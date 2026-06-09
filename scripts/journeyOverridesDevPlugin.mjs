import { writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { formatJourneyPlacementOverridesModule } from './apply-journey-prop-export.mjs';
import {
  mergeJourneyPlacementOverrideExports,
  normalizeJourneyPlacementExportForOverrides,
} from '../src/components/expedition-journey/journeyPlacementOverrides.js';

// DEV-only bridge for the in-game Journey prop editor's "Write to source" button.
// It accepts the same per-room export JSON the editor already produces and rewrites
// journeyPlacementOverrides.generated.js in place — identical output to
// `npm run journey:write-placement-overrides`, just without the copy/paste + CLI step.
// Only ever mounted on the dev server (`apply: 'serve'`), so it cannot ship to prod.
const OVERRIDES_PATH = 'src/components/expedition-journey/journeyPlacementOverrides.generated.js';
const ENDPOINT = '/__journey/write-overrides';
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const OVERRIDE_ITEM_KEYS = [
  'props', 'platforms', 'hazards', 'routeGates',
  'routeGateDoorways', 'checkpoints', 'enemies', 'miniBosses',
];

const countOverrideItems = (data) => OVERRIDE_ITEM_KEYS.reduce(
  (sum, key) => sum + (Array.isArray(data?.[key]) ? data[key].length : 0),
  0,
);

export const journeyOverridesDevPlugin = () => ({
  name: 'journey-overrides-writer',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(ENDPOINT, (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      const sendError = (statusCode, error) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: false, error }));
      };
      let body = '';
      let aborted = false;
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > MAX_BODY_BYTES) {
          aborted = true;
          sendError(413, 'Export payload too large.');
          req.destroy();
        }
      });
      req.on('end', async () => {
        if (aborted) return;
        try {
          const exportData = JSON.parse(body);
          const overridesPath = resolve(server.config.root, OVERRIDES_PATH);

          // The write MERGES the incoming per-room export into the FULL existing
          // override set. The editor only ever exports one room at a time, so if we
          // can't read the existing file we must NOT proceed — writing the per-room
          // export against an empty base would wipe every other room. Only a genuinely
          // absent file is a legitimate empty base (the very first write).
          let existingText = null;
          try {
            existingText = await readFile(overridesPath, 'utf8');
          } catch (readError) {
            if (readError.code !== 'ENOENT') throw readError;
          }

          let existingExport = {};
          if (existingText && existingText.trim()) {
            try {
              existingExport = (await import(`${pathToFileURL(overridesPath).href}?t=${Date.now()}`)).default;
            } catch (importError) {
              sendError(500, `Refusing to write: existing overrides could not be parsed (${importError.message}). Nothing was changed, so other rooms are preserved.`);
              return;
            }
            if (!existingExport || typeof existingExport !== 'object') {
              sendError(500, 'Refusing to write: existing overrides module has no usable default export. Nothing was changed.');
              return;
            }
          }

          const nextExport = mergeJourneyPlacementOverrideExports(existingExport, exportData);

          // Final safety net: the merge is additive apart from EXPLICIT deletions, so the
          // result must never drop more items than were deleted on purpose. If it would,
          // something went wrong upstream — bail out instead of overwriting good data.
          const existingCount = countOverrideItems(normalizeJourneyPlacementExportForOverrides(existingExport));
          const nextCount = countOverrideItems(nextExport);
          const explicitDeletions = (exportData.deletedPropIds?.length || 0)
            + (exportData.deletedPlatformIds?.length || 0)
            + (exportData.deletedHazardIds?.length || 0);
          if (existingCount > 0 && nextCount < existingCount - explicitDeletions) {
            sendError(500, `Refusing to write: merge would drop ${existingCount - nextCount} override item(s) but only ${explicitDeletions} deletion(s) were requested. Existing overrides left intact.`);
            return;
          }

          // Keep a recoverable copy of the previous file outside the repo before
          // overwriting, so even an unforeseen bad write can be undone.
          if (existingText != null) {
            try {
              await writeFile(join(tmpdir(), 'journeyPlacementOverrides.generated.bak.js'), existingText);
            } catch {
              // Backup is best-effort; don't block the write on it.
            }
          }

          const nextModule = formatJourneyPlacementOverridesModule(nextExport);
          await writeFile(overridesPath, nextModule);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            room: exportData.room ?? null,
            props: Array.isArray(exportData.props) ? exportData.props.length : 0,
            enemies: Array.isArray(exportData.enemies) ? exportData.enemies.length : 0,
            totalItems: nextCount,
          }));
        } catch (error) {
          sendError(400, error.message);
        }
      });
    });
  },
});

export default journeyOverridesDevPlugin;

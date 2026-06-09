import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { formatJourneyPlacementOverridesModule } from './apply-journey-prop-export.mjs';
import { mergeJourneyPlacementOverrideExports } from '../src/components/expedition-journey/journeyPlacementOverrides.js';

// DEV-only bridge for the in-game Journey prop editor's "Write to source" button.
// It accepts the same per-room export JSON the editor already produces and rewrites
// journeyPlacementOverrides.generated.js in place — identical output to
// `npm run journey:write-placement-overrides`, just without the copy/paste + CLI step.
// Only ever mounted on the dev server (`apply: 'serve'`), so it cannot ship to prod.
const OVERRIDES_PATH = 'src/components/expedition-journey/journeyPlacementOverrides.generated.js';
const ENDPOINT = '/__journey/write-overrides';
const MAX_BODY_BYTES = 8 * 1024 * 1024;

export const journeyOverridesDevPlugin = () => ({
  name: 'journey-overrides-writer',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(ENDPOINT, (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      let body = '';
      let aborted = false;
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > MAX_BODY_BYTES) {
          aborted = true;
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: 'Export payload too large.' }));
          req.destroy();
        }
      });
      req.on('end', async () => {
        if (aborted) return;
        try {
          const exportData = JSON.parse(body);
          const overridesPath = resolve(server.config.root, OVERRIDES_PATH);
          let existingExport = {};
          try {
            existingExport = (await import(`${pathToFileURL(overridesPath).href}?t=${Date.now()}`)).default || {};
          } catch {
            // If the generated module is missing or malformed, fall back to the incoming export.
          }
          const nextExport = mergeJourneyPlacementOverrideExports(existingExport, exportData);
          const nextModule = formatJourneyPlacementOverridesModule(nextExport);
          await writeFile(overridesPath, nextModule);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ok: true,
            room: exportData.room ?? null,
            props: Array.isArray(exportData.props) ? exportData.props.length : 0,
            enemies: Array.isArray(exportData.enemies) ? exportData.enemies.length : 0,
          }));
        } catch (error) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: error.message }));
        }
      });
    });
  },
});

export default journeyOverridesDevPlugin;

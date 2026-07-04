import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, join, basename } from 'node:path';

// DEV-only bridge for saving the live game canvas to disk. CDP screenshots
// freeze against the running game loop, so verification tooling instead has
// the page POST a canvas.toDataURL() frame here. Writes land in scratch/
// (watch-ignored) so saving a frame never triggers an HMR reload.
const ENDPOINT = '/__journey/save-frame';
const OUT_DIR = 'scratch/frame-captures';
const MAX_BODY_BYTES = 24 * 1024 * 1024;

// Injected ahead of the app bundle when the page is opened with ?frameshim.
// Browsers park requestAnimationFrame in hidden tabs, which freezes the game
// loop and makes headless verification impossible. MessageChannel messages are
// not throttled, so this shim drives pending rAF callbacks at ~30fps whenever
// the document is hidden. Visible tabs keep the native rAF path untouched.
const FRAME_SHIM = `
(() => {
  if (!/[?&]frameshim/.test(location.search)) return;
  // Crash visibility for headless runs: stash real error text where an
  // automation eval can read it, since the console tool flattens %s args.
  window.__errlog = [];
  const stash = (label, parts) => {
    try { window.__errlog.push(label + ': ' + parts.map((p) => (p && p.stack) || String(p)).join(' | ')); } catch { /* ignore */ }
  };
  window.addEventListener('error', (e) => stash('error', [e.message, e.filename + ':' + e.lineno, e.error]));
  window.addEventListener('unhandledrejection', (e) => stash('rejection', [e.reason]));
  const nativeConsoleError = console.error.bind(console);
  console.error = (...args) => { stash('console.error', args); nativeConsoleError(...args); };
  // The game gates its own step() on document.hidden, so mask visibility from
  // the app entirely while keeping the real value for the pump's branching.
  const nativeHiddenGet = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden').get;
  const reallyHidden = () => nativeHiddenGet.call(document);
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  const nativeRaf = window.requestAnimationFrame.bind(window);
  const pending = new Map();
  let nextId = 1;
  let pumping = false;
  const channel = new MessageChannel();
  let lastTick = performance.now();
  const pump = () => {
    if (!reallyHidden() || !pending.size) { pumping = false; return; }
    const now = performance.now();
    if (now - lastTick >= 33 && pending.size) {
      lastTick = now;
      const batch = [...pending.values()];
      pending.clear();
      batch.forEach((cb) => { try { cb(now); } catch (e) { console.error('[frameshim]', e); } });
    }
    channel.port2.postMessage(0);
  };
  channel.port1.onmessage = pump;
  const startPump = () => { if (!pumping) { pumping = true; channel.port2.postMessage(0); } };
  window.requestAnimationFrame = (cb) => {
    if (!reallyHidden()) return nativeRaf(cb);
    const id = nextId++;
    pending.set(id, cb);
    startPump();
    return id;
  };
  window.cancelAnimationFrame = (id) => { pending.delete(id); };
  console.log('[frameshim] hidden-tab frame pump installed');
})();
`;

export const journeyFrameCaptureDevPlugin = () => ({
  name: 'journey-frame-capture',
  apply: 'serve',
  transformIndexHtml() {
    return [{ tag: 'script', children: FRAME_SHIM, injectTo: 'head-prepend' }];
  },
  configureServer(server) {
    server.middlewares.use(ENDPOINT, (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }
      const sendJson = (statusCode, payload) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      };
      let body = '';
      let aborted = false;
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > MAX_BODY_BYTES) {
          aborted = true;
          sendJson(413, { ok: false, error: 'Frame payload too large.' });
          req.destroy();
        }
      });
      req.on('end', async () => {
        if (aborted) return;
        try {
          const { name, dataUrl } = JSON.parse(body);
          const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(dataUrl ?? '');
          if (!match) {
            sendJson(400, { ok: false, error: 'dataUrl must be a base64 image/png or image/jpeg data URL.' });
            return;
          }
          // basename() strips any path segments so frames can only land in OUT_DIR.
          const safeName = basename(String(name || 'frame')).replace(/[^\w.-]/g, '_');
          const outDir = resolve(server.config.root, OUT_DIR);
          await mkdir(outDir, { recursive: true });
          const file = join(outDir, `${safeName}.${match[1] === 'jpeg' ? 'jpg' : 'png'}`);
          await writeFile(file, Buffer.from(match[2], 'base64'));
          sendJson(200, { ok: true, file });
        } catch (error) {
          sendJson(400, { ok: false, error: error.message });
        }
      });
    });
  },
});

export default journeyFrameCaptureDevPlugin;

import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});

try {
  await server.ssrLoadModule('/scripts/journeyCollisionTuning.test.mjs');
} finally {
  await server.close();
}

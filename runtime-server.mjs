import http from 'node:http';

const port = Number(process.env.PORT || 80);
const service = process.env.SERVICE_NAME || 'agritwin-dairy-frontend';

let appImportStatus = 'pending';
let appImportError = null;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'content-type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/ready' || req.url === '/') {
    sendJson(res, 200, {
      ok: appImportStatus !== 'failed',
      service,
      status: appImportStatus,
      error: appImportError,
      path: req.url,
      timestamp: new Date().toISOString()
    });
    return;
  }

  sendJson(res, 404, {
    ok: false,
    service,
    error: 'not found',
    path: req.url
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`${service} runtime server listening on 0.0.0.0:${port}`);
});

try {
  await import('./src/index.mjs');
  appImportStatus = 'loaded';
  console.log(`${service} app module loaded`);
} catch (error) {
  appImportStatus = 'failed';
  appImportError = error?.stack || error?.message || String(error);
  console.error(`${service} app module failed`, error);
}

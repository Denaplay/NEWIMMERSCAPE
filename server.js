const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const publicRoot = __dirname;
const apiPrefix = '/api/my-erp/';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function proxyMyErp(request, response, pathname) {
  const upstreamPath = `/booking_api/${pathname.slice(apiPrefix.length)}`;
  const headers = {
    accept: request.headers.accept || 'application/json',
    'content-type': request.headers['content-type'] || 'application/octet-stream',
    'user-agent': request.headers['user-agent'] || 'ImmerscapeBooking/1.0'
  };
  if (request.headers['content-length']) headers['content-length'] = request.headers['content-length'];

  const upstream = http.request({
    hostname: 'mirkvestov.ru',
    port: 80,
    path: upstreamPath,
    method: request.method,
    headers
  }, upstreamResponse => {
    response.writeHead(upstreamResponse.statusCode || 502, {
      'content-type': upstreamResponse.headers['content-type'] || 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    });
    upstreamResponse.pipe(response);
  });

  upstream.setTimeout(10000, () => upstream.destroy(new Error('my-ERP request timed out')));
  upstream.on('error', error => {
    if (response.headersSent) return response.end();
    response.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: `my-ERP недоступен: ${error.message}` }));
  });
  request.pipe(upstream);
}

function sendStaticFile(response, filePath) {
  response.writeHead(200, {
    'content-type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
  });
  fs.createReadStream(filePath).pipe(response);
}

function serveStatic(response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname.replace(/\/$/, '/index.html');
  const filePath = path.resolve(publicRoot, `.${decodeURIComponent(requestedPath)}`);
  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isFile()) {
      sendStaticFile(response, filePath);
      return;
    }

    // Красивые адреса: /booking открывает booking.html, /events — events.html.
    if (!path.extname(filePath)) {
      const htmlPath = `${filePath}.html`;
      fs.stat(htmlPath, (htmlError, htmlStats) => {
        if (!htmlError && htmlStats.isFile()) {
          sendStaticFile(response, htmlPath);
          return;
        }
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
      });
      return;
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname.startsWith(apiPrefix)) {
    proxyMyErp(request, response, `${url.pathname}${url.search}`);
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  serveStatic(response, url.pathname);
});

server.listen(port, () => {
  console.log(`Immerscape: http://localhost:${port}`);
});

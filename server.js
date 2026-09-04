const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { getUpstreamPath } = require('./server/my-erp');
const { sendTelegramBooking } = require('./server/telegram-booking');

const port = Number(process.env.PORT) || 3000;
const publicRoot = __dirname;
const myErpApiPrefix = '/api/my-erp/';
const telegramBookingPath = '/api/telegram-booking';

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8'
};

function sendJson(response, statusCode, body, extraHeaders = {}) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...extraHeaders
  });
  response.end(JSON.stringify(body));
}

function proxyMyErp(request, response, url) {
  const upstreamPath = getUpstreamPath(url.pathname, url.search);
  if (!upstreamPath) {
    sendJson(response, 404, { error: 'Неизвестный адрес my-ERP.' });
    return;
  }
  if (!['GET', 'POST'].includes(request.method)) {
    sendJson(response, 405, { error: 'Метод не поддерживается.' }, { allow: 'GET, POST' });
    return;
  }

  const headers = {
    accept: request.headers.accept || 'application/json',
    'content-type': request.headers['content-type'] || 'application/octet-stream',
    'user-agent': request.headers['user-agent'] || 'ImmerscapeBooking/1.0'
  };
  if (request.headers['content-length']) headers['content-length'] = request.headers['content-length'];

  const upstream = https.request({
    hostname: 'mirkvestov.ru',
    port: 443,
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

  upstream.setTimeout(10000, () => upstream.destroy(new Error('превышено время ожидания')));
  upstream.on('error', error => {
    if (response.headersSent) return response.end();
    sendJson(response, 502, { error: `my-ERP недоступен: ${error.message}` });
  });
  request.pipe(upstream);
}

function readJsonBody(request, maxBytes = 64 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error('Слишком большой запрос.'));
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      if (size > maxBytes) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'));
      } catch (_error) {
        reject(new Error('Некорректный JSON.'));
      }
    });
    request.on('error', reject);
  });
}

async function handleTelegramBooking(request, response) {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Метод не поддерживается.' }, { allow: 'POST' });
    return;
  }

  let booking;
  try {
    booking = await readJsonBody(request);
  } catch (error) {
    if (!response.writableEnded) sendJson(response, 400, { error: error.message });
    return;
  }

  const result = await sendTelegramBooking(booking);
  sendJson(response, result.statusCode, result.body);
}

function sendStaticFile(request, response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const requestPath = String(request.url || '').split('?')[0];
  const headers = {
    'content-type': mimeTypes[extension] || 'application/octet-stream',
    'cache-control': ['.html', '.js', '.css'].includes(extension) ? 'no-store' : 'public, max-age=3600'
  };
  if (/^\/(?:booking|profile|staff-)/.test(requestPath)) {
    headers['x-robots-tag'] = 'noindex, nofollow';
  }
  response.writeHead(200, headers);
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(filePath).pipe(response);
}

function serveStatic(request, response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname.replace(/\/$/, '/index.html');
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestedPath);
  } catch (_error) {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end('Некорректный адрес');
    return;
  }
  const privatePath = /(?:^|\/)\./.test(decodedPath)
    || /^\/(?:server(?:\.js|\/)|tests\/|supabase\/|seo\/|package(?:-lock)?\.json|README\.md)/i.test(decodedPath);
  if (privatePath) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Страница не найдена');
    return;
  }
  const filePath = path.resolve(publicRoot, `.${decodedPath}`);
  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' }).end('Доступ запрещён');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (!statError && stats.isFile()) {
      sendStaticFile(request, response, filePath);
      return;
    }

    if (!path.extname(filePath)) {
      const htmlPath = `${filePath}.html`;
      fs.stat(htmlPath, (htmlError, htmlStats) => {
        if (!htmlError && htmlStats.isFile()) {
          sendStaticFile(request, response, htmlPath);
          return;
        }
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Страница не найдена');
      });
      return;
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Страница не найдена');
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (url.pathname.startsWith(myErpApiPrefix)) {
    proxyMyErp(request, response, url);
    return;
  }
  if (url.pathname === telegramBookingPath) {
    handleTelegramBooking(request, response).catch(error => {
      console.error('Ошибка обработчика Telegram:', error);
      if (!response.headersSent) sendJson(response, 500, { error: 'Внутренняя ошибка сервера.' });
    });
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { allow: 'GET, HEAD' }).end('Метод не поддерживается');
    return;
  }
  serveStatic(request, response, url.pathname);
});

server.listen(port, () => {
  console.log(`Immerscape: http://localhost:${port}`);
});

const UPSTREAM_ORIGIN = 'https://mirkvestov.ru';
const FUNCTION_PREFIX = '/.netlify/functions/my-erp/';
const API_PREFIX = '/api/my-erp/';

function getUpstreamPath(event) {
  const requestPath = String(event.rawPath || event.path || '');
  const prefix = requestPath.startsWith(FUNCTION_PREFIX) ? FUNCTION_PREFIX : API_PREFIX;
  const relativePath = requestPath.startsWith(prefix) ? requestPath.slice(prefix.length) : '';

  if (!/^(?:timetable\/\d+\.json|get_tariff(?:_with_players)?\/\d+|book\/\d+)$/.test(relativePath)) {
    return null;
  }

  const query = event.rawQuery ? `?${event.rawQuery}` : '';
  return `/booking_api/${relativePath}${query}`;
}

exports.handler = async function handler(event) {
  const method = String(event.httpMethod || 'GET').toUpperCase();
  const upstreamPath = getUpstreamPath(event);

  if (!upstreamPath) {
    return {
      statusCode: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'Unknown my-ERP endpoint' })
    };
  }

  if (!['GET', 'POST'].includes(method)) {
    return {
      statusCode: 405,
      headers: {
        allow: 'GET, POST',
        'content-type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const requestHeaders = {
    accept: event.headers?.accept || 'application/json',
    'user-agent': event.headers?.['user-agent'] || 'ImmerscapeBooking/1.0'
  };
  if (event.headers?.['content-type']) requestHeaders['content-type'] = event.headers['content-type'];

  const request = {
    method,
    headers: requestHeaders,
    signal: AbortSignal.timeout(10000)
  };
  if (method !== 'GET' && event.body) {
    request.body = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  }

  try {
    const response = await fetch(`${UPSTREAM_ORIGIN}${upstreamPath}`, request);
    const responseBody = Buffer.from(await response.arrayBuffer());

    return {
      statusCode: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      },
      body: responseBody.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    const message = error?.name === 'TimeoutError' ? 'request timed out' : error?.message || 'unknown error';
    return {
      statusCode: 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      },
      body: JSON.stringify({ error: `my-ERP недоступен: ${message}` })
    };
  }
};

exports.getUpstreamPath = getUpstreamPath;


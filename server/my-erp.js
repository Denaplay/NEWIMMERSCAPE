const API_PREFIX = '/api/my-erp/';

function getUpstreamPath(pathname, search = '') {
  const requestPath = String(pathname || '');
  const relativePath = requestPath.startsWith(API_PREFIX)
    ? requestPath.slice(API_PREFIX.length)
    : '';

  if (!/^(?:timetable\/\d+\.json|get_tariff(?:_with_players)?\/\d+|book\/\d+)$/.test(relativePath)) {
    return null;
  }

  return `/booking_api/${relativePath}${String(search || '')}`;
}

module.exports = { getUpstreamPath };

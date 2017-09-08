const { STORAGE_PREFIX } = require('./constants');

exports.createStorageKey = suffix => `${STORAGE_PREFIX}${suffix}`;

exports.isObject = (value) => {
  if (!value || typeof value !== 'object') return false;
  return true;
};

exports.parseQueryString = (query) => {
  const toParse = query || window.location.search;
  const qs = toParse.replace('?', '');
  const pairs = qs.split('&');
  const parsed = {};
  if (!qs) return parsed;
  pairs.forEach((pair) => {
    const parts = pair.split('=');
    if (parts[1]) parsed[parts[0]] = decodeURIComponent(parts[1]);
  });
  return parsed;
};

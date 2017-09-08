const compose = require('stampit');
const Store = require('./index');
const { createStorageKey } = require('../utils');

module.exports = compose(Store, {
  properties: { type: 'cookie', key: createStorageKey('s'), expires: 30 },
});

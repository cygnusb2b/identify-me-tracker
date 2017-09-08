const compose = require('stampit');
const CookieStore = require('./cookie');

const Store = {
  cookie: CookieStore,
};

module.exports = compose({
  init({ type, key, expires }) {
    this.type = type || this.type;
    this.key = key || this.key;
    this.expires = Number(expires) || this.expires;

    if (!Store[this.type]) {
      throw new Error(`No storage type was found for '${this.type}'`);
    }
    // @todo, Perhaps this should be compose of itself and the type?
    return Store[this.type](this);
  },
  properties: {
    key: null,
    expires: 0,
    type: 'cookie',
  },
});

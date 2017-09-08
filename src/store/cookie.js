const compose = require('stampit');
const cookie = require('js-cookie');

function getExpiresDate(expiresInMinutes) {
  const toAdd = expiresInMinutes * 60 * 1000;
  const now = new Date();
  return new Date(now.valueOf() + toAdd);
}

module.exports = compose({
  init({ key, expires }) {
    this.key = key || this.key;
    this.expires = Number(expires) || this.expires;
  },
  properties: {
    type: 'cookie',
    key: null,
    expires: 0,
  },
  methods: {
    /**
     * Assigns/updates the current value in storage
     * with the provided value, using `Object.assign`.
     * Will also refresh the contents. Only assigns if the current
     * value exists.
     *
     * @param {object} value
     * @return {this}
     */
    assign(value) {
      const current = this.retrieve();
      if (current) {
        this.save(Object.assign({}, current, value));
      }
    },
    /**
     * Deletes the value from storage.
     *
     * @return {this}
     */
    delete() {
      cookie.remove(this.key);
      return this;
    },

    /**
     * Determines if the value exists in storage.
     *
     * @return {boolean}
     */
    exists() {
      const value = this.retrieve();
      if (value) return true;
      return false;
    },

    /**
     * Refreshes the current value in storage
     * by extending it's expiration.
     *
     * @return {?object} The refreshed value.
     */
    refresh() {
      return this.save(this.retrieve());
    },

    /**
     * Retrieves a JSON value from storage.
     *
     * @return {?object} The JSON parsed value, or `falsey` if it doesn't exist.
     */
    retrieve() {
      let value;
      if (!this.key) return value;
      try {
        value = cookie.getJSON(this.key);
        return value;
      } catch (e) {
        return value;
      }
    },

    /**
     * Saves a value to storage.
     * Assumes and object that will be JSON stringified.
     * If the value is falsey, the storage value will be deleted.
     *
     * @param {object} value
     * @return {?object} The saved value.
     */
    save(value) {
      if (!value) return this.delete();
      if (this.key) cookie.set(this.key, value, { expires: getExpiresDate(this.expires) });
      return value;
    },
  },
});

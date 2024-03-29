/* eslint-disable */
const Promise = require('es6-promise');

module.exports = function polyfills() {
  Promise.polyfill();

  if (!('assign' in Object)) {
    Object.assign = function assign(target, source) {
      for (var index = 1, key, src; index < arguments.length; ++index) {
        src = arguments[index];
        for (key in src) {
          if (Object.prototype.hasOwnProperty.call(src, key)) {
            target[key] = src[key];
          }
        }
      }
      return target;
    };
  }
};

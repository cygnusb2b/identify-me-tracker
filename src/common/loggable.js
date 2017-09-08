const compose = require('stampit');
const Logger = require('../logger');
const typeOf = require('./type-of');

const defaultLogger = Logger({ disbled: true });

module.exports = compose({
  init({ logger }) {
    this.logger = typeOf(logger) === 'logger' ? logger : defaultLogger;
  },
});

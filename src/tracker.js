const compose = require('stampit');
const User = require('./user/index');
const Logger = require('./logger');
const { APP_NAME } = require('./constants');
const commands = require('./commands/index');

const assign = Object.assign;

module.exports = compose({
  init({ id, name, logger, user, session, campaign }) {
    if (!id) {
      throw new Error(`No identifier was provided to the ${APP_NAME} tracker named '${id}'`);
    }
    this.logger = Logger(assign({}, { name }, logger));
    this.logger.dispatch('log', 'Tracker initialized');

    this.user = User(assign({}, user, {
      logger: this.logger,
      session,
      campaign,
    }));

    if (this.user.exists()) {
      this.user.refresh();
    } else {
      this.user.create();
    }
  },
  properties: {
    id: null,
    name: '_default_',
  },
  methods: {
    execute(command, options) {
      if (typeof commands[command] === 'function') {
        return commands[command](this, options);
      }
      return Promise.reject(new Error(`The command '${command}' was not found.`));
    },
  },
});

const compose = require('stampit');
const uuid = require('uuid/v4');
const Loggable = require('../common/loggable');
const SessionStore = require('../store/session');
const objectPath = require('object-path');

const { has } = objectPath;

module.exports = compose({
  init({ store }) {
    this.store = SessionStore(store);
  },
  methods: {
    create() {
      const payload = this.store.save({ i: uuid(), t: (new Date()).valueOf() });
      this.logger.dispatch('log', 'Session created.', payload);
      return payload;
    },
    endOfDay() {
      const now = new Date();
      const payload = this.retrieve();
      try {
        const created = new Date(payload.t);
        return now.getDate() > created.getDate();
      } catch (e) {
        return false;
      }
    },
    exists() {
      const session = this.retrieve();
      if (!session) return false;
      return true;
    },
    refresh() {
      const payload = this.store.refresh();
      if (payload) {
        this.logger.dispatch('log', 'Session refreshed.', payload);
      } else {
        this.logger.dispatch('warn', 'Session was refreshed with an empty value. The session store has been removed');
      }
      return this;
    },
    retrieve() {
      const session = this.store.retrieve();
      return has(session, 'i') ? session : null;
    },
  },
}, Loggable);

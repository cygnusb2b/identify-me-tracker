const compose = require('stampit');
const uuid = require('uuid/v4');
const Loggable = require('../common/loggable');
const UserStore = require('../store/user');
const Session = require('./session');
const Campaign = require('./campaign');
const objectPath = require('object-path');

const assign = Object.assign;
const { get, has } = objectPath;

module.exports = compose(Loggable, {
  init({ store, session, campaign }) {
    this.store = UserStore(store);
    this.session = Session(assign({}, session, { logger: this.logger }));
    this.campaign = Campaign(assign({}, campaign, { logger: this.logger }));
  },
  methods: {
    create() {
      const payload = this.store.save({ i: uuid(), t: (new Date()).valueOf() });
      this.logger.dispatch('log', 'User created.', payload);
      this.session.create();
      this.campaign.delete(); // Remove any existing campaigns from storage. @todo Confirm!
      this.campaign.create(); // Create a new campaign, if detected.
      return payload;
    },
    exists() {
      const user = this.retrieve();
      if (!user) return false;
      return true;
    },
    refresh() {
      const payload = this.store.refresh();
      if (payload) {
        this.logger.dispatch('log', 'User refreshed.', payload);
      } else {
        this.logger.dispatch('warn', 'User was refreshed with an empty value. The user store has been removed');
      }

      if (!this.session.exists()) {
        this.session.create();
      } else if (this.session.endOfDay()) {
        this.session.create();
      } else if (this.campaign.isNew()) {
        this.campaign.create();
        this.session.create();
      } else {
        this.session.refresh();
      }
      return this;
    },
    retrieve() {
      const user = this.store.retrieve();
      return has(user, 'i') ? user : null;
    },
    getIdentity() {
      const u = get(this.retrieve(), 'u');
      return has(u, 's') && has(u, 'i') ? u : null;
    },
    setIdentity(identifier, source) {
      const s = source || 'default';
      const i = String(identifier);
      const u = { s, i };

      if (u && i) {
        const current = this.getIdentity();
        if (!current) {
          // No previous identity was assigned to this user.
          // Assign the identity to the current user (which also refreshes the user storage).
          // @todo Must also send identification event so
          // all previous user sessions can be updated with the ident.
          this.logger.dispatch('info', 'Identity data was assigned to a previously anonymous user.', u);
          this.store.assign({ u });
        } else if (current.s !== u.s || current.i !== u.i) {
          // Previous identity was found, and the new identity is different than the current.
          this.logger.dispatch('info', 'Identity data was assigned to a previously identified user. Created new user/session identifiers.', u);
          // Create new user/session identifiers and apply the identity.
          this.create();
          this.store.assign({ u });
        }
      }
    },
  },
});

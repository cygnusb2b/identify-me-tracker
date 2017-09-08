const compose = require('stampit');
const Loggable = require('../common/loggable');
const CampaignStore = require('../store/campaign');
const { parseQueryString, isObject } = require('../utils');

const CampaignParams = compose({
  init({ source, medium, name, content, keyword, influencer }) {
    this.source = source || this.source;
    this.medium = medium || this.medium;
    this.name = name || this.name;
    this.content = content || this.content;
    this.keyword = keyword || this.keyword;
    this.influencer = influencer || this.influencer;
  },
  properties: {
    source: 'utm_source',
    medium: 'utm_medium',
    name: 'utm_campaign',
    content: 'utm_content',
    keyword: 'utm_term',
    influencer: 'utm_influencer',
  },
  methods: {
    get() {
      return ['source', 'medium', 'name', 'content', 'keyword', 'influencer'].map(key => ({ key, param: this[key], code: key.slice(0, 2) }));
    },
  },
});

module.exports = compose({
  init({ store, params }) {
    this.store = CampaignStore(store);
    this.params = CampaignParams(params);
    this.parsed = {
      store: this.parseFromStore(),
      query: this.parseFromQuery(),
    };
  },
  methods: {
    clean(campaign) {
      const cleaned = {};
      this.params.get().forEach(({ code }) => {
        if (campaign[code]) cleaned[code] = String(campaign[code]);
      });
      return cleaned;
    },
    create() {
      const payload = this.parsed.query;
      if (payload) {
        this.store.save(payload);
        this.logger.dispatch('log', 'Campaign created.', payload);
      }
      return payload;
    },
    delete() {
      this.store.delete();
      return this;
    },
    isNew() {
      if (!this.parsed.query) return false;
      if (!this.parsed.store) return true;
      let match = false;
      this.params.get().forEach(({ code }) => {
        if (this.parsed.query[code] !== this.parsed.store[code]) match = true;
      });
      return match;
    },
    isValid(campaign) {
      if (isObject(campaign) && campaign.so) return true;
      return false;
    },
    parseFromQuery() {
      const query = parseQueryString();
      const campaign = {};
      this.params.get().forEach(({ code, param }) => {
        campaign[code] = query[param];
      });
      if (this.isValid(campaign)) return this.clean(campaign);
      return null;
    },
    parseFromStore() {
      const payload = this.store.retrieve();
      if (this.isValid(payload)) return this.clean(payload);
      return null;
    },
  },
}, Loggable);

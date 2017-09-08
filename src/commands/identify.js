function sendRequest(payload) {
  return payload;
}

module.exports = function identify(Tracker, { id, source, data }) {
  const payload = { id, source: source || 'default', data };
  return Promise.resolve()
    .then(() => sendRequest(payload))
    .then((result) => {
      Tracker.user.setIdentity(result.id, result.source);
      return result;
    })
  ;
};

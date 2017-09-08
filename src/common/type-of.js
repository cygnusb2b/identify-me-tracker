module.exports = (object) => {
  if (!object || typeof object !== 'object') {
    return false;
  }
  return object.stampType;
};

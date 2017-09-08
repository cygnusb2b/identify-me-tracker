const Tracker = require('./tracker');
const { APP_NAME, DEFAULT_TRACKER_NAME } = require('./constants');

const assign = Object.assign;
const trackers = {};

module.exports = function app(command, options, cb) {
  const next = (err, res) => {
    if (typeof cb === 'function') cb(err, res);
  };
  const opts = assign({}, options);
  if (command === 'init') {
    // Create the tracker instance on init.
    const name = opts.name || DEFAULT_TRACKER_NAME;
    opts.name = name;
    if (!trackers[name]) {
      // Only create the instance once.
      trackers[name] = Tracker(opts);
      if (typeof cb === 'function') {
        next(null, trackers[name]);
      }
    }
  } else if (typeof command === 'string') {
    // Delegate the command to the appropriate tracker.
    const parts = command.split('.', 2);
    const params = {
      name: (parts.length === 2) ? parts[0] : DEFAULT_TRACKER_NAME,
      command: (parts.length === 2) ? parts[1] : parts[0],
    };
    const tracker = trackers[params.name];
    if (!tracker) {
      throw new Error(`No ${APP_NAME} tracker named '${params.name}' was found.`);
    }

    const log = (level, stage, value) => {
      tracker.logger.dispatch(level, `Command execution ${stage} for '${params.command}'`, value);
    };

    log('info', 'started', opts);
    tracker.execute(params.command, opts).then((result) => {
      log('info', 'complete', result);
      next(null, result);
    }).catch((error) => {
      log('error', 'error', error);
      next(error);
    });
  }
};

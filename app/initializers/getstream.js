import config from 'kitsu/config/environment';

export function initialize(/* application */) {
  if (!window.stream || config.environment === 'test') { return; }
  const { app, key } = config.kitsu.APIKeys.getstream[config.kitsu.environment];
  window.kitsu = window.kitsu || {};
  window.kitsu.getstream = window.stream.connect(key, null, app);
}

export default {
  name: 'getstream',
  initialize
};

import config from 'kitsu/config/environment';

export function initialize(appInstance) {
  const raven = appInstance.lookup('service:raven');
  if (config.environment === 'production') {
    raven.callRaven('setRelease', config.release);
  }
}

export default {
  name: 'sentry-release',
  after: 'sentry-setup',
  initialize
};

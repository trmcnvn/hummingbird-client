import config from 'kitsu/config/environment';

export function initialize() {
  window.OneSignal = window.OneSignal || [];
  window.OneSignal.push(function() {
    window.OneSignal.init({
      appId: config.kitsu.APIKeys.onesignal[config.kitsu.environment],
      allowLocalhostAsSecureOrigin: true,
      autoRegister: false,
      notifyButton: { enable: false },
      persistNotification: false,
      welcomeNotification: { // @i18n
        title: 'Kitsu',
        message: 'Thanks for subscribing!'
      },
      promptOptions: { // @i18n
        actionMessage: 'Enable notifications to stay updated on all the new activity.',
        acceptButtonText: 'Allow',
        cancelButtonText: 'No Thanks'
      }
    });
  });
}

export default {
  name: 'onesignal',
  initialize
};

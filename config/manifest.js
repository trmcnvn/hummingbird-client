/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  // See https://github.com/san650/ember-web-app#documentation for a list of
  // supported properties

  return {
    name: 'Kitsu',
    short_name: 'Kitsu',
    description: '',
    start_url: '/?utm_source=web_app_manifest',
    display: 'standalone',
    gcm_sender_id: '482941778795',
    orientation: 'portrait',
    background_color: '#332532',
    theme_color: '#332532',
    icons: [{
      src: '/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    }, {
      src: '/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    }, {
      src: '/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
      targets: ['apple']
    }, {
      src: '/mstile-70x70.png',
      element: 'square70x70logo',
      targets: ['ms']
    }, {
      src: '/mstile-150x150.png',
      element: 'square150x150logo',
      targets: ['ms']
    }, {
      src: '/mstile-310x310.png',
      element: 'square310x310logo',
      targets: ['ms']
    }, {
      src: '/mstile-310x150.png',
      element: 'wide310x150logo',
      targets: ['ms']
    }],
    ms: {
      tileColor: '#f75239'
    },
    prefer_related_applications: true,
    related_applications: [{
      platform: 'itunes',
      url: 'https://itunes.apple.com/us/app/kitsu-anime/id590452826'
    }, {
      platform: 'play',
      url: 'https://play.google.com/store/apps/details?id=com.everfox.animetrackerandroid',
      id: 'com.everfox.animetrackerandroid'
    }]
  };
}

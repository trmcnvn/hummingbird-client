'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'kitsu',
    environment,
    rootURL: '/',
    locationType: 'router-scroll',
    historySupportMiddleware: true,
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: false
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    kitsu: {
      environment: process.env.HEROKU_EMBER_APP || environment,
      APIHost: 'https://kitsu.io',
      APIKeys: {
        algolia: 'AWQO5J657S',
        embedly: '90f3fb8ff40f4603991aa258127ccb5e',
        onesignal: {
          production: '01f6e47a-6809-4118-a796-949952e9c209',
          staging: '9933b0ac-ca94-4990-931b-7efa6bafdfd6',
          development: '9933b0ac-ca94-4990-931b-7efa6bafdfd6'
        },
        getstream: {
          production: { key: 'eb6dvmba4ct3', app: '18373' },
          staging: { key: 'ekx6xkn9v9xx', app: '17647' },
          // development: { key: 'sjm3sx9mgcx2', app: '17073' }
          development: { key: 'eb6dvmba4ct3', app: '18373' }
        },
        googleAnalytics: 'UA-37633900-4',
        twitterPixel: 'nz90m',
        facebookPixel: '1372973436170230'
      },
      OrbitDBVersion: '99d88fb9-57c8-426a-a3d9-7ce70fef53c3'
    },

    // ember-cli-sentry
    sentry: {
      dsn: 'https://1c436e52d5a54f4a94339278c8bdbe77@sentry.io/151419',
      development: environment !== 'production',
      debug: environment !== 'production',
      ravenOptions: {
        whitelistUrls: [
          'kitsu.io/assets',
          'staging.kitsu.io/assets'
        ],
        includePaths: [/https?:\/\/(staging\.)?kitsu\.io/],
        environment: process.env.HEROKU_EMBER_APP
      }
    },

    // ember-simple-auth / torii
    torii: {
      providers: {
        'facebook-connect': {
          appId: '325314560922421',
          version: 'v2.9',
          scope: 'public_profile,email,user_friends'
        }
      }
    },

    '@ember-decorators/argument': {
      ignoreComponentsWithoutValidations: true
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.torii.providers['facebook-connect'].appId = '1189964281083789';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
    ENV.kitsu.APIHost = 'https://staging.kitsu.io';
  }

  if (process.env.HEROKU_EMBER_APP === 'staging') {
    ENV.kitsu.APIHost = 'https://staging.kitsu.io';
  } else if (process.env.HEROKU_EMBER_APP === 'production') {
    ENV.kitsu.APIHost = 'https://kitsu.io';
  }

  return ENV;
};

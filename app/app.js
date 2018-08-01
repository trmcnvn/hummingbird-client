import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import './ext/orbit-ext';
import './ext/array-ext';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  customEvents: {
    paste: 'paste'
  },

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  engines: {
    dashboard: {
      dependencies: {
        services: [
          'algolia',
          'analytics',
          'cache',
          'dataCoordinator',
          'experiments',
          'fetch',
          'intl',
          'notification-messages',
          'raven',
          'router',
          'session',
          'store'
        ],
        externalRoutes: {
          'explore': 'explore.explore'
        }
      }
    },
    explore: {
      dependencies: {
        services: ['algolia', 'analytics', 'fetch', 'intl', 'router', 'session', 'store']
      }
    },
    feedback: {
      dependencies: {
        services: ['analytics', 'intl', 'fetch', 'router', 'session']
      }
    },
    media: {
      dependencies: {
        services: ['analytics', 'intl', 'router', 'session', 'store']
      }
    },
    profile: {
      dependencies: {
        services: ['analytics', 'intl', 'router', 'session', 'store']
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;

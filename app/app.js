import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import './ext/orbit-ext';
import './ext/array-ext';
import './ext/popper-ext';

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
      // @TODO: Specify properly
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
        ]
      }
    },
    feedback: {
      dependencies: {
        services: [
          'analytics',
          'fetch',
          'intl',
          'router',
          'session',
        ]
      }
    },
    media: {
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
        ]
      }
    },
    profile: {
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
        ]
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;

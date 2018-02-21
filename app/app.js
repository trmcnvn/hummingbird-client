import Application from '@ember/application';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import './ext/engines-ext';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  engines: {
    kitsuDashboard: {
      dependencies: {
        services: ['session'],
        externalRoutes: {
          'kitsu-explore': 'kitsu-explore.index'
        }
      }
    },
    kitsuExplore: {
      dependencies: {
        services: ['ajax', 'intl', 'session', 'store', 'query-cache'],
        externalRoutes: {
          'kitsu-anime': 'kitsu-anime.show',
          'kitsu-manga': 'kitsu-manga.show'
        }
      }
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;

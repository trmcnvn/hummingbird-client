import Engine from 'ember-engines/engine';
import loadInitializers from 'ember-load-initializers';
import Resolver from './resolver';
import config from './config/environment';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver,

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
});

loadInitializers(Eng, modulePrefix);

export default Eng;

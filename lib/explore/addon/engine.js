import Engine from 'ember-engines/engine';
import loadInitializers from 'ember-load-initializers';
import Resolver from './resolver';
import config from './config/environment';

const { modulePrefix } = config;

const Eng = Engine.extend({
  modulePrefix,
  Resolver,
  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  dependencies: {
    services: [
      'algolia',
      'analytics',
      'fetch',
      'intl',
      'router',
      'session',
      'store'
    ]
  }
});

loadInitializers(Eng, modulePrefix);

export default Eng;

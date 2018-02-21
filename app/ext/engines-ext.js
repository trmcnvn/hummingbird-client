import Ember from 'ember';
import Application from '@ember/application';
import LinkComponent from '@ember/routing/link-component';

/**
 * Create a `link-to-kitsu` component that uses Ember's `link-to` component within engines.
 * This allows us to explicitly define the route we want without determining if it is an external
 * or internal when dealing with shared internal addons.
 */
const Engine = Ember.__loader.require('ember-application/system/engine')['default'];
Engine.reopen({
  buildRegistry() {
    const registry = this._super(...arguments);
    if (!(this instanceof Application)) {
      registry.register('component:link-to-kitsu', LinkComponent);
    }
    return registry;
  }
});

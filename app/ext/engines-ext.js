import Ember from 'ember';
import LinkComponent from '@ember/routing/link-component';

// Register a `link-to-kitsu` component that uses Ember's `link-to` as engine's override it.
const Engine = Ember.__loader.require('@ember/engine')['default'];
Engine.reopen({
  buildRegistry() {
    const registry = this._super(...arguments);
    registry.register('component:link-to-kitsu', LinkComponent);
    return registry;
  }
});

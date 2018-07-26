import Ember from 'ember';

export function initialize() {
  if (!Ember.Debug) { return; }
  Ember.Debug.registerDeprecationHandler((message, options, next) => {
    if (options && options.until && options.until !== '3.5.0') {
      return;
    } else {
      next(message, options);
    }
  });
}

export default {
  name: 'deprecations',
  initialize
};

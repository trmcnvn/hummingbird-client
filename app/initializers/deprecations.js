import Ember from 'ember';
import { registerDeprecationHandler } from '@ember/debug';

export function initialize() {
  if (!Ember.Debug) { return; }
  registerDeprecationHandler((message, options, next) => {
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

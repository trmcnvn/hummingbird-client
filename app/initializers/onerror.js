import Ember from 'ember';
import { later } from '@ember/runloop';

export function initialize() {
  Ember.onerror = function(error) {
    // Safari issue with pushState
    if (error.name === 'SecurityError' && error.code === 18) {
      return later(() => window.location.reload(), 1);
    }

    // Log to browser console
    console.error(error);
    throw error;
  };
}

export default {
  name: 'onerror',
  initialize
};

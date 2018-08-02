import Ember from 'ember';
import { later } from '@ember/runloop';
import { SchemaError } from '@orbit/data';

export function initialize(application) {
  Ember.onerror = function(error) {
    // Safari issue with pushState, this can happen if the user spends a lot of time
    // on the advanced filtering page which can manipulate queryParams a lot.
    if (error.name === 'SecurityError' && error.code === 18) {
      return later(() => window.location.reload(), 1);
    }

    // Orbit bucket was corrupted?
    if (error instanceof SchemaError) {
      console.debug('Bucket became corrupted. Cleaning it up...', error); // @Debug
      const bucket = application.__container__.lookup('data-bucket:main');
      return bucket.setItem('store-requests', []).then(() => {
        return later(() => window.location.reload(), 1);
      });
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

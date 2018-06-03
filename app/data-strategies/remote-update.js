import { RequestStrategy } from '@orbit/coordinator';

// Whenever we update the in-memory store, also push those changes to the remote store (API)
export default {
  create() {
    return new RequestStrategy({
      name: 'remote-update',

      source: 'store',
      on: 'beforeUpdate',

      target: 'remote',
      action: 'push',

      blocking: false,

      filter(transform) {
        const isLocal = transform.options && transform.options.local;
        const isBlocking = transform.options && transform.options.blocking;
        return !isLocal && !isBlocking
      },

      catch() {
        // caught and handled by `remote-push-fail`
      }
    });
  }
};

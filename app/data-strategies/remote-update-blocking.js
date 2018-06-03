import { RequestStrategy } from '@orbit/coordinator';

// Blocking variant of `remote-update`.
export default {
  create() {
    return new RequestStrategy({
      name: 'remote-update-blocking',

      source: 'store',
      on: 'beforeUpdate',

      target: 'remote',
      action: 'push',

      blocking: true,

      filter(transform) {
        return transform.options && transform.options.blocking;
      },

      catch() {
        // caught and handled by `remote-push-fail`
      }
    });
  }
};

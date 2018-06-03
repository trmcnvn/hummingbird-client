import { RequestStrategy } from '@orbit/coordinator';

// When we query the in-memory store of Orbit, also pull that data from the remote store (API)
// Non-blocking so the in-memory store can return results without this interfering
export default {
  create() {
    return new RequestStrategy({
      name: 'remote-query',

      source: 'store',
      on: 'beforeQuery',

      target: 'remote',
      action: 'pull',

      blocking: false,

      filter(transform) {
        return !(transform.options && transform.options.blocking);
      }
    });
  }
};

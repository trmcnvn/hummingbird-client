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

      blocking(query) {
        return !!(query.options && query.options.blocking);
      },

      filter(transform) {
        return !(transform.options && transform.options.local);
      },

      catch(error, transform) {
        if (transform.options && transform.options.blocking) {
          this.source.requestQueue.skip();
          this.target.requestQueue.skip();
        }
        throw error;
      }
    });
  }
};

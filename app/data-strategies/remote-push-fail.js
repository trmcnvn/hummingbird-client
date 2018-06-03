import { RequestStrategy } from '@orbit/coordinator';
import { NetworkError } from '@orbit/data';

// If a `push` to the remote store fails then we check to see if it is a Network related error.
// If it is, we continue to retry the push every 5 seconds until they either regain network connectivity
// and the push succeeds or fails for a different reason.
// If it fails for a non-network related error, we rollback the changes to the store and skip the remote request.
export default {
  create() {
    return new RequestStrategy({
      name: 'remote-push-fail',

      source: 'remote',
      on: 'pushFail',

      blocking: false,

      action(transform, error) {
        const remote = this.coordinator.getSource('remote');
        const store = this.coordinator.getSource('store');

        // Retry the remote push if it was a network connection issue, otherwise rollback changes locally
        if (error instanceof NetworkError) {
          setTimeout(() => {
            remote.requestQueue.retry();
          }, 5000);
        } else {
          if (store.transformLog.contains(transform.id)) {
            console.debug('Rolling back failed remote.push', transform, error); // @Debug
            store.rollback(transform.id, -1);
          }
          return remote.requestQueue.skip();
        }
      }
    });
  }
};

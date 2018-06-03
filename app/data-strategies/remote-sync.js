import { SyncStrategy } from '@orbit/coordinator';

// When the remote store receives data then synchronize that with the in-memory store
export default {
  create() {
    return new SyncStrategy({
      name: 'remote-sync',
      source: 'remote',
      target: 'store',
      blocking: true
    });
  }
}

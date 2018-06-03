import { SyncStrategy } from '@orbit/coordinator';

// Synchronize any changes to the in-memory store to the backup store (browser)
export default {
  create() {
    return new SyncStrategy({
      name: 'backup-sync',
      source: 'store',
      target: 'backup',
      blocking: false
    });
  }
}

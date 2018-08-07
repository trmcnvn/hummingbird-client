import { SyncStrategy } from '@orbit/coordinator';
import { later } from '@ember/runloop';

// Synchronize any changes to the in-memory store to the backup store (browser)
export default {
  create() {
    return new SyncStrategy({
      name: 'backup-sync',
      source: 'store',
      target: 'backup',
      blocking: false,

      catch(error) {
        // Just reset the database and reload
        if (error instanceof DOMException && (
          // everything except Firefox
          error.code === 22 ||
          // Firefox
          error.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          error.name === 'QuotaExceededError' ||
          // Firefox
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          this.source.syncQueue.skip();
          return this.target.reset().then(() => {
            later(() => window.location.reload(), 1);
          });
        }
        throw error;
      }
    });
  }
}

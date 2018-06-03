import IndexedDBSource from '@orbit/indexeddb';

export default {
  create(injections = {}) {
    injections.name = 'backup';
    injections.namespace = 'kitsu-backup';
    return new IndexedDBSource(injections);
  }
}

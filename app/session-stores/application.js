import LocalStorageStore from 'ember-simple-auth/session-stores/local-storage';

export default class ApplicationStore extends LocalStorageStore {
  key = 'ember_simple_auth:session';
}

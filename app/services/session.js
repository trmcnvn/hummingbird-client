import Session from 'ember-simple-auth/services/session';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { UnauthorizedError } from 'ember-data/adapters/errors';

export default Session.extend({
  account: null,
  error: null,
  store: service(),
  raven: service(),

  authenticateWithOAuth2(identification, password) {
    return this.authenticate('authenticator:oauth2', identification, password);
  },

  authenticateWithFacebook() {
    return this.authenticate('authenticator:assertion', 'facebook');
  },

  isCurrentUser(user) {
    const isAuthenticated = this.isAuthenticated();
    if (!isAuthenticated || !user) { return false; }
    return this.account.get('id') === (user.get('id') || user);
  },

  isAuthenticated() {
    return this.isAuthenticated && this.account !== null;
  },

  getCurrentUser() {
    return this.account;
  },

  async fetchCurrentUser() {
    try {
      const users = await this.store.query('user', {
        filter: { self: true }
      });
      const user = users.get('firstObject');
      if (!user) {
        throw new UnauthorizedError();
      }
      return set(this, 'account', user);
    } catch (error) {
      this.raven.captureException(error);
      const status = get(error, 'errors.firstObject.status');
      // Don't invalidate the session for 5xx errors
      if (status && status.charAt(0) === '5') {
        set(this, 'error', 'serverError');
      } else {
        this.invalidate();
        throw error;
      }
    }
  }
});

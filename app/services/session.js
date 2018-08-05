import SessionService from 'ember-simple-auth/services/session';
import { get, set } from '@ember/object';
import { service } from '@ember-decorators/service';
import { isArray } from '@ember/array';
import { ClientError } from '@orbit/data';
import { computed } from '@ember-decorators/object';
import RSVP from 'rsvp';

export default class Session extends SessionService {
  userId = null; // This is the local store id, not the user's remote id.

  @service store;
  @service raven;
  @service router;

  @computed('userId')
  get currentUser() {
    return this.getCurrentUser();
  }

  @computed('session.isAuthenticated', 'userId')
  get hasSession() {
    return this.isAuthenticated();
  }

  @computed('session.content.authenticated')
  get authData() {
    return this.session.content.authenticated;
  }

  authenticateWithOAuth2(identification, password) {
    return this.authenticate('authenticator:oauth2', identification, password);
  }

  authenticateWithFacebook() {
    return this.authenticate('authenticator:assertion', 'facebook');
  }

  isCurrentUser(user) {
    const isAuthenticated = this.isAuthenticated();
    if (!isAuthenticated || !user) { return false; }
    const currentUser = this.getCurrentUser();
    return currentUser && currentUser.remoteId === (user.remoteId || user);
  }

  isAuthenticated() {
    return this.session.isAuthenticated && this.userId !== null;
  }

  getCurrentUser() {
    try {
      return this.store.cache.query(q => q.findRecord({ type: 'user', id: this.userId }));
    } catch (error) {
      return null;
    }
  }

  async fetchCurrentUser() {
    // @Debug
    console.debug('Attempting to fetch the current user');
    console.debug('Current state:', this.session.isAuthenticated);

    if (!this.session.isAuthenticated) { return RSVP.reject(); }
    try {
      const users = await this.store.request('user', {
        filter: { self: true },
        cache: false
      });
      const user = isArray(users) ? users.firstObject : null;
      if (!user) {
        throw new ClientError('Unauthorized');
      }
      set(this, 'userId', user.id);
      return user;
    } catch (error) {
      // Don't invalidate the session for 5xx errors
      const status = get(error, 'response.status');
      if (status === 401) {
        this.invalidate();
      } else {
        this.raven.captureException(error);
        this.router.replaceWith('server-error');
      }
    }
  }

  openAuthenticationModal() {
    const element = document.getElementById('sign-up-header-link');
    if (!element) { return; }
    element.click();
  }
}

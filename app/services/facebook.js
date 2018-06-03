import Service from '@ember/service';
import RSVP from 'rsvp';
import { service } from '@ember-decorators/service';

export default class Facebook extends Service {
  @service fetch;
  @service store;
  @service torii;

  connect(userId) {
    return new RSVP.Promise((resolve, reject) => {
      this.torii.open('facebook', {})
        .then(response => resolve(response))
        .catch(error => reject(error));
    }).then(response => {
      const record = { type: 'user', id: userId };
      return this.store.update(t => t.replaceAttribute(record, "facebookId", response.userId));
    });
  }

  disconnect(userId) {
    const record = { type: 'user', id: userId };
    return this.store.update(t => t.replaceAttribute(record, "facebookId", null));
  }

  /**
   * Create follow relationships with Facebook friends that also use Kitsu
   */
  createNetwork() {
    if (!this.isFacebookLoaded()) {
      throw new Error('Facebook is not loaded.');
    }
    return new RSVP.Promise((resolve, reject) => {
      window.FB.getLoginStatus(({ status, authResponse }) => {
        if (status === 'connected') {
          this.fetch.request('/follows/import_from_facebook', {
            method: 'POST',
            body: JSON.stringify({
              assertion: authResponse.accessToken
            })
          }).then(response => resolve(response)).catch(error => reject(error));
        } else {
          this.torii.open('facebook', {}).then(() => this.createNetwork());
        }
      });
    })
  }

  getUserData() {
    if (!this.isFacebookLoaded()) {
      throw new Error('Facebook is not loaded.');
    }
    return new RSVP.Promise(resolve => {
      window.FB.api('/me', { fields: 'id,name,email,gender' }, response => {
        resolve(response);
      });
    });
  }

  isFacebookLoaded() {
    return window.FB !== undefined;
  }
}

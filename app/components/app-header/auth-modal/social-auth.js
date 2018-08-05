import Component from './-base';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { underscore } from '@orbit/utils';
import { action } from '@ember-decorators/object';

export default class SocialAuth extends Component {
  @service intl;
  @service facebook;
  @service session;
  @service('notification-messages') notifications;

  @task({ drop: true })
  authenticateWithFacebook = function* () {
    try {
      yield this.session.authenticateWithFacebook();
      this.closeModal();
    } catch (error) {
      console.debug('Facebook Auth Error:', error); // @Debug
      if (error && error.error === 'invalid_grant') {
        try {
          const response = yield this.facebook.getUserData();
          const data = { ...response, name: underscore(response.name) };
          console.debug('Facebook User Data:', data); // @Debug
          this.authentication.setComponent('sign-up', data);
        } catch (error) {
          const message = this.intl.t('application.authentication.errors.facebook-user');
          this.notifications.error(message, { clearDuration: 5000 });
        }
      } else {
        const message = this.intl.t('application.authentication.errors.facebook-user');
        this.notifications.error(message, { clearDuration: 5000 });
      }
    }
  };

  @action
  handleTransition(event) {
    const { target } = event;
    if (target.tagName === 'A') {
      this.closeModal();
    }
  }
}

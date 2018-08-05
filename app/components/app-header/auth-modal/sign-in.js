import Component from './-base';
import { waitForProperty } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { underscore } from '@orbit/utils';
import getErrorMessage from '../../../utils/get-error-message';

export default class SignIn extends Component {
  identification = null;
  password = null;

  @service experiments;
  @service intl;
  @service facebook;
  @service fetch;
  @service session;
  @service('notification-messages') notifications;

  @computed('identification', 'password')
  get isButtonDisabled() {
    return !((this.identification && this.identification.length > 1) &&
      (this.password && this.password.length > 1));
  }

  @task({ drop: true })
  authenticateWithFacebook = function* () {
    try {
      yield this.session.authenticateWithFacebook();
      yield this.handleAozora.perform();
    } catch (error) {
      console.debug('Facebook Auth Error:', error); // @Debug
      if (error && error.error === 'invalid_grant') {
        try {
          const response = yield this.facebook.getUserData();
          const data = { ...response, name: underscore(response.name) };
          console.debug('Facebook User Data:', data); // @Debug
          this.transitionToComponent('sign-up', data);
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

  @task({ drop: true })
  authenticate = function* () {
    try {
      yield this.session.authenticateWithOAuth2(this.identification, this.password);
      yield waitForProperty(this, 'session.userId', id => id !== null);
      if (this.experiments.isParticipatingIn('aozora')) {
        yield this.handleAozora.perform();
      } else {
        this.closeModal();
      }
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('application.authentication.errors.invalid-credenditials');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  @task({ drop: true })
  handleAozora = function* () {
    if (this.session.currentUser.isAozoraImported) {
      const conflicts = yield this.fetch.request('/users/_conflicts');
      if (Object.keys(conflicts).length > 1) {
        this.transitionToComponent('aozora-conflict', conflicts);
      } else {
        this.transitionToComponent('aozora-account-details');
      }
    } else { // user is from Kitsu!
      this.closeModal();
    }
  };
}

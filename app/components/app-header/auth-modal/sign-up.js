import Component from './-base';
import { action, computed } from '@ember-decorators/object';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { validator, buildValidations, hasValidations } from 'ember-cp-validations';
import getErrorMessage from '../../../utils/get-error-message';

const Validations = buildValidations({
  name: [
    validator('presence', true),
    validator('length', { min: 3, max: 20 })
  ],
  email: [
    validator('presence', true),
    validator('format', { type: 'email', regex: /^[^@]+@([^@.]+\.)+[^@.]+$/ })
  ],
  password: [
    validator('presence', true),
    validator('length', { min: 8, max: 72 })
  ]
});

@hasValidations(Validations)
export default class SignUp extends Component {
  name = '';
  email = '';
  password = '';
  extraUserData = {};

  @service analytics;
  @service intl;
  @service('notification-messages') notifications;
  @service session;
  @service store;
  @service('password-strength') zxcvbn;

  @task({ drop: true })
  createAccount = function* () {
    try {
      const record = {
        type: 'user',
        attributes: {
          name: this.name,
          email: this.email,
          password: this.password,
          ...this.extraUserData
        }
      };
      const user = yield this.store.addRecord(record, { blocking: true });
      yield this.session.authenticateWithOAuth2(this.email, this.password);
      this.analytics.trackEvent({
        category: 'account',
        action: 'create',
        label: user.facebookId ? 'facebook' : 'kitsu',
        value: user.remoteId
      });
      this.analytics.trackGoogleConversion(863549170, 'jvhFCLzuhG0Q8u3imwM');
      this.analytics.facebookPixel('CompleteRegistration', {
        value: 25.00,
        currency: 'USD'
      });
      this.transitionToComponent('import-select');
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  @computed('password')
  get passwordScore() {
    return this.zxcvbn.strengthProxy(this.password || '');
  }

  @computed('name', 'email', 'password')
  get buttonTranslationKey() {
    const isNameValid = this.validations.attrs.name.isValid;
    const isEmailValid = this.validations.attrs.email.isValid;
    const isPasswordValud = this.validations.attrs.password.isValid;

    if (isNameValid && (!isEmailValid && !isPasswordValud)) {
      return 'username';
    } else if (isEmailValid && (isNameValid && !isPasswordValud)) {
      return 'email';
    } else if (this.validations.isValid) {
      return 'password';
    }
    return 'empty';
  }

  @computed('buttonTranslationKey')
  get isButtonValid() {
    return this.buttonTranslationKey === 'password';
  }

  didReceiveAttrs() {
    if (Object.keys(this.data).length > 0) {
      ['name', 'email'].forEach(field => {
        if (field in this.data) {
          this.set(field, this.data[field]);
        }
      });
      this.set('extraUserData', {
        gender: this.data.gender,
        facebookId: this.data.id
      });
    }
  }

  didInsertElement() {
    const element = document.querySelectorAll(`.modal-body input.username`)[0];
    element.focus();
  }

  @action
  removeFade(target) {
    const element = document.querySelectorAll(`.modal-body .auth-section-${target}`)[0];
    if (element.classList.contains('faded')) {
      element.classList.remove('faded');
    }
  }
}

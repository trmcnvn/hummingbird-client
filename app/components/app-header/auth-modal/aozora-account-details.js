import Component from './sign-up';
import template from '../../../templates/components/app-header/auth-modal/sign-up';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { layout } from '@ember-decorators/component';
import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import getErrorMessage from '../../../utils/get-error-message';

@layout(template)
export default class AozoraAccountDetails extends Component {
  @service intl;
  @service raven;
  @service session;
  @service store;
  @service('notification-messages') notifications;

  @task({ drop: true })
  createAccount = function* () {
    const user = this.session.getCurrentUser();
    const record = {
      type: 'user',
      id: this.session.userId,
      attributes: {
        status: 'registered'
      }
    };
    if (this.name !== user.name) {
      record.attributes.name = this.name;
    }
    if (this.email !== user.email) {
      record.attributes.email = this.email;
    }
    if (isPresent(this.password)) {
      record.attributes.password = this.password;
    }

    try {
      yield this.store.update(t => t.replaceRecord(record), { blocking: true });
      this.closeModal();
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    }
  };

  didReceiveAttrs() {
    assert('must be authenticated', this.session.isAuthenticated());
    const { name, email, password } = this.session.getCurrentUser();
    this.setProperties({ name, email, password });
  }

  didInsertElement() {
    this.removeFade('email');
  }
}

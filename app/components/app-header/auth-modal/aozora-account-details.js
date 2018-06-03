import Component from './sign-up';
import layout from '../../../templates/components/app-header/auth-modal/sign-up';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';

export default class AozoraAccountDetails extends Component {
  layout = layout;

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
      // @TODO: Attempt to get human-readable server error from `error`
      // otherwise, default to a translated error
      const message = this.intl.t('application.authentication.errors.unknown-error');
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

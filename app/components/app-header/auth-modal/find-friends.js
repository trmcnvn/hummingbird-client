import Component from './-base';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';
import { isPresent } from '@ember/utils';
import { taskState } from 'kitsu/app/decorators';

export default class FindFriends extends Component {
  @service facebook;
  @service intl;
  @service session;
  @service('notification-messages') notifications;
  @taskState('isRunning', 'connectFacebook', 'disconnectFacebook', 'createNetwork') isWorking;

  @task({ drop: true })
  connectFacebook = function* () {
    try {
      yield this.facebook.connect(this.session.userId);
    } catch (error) {
      const message = this.intl.t('application.authentication.errors.facebook-connected');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  @task({ drop: true })
  disconnectFacebook = function* () {
    try {
      yield this.facebook.disconnect(this.session.userId)
    } catch (error) {
      const message = this.intl.t('application.authentication.errors.unknown-error');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  @task({ drop: true })
  createNetwork = function* () {
    if (this.session.currentUser && isPresent(this.session.currentUser.facebookId)) {
      try {
        yield this.facebook.createNetwork();
      } catch (error) { } // eslint-disable-line no-empty
    }
    this.closeModal();
  };
}

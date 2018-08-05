import Component from '@ember/component';
import template from '../templates/components/user-follow-button';
import { layout, tagName } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';
import { reads, bool } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import getErrorMessage from 'kitsu/utils/get-error-message';

@layout(template)
@tagName('')
export default class UserFollowButton extends Component {
  @argument user = null;

  @service intl;
  @service('notification-messages') notifications;
  @service raven;
  @service session;
  @service store;

  @reads('fetchFollow.last.value.firstObject') followRecord;
  @bool('followRecord') isFollowing;

  @task({ drop: true })
  fetchFollow = function* () {
    return yield this.store.request('follow', {
      filter: {
        follower: this.session.currentUser.remoteId,
        followed: this.user.remoteId
      }
    });
  };

  @task({ drop: true })
  createFollow = function* () {
    const record = {
      type: 'follow',
      relationships: {
        follower: { data: this.session.currentUser.identity },
        followed: { data: this.user.identity }
      }
    };
    try {
      const follow = yield this.store.addRecord(record);
      yield this.store.update(t => (
        t.replaceAttribute(this.session.currentUser.identity, 'followingCount', this.session.currentUser.followingCount + 1)
      ), { local: true });
      this.set('followRecord', follow);
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    }
  };

  @task({ drop: true })
  destroyFollow = function* () {
    try {
      yield this.store.update(t => t.removeRecord(this.followRecord.identity));
      yield this.store.update(t => (
        t.replaceAttribute(this.session.currentUser.identity, 'followingCount', this.session.currentUser.followingCount - 1)
      ), { local: true });
      this.set('followRecord', null);
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.delete');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    }
  };

  didReceiveAttrs() {
    if (!this.session.isAuthenticated()) { return; }
    this.fetchFollow.perform();
  }

  @action
  onClick() {
    if (!this.session.isAuthenticated()) {
      return this.session.openAuthenticationModal();
    }
    const action = this.isFollowing ? 'destroyFollow' : 'createFollow';
    this[action].perform();
  }
}

import Component from '@ember/component';
import template from '../templates/components/user-actions';
import { layout, className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { reads, bool } from '@ember-decorators/object/computed';
import { action, computed } from '@ember-decorators/object';
import getErrorMessage from 'kitsu/utils/get-error-message';

@layout(template)
export default class UserActions extends Component {
  showBlockModal = false;
  isUserBlocked = false;

  @className('vertical', 'horizontal')
  @argument vertical = false;
  @argument user = null;

  @service intl;
  @service('notification-messages') notifications;
  @service session;
  @service store;

  @reads('fetchFollow.last.value.firstObject') followRecord;
  @bool('followRecord') hasRecord;

  @computed('followRecord.hidden')
  get isHidden() {
    return this.followRecord && this.followRecord.hidden;
  }

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
  blockUser = function* () {
    if (!this.session.isAuthenticated()) {
      return this.session.openAuthenticationModal();
    }
    const record = {
      type: 'block',
      relationships: {
        user: { data: this.session.currentUser.identity },
        blocked: { data: this.user.identity }
      }
    };
    try {
      this.set('showBlockModal', false);
      yield this.store.addRecord(record, { blocking: true });
      this.set('isUserBlocked', true);

      const message = this.intl.t('shared-addon.app-feed.items.post.actions.blocked', { name: this.user.name });
      this.notifications.success(message);
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  didReceiveAttrs() {
    if (!this.session.isAuthenticated()) { return; }
    this.fetchFollow.perform();
  }

  @action
  hidePosts() {
    if (!this.session.isAuthenticated()) { return this.session.openAuthenticationModal(); }
    if (!this.hasRecord) { return; }

    // Flip the hidden state
    this.store.update(t => t.replaceAttribute(this.followRecord.identity, 'hidden', !this.isHidden));
  }

  @action
  toggleBlockModal() {
    if (!this.session.isAuthenticated()) { return this.session.openAuthenticationModal(); }
    this.set('showBlockModal', true);
  }
}

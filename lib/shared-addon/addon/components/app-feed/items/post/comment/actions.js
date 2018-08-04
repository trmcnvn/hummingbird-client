import Component from '@ember/component';
import template from '../../../../../templates/components/app-feed/items/post/comment/actions';
import { layout } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';
/* global ClipboardJS */

@layout(template)
export default class Actions extends Component {
  groupMemberRecord = null;
  showEditModal = false;
  showDeleteModal = false;
  showReportModal = false;
  showBlockModal = false;
  isUserBlocked = false;

  @argument comment = null;
  @argument post = null;

  @service intl;
  @service('notification-messages') notifications;
  @service session;
  @service store;

  @computed('comment', 'groupMemberRecord')
  get canMutateComment() {
    if (!this.session.isAuthenticated()) { return false; }
    const isStaffOrMod = this.session.currentUser.isStaff;
    const isAuthor = this.session.isCurrentUser(this.comment.user);

    if (this.post.targetGroup && this.groupMemberRecord) {
      const hasPermission = this.groupMemberRecord.hasPermission('content');
      return hasPermission || isAuthor || isStaffOrMod;
    }
    return isAuthor || isStaffOrMod;
  }

  @task({ drop: true })
  fetchGroupMember = function* () {
    if (!this.post.targetGroup) { return; }
    const records = yield this.store.request('groupMember', {
      filter: {
        group: this.post.targetGroup.remoteId,
        user: this.session.currentUser.remoteId
      },
      include: 'permissions',
      cache: false
    });
    this.set('groupMemberRecord', records.firstObject);
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
        blocked: { data: this.comment.user.identity }
      }
    };
    yield this.store.update(t => t.addRecord(record));
    this.set('showBlockModal', false);
    this.set('isUserBlocked', true);
    const message = this.intl.t('shared-addon.app-feed.items.post.actions.blocked', { name: this.comment.user.name });
    this.notifications.success(message);
  };

  onCopy = () => {
    const message = this.intl.t('general.copied');
    this.notifications.success(message);
  };

  didRender() {
    const elements = this.element.querySelectorAll('[data-clipboard-text]');
    if (!this._clipboard && elements.length > 0) {
      this._clipboard = new ClipboardJS(elements);
      this._clipboard.on('success', this.onCopy);
    }
  }

  willDestroyElement() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
  }

  @action
  getCopyLink(link) {
    return `${window.location.protocol}//${window.location.host}${link}`;
  }

  @action
  noop() { }

  @action
  deleteComment() {
    this.set('showDeleteModal', false);
    this.onDelete().then(() => {
      const message = this.intl.t('shared-addon.app-feed.items.post.comments.actions.deleted');
      this.notifications.success(message);
    }).catch(() => {});
  }

  @action
  reportCreated() {
    const message = this.intl.t('general.reported');
    this.notifications.success(message);
  }
}

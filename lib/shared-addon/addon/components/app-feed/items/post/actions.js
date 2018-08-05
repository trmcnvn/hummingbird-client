import Component from '@ember/component';
import template from '../../../../templates/components/app-feed/items/post/actions';
import { layout } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { all } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { capitalize } from '@ember/string';
import getErrorMessage from 'kitsu/utils/get-error-message';
/* global ClipboardJS */

@layout(template)
export default class Actions extends Component {
  showEditModal = false;
  showDeleteModal = false;
  showReportModal = false;
  showBlockModal = false;
  isUserBlocked = false;

  postFollowRecord = null;
  userFollowRecord = null;
  groupMemberRecord = null;
  mediaIgnoreRecord = null;

  @argument feed = null;
  @argument post = null;

  @service intl;
  @service('notification-messages') notifications;
  @service session;
  @service store;

  @computed('post', 'groupMemberRecord')
  get canMutatePost() {
    if (!this.session.isAuthenticated()) { return false; }
    const isStaffOrMod = this.session.currentUser.isStaff;
    const isAuthor = this.session.isCurrentUser(this.post.user);

    if (this.post.targetGroup && this.groupMemberRecord) {
      const hasPermission = this.groupMemberRecord.hasPermission('content');
      return hasPermission || isAuthor || isStaffOrMod;
    }
    return isAuthor || isStaffOrMod;
  }

  @computed('feed')
  get isOnTimeline() {
    return this.feed && this.feed.split('/')[0] === 'timeline';
  }

  @computed('feed')
  get isOnInterest() {
    return this.feed && this.feed.split('/')[0] === 'interest_timeline';
  }

  @computed('post.user.pinnedPost')
  get isPostPinned() {
    const post = this.post.user.pinnedPost;
    return post && post.id === this.post.id;
  }

  onCopy = () => {
    const message = this.intl.t('general.copied');
    this.notifications.success(message);
  };

  @task({ drop: true })
  fetchRecords = function* () {
    if (this._hasFetched || !this.session.isAuthenticated()) { return; }
    const tasks = [
      this.fetchPostFollow.perform(),
      this.fetchUserFollow.perform(),
      this.fetchGroupMember.perform(),
      this.fetchMediaIgnore.perform(),
      this.fetchPinnedPost.perform()
    ];
    yield all(tasks);
    this._hasFetched = true;
  };

  @task({ drop: true })
  fetchPostFollow = function* () {
    if (this.session.isCurrentUser(this.post.user)) { return; }
    const response = yield this.store.request('postFollow', {
      filter: {
        user_id: this.session.currentUser.remoteId,
        post_id: this.post.remoteId
      },
      cache: false
    });
    if (response.length === 0) { return; }
    this.set('postFollowRecord', response.firstObject);
  };

  @task({ drop: true })
  fetchUserFollow = function* () {
    if (this.session.isCurrentUser(this.post.user)) { return; }
    if (this.post.targetGroup) { return; }
    const records = yield this.store.request('follow', {
      filter: {
        follower: this.session.currentUser.remoteId,
        followed: this.post.user.remoteId
      },
      cache: false
    });
    this.set('userFollowRecord', records.firstObject);
  };

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
  fetchMediaIgnore = function* () {
    if ((!this.isOnInterest && this.reason !== 'media') || !this.post.media) { return; }
    const records = yield this.store.request('mediaIgnore', {
      filter: {
        user_id: this.session.currentUser.remoteId,
        media_id: this.post.media.remoteId,
        media_type: capitalize(this.post.media.type)
      },
      cache: false
    });
    this.set('mediaIgnoreRecord', records.firstObject);
  };

  @task({ drop: true })
  fetchPinnedPost = function* () {
    if (!this.session.isCurrentUser(this.post.user)) { return; }
    yield this.store.query(q => q.findRelatedRecord(this.post.user.identity, 'pinnedPost'), { blocking: true });
  };

  @task({ drop: true })
  followPost = function* () {
    if (!this.session.isAuthenticated()) {
      return this.session.openAuthenticationModal();
    }
    if (this.postFollowRecord) {
      yield this.store.update(t => t.removeRecord(this.postFollowRecord.identity));
      this.set('postFollowRecord', null);
    } else {
      const record = {
        type: 'postFollow',
        relationships: {
          post: { data: this.post.identity },
          user: { data: this.session.currentUser.identity }
        }
      };
      const response = yield this.store.addRecord(record);
      this.set('postFollowRecord', response);
    }
  };

  @task({ drop: true })
  hideGroup = function* () {
    if (!this.groupMemberRecord) { return; }
    const value = !this.groupMemberRecord.hidden;
    yield this.store.update(t => t.replaceAttribute(this.groupMemberRecord.identity, 'hidden', value));
  };

  @task({ drop: true })
  hideUser = function* () {
    if (!this.userFollowRecord) { return; }
    const value = !this.userFollowRecord.hidden;
    yield this.store.update(t => t.replaceAttribute(this.userFollowRecord.identity, 'hidden', value));
  };

  @task({ drop: true })
  hideMedia = function* () {
    if (this.mediaIgnoreRecord) {
      yield this.store.update(t => t.removeRecord(this.mediaIgnoreRecord.identity));
      this.set('mediaIgnoreRecord', null);
    } else {
      const record = {
        type: 'mediaIgnore',
        relationships: {
          user: { data: this.session.currentUser.identity },
          media: { data: this.post.media.identity }
        }
      };
      const response = yield this.store.addRecord(record);
      this.set('mediaIgnoreRecord', response);
    }
  };

  @task({ drop: true })
  pinPost = function* () {
    if (this.isPostPinned) {
      yield this.store.update(t => t.replaceRelatedRecord(this.post.user.identity, 'pinnedPost', null));
    } else {
      yield this.store.update(t => t.replaceRelatedRecord(this.post.user.identity, 'pinnedPost', this.post.identity));
    }
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
        blocked: { data: this.post.user.identity }
      }
    };
    try {
      yield this.store.addRecord(record, { blocking: true });
      this.set('showBlockModal', false);
      this.set('isUserBlocked', true);

      const message = this.intl.t('shared-addon.app-feed.items.post.actions.blocked', { name: this.post.user.name });
      this.notifications.success(message);
    } catch (error) {
      this.set('showBlockModal', false);
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
    }
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
  deletePost() {
    this.set('showDeleteModal', false);
    this.onDelete();
  }

  @action
  reportCreated() {
    const message = this.intl.t('general.reported');
    this.notifications.success(message);
  }
}

import Component from '@ember/component';
import layout from '../../../../templates/components/app-feed/items/post/comment';
import { task } from 'ember-concurrency-decorators';
import { argument } from '@ember-decorators/argument';
import Pagination from 'shared-addon/mixins/pagination';
import { tagName } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';

@Pagination
@tagName('')
export default class Comment extends Component {
  layout = layout;
  paginationType = 'comment';
  records = [];

  @argument post = null;
  @argument comment = null;
  @argument isReply = false;
  @argument onDelete = () => {};

  @service('notification-messages') notifications;
  @service store;
  @alias('records') replies;

  @computed('comment.repliesCount', 'replies.[]')
  get hasMoreReplies() {
    const record = this.replies.firstObject;
    if (!record) { return false; }
    const count = this.comment.repliesCount;
    return this.replies.length < count;
  }

  @task({ drop: true })
  fetchReplies = function* () {
    const options = this.buildQueryExpression();
    options.page.limit = 2;
    const records = yield this.store.request(this.paginationType, options);
    this.records.addObjects(records.toArray().reverse());
  }

  @task({ drop: true })
  deleteComment = function* () {
    try {
      yield this.store.update(t => t.removeRecord(this.comment.identity), { blocking: true });
      this.onDelete(this.comment);
    } catch (error) {
      const message = this.intl.t('shared-addon.errors.request');
      this.notifications.error(message);
    }
  };

  @task({ drop: true })
  onLike = function* () {
    yield this.store.update(t => (
      t.replaceAttribute(this.comment.identity, 'likesCount', this.comment.likesCount + 1)
    ), { local: true });
  };

  @task({ drop: true })
  onDislike = function* () {
    yield this.store.update(t => (
      t.replaceAttribute(this.comment.identity, 'likesCount', this.comment.likesCount - 1)
    ), { local: true });
  };

  didInsertElement() {
    if (!this.isReply && this.comment.repliesCount > 0) {
      this.fetchReplies.perform();
    }
  }

  addPaginationRecords(records) {
    this.records.addObjects(records, true);
  }

  updatePaginationState() {
    return this.replies.length;
  }

  buildQueryExpression() {
    return {
      filter: {
        post_id: this.post.remoteId,
        parent_id: this.comment.remoteId
      },
      fields: {
        users: ['avatar', 'name', 'slug'].join()
      },
      page: {
        limit: 10
      },
      include: ['user', 'uploads'].join(),
      sort: '-createdAt',
      cache: false
    };
  }

  @action
  onReplyDeleted(comment) {
    this.records.removeObject(comment);
    this.store.update(t => (
      t.replaceAttribute(this.comment.identity, 'repliesCount', this.comment.repliesCount - 1)
    ), { local: true });
  }
}

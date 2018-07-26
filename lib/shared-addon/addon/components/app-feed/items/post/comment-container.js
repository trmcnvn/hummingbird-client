import Component from '@ember/component';
import template from '../../../../templates/components/app-feed/items/post/comment-container';
import { layout } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';
import Pagination from 'shared-addon/mixins/pagination';
import { computed, action } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';

@Pagination
@layout(template)
export default class CommentContainer extends Component {
  paginationType = 'comment';
  records = [];
  sortOptions = Object.freeze(['likes', 'replies', 'oldest']);

  @argument isPermalinkPage = false;
  @argument selectedSort = this.isPermalinkPage ? 'oldest' : null;

  @service store;
  @alias('records') comments;

  @computed('post.topLevelCommentsCount', 'comments.[]')
  get hasMoreComments() {
    const record = this.comments.firstObject;
    if (!record) { return false; }
    const count = this.post.topLevelCommentsCount;
    return this.comments.length < count;
  }

  @task({ drop: true })
  fetchComments = function* () {
    const options = this.buildQueryExpression();
    options.page.limit = this.isPermalinkPage ? 10 : 2;
    let records = yield this.store.request(this.paginationType, options);
    records = this.isPermalinkPage ? records : records.toArray().reverse();
    this.records.addObjects(records);
  };

  didReceiveAttrs() {
    if (!this.comment && this.post.topLevelCommentsCount > 0) {
      this.fetchComments.perform();
    } else if (this.comment) {
      this.records.clear();
      this.records.addObject(this.comment);
    }
  }

  buildQueryExpression() {
    return {
      filter: {
        post_id: this.post.remoteId,
        parent_id: '_none'
      },
      fields: {
        users: ['avatar', 'name', 'slug'].join()
      },
      include: ['user', 'uploads'].join(),
      sort: this.getSortOrder(),
      page: { limit: 10 },
      cache: false
    };
  }

  addPaginationRecords(records) {
    this.records.addObjects(records, !this.isPermalinkPage);
  }

  updatePaginationState() {
    return this.comments.length;
  }

  getSortOrder() {
    switch (this.selectedSort) {
      case 'likes': {
        return ['-likesCount', 'createdAt'].join();
      }
      case 'replies': {
        return ['-repliesCount', 'createdAt'].join();
      }
      case 'oldest': {
        return 'createdAt';
      }
      default: {
        return '-createdAt';
      }
    }
  }

  @action
  changeSort(sort) {
    this.set('selectedSort', sort);
    this.records.clear();
    this.fetchComments.perform();
  }

  @action
  onDelete(comment) {
    this.records.removeObject(comment);
    this.store.update(t => (
      t.replaceAttribute(this.post.identity, 'topLevelCommentsCount', this.post.topLevelCommentsCount - 1)
    ), { local: true });
  }
}

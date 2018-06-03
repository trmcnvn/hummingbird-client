import Component from '@ember/component';
import layout from '../../templates/components/app-feed/activity-likes';
import { task } from 'ember-concurrency-decorators';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { concat } from 'kitsu/decorators';

export default class ActivityLikes extends Component {
  layout = layout;
  internalRecords = [];

  @argument likedCount = 0;
  @argument showUsers = true;

  @service analytics;
  @service session;
  @service store;

  @concat('fetchLikes.last.value', 'fetchUserLike.last.value', 'internalRecords') records;

  @computed('records.[]')
  get userRecord() {
    if (!this.session.isAuthenticated()) { return null; }
    return this.records.findBy('user.remoteId', this.session.currentUser.remoteId);
  }

  @computed('userRecord')
  get isLiked() {
    return !!this.userRecord;
  }

  @computed('activity.type')
  get recordKey() {
    return `${this.activity.type}_id`;
  }

  @computed('activity.type')
  get recordType() {
    return `${this.activity.type}Like`;
  }

  @task({ drop: true })
  fetchLikes = function* () {
    const records = yield this.store.request(this.recordType, this._requestOptions());
    yield this.fetchUserLike.perform(records);
    return records;
  };

  @task({ drop: true })
  fetchUserLike = function* (records) {
    if (!this.session.isAuthenticated()) { return []; }
    if (!this.isLiked && records.length >= 4) {
      return yield this.store.request(this.recordType, {
        filter: {
          [this.recordKey]: this.activity.remoteId,
          user_id: this.session.currentUser.remoteId
        },
        include: 'user'
      });
    }
    return [];
  };

  @task({ drop: true })
  onPagination = function* () {
    const options = this._requestOptions();
    options.page.limit = 20;
    options.page.offset = this.records.length;
    const records = yield this.store.request(this.recordType, options);
    // handle duplicates in the task results
    records.forEach(record => {
      if (!this.records.includes(record)) {
        this.internalRecords.addObject(record);
      }
    });
  };

  @task({ drop: true })
  createLike = function* () {
    if (!this.session.isAuthenticated()) {
      return this.session.openAuthenticationModal();
    }
    if (this.isLiked) {
      yield this.onDislike();
      yield this.store.update(t => t.removeRecord(this.userRecord.identity));
      this.internalRecords.removeObject(this.userRecord);
    } else {
      const record = {
        type: this.recordType,
        relationships: {
          [this.activity.type]: { data: this.activity.identity },
          user: { data: this.session.currentUser.identity }
        }
      };
      yield this.onLike();
      const response = yield this.store.addRecord(record);
      this.internalRecords.addObject(response);
      this.analytics.trackEvent({
        category: this.activity.type,
        action: 'like',
        value: this.activity.remoteId
      });
    }
  };

  didInsertElement() {
    if (this.likedCount > 0) {
      this.fetchLikes.perform();
    }
  }

  _requestOptions() {
    return {
      filter: {
        [this.recordKey]: this.activity.remoteId
      },
      fields: {
        users: ['avatar', 'name', 'slug', 'followersCount'].join()
      },
      page: { limit: 4 },
      include: 'user'
    };
  }
}

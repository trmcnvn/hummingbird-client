import Component from '@ember/component';
import template from '../templates/components/app-feed';
import { argument } from '@ember-decorators/argument';
import { layout } from '@ember-decorators/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { run } from '@ember/runloop';
import { toArray } from '@orbit/utils';
import { action } from '@ember-decorators/object';
import { dasherize } from '@ember/string';

const FILTERS = {
  ALL: 'all',
  USER: 'user',
  MEDIA: 'media'
};

@layout(template)
export default class AppFeed extends Component {
  records = [];
  newActivities = [];
  activitiesToLink = [];
  filterOptions = Object.values(FILTERS);
  showNotice = true;

  @argument showPostCreation = true;
  @argument feed = 'global/global';
  @argument interestType = null;
  @argument targetGroup = {};
  @argument targetMedia = {};
  @argument showFilters = true;
  @argument extraFilters = [];
  @argument selectedFilter = FILTERS.ALL;

  @service cache;
  @service intl;
  @service('notification-messages') notifications;
  @service raven;
  @service session;
  @service store;

  @task({ keepLatest: true })
  fetchFeed = function* (page = { limit: 10 }, shouldAddRecords = true) {
    const path = `feeds/${this.feed}`;
    const options = {
      include: [
        // activity
        ['media', 'actor', 'unit', 'subject', 'target'].join(),
        // posts
        ['user', 'target_user', 'spoiled_unit', 'media', 'target_group', 'uploads'].map(relation => `target.${relation}`).join(),
        ['user', 'target_user', 'spoiled_unit', 'media', 'target_group', 'uploads'].map(relation => `subject.${relation}`).join(),
        // follow
        ['subject.followed'].join(),
        // review/reaction
        ['library_entry', 'anime', 'manga'].map(relation => `subject.${relation}`).join()
      ].join(),
      page,
      cache: false
    };
    if (this.selectedFilter && this.selectedFilter !== FILTERS.ALL) {
      options.filter = { kind: this.selectedFilter === FILTERS.USER ? 'posts' : this.selectedFilter };
    }

    try {
      const records = yield this.store.request(path, options, true);
      if (records.length === 0) { return records; }
      if (shouldAddRecords) {
        this.records.addObjects(records);
      }
      // @Orbit
      const { _meta: { feed: { group, id, token } } } = records.firstObject;
      this.subscribeToStream(group, id, token);
      // @Metrics (Stream Impressions)
      return records;
    } catch (error) {
      const message = this.intl.t('shared-addon.errors.feed-request');
      this.notifications.error(message);
      this.raven.captureException(error);
      console.error(error);
    }
  };

  @task({ drop: true })
  fetchNextPage = function* () {
    const recordIds = this.records.mapBy('group');
    const records = yield this.fetchFeed.perform({
      cursor: this.records.lastObject.remoteId,
      limit: 10
    });
    this.clearDuplicates(recordIds, records);
    // @Metrics (Stream Impressions)
  };

  @task({ drop: true })
  fetchNewActivities = function* () {
    const recordIds = this.records.mapBy('group');
    const records = yield this.fetchFeed.perform({
      limit: this.newActivities.length
    }, false);
    this.clearDuplicates(recordIds, records);
    this.records.addObjects(records, true);
    this.newActivities.clear();
    // @Metrics (Stream Impressions)
  };

  @task({ drop: true })
  onPostCreated = function* (post) {
    const link = this.activitiesToLink.popObject();
    let record = {
      type: 'activity',
      attributes: {
        foreignId: `Post:${post.remoteId}`
      },
      relationships: {
        subject: { data: post.identity }
      }
    };
    if (link) {
      record.keys = {
        remoteId: link.id
      };
    }
    const activity = yield this.store.addRecord(record, { local: true });

    record = {
      type: 'activityGroup',
      attributes: {
        group: post.remoteId
      },
      relationships: {
        activities: { data: [activity.identity] }
      }
    };
    if (link) {
      record.keys = {
        remoteId: link.id
      };
    }
    const activityGroup = yield this.store.addRecord(record, { local: true });
    this.records.addObject(activityGroup, true);
  };

  didReceiveAttrs() {
    this.filterOptions.clear();
    this.filterOptions.addObjects([...Object.values(FILTERS), ...this.extraFilters]);

    if (this.showFilters) {
      const filter = this.cache.get('app-feed-filter');
      this.set('selectedFilter', filter || FILTERS.ALL);
    } else {
      this.set('selectedFilter', FILTERS.ALL);
    }

    if (this.interestType) {
      const value = this.cache.get(`${this.interestType}-notice`);
      this.set('showNotice', !value);
    }
    if (this.feed) { this.reloadFeed(); }
  }

  willDestroyElement() {
    if (this._subscription) {
      this._subscription.cancel();
      this._subscription = null;
    }
  }

  reloadFeed() {
    this.willDestroyElement();
    this.records.clear();
    this.newActivities.clear();
    this.fetchFeed.perform();
  }

  clearDuplicates(ids, records) {
    if (!records) { return; }
    const duplicates = ids.filter(id => records.find(record => record.group === id));
    run(() => {
      duplicates.forEach(duplicate => {
        const record = this.records.findBy('group', duplicate);
        this.records.removeObject(record);
      });
    });
  }

  subscribeToStream(group, id, token) {
    if (!window.kitsu.getstream || this._subscription) { return; }
    this._subscription = window.kitsu.getstream.feed(group, id, token).subscribe(data => {
      this.handleStreamResponse(data);
    });
  }

  handleStreamResponse(data) {
    const newActivities = toArray(data.new);
    if (newActivities.length > 0) {
      run(() => {
        newActivities.forEach(activity => {
          // filter out if not apart of the current filter
          const [type, id] = activity['foreign_id'].split(':');
          if (this.selectedFilter === FILTERS.MEDIA && (type === 'Post' || type === 'Comment')) { return; }
          if (this.selectedFilter === FILTERS.USER && (type !== 'Post' && type !== 'Comment')) { return; }

          // Is the current user the author of this new activity?
          if (type === 'Post' || type === 'Comment' && (activity.actor.split(':')[1] === this.session.currentUser.remoteId)) {
            // Link an authored activity to the locally created one
            const record = this.records.findBy('group', id);
            if (type === 'Post') {
              if (record && !record.remoteId) {
                this.store.update(t => [
                  t.replaceKey(record.identity, 'remoteId', activity.id),
                  t.replaceKey(record.activities.firstObject.identity, 'remoteId', activity.id)
                ], { local: true });
              } else { // Potentially this event came in before we created the local record
                this.activitiesToLink.addObject(activity);
              }
            }

            // Only continue if we don't already have this record in the list
            if (record) { return; }
          }

          if (this.newActivities.indexOf(activity.group) !== -1) { return; }
          this.newActivities.addObject(activity);
        });
      });
    }

    const removedActivities = toArray(data.deleted);
    if (removedActivities.length > 0) {
      const transforms = t => (
        removedActivities.reduce((prev, curr) => {
          try {
            const id = this.store.source.keyMap.keyToId('activity', 'remoteId', curr);
            if (!id) { return prev; }
            prev.push(t.removeRecord({ type: 'activity', id }));
            return prev;
          } catch (error) {
            return prev;
          }
        }, [])
      );
      this.store.update(t => transforms(t), { local: true });
    }
  }

  @action
  onPagination() {
    return this.fetchNextPage.perform();
  }

  @action
  setFilter(filter) {
    this.set('selectedFilter', filter);
    this.cache.set('app-feed-filter', filter);
    this.reloadFeed();
  }

  @action
  dismissNotice() {
    this.set('showNotice', false);
    this.cache.set(`${this.interestType}-notice`, true);
  }

  @action
  getActivityType(activity) {
    if (!activity) { return null; }
    const [type] = activity.foreignId.split(':');
    switch (type) {
      // Comment bumping issue, we want to render the post -- not the comment
      case 'Comment': {
        return 'post';
      }
      default: {
        return dasherize(type);
      }
    }
  }

  @action
  onDelete(record, type, shouldRemove = true) {
    if (shouldRemove) { this.records.removeObject(record); }
    const message = this.intl.t(`shared-addon.app-feed.items.${type}.deleted`);
    this.notifications.success(message);
  }

  @action
  isAdIndex(index) {
    return (index + 1) % 10 === 0;
  }
}

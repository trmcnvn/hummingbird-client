import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { toArray, some } from '@orbit/utils';
import { computed, action } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

@tagName('div')
export default class Notifications extends Component {
  forkedStore = null;
  records = [];

  @service fetch;
  @service intl;
  @service('notification-messages') notifications;
  @service session;
  @service store;

  @computed('records.@each.isSeen')
  get unseenCount() {
    return this.records.reduce((prev, curr) => (
      prev + (curr.isSeen ? 0 : 1)
    ), 0);
  }

  @computed('records.@each.isRead')
  get hasUnreadNotifications() {
    return some(this.records, record => record.isRead === false);
  }

  @task({ drop: true })
  fetchNotifications = function* (page = { limit: 15 }, shouldUnshift = false) {
    try {
      const path = `feeds/notifications/${this.session.currentUser.remoteId}`;
      const records = yield this.forkedStore.request(path, {
        include: ['actor', 'subject', 'target.user', 'target.post', 'target.anime', 'target.manga'].join(),
        page
      }, true);
      if (records.length === 0) { return records; }
      this.records.addObjects(records, shouldUnshift);

      // @Orbit
      const { _meta: { feed: { token } } } = records.firstObject;
      this.subscribeToStream(token);
      return records;
    } catch (error) {
      const message = this.intl.t('application.errors.notifications-request');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  @task({ drop: true })
  onPagination = function* () {
    return yield this.fetchNotifications.perform({
      cursor: this.records.lastObject.remoteId,
      limit: 15
    });
  };

  // Update a query-param notification on the forked store (passed down from application)
  didReceiveAttrs() {
    if (!this.forkedStore || !this.notification) { return; }
    try {
      this.forkedStore.update(t => (
        t.replaceAttribute({ type: 'activityGroup', id: this.notification }, 'isRead', true)
      ));
    } catch (error) { } // eslint-disable-line no-empty
  }

  didInsertElement() {
    // We fork the store here as there was an issue in an earlier iteration of Kitsu where
    // notification activity groups would share the same id's as groups from the feeds.
    // This caused `isSeen` and `isRead` to be reset to default values as these properties are
    // only available on the notification feed.
    //
    // Future notifications should use unique ids, but this is still required to handle older
    // data.
    this.forkedStore = this.store.fork();
    this.fetchNotifications.perform();
  }

  willDestroyElement() {
    if (this._subscription) {
      this._subscription.cancel();
      this._subscription = null;
    }
  }

  subscribeToStream(token) {
    if (!window.kitsu.getstream || this._subscription) { return; }
    const id = this.session.currentUser.remoteId;
    this._subscription = window.kitsu.getstream.feed('notifications', id, token).subscribe(data => {
      this.handleStreamResponse(data);
    });
  }

  handleStreamResponse(data) {
    const newActivities = toArray(data.new);
    if (newActivities.length > 0) {
      this.fetchNotifications.perform({ limit: newActivities.length }, true).then(records => {
        records.forEach(record => {
          const activity = record.activities.firstObject;
          if (!activity) { return; }

          const actor = activity.actor.name;
          const message = this.intl.t('application.notifications.new', { actor });
          this.notifications.info(message, {
            cssClasses: 'kitsu-notification'
          });
        })
      });
    }

    const removedActivities = toArray(data.deleted);
    if (removedActivities.length > 0) {
      const transforms = t => (
        removedActivities.reduce((prev, curr) => {
          try {
            const id = this.forkedStore.source.keyMap.keyToId('activity', 'remoteId', curr);
            if (!id) { return prev; }
            prev.push(t.removeRecord({ type: 'activity', id }));
            return prev;
          } catch (error) {
            return prev;
          }
        }, [])
      );
      this.forkedStore.update(t => transforms(t));
    }
  }

  @action
  showPopper() {
    this.markNotifications('seen');
    this.toggleProperty('shouldRenderPopper');
  }

  @action
  markNotifications(type = 'seen') {
    try {
      const property = type === 'seen' ? 'isSeen' : 'isRead';
      const filteredRecords = this.records.filter(record => record[property] == false);
      if (filteredRecords.length === 0) { return; }

      this._remoteMark(type, filteredRecords);
      const records = filteredRecords.map(record => ({ type: record.type, id: record.id }));
      this.forkedStore.update(t => records.map(record => t.replaceAttribute(record, property, true)));
    } catch (error) {
      const message = this.intl.t('application.errors.notifications-marking');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  }

  _remoteMark(type, list) {
    const id = this.session.currentUser.remoteId;
    const path = `/feeds/notifications/${id}/_${type}`;
    return this.fetch.request(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(list.map(item => item.remoteId))
    });
  }
}

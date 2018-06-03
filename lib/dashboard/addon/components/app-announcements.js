import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { toArray } from '@orbit/utils';
import { task } from 'ember-concurrency-decorators';
import { action, computed } from '@ember-decorators/object';
import { mapBy, filterBy } from '@ember-decorators/object/computed';

export default class AppAnnouncements extends Component {
  records = [];

  @service fetch;
  @service intl;
  @service('notification-messages') notifications;
  @service raven;
  @service session;
  @service store;

  @filterBy('records', 'isRead', false) unreadRecords;
  @mapBy('activities', 'subject') announcements;

  @computed('unreadRecords.[]')
  get activities() {
    return this.unreadRecords.mapBy('activities.firstObject');
  }

  @task({ drop: true })
  fetchAnnouncements = function* (page = { limit: 10 }, shouldUnshift = false) {
    try {
      const userId = this.session.currentUser.remoteId;
      const path = `feeds/site_announcements/${userId}`;
      const records = yield this.store.request(path, {
        include: 'subject',
        page,
        cache: false
      }, true);
      if (records.length === 0) { return records; }
      this.records.addObjects(records, shouldUnshift);

      // @Orbit
      const { _meta: { feed: { token } } } = records.firstObject;
      this.subscribeToStream(token);
    } catch (error) { } // eslint-disable-line no-empty
  };

  didReceiveAttrs() {
    if (!this.session.isAuthenticated()) { return; }
    this.fetchAnnouncements.perform();
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
    this._subscription = window.kitsu.getstream.feed('site_announcements', id, token).subscribe(data => {
      this.handleStreamResponse(data);
    });
  }

  // @Cleanup - This is almost identical to other stream handles - see `notifications`
  handleStreamResponse(data) {
    const newActivities = toArray(data.new);
    if (newActivities.length > 0) {
      this.fetchAnnouncements.perform({ limit: newActivities.length }, true);
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
  async removeAnnouncement(announcement) {
    this.announcements.removeObject(announcement);
    const record = this.records.findBy('activities.firstObject.subject.id', announcement.id);
    const userId = this.session.currentUser.remoteId;
    const path = `feeds/site_announcements/${userId}/_read`;
    try {
      await this.fetch.request(path, {
        method: 'POST',
        body: JSON.stringify([record.remoteId]),
        contentType: 'application/json'
      });
    } catch (error) {
      this.announcements.addObject(announcement, true);
      this.raven.captureException(error);
    }
  }
}

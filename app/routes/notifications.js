import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';

export default class Notifications extends Route {
  @service intl;
  @service session;
  @service store;

  @task({ drop: true })
  fetchNotifications = function* (page = { limit: 30 }) {
    const path = `feeds/notifications/${this.session.currentUser.remoteId}`;
    return yield this.store.request(path, {
      include: ['actor', 'subject', 'target.user', 'target.post', 'target.anime', 'target.manga'].join(),
      page
    }, true);
  };

  beforeModel() {
    if (!this.session.isAuthenticated()) {
      return this.transitionTo('explore.explore', 'anime');
    }
  }

  model() {
    return {
      taskProperty: this.fetchNotifications,
      notifications: this.fetchNotifications.perform()
    };
  }

  titleToken() {
    return this.intl.t('application.titles.notifications');
  }
}

import Controller from '@ember/controller';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import QueryParams from 'ember-parachute';

const queryParams = new QueryParams({
  notification: {
    defaultValue: null
  }
});

export default Controller.extend(queryParams.Mixin, {
  ajax: service(),
  session: service(),
  store: service(),

  async queryParamsDidChange({ changed: { notification } }) {
    if (notification && this.session.isAuthenticated()) {
      await this._markNotificationRead(notification);
      set(this, 'notification', null);
    }
  },

  async _markNotificationRead(notification) {
    const user = this.session.getCurrentUser();
    const endpoint = `/feeds/notifications/${user.id}/_read`;
    const response = await this.ajax.request(endpoint, {
      method: 'POST',
      data: JSON.stringify([notification]),
      contentType: 'application/json'
    });
    // Mark the local item as read as well
    const item = this.store.peekAll('notification').findBy('streamId', notification);
    if (item) {
      set(item, 'isRead', true);
    }
  }
});

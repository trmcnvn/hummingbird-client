import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import QueryParams from 'ember-parachute';
import WithParams from 'shared-addon/mixins/query-params';

const queryParams = new QueryParams({
  notification: {
    defaultValue: null,
    replace: true
  }
});

@WithParams(queryParams)
export default class Application extends Controller {
  @service fetch;
  @service session;
  @service store;

  async setup({ changes: { notification } }) {
    await this.markNotification(notification);
  }

  async queryParamsDidChange({ changes: { notification } }) {
    await this.markNotification(notification);
  }

  async markNotification(notification) {
    if (notification && this.session.isAuthenticated()) {
      await this._markNotificationRead(notification);
      this.set('notification', null);
    }
  }

  async _markNotificationRead(notification) {
    const user = this.session.getCurrentUser();
    const endpoint = `/feeds/notifications/${user.remoteId}/_read`;
    try {
      await this.fetch.request(endpoint, {
        method: 'POST',
        body: JSON.stringify([notification]),
        contentType: 'application/json'
      });
    } catch (error) { } // eslint-disable-line no-empty
  }
}

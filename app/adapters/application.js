import JSONAPIAdapter from 'ember-data/adapters/json-api';
import AdapterFetch from 'ember-fetch/mixins/adapter-fetch';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import config from 'kitsu/config/environment';

export default JSONAPIAdapter.extend(AdapterFetch, {
  authorizer: 'authorizer:application',
  coalesceFindRequests: true,
  namespace: 'api/edge',
  session: service(),

  init() {
    this._super(...arguments);
    set(this, 'host', config.kitsu.APIHost);
  },

  ajaxOptions() {
    const options = this._super(...arguments);
    if (this.session.isAuthenticated()) {
      this.session.authorize('authorizer:application', (name, value) => {
        options.headers[name] = value;
      });
    }
    return options;
  },

  handleResponse(status) {
    if (status === 401 && this.session.isAuthenticated()) {
      this.session.invalidate();
    }
    return this._super(...arguments);
  }
});

import Service, { inject as service } from '@ember/service';
import fetch from 'ember-fetch/ajax';
import config from 'kitsu/config/environment';

export default Service.extend({
  session: service(),

  request(url, options = {}) {
    const _options = this._getDefaultOptions();
    const _url = `${config.kitsu.APIHost}/api/edge/${url}`;
    return fetch(_url, Object.assign(_options, options));
  },

  _getHeaders() {
    const headers = {
      accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    };
    if (this.session.isAuthenticated()) {
      this.session.authorize('authorizer:application', (name, value) => {
        headers[name] = value;
      });
    }
    return headers;
  },

  _getDefaultOptions() {
    const headers = this._getHeaders();
    return { headers };
  }
});

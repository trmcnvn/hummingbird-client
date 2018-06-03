import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import config from 'kitsu/config/environment';

export default class Fetch extends Service {
  @service session;

  request(url, options = {}) {
    const host = config.kitsu.APIHost ? config.kitsu.APIHost : '';
    let cleanUrl = url.charAt(0) === '/' ? url.slice(1) : url;
    cleanUrl = `${host}/api/edge/${cleanUrl}`;

    const defaultOptons = this._getDefaultOptions();
    const headers = Object.assign({}, defaultOptons.headers, options.headers || {});
    return fetch(cleanUrl, Object.assign({}, defaultOptons, options, { headers })).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    });
  }

  _getHeaders() {
    const headers = {
      accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    };
    if (this.session.isAuthenticated()) {
      const { access_token: accessToken } = this.session.authData;
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    return headers;
  }

  _getDefaultOptions() {
    const headers = this._getHeaders();
    return { headers };
  }
}

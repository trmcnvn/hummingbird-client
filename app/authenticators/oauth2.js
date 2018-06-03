import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
import { service } from '@ember-decorators/service';
import config from 'kitsu/config/environment';

export default class OAuth2 extends OAuth2PasswordGrant {
  refreshAccessTokens = true;
  @service session;

  constructor() {
    super(...arguments);
    const host = config.kitsu.APIHost || '';
    this.serverTokenEndpoint = `${host}/api/oauth/token`;
    this.serverTokenRevocationEndpoint = `${host}/api/oauth/revoke`;
  }

  makeRequest(url, data, headers = {}) {
    const { access_token: accessToken } = this.session.authData;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return super.makeRequest(url, data, headers);
  }
}

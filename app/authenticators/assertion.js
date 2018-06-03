import Base from 'kitsu/authenticators/oauth2';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import { service } from '@ember-decorators/service';
import RSVP from 'rsvp';

export default class Assertion extends Base {
  @service torii;

  authenticate(provider, options = {}) {
    return new RSVP.Promise(async (resolve, reject) => {
      try {
        const providerResponse = await this.torii.open(provider, options);
        const data = { grant_type: 'assertion', assertion: providerResponse.accessToken, provider };
        let response = await this.makeRequest(this.serverTokenEndpoint, data);
        run(() => {
          const expiresIn = response['expires_in'];
          const expiresAt = this._absolutizeExpirationTime(expiresIn);
          this._scheduleAccessTokenRefresh(expiresIn, expiresAt, response['refresh_token']);
          if (!isEmpty(expiresAt)) {
            response = Object.assign(response, { expires_at: expiresAt });
          }
          resolve(response);
        });
      } catch (error) {
        run(null, reject, (error && error.responseJSON) || (error && error.responseText) || error);
      }
    });
  }
}

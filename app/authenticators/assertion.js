import Base from 'kitsu/authenticators/oauth2';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import RSVP from 'rsvp';

export default Base.extend({
  torii: service(),

  authenticate(provider, options = {}) {
    return new RSVP.Promise(async (resolve, reject) => {
      const providerResponse = await this.torii.open(provider, options);
      const data = { grant_type: 'assertion', assertion: providerResponse.accessToken, provider };
      try {
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
        run(null, reject, error.responseJSON || error.responseText || error);
      }
    });
  }
});

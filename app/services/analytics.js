import Service from '@ember/service';
import config from 'kitsu/config/environment';
import { capitalize } from '@ember/string';

export default class Analytics extends Service {
  production = config.environment === 'production';

  identify(data = {}) {
    if (!this.production) { return; }
    if (window.ga) {
      window.ga('set', 'userId', data.id);
    }
  }

  trackEvent(event = {}) {
    if (!this.production) { return; }
    if (window.ga) {
      const gaEvent = {};
      Object.keys(event).forEach(key => {
        const capitalizedKey = capitalize(key);
        gaEvent[`event${capitalizedKey}`] = event[key];
      });
      window.ga('send', {
        hitType: 'event',
        ...gaEvent
      });
    }
  }

  trackPage(event = {}) {
    if (!this.production) { return; }
    if (window.ga) { window.ga('send', { hitType: 'pageview', ...event }); }
    if (window.twq) { window.twq('track', 'PageView', event); }
    if (window.fbq) { window.fbq('track', 'PageView', event); }
  }

  trackGoogleConversion(id, label, params = {}, remarketing = false) {
    if (!this.production || !window.google_trackConversion) { return; }
    window.google_trackConversion({
      google_conversion_id: id,
      google_conversion_label: label,
      google_conversion_format: '3',
      google_remarketing_only: remarketing,
      google_custom_params: params
    });
  }

  facebookPixel(event, params = {}) {
    if (!this.production || !window.fbq) { return; }
    window.fbq('track', event, params);
  }
}

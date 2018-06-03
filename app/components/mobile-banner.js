import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { or } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';

const ANDROID_PHONE_PATTERN = /(?=.*\bAndroid\b)(?=.*\bMobile\b)/i;
const APPLE_PHONE_PATTERN = /iPhone/i;
const CACHE_TIME_DAY = 3;

@tagName('')
export default class MobileBanner extends Component {
  shouldRender = true;
  isAndroid = false;
  isApple = false;

  @service cache;

  @or('isAndroid', 'isApple') isPhone;

  didReceiveAttrs() {
    this.cache.get('mobile-banner').then(date => {
      if ((new Date()) < date) {
        this.set('shouldRender', false);
      }

      const isAndroid = ANDROID_PHONE_PATTERN.test(navigator.userAgent);
      const isApple = APPLE_PHONE_PATTERN.test(navigator.userAgent);
      this.set('isAndroid', isAndroid);
      this.set('isApple', isApple);
    });
  }

  @action
  dismiss() {
    const date = new Date();
    date.setTime(date.getTime() + (CACHE_TIME_DAY * 24 * 60 * 60 * 1000));
    this.cache.set('mobile-banner', date);
    this.set('shouldRender', false);
  }
}

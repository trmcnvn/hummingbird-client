import SwiperContainer from 'ember-cli-swiper/components/swiper-container';
import { once } from '@ember/runloop';

export default class SwiperContainerOverride extends  SwiperContainer {
  didUpdateAttrs() {
    super.didUpdateAttrs(...arguments);

    // @Issue - Workaround for https://github.com/Ember-Swiper/ember-cli-swiper/issues/106
    if (this.customUpdateFor !== this._customUpdateForInternal) {
      once(this, () => { this._swiper.update(); });
      this.set('_customUpdateForInternal', this.customUpdateFor);
    }
  }
}

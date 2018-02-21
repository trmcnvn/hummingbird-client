import Component from '@ember/component';
import { set, computed } from '@ember/object';
import { not } from '@ember/object/computed';
import layout from 'kitsu-shared/templates/components/media-information-dialog';
/* global hoverintent */

export default Component.extend({
  layout,
  disabled: false,
  showDialog: false,
  isEnabled: not('disabled'),

  percentageClass: computed('media.averageRating', function() {
    const rating = this.media.averageRating;
    if (!rating) {
      return '';
    }
    if (rating <= 25) {
      return 'percent-quarter-1';
    } else if (rating <= 50) {
      return 'percent-quarter-2';
    } else if (rating <= 75) {
      return 'percent-quarter-3';
    } else if (rating <= 100) {
      return 'percent-quarter-4';
    }
  }).readOnly(),

  didInsertElement() {
    this._super(...arguments);
    if (this.disabled) { return; }
    const hoverIntentInstance = hoverintent(this.element, () => {
      this._onMouseEnter();
    }, () => {
      this._onMouseLeave();
    }).options({ timeout: 0 });
    set(this, 'hoverIntentInstance', hoverIntentInstance);
  },

  willDestroyElement() {
    this._super(...arguments);
    if (this.hoverIntentInstance) {
      this.hoverIntentInstance.remove();
    }
  },

  _onMouseEnter() {
    if (this.isDestroyed) { return; }
    set(this, 'showDialog', true);
  },

  _onMouseLeave() {
    if (this.isDestroyed) { return; }
    set(this, 'showDialog', false);
  }
});

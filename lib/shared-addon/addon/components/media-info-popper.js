import Component from '@ember/component';
import { set } from '@ember/object';
import { not } from '@ember-decorators/object/computed';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import layout from '../templates/components/media-info-popper';
/* global hoverintent */

export default class MediaInfoPopper extends Component {
  layout = layout;
  @argument disabled = false;
  @argument showDialog = false;

  @not('disabled') isEnabled;

  @computed('media.averageRating')
  get percentageClass() {
    const rating = this.media.averageRating;
    if (rating <= 25) {
      return 'percent-quarter-1';
    } else if (rating <= 50) {
      return 'percent-quarter-2';
    } else if (rating <= 75) {
      return 'percent-quarter-3';
    } else if (rating <= 100) {
      return 'percent-quarter-4';
    }
    return '';
  }

  didInsertElement() {
    if (this.disabled) { return; }
    const hoverIntentInstance = hoverintent(this.element, () => {
      this._onMouseEnter();
    }, () => {
      this._onMouseLeave();
    }).options({ timeout: 0 });
    set(this, 'hoverIntentInstance', hoverIntentInstance);
  }

  willDestroyElement() {
    if (this.hoverIntentInstance) {
      this.hoverIntentInstance.remove();
    }
  }

  _onMouseEnter() {
    if (this.isDestroyed) { return; }
    set(this, 'showDialog', true);
  }

  _onMouseLeave() {
    if (this.isDestroyed) { return; }
    set(this, 'showDialog', false);
  }
}

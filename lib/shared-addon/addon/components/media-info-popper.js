import Component from '@ember/component';
import { not } from '@ember-decorators/object/computed';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import template from '../templates/components/media-info-popper';
import { layout } from '@ember-decorators/component';

@layout(template)
export default class MediaInfoPopper extends Component {
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
}

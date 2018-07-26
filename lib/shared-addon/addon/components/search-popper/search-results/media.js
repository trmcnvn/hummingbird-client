import Component from '@ember/component';
import { layout, classNames, tagName } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import template from '../../../templates/components/search-popper/search-results/media';

@layout(template)
@tagName('li')
@classNames('media')
export default class Media extends Component {
  @argument onClick = () => {};

  @computed('record.averageRating')
  get ratingClass() {
    const rating = this.record.averageRating;
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

  @action
  onClickAction(record) {
    return this.onClick(record);
  }
}

import Component from '@ember/component';
import template from '../../templates/components/media-rating/star-rating';
import { layout, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';
import getRatingTag from 'shared-addon/utils/get-rating-tag';

@layout(template)
@tagName('')
export default class StarRating extends Component {
  @argument isReadOnly = false;
  @argument rating = null;
  @argument onRating = () => {};

  @computed('rating')
  get computedRating() {
    return this.rating ? this.rating / 2 : 0.5;
  }

  @computed('computedRating')
  get ratingTag() {
    return getRatingTag(this.rating);
  }
}

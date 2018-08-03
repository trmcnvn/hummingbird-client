import Component from '@ember/component';
import { layout, tagName } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import template from '../../templates/components/media-rating/simple-rating';

@layout(template)
@tagName('')
export default class SimpleRating extends Component {
  allRatings = Object.freeze([{
    tag: 'awful',
    value: 1
  }, {
    tag: 'meh',
    value: 4
  }, {
    tag: 'good',
    value: 7
  }, {
    tag: 'great',
    value: 10
  }]);

  @argument isReadOnly = false;
  @argument isDisabled = false;
  @argument rating = null;
  @argument onRating = () => {};

  @computed('rating')
  get currentRating() {
    if (!this.rating) { return null; }
    return this.allRatings.findBy('tag', this.getRatingTag(this.rating));
  }

  getRatingTag(rating) {
    if (rating > 0 && rating < 4) {
      return 'awful';
    } else if (rating >= 4 && rating < 7) {
      return 'meh';
    } else if (rating >= 7 && rating < 10) {
      return 'good';
    }
    return 'great';
  }

  @action
  setRating(rating) {
    if (this.isDisabled || this.isReadOnly) { return; }
    this.onRating(rating.value);
    this.set('rating', rating.value); // @Unsure: Is this two-way?
  }
}

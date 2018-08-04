import Component from '@ember/component';
import { layout, tagName } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import template from '../../templates/components/media-rating/simple-rating';
import getRatingTag from 'shared-addon/utils/get-rating-tag';

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
    return this.allRatings.findBy('tag', getRatingTag(this.rating));
  }

  @action
  setRating(rating) {
    if (this.isDisabled || this.isReadOnly) { return; }
    this.onRating(rating.value);
    this.set('rating', rating.value); // @Unsure: Is this two-way?
  }
}

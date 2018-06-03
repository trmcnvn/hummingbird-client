import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import layout from '../../templates/components/media-rating/simple-rating';

@tagName('')
export default class SimpleRating extends Component {
  layout = layout;
  _rating = null;
  ratings = [{
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
  }];

  @argument onRating = () => {};
  @argument isDisabled = false;

  @action
  setRating(rating) {
    if (this.isDisabled) { return; }
    this.onRating(rating.value);
    this.set('_rating', rating.value);
  }
}

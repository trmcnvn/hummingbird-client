import Component from '@ember/component';
import template from '../../templates/components/media-rating/star-rating';
import { layout } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@layout(template)
export default class StarRating extends Component {
  @argument isReadOnly = false;
  @argument rating = null;
  @argument onRating = () => {};

  didReceiveAttrs() {
    this.thing = this.rating ? this.rating / 2 : 0.5;
  }
}

import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { layout, tagName, classNames } from '@ember-decorators/component';
import template from '../templates/components/media-rating';

@layout(template)
@classNames('media-rating')
export default class MediaRating extends Component {
  @argument isReadOnly = false;
  @argument rating = null;
  @argument onRating = () => {};

  @service session;

  get ratingComponent() {
    if (!this.session.isAuthenticated()) { return 'simple-rating'; }
    const user = this.session.getCurrentUser();
    switch (user.ratingSystem) {
      case 'simple':
        return 'simple-rating';
      case 'regular':
        return 'star-rating';
      default:
        return 'slider-rating';
    }
  }

  @computed('rating')
  get hasRating() {
    return this.rating !== null && this.rating > 0;
  }

  @action
  setRating(rating) {
    if (this.isReadOnly) { return; }
    this.onRating(rating);
  }
}

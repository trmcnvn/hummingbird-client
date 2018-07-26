import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { layout, tagName } from '@ember-decorators/component';
import template from '../templates/components/media-rating';

@layout(template)
@tagName('')
export default class MediaRating extends Component {
  shouldRenderPopper = false;

  @argument rating = null;
  @argument onRating = () => {};
  @argument isDisabled = false; // @TODO: ?
  @argument shouldShowDropdown = false;

  @service session;

  @computed
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

  @computed('hasRating')
  get shouldRenderDropdown() {
    return this.hasRating && this.shouldShowDropdown;
  }

  onBodyClick = (event) => {
    console.debug('Clicked:', event); // @Debug
  };

  didInsertElement() {
    document.body.addEventListener('click', this.onBodyClick);
  }

  willDestroyElement() {
    document.body.removeEventListener('click', this.onBodyClick);
  }

  @action
  setRating(rating) {
    this.onRating(rating);
    this.set('shouldRenderPopper', false);
  }
}

import Component from '@ember/component';
import { tagName, classNames, attribute } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember-decorators/object';

@tagName('img')
@classNames('lazyload')
export default class UIImage extends Component {
  @argument image = null;
  @argument fallback = null;

  @attribute('alt')
  @argument alt = null;

  @attribute('data-src')
  @computed('image', 'fallback')
  get computedImage() {
    return this.image || this.fallback;
  }

  didUpdateAttrs() {
    scheduleOnce('afterRender', () => {
      this.element.classList.remove('lazyload');
      this.element.classList.add('lazyload');
    });
  }
}

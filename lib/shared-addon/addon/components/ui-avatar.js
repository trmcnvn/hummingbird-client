import Component from '@ember/component';
import { tagName, classNames, attribute, className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';
import { scheduleOnce } from '@ember/runloop';

@tagName('img')
@classNames('lazyload')
export default class UIAvatar extends Component {
  @argument default = '/images/default_avatar.png';
  @argument image = null;

  @attribute('alt')
  @argument alt = null;

  @attribute('data-src')
  @computed('image')
  get usableImage() {
    return this.image || this.default;
  }

  @className
  @computed
  get avatarSize() {
    return `${this.styleNamespace}--${this.size}`;
  }

  didUpdateAttrs() {
    scheduleOnce('afterRender', () => {
      this.element.classList.remove('lazyload');
      this.element.classList.add('lazyload');
    });
  }
}

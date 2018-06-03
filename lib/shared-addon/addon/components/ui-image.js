import Component from '@ember/component';
import { tagName, classNames, attribute } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { scheduleOnce } from '@ember/runloop';

@tagName('img')
@classNames('lazyload')
export default class UIImage extends Component {
  @attribute('data-src')
  @argument image = null;

  @attribute('alt')
  @argument alt = null;

  didUpdateAttrs() {
    scheduleOnce('afterRender', () => {
      this.element.classList.remove('lazyload');
      this.element.classList.add('lazyload');
    });
  }
}

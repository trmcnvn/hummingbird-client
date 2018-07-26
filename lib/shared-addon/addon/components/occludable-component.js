import Component from '@ember/component';
import template from '../templates/components/occludable-component';
import { argument } from '@ember-decorators/argument';
import { layout, attribute } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { htmlSafe } from '@ember/string';
import { join } from '@ember/runloop';

// Based off https://github.com/sreedhar7/ember-occludable-components
@layout(template)
export default class OccludableComponent extends Component {
  shouldRender = false;

  @argument estimatedHeight = 0;
  @argument rootMargin = {};

  @attribute('style')
  @computed('estimatedHeight', 'shouldRender')
  get height() {
    return this.shouldRender ? null : htmlSafe(`min-height: ${this.estimatedHeight}px;`);
  }

  didInsertElement() {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this.onVisible();
          observer.unobserve(this.element);
        }
      });
    }, this._getIntersectionOption());
    this.observer.observe(this.element);
  }

  willDestroyElement() {
    if (this.observer) {
      this.observer.unobserve(this.element);
      this.observer.disconnect();
    }
  }

  onVisible() {
    if (this.isDestroyed) { return; }
    this._scheduleWork(() => {
      this._scheduleWork(() => {
        if (this.isDestroyed) { return; }
        this.set('shouldRender', true);
      });
    });
  }

  _scheduleWork(callback) {
    window.requestAnimationFrame(() => {
      join(() => {
        callback();
      });
    });
  }

  _getIntersectionOption() {
    const defaultOptions = this._getDefaultRootMargin();
    let rootMargin = Object.assign(defaultOptions, this.rootMargin);
    rootMargin = `${rootMargin.top}px ${rootMargin.right}px ${rootMargin.bottom}px ${rootMargin.left}px`;
    return { root: null, rootMargin, threshold: 0 };
  }

  _getDefaultRootMargin() {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }
}

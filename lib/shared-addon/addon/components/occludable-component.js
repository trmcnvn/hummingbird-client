import Component from '@ember/component';
import template from '../templates/components/occludable-component';
import { argument } from '@ember-decorators/argument';
import { layout, attribute, classNames } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { htmlSafe } from '@ember/string';
import { join } from '@ember/runloop';
import observerManager from 'kitsu/utils/observer-manager';

// Based off https://github.com/sreedhar7/ember-occludable-components
@layout(template)
@classNames('occludable-component')
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
    const observer = observerManager(this._getIntersectionOption());
    this.unobserve = observer(this.element, entry => {
      if (entry && entry.isIntersecting) {
        this.onVisible();
        if (this.unobserve) { this.unobserve(); }
      }
    });
  }

  willDestroyElement() {
    if (this.unobserve) {
      this.unobserve();
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

import Component from '@ember/component';
import { guidFor } from '@ember/object/internals';
import { layout, tagName } from '@ember-decorators/component';
import { alias } from '@ember-decorators/object/computed';
import { argument } from '@ember-decorators/argument';
import template from '../templates/components/ui-pagination';
import observerManager from 'kitsu/utils/observer-manager';

@layout(template)
@tagName('')
export default class UIPagination extends Component {
  viewportDivId = `kitsu-pagination-${guidFor(this)}`;

  @argument shouldPaginate = true;
  @argument sentinelOnTop = false;
  @argument showSpinner = true;
  @argument spinnerSize = 'small';
  @argument rootMargin = {};

  @alias('task.isRunning') isLoading;

  get element() {
    return document.getElementById(this.viewportDivId);
  }

  didInsertElement() {
    if (!this.shouldPaginate) { return; }
    const observe = observerManager(this._getOptions());
    this.unobserve = observe(this.element, entry => {
      if (entry && entry.isIntersecting) {
        this.onVisible();
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
    const instance = this.onPagination ? this.onPagination() : null;
    this.set('task', instance);
  }

  _getOptions() {
    const defaultOptions = this._getDefaultRootMargin();
    let rootMargin = Object.assign(defaultOptions, this.rootMargin);
    rootMargin = `${rootMargin.top}px ${rootMargin.right}px ${rootMargin.bottom}px ${rootMargin.left}px`;
    return { root: null, rootMargin, threshold: 0 };
  }

  _getDefaultRootMargin() {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }
}

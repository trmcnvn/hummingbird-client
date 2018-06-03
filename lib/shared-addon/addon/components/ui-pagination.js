import Component from '@ember/component';
import { guidFor } from '@ember/object/internals';
import { tagName } from '@ember-decorators/component';
import { alias } from '@ember-decorators/object/computed';
import { argument } from '@ember-decorators/argument';
import layout from '../templates/components/ui-pagination';

@tagName('')
export default class UIPagination extends Component {
  layout = layout;
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
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          this.onVisible();
        }
      });
    });
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
    const instance = this.onPagination ? this.onPagination() : null;
    this.set('task', instance);
  }

  _getWatcherOptions() {
    const defaultOptions = this._getDefaultRootMargin();
    let rootMargin = Object.assign(defaultOptions, this.rootMargin);
    rootMargin = `${rootMargin.top}px ${rootMargin.right}px ${rootMargin.bottom}px ${rootMargin.left}px`;
    return { root: null, rootMargin, threshold: 0 };
  }

  _getDefaultRootMargin() {
    return { top: 0, left: 0, right: 0, bottom: 0 };
  }
}

import Component from '@ember/component';
import template from '../templates/components/sortable-items';
import { layout, tagName, classNames } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import sortable from 'html5sortable';
import { scheduleOnce } from '@ember/runloop';

@layout(template)
@tagName('ul')
@classNames('list-unstyled', 'sortable-items')
export default class SortableItems extends Component {
  @argument items = [];
  @argument onSortChanged = () => {};

  onUpdate = (event) => {
    const { detail } = event;
    const { destination, origin } = detail;
    this.onSortChanged(origin.index, destination.index);
  };

  // Initialize the sortable collection
  didInsertElement() {
    sortable(this.element);
    this.element.addEventListener('sortupdate', this.onUpdate);
  }

  didUpdateAttrs() {
    scheduleOnce('afterRender', () => {
      sortable(this.element);
    });
  }

  // Cleanupa
  willDestroyElement() {
    this.element.removeEventListener('sortupdate', this.onUpdate);
    sortable(this.element, 'destroy');
  }
}

import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { sort } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class ModalItem extends Component {
  titleSorting = Object.freeze(['title']);
  @argument isExpanded = false;

  @service store;
  @sort('fetchChildren.last.value', 'titleSorting') sortedChildren;

  @task({ drop: true })
  fetchChildren = function* () {
    return yield this.store.request('category', {
      filter: { parent_id: this.category.remoteId },
      fields: { category: 'title,slug' },
      page: { limit: 50 }
    });
  };

  @action
  toggleExpansion() {
    this.fetchChildren.perform();
    this.toggleProperty('isExpanded');
  }
}

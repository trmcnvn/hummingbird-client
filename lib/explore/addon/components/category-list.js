import Component from '@ember/component';
import { sort } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';

export default class CategoryList extends Component {
  titleSorting = Object.freeze(['title']);
  isModalShown = false;
  @argument showModal = true;

  @service store;
  @sort('fetchCategories.last.value', 'titleSorting') sortedCategories;

  @task({ drop: true })
  fetchCategories = function* () {
    return yield this.store.request('category', {
      filter: { parent_id: '_none' },
      fields: { category: 'title' },
      page: { limit: 500 }
    });
  };

  constructor() {
    super(...arguments);
    this.fetchCategories.perform();
  }
}

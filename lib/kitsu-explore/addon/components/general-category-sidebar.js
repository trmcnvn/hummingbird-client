import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';

export default Component.extend({
  queryCache: service(),
  categories: reads('fetchCategories.last.value'),

  didInsertElement() {
    this._super(...arguments);
    this.fetchCategories.perform();
  },

  fetchCategories: task(function* () {
    return yield this.queryCache.query('category', {
      sort: '-total_media_count',
      page: { limit: 40 }
    });
  }).drop()
});

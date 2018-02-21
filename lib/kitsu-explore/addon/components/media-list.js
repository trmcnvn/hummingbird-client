import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { typeOf } from '@ember/utils';
import { task, taskGroup } from 'ember-concurrency';

export default Component.extend({
  limit: 5,
  viewMoreRoute: 'kitsu-explore.index.more',
  ajax: service(),
  store: service(),
  queryCache: service(),
  tasks: taskGroup().drop(),
  media: reads('tasks.last.value'),

  didReceiveAttrs() {
    this._super(...arguments);
    if (this.key === 'trending') {
      this.fetchTrendingMedia.perform();
    } else {
      this.fetchMedia.perform();
    }
  },

  fetchMedia: task(function* () {
    const options = this._getRequestOptions();
    return yield this.queryCache.query(this.type, options);
  }).group('tasks'),

  fetchTrendingMedia: task(function* () {
    let path = `trending/${this.type}?limit=${this.limit}`;

    // Include category information in URL if requested
    if (this.category) {
      const id = this.category.get('id');
      path = `${path}&in_category=true&category=${id}`;
    }

    // do we have a cached request?
    const cachedResult = this.queryCache.get(this.key, path);
    if (cachedResult) { return cachedResult; }

    // query the API
    const { data } = yield this.ajax.request(path);
    if (typeOf(data) !== 'array') {
      return [];
    }

    const records = [];
    data.forEach((record) => {
      const normalize = this.store.normalize(this.type, record);
      records.push(this.store.push(normalize));
    });

    // push result into cache
    this.queryCache.push(this.key, path, records);
    return records;
  }).group('tasks'),

  _getRequestOptions() {
    const options = {
      filter: {},
      sort: this.sort,
      page: { limit: this.limit }
    };
    if (this.filters) {
      options.filter = this.filters.split(',').reduce((previous, current) => {
        const [key, value] = current.split(':');
        previous[key] = value;
        return previous;
      }, {});
    }

    if (this.category) {
      options.filter.categories = this.category.get('slug');
    }
    return options;
  }
});

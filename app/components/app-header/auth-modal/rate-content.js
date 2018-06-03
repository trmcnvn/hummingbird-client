import Component from './-base';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { filterBy } from '@ember-decorators/object/computed';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import Pagination from 'shared-addon/mixins/pagination';

@Pagination
export default class RateContent extends Component {
  paginationType = 'anime';
  query = '';
  numRated = 0;
  records = [];

  @service store;
  @filterBy('records', 'type', 'anime') anime;
  @filterBy('records', 'type', 'manga') manga;

  @computed('numRated')
  get numRatedLeft() {
    return 5 - this.numRated;
  }

  @task({ drop: true })
  fetchMedia = function* () {
    const query = this.buildQueryExpression();
    const records = yield this.store.request(this.paginationType, query);
    this.records.addObjects(records);
  };

  @task({ restartable: true })
  updateQuery = function* (value) {
    yield timeout(250);
    this.set('query', value);
    this.records.clear();
    yield this.fetchMedia.perform();
  };

  didReceiveAttrs() {
    this.fetchMedia.perform();
  }

  buildQueryExpression() {
    const key = this.query.length > 0 ? 'filter' : 'sort';
    return {
      [key]: this.query.length > 0 ? { text: this.query } : '-userCount',
      fields: { [this.paginationType]: 'posterImage,canonicalTitle' },
      page: { limit: 20 },
      cache: false
    };
  }

  addPaginationRecords(records) {
    this.records.addObjects(records);
  }

  @action
  tabChanged() {
    const type = this.paginationType === 'anime' ? 'manga' : 'anime';
    this.set('paginationType', type);
    if (this[type].length === 0) {
      this.fetchMedia.perform();
    }
  }

  @action
  onCreate() {
    this.set('numRated', this.numRated + 1);
  }
}

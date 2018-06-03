import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import { argument } from '@ember-decorators/argument';
import layout from '../../templates/components/search-popper/search-results';

const DEFAULT_ATTRIBUTES = Object.freeze(['id', 'slug', 'kind']);
const ATTRIBUTES = Object.freeze({
  media: [...DEFAULT_ATTRIBUTES, 'canonicalTitle', 'titles', 'posterImage', 'subtype',
    'posterImage', 'averageRating', 'synopsis', 'year'],
  users: [...DEFAULT_ATTRIBUTES, 'name', 'avatar', 'followersCount'],
  groups: [...DEFAULT_ATTRIBUTES, 'name', 'avatar', 'tagline', 'membersCount']
});

export default class SearchResults extends Component {
  layout = layout;
  currentPage = 0;
  hitsPerPage = 6;

  @argument response = {};
  @argument records = [];
  @service algolia;

  @computed('isFullPage', 'records.[]', 'response')
  get shouldPaginate() {
    return this.isFullPage && this.records.length < (this.response && this.response.nbHits);
  }

  @task({ restartable: true })
  fetchResults = function* (query, options = {}) {
    yield timeout(150);

    const index = yield this.algolia.fetchIndex.perform(this.type);
    if (isEmpty(index)) { return {}; }

    const response = yield index.search(query, {
      attributesToRetrieve: ATTRIBUTES[this.type],
      hitsPerPage: this.hitsPerPage,
      ...options
    });
    this.records.addObjects(response.hits);
    return response;
  };

  @task({ drop: true })
  onPagination = function* () {
    this.set('currentPage', this.currentPage + 1);
    const response = yield this.fetchResults.perform(this.query, {
      page: this.currentPage,
      hitsPerPage: this.hitsPerPage * 4
    });
    this.records.addObjects(response.hits);
  };

  didReceiveAttrs() {
    if (this.queryWas === this.query) { return; }
    this.queryWas = this.query;

    if (this.query && this.query.length > 0) {
      this.fetchResults.perform(this.query).then(response => {
        this.set('response', response);
      }).catch(() => {});
    }
  }

  @action
  viewMore() {
    this.onTransitionToPage(this.type, this.response);
  }
}

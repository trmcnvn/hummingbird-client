import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import { argument } from '@ember-decorators/argument';
import template from '../../templates/components/search-popper/search-results';
import { layout } from '@ember-decorators/component';

const DEFAULT_ATTRIBUTES = Object.freeze(['id', 'slug', 'kind']);
const ATTRIBUTES = Object.freeze({
  media: Object.freeze([...DEFAULT_ATTRIBUTES, 'canonicalTitle', 'titles', 'posterImage', 'subtype',
    'posterImage', 'averageRating', 'synopsis', 'year']),
  users: Object.freeze([...DEFAULT_ATTRIBUTES, 'name', 'avatar', 'followersCount']),
  groups: Object.freeze([...DEFAULT_ATTRIBUTES, 'name', 'avatar', 'tagline', 'membersCount'])
});

@layout(template)
export default class SearchResults extends Component {
  currentPage = 0;
  hitsPerPage = 6;

  @argument initialResponse = null;
  @argument response = null;
  @argument records = [];
  @argument isFullPage = false;
  @argument query = null;

  @service algolia;

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
    this.set('response', response);
    this.records.addObjects(response.hits);
    return response;
  };

  @task({ drop: true })
  onPagination = function* () {
    this.set('currentPage', this.currentPage + 1);
    yield this.fetchResults.perform(this.query, {
      page: this.currentPage,
      hitsPerPage: this.hitsPerPage * 4
    });
  };

  didReceiveAttrs() {
    if (this.queryWas === this.query) { return; }
    if (this.queryWas && this.queryWas !== this.query) {
      this.records.clear();
      this.set('currentPage', 0);
    }
    this.queryWas = this.query;

    if (this.query && this.query.length > 0) {
      this.fetchResults.perform(this.query);
    }
  }

  @action
  viewMore() {
    this.onTransitionToPage(this.type, this.response);
  }
}

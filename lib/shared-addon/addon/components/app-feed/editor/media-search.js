import Component from '@ember/component';
import layout from '../../../templates/components/app-feed/editor/media-search';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { isEmpty } from '@ember/utils';

export default class MediaSearch extends Component {
  layout = layout;
  types = Object.freeze(['anime', 'manga']);
  query = null;
  selectedType = 'anime';
  records = [];
  currentPage = 0;

  @argument media = null;
  @argument onClick = () => {};

  @service algolia;
  @service store;

  @task({ restartable: true })
  fetchMedia = function* (query, options = {}) {
    yield timeout(200);
    const index = yield this.algolia.fetchIndex.perform('media');
    if (isEmpty(index) || isEmpty(query)) { return {}; }
    const response = yield index.search(query, {
      attributesToRetrieve: ['id', 'slug', 'kind', 'canonicalTitle', 'titles', 'posterImage', 'subtype',
        'posterImage', 'averageRating', 'synopsis', 'year'],
      hitsPerPage: 15,
      filters: `kind:${this.selectedType}`,
      ...options
    });
    this.records.addObjects(response.hits);
  };

  @task({ drop: true })
  onPagination = function* () {
    this.incrementProperty('currentPage');
    yield this.fetchMedia.perform(this.query, {
      page: this.currentPage
    });
  };

  @task({ drop: true })
  fetchSelectedMedia = function* (media) {
    const keyMap = this.store.source.keyMap;
    const id = keyMap.keyToId(media.kind, 'remoteId', media.id);
    if (!id) {
      const records = yield this.store.request(media.kind, {
        filter: { id: media.id },
        cache: false
      });
      return this.onClick(records.firstObject);
    }
    const record = this.store.cache.findRecord(media.kind, id);
    return this.onClick(record);
  };

  @action
  updateQuery(query) {
    this.set('query', query);
    this.records.clear();
    this.fetchMedia.perform(query);
  }

  @action
  updateType(type) {
    this.set('selectedType', type);
    this.records.clear();
    this.fetchMedia.perform(this.query);
  }
}

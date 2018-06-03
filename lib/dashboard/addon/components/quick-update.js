import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { tagName } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { assert } from '@ember/debug';
import Pagination from 'shared-addon/mixins/pagination';
import { concat } from 'kitsu/decorators';
import { isEmpty } from '@ember/utils';

const FILTER_TYPES = {
  ALL: 'all',
  ANIME: 'anime',
  MANGA: 'manga'
};

@Pagination
@tagName('')
export default class QuickUpdate extends Component {
  paginationType = 'libraryEntry';
  pageLimit = 12;
  filterOptions = Object.freeze(Object.values(FILTER_TYPES));
  selectedFilter = FILTER_TYPES.ALL;

  @concat('fetchLibraryEntries.last.value', 'paginatedRecords') libraryEntries;
  @service cache;
  @service store;
  @service session;

  @computed('selectedFilter')
  get kind() {
    return this.selectedFilter !== FILTER_TYPES.ALL ? this.selectedFilter : 'anime';
  }

  @computed('libraryEntries.length')
  get remainingSlides() {
    return 3 - (this.libraryEntries.length || 0);
  }

  @task({ keepLatest: true })
  fetchLibraryEntries = function* () {
    return yield this.store.request(this.paginationType, this.buildQueryExpression());
  };

  @task({ drop: true })
  updateLibraryEntry = function* (libraryEntry, props, message) {
    // update library entry attributes
    const ops = Object.keys(props).map(key => ({
      attribute: key,
      value: props[key]
    }));
    yield this.store.update(t => ops.map(op => (
      t.replaceAttribute(libraryEntry.identity, op.attribute, op.value)
    )), { blocking: true });

    // re-request the library entry with unit data so we can grab that new unit data
    // `unit` isn't a real relationship with a library entry, so there is no link between the two
    yield this.store.query(q => q.findRecord(libraryEntry.identity), {
      blocking: true,
      sources: {
        remote: {
          include: ['unit']
        }
      }
    });

    // create the post record data
    if (isEmpty(message)) { return; }
    const record = {
      type: 'post',
      attributes: {
        content: message,
        spoiler: true
      },
      relationships: {
        media: { data: { type: libraryEntry.media.type, id: libraryEntry.media.id } },
        user: { data: this.session.currentUser.identity }
      }
    };

    // not all entries have a unit associated with them
    if (libraryEntry.unit) {
      record.relationships.spoiledUnit = {
        data: { type: libraryEntry.unit.type, id: libraryEntry.unit.id }
      };
    }
    yield this.store.update(t => t.addRecord(record));
  };

  didReceiveAttrs() {
    this.cache.get('quick-update-filter').then(filter => {
      this.set('selectedFilter', filter || FILTER_TYPES.ALL);
      this.fetchLibraryEntries.perform();
    });
  }

  buildQueryExpression() {
    return {
      filter: {
        kind: this.kind,
        user_id: this.session.currentUser.remoteId,
        status: ['current', 'planned'].join()
      },
      include: [this.kind || 'anime,manga', 'unit'].join(),
      sort: ['status', '-progressedAt', '-updatedAt'].join(),
      page: { limit: this.pageLimit }
    };
  }

  @action
  changeFilter(filter) {
    assert('Filter must be a valid option', Object.values(FILTER_TYPES).includes(filter));
    this.set('selectedFilter', filter);
    this.cache.set('quick-update-filter', filter);
    this.resetPaginationState();
    this.fetchLibraryEntries.perform();
  }

  @action
  onUpdate(libraryEntry, ops = [], message = null) {
    if (ops.length === 0) { return; }
    return this.updateLibraryEntry.perform(libraryEntry, ops, message);
  }
}

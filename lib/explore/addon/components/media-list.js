import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import Pagination from 'shared-addon/mixins/pagination';
import { concat, taskState } from 'kitsu/decorators';

@Pagination
export default class MediaList extends Component {
  @argument shouldPaginate = false;
  @argument sort = 'id';
  @argument filters = undefined;
  @argument limit = 5;
  @argument viewMoreRoute = 'explore.explore.more';

  @service store;
  @concat('fetchMedia.last.value', 'fetchTrendingMedia.last.value', 'paginatedRecords') media;
  @taskState('isRunning', 'fetchMedia', 'fetchTrendingMedia') isWorking;

  @task({ drop: true })
  fetchMedia = function* () {
    const query = this.buildQueryExpression();
    return yield this.store.request(this.type, query);
  };

  @task({ drop: true })
  fetchTrendingMedia = function* () {
    const path = `trending/${this.type}`;
    const query = { limit: this.limit };
    if (this.category) {
      const id = this.category.get('remoteId');
      query.in_category = true;
      query.category = id;
    }
    return yield this.store.request(path, query, true);
  };

  didReceiveAttrs() {
    this.paginationType = this.type;
    if (this.key === 'trending') {
      this.fetchTrendingMedia.perform();
    } else {
      this.fetchMedia.perform();
    }
  }

  buildQueryExpression() {
    const query = {
      filter: Object.assign({}, this.filters || {}),
      sort: this.sort,
      page: { limit: this.limit }
    };
    if (this.category) {
      query.filter.categories = this.category.slug;
    }
    return query;
  }
}

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Route.extend({
  intl: service(),
  session: service(),
  queryCache: service(),

  beforeModel() {
    const { type } = this.paramsFor(this.routeName);
    if (!['anime', 'manga'].includes(type)) {
      this.transitionTo('index', 'anime');
    }
  },

  model({ type }) {
    return {
      type,
      favorites: this.fetchFavorites.perform()
    };
  },

  titleToken() {
    const { type } = this.paramsFor('index');
    return this.intl.t('kitsu-explore.titles.index', { type });
  },

  fetchFavorites: task(function* () {
    const isAuthenticated = this.session.isAuthenticated();
    if (!isAuthenticated) { return; }
    return yield this.queryCache.query('category-favorite', {
      include: 'category',
      filter: { user_id: this.session.getCurrentUser().id },
      fields: { categoryFavorites: 'category', categories: 'title,slug' },
      page: { limit: 20 }
    });
  }).drop()
});

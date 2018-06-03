import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';

export default class Explore extends Route {
  @service session;
  @service store;

  @task({ drop: true })
  fetchFavorites = function* () {
    const isAuthenticated = this.session.isAuthenticated();
    if (!isAuthenticated) { return []; }

    const currentUser = this.session.getCurrentUser();
    return yield this.store.request('categoryFavorite', {
      filter: { user_id: currentUser.remoteId },
      include: 'category',
      page: { limit: 20 }
    })
  };

  @task({ drop: true })
  fetchCategories = function* () {
    return yield this.store.request('category', {
      sort: '-totalMediaCount',
      page: { limit: 40 }
    });
  };

  beforeModel() {
    const { type } = this.paramsFor(this.routeName);
    if (!['anime', 'manga'].includes(type)) {
      return this.transitionTo('explore', 'anime');
    }
  }

  model({ type }) {
    return {
      type,
      categories: this.fetchCategories.perform(),
      favorites: this.fetchFavorites.perform()
    };
  }
}

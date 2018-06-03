import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class ExploreCategoryRoute extends Route {
  @service store;

  model({ slug }) {
    const exploreModel = this.modelFor('explore');
    return this.store.request('category', {
      filter: { slug },
      include: 'parent.parent'
    }).then(records => ({
      category: records.firstObject,
      favorites: exploreModel.favorites
    }));
  }

  afterModel(model) {
    if (!model.category || !model.category.parent) {
      this.transitionTo('explore', 'anime');
    }
  }
}

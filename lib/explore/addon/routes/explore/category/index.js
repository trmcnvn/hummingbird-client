import Route from '@ember/routing/route';
import { set } from '@ember/object';
import { service } from '@ember-decorators/service';

export default class ExploreCategoryIndexRotue extends Route {
  @service intl;

  model() {
    return this.modelFor('explore.category');
  }

  setupController(controller) {
    super.setupController(...arguments);
    const { type } = this.paramsFor('explore');
    set(controller, 'type', type);
  }

  titleToken() {
    const model = this.modelFor('explore.category');
    const { type } = this.paramsFor('explore');
    return this.intl.t('explore.titles.category.index', {
      category: model.category.title,
      type
    });
  }
}

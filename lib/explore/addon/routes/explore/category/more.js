import Route from '@ember/routing/route';
import { setProperties } from '@ember/object';
import { service } from '@ember-decorators/service';

export default class ExploreCategoryMoreRoute extends Route {
  @service intl;

  beforeModel() {
    const title = this.titleToken();
    if (title && title.toString().includes('Missing translation')) {
      const { slug } = this.paramsFor('explore.category');
      return this.transitionTo('explore.category', slug);
    }
  }

  model() {
    return this.modelFor('explore.category');
  }

  setupController(controller) {
    super.setupController(...arguments);
    const { type } = this.paramsFor('explore'); // anime | manga
    const { key } = this.paramsFor(this.routeName);
    setProperties(controller, { type, key });
  }

  titleToken() {
    const { type } = this.paramsFor('explore');
    const { key } = this.paramsFor(this.routeName);
    const model = this.modelFor('explore.category');

    return this.intl.t(`explore.titles.${key}`, {
      category: model.category.title,
      type
    });
  }
}

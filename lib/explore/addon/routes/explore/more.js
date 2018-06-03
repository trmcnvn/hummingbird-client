import Route from '@ember/routing/route';
import { set } from '@ember/object';
import { service } from '@ember-decorators/service';

export default class ExploreMoreRoute extends Route {
  @service intl;

  beforeModel() {
    const title = this.titleToken();
    if (title && title.toString().includes('Missing translation')) {
      return this.transitionTo('explore', 'anime');
    }
  }

  model() {
    return this.modelFor('explore');
  }

  setupController(controller) {
    super.setupController(...arguments);
    const { key } = this.paramsFor(this.routeName);
    set(controller, 'key', key);
  }

  titleToken() {
    const { key } = this.paramsFor(this.routeName);
    const { type } = this.paramsFor('explore');
    const title = this.intl.t(`explore.titles.${key}`, { type, category: null });
    return title;
  }
}

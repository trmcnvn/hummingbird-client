import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class Index extends Route {
  @service intl;

  model() {
    return this.modelFor('explore');
  }

  titleToken() {
    const { type } = this.paramsFor('explore');
    return this.intl.t('explore.titles.explore', { type });
  }
}

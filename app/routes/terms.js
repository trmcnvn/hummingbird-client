import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class Terms extends Route {
  @service intl;

  titleToken() {
    return this.intl.t('application.titles.terms');
  }
}

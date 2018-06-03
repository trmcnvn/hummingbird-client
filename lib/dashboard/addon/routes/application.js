import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class DashboardRoute extends Route {
  @service intl;
  @service session;

  beforeModel() {
    const isAuthenticated = this.session.isAuthenticated();
    if (!isAuthenticated) {
      return this.transitionToExternal('explore', 'anime');
    }
  }

  title() {
    const flavor = this.intl.t('dashboard.title');
    return `Kitsu - ${flavor}`;
  }
}

import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class Application extends Route {
  @service fetch;
  @service session;

  model() {
    if (!this.session.isAuthenticated()) { return {}; }
    return this.fetch.request('/sso/canny');
  }

  afterModel(model, transition) {
    if (transition.targetName === 'feedback.index') {
      return this.transitionTo('bugs');
    }
  }
}

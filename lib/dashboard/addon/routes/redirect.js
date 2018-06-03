import Route from '@ember/routing/route';

// @Legacy
export default class RedirectRoute extends Route {
  redirect() {
    return this.transitionTo('index');
  }
}

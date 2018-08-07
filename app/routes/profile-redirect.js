import Route from '@ember/routing/route';

export default class ProfileRedirect extends Route {
  beforeModel() {
    return this.transitionTo('dashboard');
  }
}

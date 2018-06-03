import Route from '@ember/routing/route';

export default class RedirectRoute extends Route {
  redirect() {
    return this.transitionTo('explore', 'anime');
  }
}

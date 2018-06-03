import Route from '@ember/routing/route';

// @Legacy
export default class ReactionsRedirect extends Route {
  beforeModel({ id }) {
    return this.transitionTo('reactions', id);
  }
}

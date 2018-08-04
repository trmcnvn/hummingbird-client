import Route from '@ember/routing/route';

// @Legacy
export default class ReactionsRedirect extends Route {
  beforeModel({ params }) {
    const { id } = params[this.routeName];
    return this.transitionTo('reactions', id);
  }
}

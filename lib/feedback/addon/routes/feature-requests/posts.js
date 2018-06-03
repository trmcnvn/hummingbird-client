import Route from '@ember/routing/route';

export default class FeatureRequestsAnythingRoute extends Route {
  model() {
    return this.modelFor('feature-requests');
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }
}

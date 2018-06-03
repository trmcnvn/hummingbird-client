import Route from '@ember/routing/route';

export default class DatabaseRequestsAnythingRoute extends Route {
  model() {
    return this.modelFor('database-requests');
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }
}

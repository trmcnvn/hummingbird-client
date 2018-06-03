import Route from '@ember/routing/route';

export default class BugsAnythingRoute extends Route {
  model() {
    return this.modelFor('bugs');
  }

  renderTemplate(controller, model) {
    console.debug(model);
    this.render('application', {
      model
    });
  }
}

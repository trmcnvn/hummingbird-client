import Route from '@ember/routing/route';

export default class MobileBugsAnythingRoute extends Route {
  model() {
    return this.modelFor('mobile-bugs');
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }
}

import Route from '@ember/routing/route';

export default class MobileFeaturesAnythingRoute extends Route {
  model() {
    return this.modelFor('mobile-features');
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }
}

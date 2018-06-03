import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class FeatureRequestsRoute extends Route {
  @service intl;

  model() {
    return {
      boardToken: '78c1c61a-55ee-bc40-d5ca-158b5c97e9c3',
      path: '/feedback/feature-requests',
      ...this.modelFor('application')
    };
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }

  titleToken() {
    return this.intl.t('feedback.titles.feature-requests');
  }
}

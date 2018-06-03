import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class DatabaseRequestsRoute extends Route {
  @service intl;

  model() {
    return {
      boardToken: '91febb25-fc04-e80a-c5c4-0dcd7028a4ac',
      path: '/feedback/database-requests',
      ...this.modelFor('application')
    };
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }

  titleToken() {
    return this.intl.t('feedback.titles.database-requests');
  }
}

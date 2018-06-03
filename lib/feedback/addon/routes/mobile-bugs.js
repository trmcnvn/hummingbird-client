import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class MobileBugsRoute extends Route {
  @service intl;

  model() {
    return {
      boardToken: 'b3f2fed5-ca07-bf13-dbbb-6e9fea351064',
      path: '/feedback/mobile-bugs',
      ...this.modelFor('application')
    };
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }

  titleToken() {
    return this.intl.t('feedback.titles.mobile-bugs');
  }
}

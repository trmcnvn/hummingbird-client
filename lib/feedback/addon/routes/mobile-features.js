import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class MobileFeaturesRoute extends Route {
  @service intl;

  model() {
    return {
      boardToken: 'fed94acf-1df6-dda7-fdd0-7c86cb41eb63',
      path: '/feedback/mobile-features',
      ...this.modelFor('application')
    };
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }

  titleToken() {
    return this.intl.t('feedback.titles.mobile-features');
  }
}

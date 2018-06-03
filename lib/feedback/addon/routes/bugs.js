import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class BugsRoute extends Route {
  @service intl;

  model() {
    return {
      boardToken: 'b157fd36-e072-9960-fc53-e969974d0b6b',
      path: '/feedback/bugs',
      ...this.modelFor('application')
    };
  }

  renderTemplate(controller, model) {
    this.render('application', {
      model
    });
  }

  titleToken() {
    return this.intl.t('feedback.titles.bugs');
  }
}

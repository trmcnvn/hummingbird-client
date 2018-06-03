import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';

export default class CannyScriptComponent extends Component {
  @argument path = null;
  @argument boardToken = null;
  @argument token = null;

  @service session;

  get cannyOptions() {
    const base = {
      basePath: this.path,
      boardToken: this.boardToken
    };
    if (this.session.isAuthenticated()) {
      base.ssoToken = this.token;
    }
    return base;
  }

  createElement() {
    // cleanup any previous code
    const targetElement = document.querySelectorAll('[data-canny]')[0];
    while (targetElement && targetElement.firstChild) {
      targetElement.removeChild(targetElement.firstChild);
    }
    while (this.element && this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }

    const params = JSON.stringify(this.cannyOptions);
    const element = document.createElement('script');
    const content = document.createTextNode(`
      Canny('render', ${params});
    `);
    element.appendChild(content);
    this.element.appendChild(element);
  }

  didReceiveAttrs() {
    scheduleOnce('afterRender', () => {
      this.createElement();
    });
  }
}

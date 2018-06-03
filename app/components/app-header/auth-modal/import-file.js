import Component from './-base';
import { run } from '@ember/runloop';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { task } from 'ember-concurrency-decorators';
import { dasherize } from '@orbit/utils';

export default class ImportFile extends Component {
  siteName = null;
  selectedFile = null;
  selectedFileName = null;

  @service analytics;
  @service intl;
  @service('notification-messages') notifications;
  @service session;
  @service store;

  @task({ drop: true })
  createImport = function* () {
    try {
      const record = {
        type: 'listImport',
        attributes: {
          strategy: 'greater',
          inputFile: this.selectedFile,
          kind: dasherize(this.siteName)
        },
        relationships: {
          user: { data: this.session.currentUser.identity }
        }
      };
      yield this.store.addRecord(record, { blocking: true });
      this.analytics.trackEvent({
        category: 'import',
        action: 'create',
        label: this.siteName
      });
      this.transitionToComponent('import-progress', this.data);
    } catch (error) {
      const message = this.intl.t('application.authentication.errors.unknown-error');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  didReceiveAttrs() {
    this.set('siteName', this.data.siteName);
  }

  @action
  selectFile({ target }) {
    if (target.files && target.files[0]) {
      this.set('selectedFileName', target.files[0].name);
      const reader = new FileReader();
      reader.onload = evt => run(() => {
        this.set('selectedFile', evt.target.result);
      });
      reader.readAsDataURL(target.files[0]);
    }
  }

  @action
  triggerClick(elementId) {
    const element = document.getElementById(elementId);
    if (!element) { return; }
    element.click();
  }

  @action
  transitionTo(component) {
    this.transitionToComponent(component, this.data);
  }
}

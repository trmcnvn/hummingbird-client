import Component from '@ember/component';
import template from '../templates/components/report-modal';
import { layout } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';
import { equal, bool } from '@ember-decorators/object/computed';
import { isPresent } from '@ember/utils';
import { computed } from '@ember-decorators/object';
import { capitalize } from '@ember/string';

@layout(template)
export default class ReportModal extends Component {
  reasonOptions = Object.freeze(['nsfw', 'offensive', 'spoiler', 'bullying', 'other']);
  selectedReason = null;
  message = null;

  @argument type = 'report';
  @argument record = null;
  @argument group = null;
  @argument onCreate = () => {};
  @argument onClose = () => {};

  @service intl;
  @service session;
  @service store;

  @equal('selectedReason', 'other') isMessageRequired;
  @bool('fetchReport.last.value.length') hasReported;

  @computed('isMessageRequired')
  get messagePlaceholderKey() {
    return this.isMessageRequired ? 'required' : 'optional';
  }

  @computed('isMessageRequired', 'message', 'selectedReason', 'hasReported', 'fetchReport.isRunning')
  get canSubmitReport() {
    let canSubmitReport = this.selectedReason && (!this.hasReported && !this.fetchReport.isRunnning);
    if (this.isMessageRequired) {
      canSubmitReport = canSubmitReport && isPresent(this.message);
    }
    return canSubmitReport;
  }

  @task({ drop: true })
  createReport = function* () {
    const record = {
      type: this.type,
      attributes: {
        explanation: this.message,
        reason: this.selectedReason,
        status: 'reported'
      },
      relationships: {
        user: { data: this.session.currentUser.identity },
        naughty: { data: this.record.identity }
      }
    };
    if (this.group) {
      record.relationships.group = { data: this.group.identity };
    }
    yield this.store.update(t => t.addRecord(record), { blocking: true });
    this.onCreate();
    this.onClose();
  };

  @task({ drop: true })
  fetchReport = function* () {
    return yield this.store.request(this.type, {
      filter: {
        user_id: this.session.currentUser.remoteId,
        naughty_id: this.record.remoteId,
        naughty_type: capitalize(this.record.type)
      }
    });
  };

  didReceiveAttrs() {
    if (this.open) {
      this.fetchReport.perform();
    }
  }
}

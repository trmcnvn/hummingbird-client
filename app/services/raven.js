import Ember from 'ember';
import RavenLogger from 'ember-cli-sentry/services/raven';
import { some } from '@orbit/utils';

// Reference Travis: https://github.com/travis-ci/travis-web/blob/master/app/services/raven.js
export default class Raven extends RavenLogger {
  unhandledPromiseErrorMessage = '';
  benignErrors = [
    'TaskCancelation',
    'TaskInstance',
    'TransitionAborted',
    'UnrecognizedURLError',
    'not found',
    'returned a 403',
    'returned a 404',
    'operation failed',
    'operation was aborted'
  ];

  captureException(error) {
    if (!this.ignoreError(error)) {
      super.captureException(...arguments);
    }
  }

  ignoreError(error) {
    if (!this.shouldReportError()) {
      return true;
    }
    const { message } = error;
    if (message) {
      return some(this.benignErrors, benign => message.includes(benign));
    }
    return false;
  }

  shouldReportError() {
    if (Ember.testing) { return false; }
    const sampleRate = 10;
    return (Math.random() * 100 <= sampleRate);
  }
}

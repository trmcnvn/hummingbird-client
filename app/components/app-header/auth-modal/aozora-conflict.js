import Component from './-base';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';

export default class AozoraConflict extends Component {
  conflicts = {};
  @service fetch;

  @task({ drop: true })
  resolveConflict = function* (selected) {
    yield this.fetch.request('/users/_conflicts', {
      method: 'POST',
      body: JSON.stringify({
        chosen: selected
      })
    });
    this.transitionToComponent('aozora-account-details');
  };

  didReceiveAttrs() {
    this.set('conflicts', this.data);
  }
}

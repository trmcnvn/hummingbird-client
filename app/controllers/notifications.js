import Controller from '@ember/controller';
import { task } from 'ember-concurrency-decorators';
import { concat } from '../decorators';

export default class Notifications extends Controller {
  records = [];
  @concat('model.notifications.value', 'records') notifications;

  @task({ drop: true })
  onPagination = function* () {
    const cursor = this.notifications.lastObject.remoteId;
    const records = yield this.model.taskProperty.perform({ cursor });
    this.records.addObjects(records);
  };
}

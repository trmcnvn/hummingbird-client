import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

export default class Reations extends Controller {
  @action
  onDelete() {
    this.transitionToRoute('dashboard');
  }
}

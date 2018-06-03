import Component from './-base';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class ImportSelect extends Component {
  @argument isAccountCreation = true;

  didReceiveAttrs() {
    this.set('isAccountCreation', this.data.isAccountCreation || this.isAccountCreation);
  }

  @action
  transitionTo(component, siteName) {
    this.transitionToComponent(component, { siteName, isAccountCreation: this.isAccountCreation });
  }
}

import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class Base extends Component {
  @argument modal = null;
  @argument data = {};
  @argument closeModal = () => {};
  @argument changeComponent = () => {};

  @action
  transitionToComponent(component, data = {}) {
    this.changeComponent(component, data);
  }
}

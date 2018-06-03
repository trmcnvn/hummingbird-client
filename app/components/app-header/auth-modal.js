import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class AuthModal extends Component {
  modalComponentData = {};

  @argument isModalShown = false;
  @argument modalComponent = 'social-auth';
  @argument onHidden = () => {};

  @computed('modalComponent')
  get currentComponent() {
    return `app-header/auth-modal/${this.modalComponent}`;
  }

  @action
  changeComponent(component, data) {
    this.setProperties({
      modalComponent: component,
      modalComponentData: data
    });
  }
}

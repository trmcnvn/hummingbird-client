import Component from '@ember/component';
import template from '../templates/components/guest-user-card';
import { layout, tagName } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { argument } from '@ember-decorators/argument';

@layout(template)
@tagName('')
export default class GuestUserCard extends Component {
  @argument user = null;
  @service session;

  @action
  onClick() {
    return this.session.openAuthenticationModal();
  }
}

import Component from '@ember/component';
import template from '../templates/components/user-card';
import { layout, classNames } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

@layout(template)
@classNames('card')
export default class UserCard extends Component {
  @argument user = null;
  @service router;

  @action
  transitionToProfile() {
    this.router.transitionTo('profile', this.user.linkableId);
  }
}

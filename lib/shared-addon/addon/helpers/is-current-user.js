import Helper from '@ember/component/helper';
import { service } from '@ember-decorators/service';

export default class IsCurrentUser extends Helper {
  @service session;

  compute([user]) {
    if (!this.session.isAuthenticated()) { return false; }
    return this.session.isCurrentUser(user);
  }
}

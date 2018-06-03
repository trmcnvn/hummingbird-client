import Helper from '@ember/component/helper';
import { isPresent } from '@ember/utils';
import { service } from '@ember-decorators/service';
import { htmlSafe } from '@ember/string';

export default class UserBadge extends Helper {
  @service intl;

  compute([user]) {
    if (isPresent(user.title)) {
      const title = this.intl.t(`shared-addon.user-badge.${user.title.toLowerCase()}`);
      return htmlSafe(`<span class="badge badge-primary">${title}</span>`);
    } else if (user.isPro) {
      const title = this.intl.t('shared-addon.user-badge.pro');
      return htmlSafe(`<span class="badge badge-primary">${title}</span>`);
    }
  }
}

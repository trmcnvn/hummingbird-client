import Component from '@ember/component';
import layout from '../templates/components/group-activity';
import { service } from '@ember-decorators/service';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember-decorators/object';

export default class GroupActivity extends Component {
  layout = layout;

  @service session;
  @service store;

  @task({ drop: true })
  fetchGroups = function* () {
    return yield this.store.request('groupMember', {
      filter: {
        user: this.session.currentUser.remoteId
      },
      fields: {
        groupMembers: ['unreadCount', 'group'].join(),
        groups: ['name', 'slug', 'avatar'].join()
      },
      include: 'group',
      page: { limit: 8 },
      sort: '-group.lastActivityAt'
    });
  };

  didInsertElement() {
    if (!this.session.isAuthenticated) { return; }
    this.fetchGroups.perform();
  }

  @action
  openAuthModal() {
    this.session.openAuthenticationModal();
  }
}

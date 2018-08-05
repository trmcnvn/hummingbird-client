import Component from '@ember/component';
import template from '../../../templates/components/app-feed/items/post';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { layout, tagName } from '@ember-decorators/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import getErrorMessage from 'kitsu/utils/get-error-message';

@layout(template)
@tagName('')
export default class Post extends Component {
  isGateShown = this.isContentGated;

  @argument showGroupAvatar = true;
  @argument isPermalinkPage = false;
  @argument showNSFW = false;
  @argument showSpoilers = false;

  @service intl;
  @service('notification-messages') notifications;
  @service router;
  @service session;
  @service store;

  @computed('item')
  get activity() {
    return this.item.activities.firstObject;
  }

  @computed('activity.{target,subject}')
  get post() {
    const [type] = this.activity.foreignId.split(':');
    const relation = type === 'Comment' ? 'target' : 'subject';
    return this.activity[relation];
  }

  set post(value) {
    const object = {
      activities: [{
        foreignId: '',
        subject: value
      }]
    };
    this.set('item', object);
    return value;
  }

  @computed('post.{user,nsfw,spoiler,spoiledUnit}', 'showNSFW', 'showSpoilers')
  get isContentGated() {
    if (this.session.isCurrentUser(this.post.user)) {
      return this.post.nsfw && !this.showNSFW;
    }
    return this.post.nsfw || (this.post.spoiler && !(this.showSpoilers && !this.post.spoiledUnit));
  }

  @task({ drop: true })
  onLike = function* () {
    const user = this.session.currentUser;
    yield this.store.update(t => ([
      t.replaceAttribute(user.identity, 'likesGivenCount', user.likesGivenCount + 1),
      t.replaceAttribute(this.post.identity, 'postLikesCount', this.post.postLikesCount + 1)
    ]), { local: true });
  };

  @task({ drop: true })
  onDislike = function* () {
    const user = this.session.currentUser;
    yield this.store.update(t => ([
      t.replaceAttribute(user.identity, 'likesGivenCount', Math.max(0, user.likesGivenCount - 1)),
      t.replaceAttribute(this.post.identity, 'postLikesCount', Math.max(0, this.post.postLikesCount - 1))
    ]), { local: true });
  };

  @task({ drop: true })
  deletePost = function* () {
    try {
      yield this.store.update(t => t.removeRecord(this.post.identity), { blocking: true });
      if (this.isPermalinkPage) {
        this.router.transitionTo('dashboard');
        const message = this.intl.t('shared-addon.app-feed.items.post.deleted');
        this.notifications.success(message);
      } else {
        this.onDelete('post');
      }
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
    }
  };

  @action
  onGate(value) {
    this.set('isGateShown', value);
  }
}

import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import { isPresent } from '@ember/utils';
import { getComputedTitle } from 'shared-addon/helpers/computed-title';
import { hrefTo } from 'ember-href-to/helpers/href-to';

@tagName('li')
export default class Item extends Component {
  @service intl;
  @service session;

  @argument notification = null;
  @argument closePopper = () => {};

  @alias('others.length') othersCount;

  @computed('notification.activities.[]')
  get activity() {
    return this.notification.activities.get('firstObject');
  }

  @computed('activity')
  get isUser() {
    return this.activity.actor.type === 'user';
  }

  @computed('notification.activities.[]')
  get others() {
    return this.notification.activities.slice(1).reject(activity => (
      activity.actor.id === this.activity.actor.id
    ));
  }

  @computed('activity.mentionedUsers')
  get isMentioned() {
    const id = parseInt(this.session.currentUser.remoteId, 10);
    return this.activity.mentionedUsers && this.activity.mentionedUsers.includes(id);
  }

  @computed('activity')
  get computedLink() {
    const queryParams = { isQueryParams: true, values: { notification: this.notification.remoteId } };
    const [type, id] = this.activity.foreignId.split(':');
    switch (type) {
      case 'Post': {
        if (isPresent(id)) {
          return hrefTo(this, 'posts', id, queryParams);
        }
        return '#';
      }
      case 'Follow': {
        const user = this.activity.actor;
        if (isPresent(user)) {
          return hrefTo(this, 'profile', user.linkableId, queryParams);
        }
        return '#';
      }
      case 'Comment': {
        if (isPresent(id)) {
          return hrefTo(this, 'comments', id, queryParams);
        }
        return '#';
      }
      case 'PostLike':
      case 'CommentLike': {
        if (isPresent(this.activity.target)) {
          const targetId = this.activity.target.remoteId;
          return hrefTo(this, type === 'PostLike' ? 'posts' : 'comments', targetId, queryParams);
        }
        return '#';
      }
      case 'GroupInvite': {
        // @TODO: Make apart of groups engine
        if (isPresent(id)) {
          return hrefTo(this, 'group-invite', id, queryParams);
        }
        return '#';
      }
      case 'MediaReactionVote': {
        if (isPresent(this.activity.target)) {
          const targetId = this.activity.target.remoteId;
          return hrefTo(this, 'reactions', targetId, queryParams);
        }
        return '#';
      }
      case 'Episode':
      case 'Chapter': {
        const user = this.activity.actor;
        if (isPresent(user)) {
          return hrefTo(this, user.type, user.slug, queryParams);
        }
        return '#';
      }
      default: {
        return '#';
      }
    }
  }

  @action
  notificationText(verb) {
    const textOnly = ['follow', 'post', 'post_like', 'comment_like', 'invited'];
    if (textOnly.includes(verb)) {
      return this.intl.t(`application.notifications.items.verbs.${verb}`);
    }

    const queryParams = { isQueryParams: true, values: { notification: this.notification.remoteId } };
    switch (verb) {
      case 'comment': {
        if (this.session.currentUser.remoteId === this.activity.replyToUser.split(':')[1]) {
          return this.intl.t('application.notifications.items.verbs.comment.replied', {
            type: this.activity.replyToType === 'comment' ? 'comment' : 'post'
          });
        } else if (this.isMentioned) {
          return this.intl.t('application.notifications.items.verbs.comment.mentioned');
        }

        // @Cleanup
        const hasUser = this.activity.target && this.activity.target.user;
        const actor = hasUser && this.activity.target.user.id === this.activity.actor.id ? 'owner'
          : (hasUser && this.activity.target.user.id === this.session.currentUser.id) ? 'self' : '';
        return this.intl.t('application.notifications.items.verbs.comment.reply', {
          type: hasUser ? 'user' : null,
          actor,
          link: hrefTo(this, 'profile', this.activity.target.user.linkableId, queryParams),
          name: hasUser && this.activity.target.user.name,
          htmlSafe: true
        })
      }
      case 'vote': {
        const media = this.activity.target.media;
        return this.intl.t('application.notifications.items.verbs.vote', {
          title: getComputedTitle(this.session.currentUser, media),
          link: hrefTo(this, media.type, media.slug, queryParams),
          htmlSafe: true
        });
      }
      case 'aired': {
        const media = this.activity.actor;
        return this.intl.t('application.notifications.items.verbs.aired', {
          type: this.activity.subject.type,
          number: this.activity.subject.number,
          unitLink: '#', // @TODO: This should be the unit page
          mediaLink: hrefTo(this, media.type, media.slug, queryParams),
          media: getComputedTitle(this.session.currentUser, media),
          htmlSafe: true
        });
      }
      default: {
        return null;
      }
    }
  }
}

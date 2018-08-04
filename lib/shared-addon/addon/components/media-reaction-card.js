import Component from '@ember/component';
import template from '../templates/components/media-reaction-card';
import { layout, classNames } from '@ember-decorators/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { alias, bool, reads } from '@ember-decorators/object/computed';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { getImage } from '../helpers/get-image';
import { htmlSafe } from '@ember/string';
/* global ClipboardJS */

@layout(template)
@classNames('card')
export default class MediaReactionCard extends Component {
  showDeleteModal = false;
  showReportModal = false;
  @argument isPermalinkPage = false;

  @service intl;
  @service('notification-messages') notifications;
  @service raven;
  @service router;
  @service session;
  @service store;

  @alias('reaction.media') media;
  @reads('fetchUserVote.last.value.firstObject') userVoteRecord;
  @bool('userVoteRecord') hasRecord;

  @computed('media.subtype')
  get subtypeKey() {
    return this.media.subtype.toLowerCase();
  }

  @computed('media.posterImage')
  get posterImageStyle() {
    const src = getImage(this.media.posterImage, 'large');
    return htmlSafe(`background-image: url(${src});`);
  }

  @computed('reaction.user', 'session.currentUser.isStaff')
  get canMutateReaction() {
    const isOwner = this.session.isCurrentUser(this.reaction.user);
    const isStaff = this.session.currentUser && this.session.currentUser.isStaff;
    return isOwner || isStaff;
  }

  @task({ drop: true })
  fetchUserVote = function* () {
    if (!this.session.isAuthenticated()) { return []; }
    return yield this.store.request('mediaReactionVote', {
      filter: {
        mediaReactionId: this.reaction.remoteId,
        userId: this.session.currentUser.remoteId
      },
      page: { limit: 1 }
    });
  };

  @task({ drop: true })
  createVote = function* () {
    const record = {
      type: 'mediaReactionVote',
      relationships: {
        mediaReaction: { data: this.reaction.identity },
        user: { data: this.session.currentUser.identity }
      }
    };
    try {
      const vote = yield this.store.addRecord(record);
      yield this.store.update(t => (
        t.replaceAttribute(this.reaction.identity, 'upVotesCount', this.reaction.upVotesCount + 1)
      ), { local: true });
      this.set('userVoteRecord', vote);
    } catch (error) {
      this.notifications.error(this.intl.t('general.errors.request'));
      this.raven.captureException(error);
    }
  };

  @task({ drop: true })
  destroyVote = function* () {
    try {
      yield this.store.update(t => t.removeRecord(this.userVoteRecord.identity));
      yield this.store.update(t => (
        t.replaceAttribute(this.reaction.identity, 'upVotesCount', this.reaction.upVotesCount - 1)
      ), { local: true });
      this.set('userVoteRecord', null);
    } catch (error) {
      this.notifications.error(this.intl.t('general.errors.request'));
      this.raven.captureException(error);
    }
  };

  @task({ drop: true })
  destroyReaction = function* () {
    try {
      yield this.store.update(t => t.removeRecord(this.reaction.identity), { blocking: true });
      this.notifications.success(this.intl.t('shared-addon.media-reaction-card.deleted'));
      if (this.isPermalinkPage) { this.router.transitionTo('dashboard'); }
    } catch (error) {
      this.notifications.error(this.intl.t('general.errors.delete'));
      this.raven.captureException(error);
    }
  }

  onCopy = () => {
    const message = this.intl.t('general.copied');
    this.notifications.success(message);
  };

  didReceiveAttrs() {
    this.fetchUserVote.perform();
  }

  didRender() {
    const elements = this.element.querySelectorAll('[data-clipboard-text]');
    if (!this._clipboard && elements.length > 0) {
      this._clipboard = new ClipboardJS(elements);
      this._clipboard.on('success', this.onCopy);
    }
  }

  willDestroyElement() {
    if (this._clipboard) {
      this._clipboard.destroy();
    }
  }

  @action
  toggleVote() {
    if (!this.session.isAuthenticated()) {
      return this.session.openAuthenticationModal();
    }
    if (this.session.isCurrentUser(this.reaction.user)) { return; }
    const task = this.hasRecord ? 'destroyVote' : 'createVote';
    this[task].perform();
  }

  @action
  getCopyLink(link) {
    return `${window.location.protocol}//${window.location.host}${link}`;
  }

  @action
  deleteReaction() {
    this.set('showDeleteModal', false);
    this.destroyReaction.perform();
  }

  @action
  reportCreated() {
    const message = this.intl.t('general.reported');
    this.notifications.success(message);
  }

  @action
  noop() {}
}

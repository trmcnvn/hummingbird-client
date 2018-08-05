import Component from '@ember/component';
import template from '../templates/components/media-reaction-modal';
import { layout } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { bool, reads } from '@ember-decorators/object/computed';
import { computed, action } from '@ember-decorators/object';
import { htmlSafe } from '@ember/string';
import { getImage } from '../helpers/get-image';
import { task } from 'ember-concurrency-decorators';
import getErrorMessage from 'kitsu/utils/get-error-message';
import { service } from '@ember-decorators/service';

@layout(template)
export default class MediaReactionModal extends Component {
  showDeleteModal = false;
  maxLength = 140;
  editorPlaceholder = this.getRandomIndex();

  @argument reaction = null;
  @argument media = null;
  @argument libraryEntry = null;
  @argument onCreate = () => {};
  @argument onDelete = null;

  @service intl;
  @service('notification-messages') notifications;
  @service raven;
  @service session;
  @service store;

  @reads('reaction.reaction') message;
  @bool('reaction') isEditing;

  @computed('media.subtype')
  get subtypeKey() {
    return this.media.subtype.toLowerCase();
  }

  @computed('media.posterImage')
  get posterImageStyle() {
    const src = getImage(this.media.posterImage, 'large');
    return htmlSafe(`background-image: url(${src});`);
  }

  @computed('message')
  get charCount() {
    return this.maxLength - this.message.length;
  }

  @task({ drop: true })
  createReaction = function* () {
    if (this.isEditing) { return yield this.editReaction.perform(); }
    try {
      const record = {
        type: 'mediaReaction',
        attributes: {
          reaction: this.message
        },
        relationships: {
          libraryEntry: { data: this.libraryEntry.identity },
          [this.media.type]: { data: this.media.identity },
          user: { data: this.session.currentUser.identity }
        }
      };
      yield this.store.addRecord(record, { blocking: true });
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    } finally {
      this.onCreate();
    }
  };

  @task({ drop: true })
  editReaction = function* () {
    try {
      const record = {
        type: 'mediaReaction',
        id: this.reaction.id,
        attributes: {
          reaction: this.message
        }
      };
      yield this.store.update(t => t.replaceRecord(record), { blocking: true });
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    } finally {
      this.onCreate();
    }
  };

  @task({ drop: true })
  destroyReaction = function* () {
    try {
      if (this.onDelete) { return yield this.onDelete(); }
      // Handle deletion ourselves if action is null.
      this.set('showDeleteModal', false);
      yield this.store.update(t => t.removeRecord(this.reaction.identity), { blocking: true });
      this.notifications.success(this.intl.t('shared-addon.media-reaction-card.deleted'));
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.delete');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    }
  };

  getRandomIndex() {
    return Math.floor(Math.random() * 4);
  }

  @action
  onEnter(event) {
    const isMeta = event.metaKey || event.ctrlKey;
    if (event.keyCode === 13 && isMeta && this.canPost) {
      // this.createComment.perform();
    }
  }
}

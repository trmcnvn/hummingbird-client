import Component from '@ember/component';
import template from '../templates/components/media-reaction-modal';
import { layout } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { bool, reads } from '@ember-decorators/object/computed';
import { computed, action } from '@ember-decorators/object';
import { htmlSafe } from '@ember/string';
import { getImage } from 'shared-addon/helpers/get-image';
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
  @argument onDelete = () => {};
  @argument destroyReactionTask = null;

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
    const length = (this.message && this.message.length) || 0;
    return this.maxLength - length;
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
      const reaction = yield this.store.addRecord(record, { blocking: true });
      this.onCreate(reaction);
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    } finally {
      this.onHidden();
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
      this.onCreate(this.reaction);
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.request');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    } finally {
      this.onHidden();
    }
  };

  @task({ drop: true })
  destroyReaction = function* () {
    try {
      if (this.destroyReactionTask) { return yield this.destroyReactionTask(); }
      // Handle deletion ourselves if action is null.
      this.set('showDeleteModal', false);
      yield this.store.update(t => t.removeRecord(this.reaction.identity), { blocking: true });
      this.notifications.success(this.intl.t('shared-addon.media-reaction-card.deleted'));
      this.onDelete();
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.delete');
      this.notifications.error(message, { clearDuration: 5000 });
      this.raven.captureException(error);
    } finally {
      this.set('message', null);
      this.onHidden();
    }
  };

  getRandomIndex() {
    return Math.floor(Math.random() * 4);
  }

  @action
  onEnter(event) {
    const isMeta = event.metaKey || event.ctrlKey;
    if (event.keyCode === 13 && isMeta) {
      this.createReaction.perform();
    }
  }
}

import Component from '@ember/component';
import template from '../../templates/components/app-feed/editor';
import { layout, tagName } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { all } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { isPresent, isEmpty } from '@ember/utils';
import { capitalize } from '@ember/string';
import { compact } from 'kitsu/utils/object';

const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
const FILE_UPLOAD_LIMIT = 20;

@layout(template)
@tagName('')
export default class Editor extends Component {
  maxLength = 9000;
  message = null;
  uploads = [];
  embed = null;
  skippedEmbeds = [];
  isNSFW = false;
  isSpoiler = false;
  isUnitTagged = false;
  showMediaModal = false;
  showEmojiSelector = false;
  showHelpModal = false;

  @argument isExpanded = false;
  @argument placeholderKey = 'shared-addon.app-feed.editor.placeholder';
  @argument targetInterest = null;
  @argument targetUser = null;
  @argument targetGroup = null;
  @argument media = null;
  @argument isMediaReadOnly = false;
  @argument unitNumber = null;

  @service fetch;
  @service intl;
  @service session;
  @service store;

  @computed('placeholderKey')
  get placeholder() {
    return this.intl.t(this.placeholderKey);
  }

  @computed('message', 'maxLength', 'embed')
  get canPost() {
    const hasMessage = isPresent(this.message) && this.message.length < this.maxLength;
    const hasEmbed = isPresent(this.embed);
    return hasMessage || hasEmbed;
  }

  @task({ restartable: true })
  fetchEmbed = function* () {
    if (!this.embed) { return; }
    return yield this.fetch.request('embeds', {
      method: 'POST',
      body: JSON.stringify({ url: this.embed })
    });
  };

  @task({ keepLatest: true })
  fetchUnitNumber = function* () {
    const response = yield this.store.request('libraryEntry', {
      filter: {
        user_id: this.session.currentUser.remoteId,
        kind: this.media.type,
        [`${this.media.type}_id`]: this.media.remoteId
      }
    });
    const record = response.firstObject;
    if (!record) { return; }
    this.set('unitNumber', record.progress);
    this.set('isUnitTagged', true);
  };

  @task({ drop: true })
  createPost = function* () {
    const record = yield this.buildPostRecord.perform();
    const post = yield this.store.addRecord(record, { blocking: true });
    // TODO: Uploads!
    yield this.store.update(t => (
      t.replaceAttribute(this.session.currentUser.identity, 'postsCount', this.session.currentUser.postsCount + 1)
    ), { local: true });
    this.onPostCreated(post);
    this.resetProperties();
  };

  @task({ drop: true })
  buildPostRecord = function* () {
    const record = {
      type: 'post',
      attributes: {
        nsfw: this.isNSFW,
        spoiler: this.isSpoiler,
        embedUrl: this.embed,
        content: this.message
      },
      relationships: {
        user: { data: this.session.currentUser.identity },
        uploads: { data: this.uploads.map(upload => upload.identity) }
      }
    };
    if (this.media) {
      record.relationships.media = { data: this.media.identity };
      // assign a unit to the post
      if (this.unitNumber > 0 && this.isUnitTagged) {
        const type = this.media.type === 'anime' ? 'episode' : 'chapter';
        let filter = { number: this.unitNumber };
        if (type === 'episode') {
          filter = { media_type: capitalize(this.media.type), media_id: this.media.remoteId, ...filter };
        } else {
          filter = { manga_id: this.media.remoteId, ...filter };
        }
        const records = yield this.store.request(type, { filter });
        const unit = records.firstObject;
        if (unit) {
          record.relationships.spoiledUnit = { data: unit.identity };
        }
      }
    }
    if (this.targetUser && !this.session.isCurrentUser(this.targetUser)) {
      record.relationships.targetUser = { data: this.targetUser.identity };
    }
    if (this.targetGroup) {
      record.relationships.targetGroup = { data: this.targetGroup.identity };
    }
    if (this.targetInterest) {
      record.attributes.targetInterest = this.targetInterest;
    }
    return record;
  };

  resetProperties() {
    this.setProperties({
      message: null,
      embed: null,
      unitNumber: null,
      isSpoiler: false,
      isNSFW: false,
      isUnitTagged: false,
      isExpanded: false
    });
    this.uploads.clear();
    this.skippedEmbeds.clear();
  }

  @action
  closeEditor() {
    if (!this.isExpanded) { return; }
    this.set('isExpanded', false);
  }

  @action
  openEditor() {
    if (this.isExpanded) { return; }
    this.set('isExpanded', true);
  }

  @action
  processMessage(message, force = false) {
    this.set('message', message);
    if (isEmpty(message)) {
      return this.skippedEmbeds.clear();
    }

    if (force || isEmpty(this.embed)) {
      const links = message.match(LINK_REGEX);
      if (links && links.length > 0) {
        const embeds = links.reject(link => this.skippedEmbeds.includes(link));
        this.set('embed', embeds.firstObject);
        this.fetchEmbed.perform();
      }
    }
  }

  @action
  clearEmbed() {
    this.skippedEmbeds.addObject(this.embed);
    if (isEmpty(this.message)) {
      this.set('embed', null);
    }
    this.processMessage(this.message, true);
  }

  @action
  showMediaModal() {
    if (this.media) { return; }
    this.set('showMediaModal', true);
  }

  @action
  clearMedia() {
    this.setProperties({
      media: null,
      unitNumber: null
    });
  }

  @action
  selectMedia(media) {
    this.setProperties({
      media,
      showMediaModal: false,
      isSpoiler: true
    });
    this.fetchUnitNumber.perform();
  }

  @action
  insertEmoji(emoji) {
    const message = this.message || '';
    this.set('message', message + emoji);
  }
}

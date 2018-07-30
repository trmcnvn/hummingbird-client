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
import config from 'kitsu/config/environment';

const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi;
const FILE_UPLOAD_LIMIT = 20;
const FILE_SIZE_LIMIT = 20;
const FILE_ACCEPT = 'image/jpg, image/jpeg, image/png, image/gif';

@layout(template)
@tagName('')
export default class Editor extends Component {
  maxLength = 9000;
  message = null;
  uploads = [];
  embed = null;
  skippedEmbeds = [];

  // checkbox state
  isNSFW = false;
  isSpoiler = false;
  isUnitTagged = false;

  // upload related
  filesAccepted = FILE_ACCEPT;

  // Modal related
  showMediaModal = false;
  showEmojiSelector = false;
  showHelpModal = false;

  // user-selector related
  showUserSelector = false;
  _userSelectorPrefixIndex = 0;
  userSelectorQuery = null;

  @argument isExpanded = false;
  @argument placeholderKey = 'shared-addon.app-feed.editor.placeholder';
  @argument targetInterest = null;
  @argument targetUser = null;
  @argument targetGroup = null;
  @argument media = null;
  @argument isMediaReadOnly = false;
  @argument unitNumber = null;

  @service dataCoordinator;
  @service fetch;
  @service fileQueue;
  @service intl;
  @service('notification-messages') notifications;
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

  @computed('embed', 'uploads.[]')
  get isUploadDisabled() {
    return this.uploads.length === FILE_UPLOAD_LIMIT || this.embed;
  }

  @task({ enqueue: true })
  uploadFile = function* (file) {
    // abort the file if it isn't valid or we have reached maximum uploads
    if (!this._isFileValid(file.blob) || this.isUploadDisabled) {
      file.set('state', 'aborted');
      return;
    }

    try {
      // @TODO: Batch uploads instead of uploading each file individually
      const path = `${config.kitsu.APIHost}/api/edge/uploads/_bulk`;
      const { access_token: accessToken } = this.session.authData;
      const headers = {
        accept: 'application/vnd.api+json',
        authorization: `Bearer ${accessToken}`
      };
      const { body } = yield file.upload(path, {
        headers,
        fileKey: 'files[]'
      });

      // Push the upload record into the store
      const remote = this.dataCoordinator.getSource('remote');
      const resource = remote.serializer.deserializeDocument(body);
      resource.data.forEach(record => {
        const upload = this.store.addRecord(record, { local: true });
        this.uploads.addObject(upload);
        this.store.update(t => (
          t.replaceAttribute(upload.identity, 'uploadOrder', this.uploads.indexOf(upload))
        ), { local: true });
      });
    } catch (error) {
      const queue = this.fileQueue.find('uploads');
      const failedFiles = queue.files.filter(file => ['failed', 'timed_out'].indexOf(file.state) !== -1);
      failedFiles.forEach(file => { file.set('state', 'aborted'); });

      const message = this.intl.t('shared-addon.app-feed.editor.errors.failed-upload');
      this.notifications.error(message);
    }
  };

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
    // @TODO: Uploads!
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
    if (this.isExpanded) { return true; }
    this.set('isExpanded', true);
  }

  @action
  processMessage(message, force = false) {
    this.set('message', message);
    if (isEmpty(message)) {
      return this.skippedEmbeds.clear();
    }

    // Handle mentioning users helper
    const char = message.charAt(message.length - 1);
    if (!this.showUserSelector && char === '@') { // `@` prefix for mentioning
      this.setProperties({
        showUserSelector: true,
        _userSelectorPrefixIndex: message.length,
      });
    } else if (this.showUserSelector) {
      if (char === ' ') { // Cancel after a space
        this.setProperties({
          showUserSelector: false,
          userSelectorQuery: null
        });
      } else {
        this.set('userSelectorQuery', message.slice(this._userSelectorPrefixIndex));
      }
    }

    // process embeds
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
  onPaste(event) {
    const { items } = event.clipboardData;
    const images = [];
    items.forEach(item => {
      const file = item.getAsFile();
      if (file && this._isFileValid(file)) {
        event.preventDefault();
        images.addObject(file);
      }
    });
    if (images.length > 0) {
      const queue = this.fileQueue.find('uploads');
      queue._addFiles(images);
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

  _isFileValid(file) {
    if (file.type && !this.filesAccepted.includes(file.type)) {
      return false;
    }
    const sizeInMb = file.size / 1000000;
    return sizeInMb >= FILE_SIZE_LIMIT;
  }
}

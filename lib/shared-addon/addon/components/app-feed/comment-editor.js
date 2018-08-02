import EditorComponent from './editor';
import template from '../../templates/components/app-feed/comment-editor';
import { layout } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';

// Store, Session injected in super
@layout(template)
export default class CommentEditor extends EditorComponent {
  // Comments are currently limited to 1 upload.
  uploadLimit = 1;

  @argument autofocus = false;
  @argument replyMention = null;
  @argument isCommentReply = false;
  @argument post = null;
  @argument comment = null;
  @argument onCommentCreated = () => {};

  @computed('isCommentReply')
  get placeholderKey() {
    if (this.isCommentReply) {
      return 'shared-addon.app-feed.comment-editor.reply-placeholder';
    } else {
      return 'shared-addon.app-feed.comment-editor.message-placeholder';
    }
  }

  @task({ drop: true })
  createComment = function* () {
    const record = {
      type: 'comment',
      attributes: {
        content: this.message,
        embedUrl: this.embed
      },
      relationships: {
        post: { data: this.post.identity },
        user: { data: this.session.currentUser.identity },
        uploads: { data: this.uploads.map(upload => upload.identity) }
      }
    };
    if (this.isEditing) { return this.editComment.perform(record); }

    if (this.isCommentReply) {
      record.relationships.parent = { data: this.comment.identity };
    }
    const comment = yield this.store.addRecord(record, { blocking: true });
    yield this.updateUploadOrder.perform();

    // Locally increase the commentsCount, this is for onboarding feedback
    if (!this.session.currentUser.feedCompleted) { // @Profile
      yield this.store.update(t => t.replaceAttribute(this.session.currentUser.identity, 'commentsCount', this.session.currentUser.commentsCount + 1), { local: true });
    }

    this.onCommentCreated(comment);
    this.resetProperties();
  };

  @task({ drop: true })
  editComment = function* (record) {
    record.id = this.comment.id;
    yield this.store.update(t => t.replaceRecord(record), { blocking: true });
    yield this.updateUploadOrder.perform();
    this.onCommentCreated();
  };

  @action
  onEnter(event) {
    if (event.keyCode === 13 && event.metaKey && this.canPost) {
      this.createComment.perform();
    }
  }

  didReceiveAttrs() {
    if (this.replyMention) {
      this.set('message', `@${this.replyMention} `);
    }

    if (this.isEditing && this.comment) {
      this.setProperties({
        message: this.comment.content,
        embed: this.comment.embed && this.comment.embed.url
      });
      if (this.comment.uploads) {
        this.uploads.addObjects(this.comment.uploads.sortBy('uploadOrder'));
      }
    }
  }
}

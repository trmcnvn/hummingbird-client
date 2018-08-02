import EditorComponent from './editor';
import template from '../../templates/components/app-feed/comment-editor';
import { layout } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';

@layout(template)
export default class CommentEditor extends EditorComponent { // Store, Session injected here
  // Comments are currently limited to 1 upload.
  uploadLimit = 1;

  @argument autofocus = false;
  @argument replyMention = null;
  @argument isCommentReply = false;
  @argument post = null;
  @argument comment = null;
  @argument onCommentCreated = () => {};

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
    super.didReceiveAttrs();
  }
}

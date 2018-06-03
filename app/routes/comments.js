import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class Comments extends Route {
  @service intl;
  @service store;

  model({ id }) {
    return this.store.request('comment', {
      filter: { id },
      include: ['user', 'parent', 'uploads', 'post',
        ['user',
        'targetUser',
        'targetGroup',
        'media',
        'uploads'].map(item => `post.${item}`).join()
      ].join(),
      cache: false
    }).then(records => records.firstObject);
  }

  afterModel(comment) {
    if (comment === undefined) {
      return this.replaceWith('/404');
    }
  }

  titleToken() {
    const comment = this.modelFor('comments');
    return this.intl.t('application.titles.comments', {
      name: comment.user.name
    });
  }

  headTags() {
    const comment = this.modelFor('comments');
    return [{
      type: 'meta',
      tagId: 'meta-description',
      attrs: {
        name: 'description',
        content: comment.content && comment.content.substring(0, 140)
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-description',
      attrs: {
        name: 'og:description',
        content: comment.content && comment.content.substring(0, 140)
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-type',
      attrs: {
        name: 'og:type',
        content: 'article'
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-image',
      attrs: {
        name: 'og:image',
        content: comment.user.get('avatar.medium') || '/images/default_avatar.png'
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-label1',
      attrs: {
        property: 'twitter:label1',
        content: 'Likes'
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-data1',
      attrs: {
        property: 'twitter:data1',
        content: comment.likesCount || 0
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-label2',
      attrs: {
        property: 'twitter:label2',
        content: 'Replies'
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-data2',
      attrs: {
        property: 'twitter:data2',
        content: comment.repliesCount || 0
      }
    }];
  }
}

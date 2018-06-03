import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class Posts extends Route {
  @service intl;
  @service store;

  model({ id }) {
    return this.store.request('post', {
      filter: { id },
      include: ['user', 'targetUser', 'targetGroup', 'media', 'uploads'].join(),
      cache: false
    }).then(records => records.firstObject);
  }

  afterModel(post) {
    if (post === undefined) {
      return this.replaceWith('/404');
    }
  }

  titleToken() {
    const post = this.modelFor('posts');
    return this.intl.t('application.titles.posts', {
      name: post.user.name
    });
  }

  headTags() {
    const post = this.modelFor('posts');
    return [{
      type: 'meta',
      tagId: 'meta-description',
      attrs: {
        name: 'description',
        content: post.content && post.content.substring(0, 140)
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-description',
      attrs: {
        name: 'og:description',
        content: post.content && post.content.substring(0, 140)
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
        content: post.user.get('avatar.medium') || '/images/default_avatar.png'
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
        content: post.postLikesCount || 0
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-label2',
      attrs: {
        property: 'twitter:label2',
        content: 'Comments'
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-data2',
      attrs: {
        property: 'twitter:data2',
        content: post.commentsCount || 0
      }
    }];
  }
}

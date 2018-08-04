import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

export default class Reactions extends Route {
  @service intl;
  @service store;

  model({ id }) {
    return this.store.request('mediaReaction', {
      filter: { id },
      include: ['user', 'anime', 'manga'].join(),
      cache: false
    }).then(records => records.firstObject);
  }

  afterModel(reaction) {
    if (reaction === undefined) {
      return this.replaceWith('/404');
    }
  }

  titleToken() {
    const reaction = this.modelFor('reactions');
    return this.intl.t('application.titles.reactions', {
      name: reaction.user.name
    });
  }

  headTags() {
    const reaction = this.modelFor('reactions');
    return [{
      type: 'meta',
      tagId: 'meta-description',
      attrs: {
        name: 'description',
        content: reaction.reaction
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-description',
      attrs: {
        name: 'og:description',
        content: reaction.reaction
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
        content: reaction.user.get('avatar.medium') || reaction.media.get('posterImage.medium') || '/images/default_avatar.png'
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-label1',
      attrs: {
        property: 'twitter:label1',
        content: 'Votes'
      }
    }, {
      type: 'meta',
      tagId: 'meta-twitter-data1',
      attrs: {
        property: 'twitter:data1',
        content: reaction.upVotesCount || 0
      }
    }];
  }
}

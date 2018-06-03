import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from 'kitsu/decorators/orbit';
import { computed } from '@ember-decorators/object';

export default class MediaReaction extends Model {
  @attr('string') reaction;
  @attr('number') upVotesCount;

  @hasOne('libraryEntry', { inverse: 'mediaReaction' }) libraryEntry;
  @hasOne('anime', { inverse: null }) anime;
  @hasOne('manga', { inverse: null }) manga;
  @hasOne('user', { inverse: null }) user;

  @hasMany('mediaReactionVote', { inverse: 'mediaReaction' }) votes;

  @computed('anime', 'manga')
  get media() {
    return this.anime || this.manga;
  }
}

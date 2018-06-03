import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';
import { computed } from '@ember-decorators/object';
import { alias } from '@ember-decorators/object/computed';

export default class LibraryEntry extends Model {
  @attr('date') finishedAt;
  @attr('string') notes;
  @attr('number') progress;
  @attr('date') progressedAt;
  @attr('boolean') private;
  @attr('kitsu-rating') ratingTwenty;
  @attr('string') reactionSkipped;
  @attr('boolean') reconsuming;
  @attr('number') reconsumeCount;
  @attr('date') startedAt;
  @attr('string') status;
  @attr('number') volumesOwned;

  @hasOne('anime', { inverse: null }) anime;
  @hasOne('manga', { inverse: null }) manga;
  @hasOne('mediaReaction', { inverse: 'libraryEntry' }) mediaReaction;
  @hasOne(null, { inverse: null }) unit;
  @hasOne('user', { inverse: 'libraryEntries' }) user;

  @alias('ratingTwenty') rating;

  @computed('anime', 'manga')
  get media() {
    return this.anime || this.manga;
  }

  @computed('rating')
  get ratingSimpleType() {
    if (this.rating > 0 && this.rating < 4) {
      return 'awful';
    } else if (this.rating >= 4 && this.rating < 7) {
      return 'meh';
    } else if (this.rating >= 7 && this.rating < 10) {
      return 'good';
    }
    return 'great';
  }
}

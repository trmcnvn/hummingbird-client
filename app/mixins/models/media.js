import Model from 'kitsu/mixins/models/base';
import { computed } from '@ember-decorators/object';
import { or } from '@ember-decorators/object/computed';
import { attr } from '../../decorators/orbit';

export default class Media extends Model {
  @attr('array') abbreviatedTitles;
  @attr('number') averageRating;
  @attr('string') canonicalTitle;
  @attr('object') coverImage;
  @attr('number') coverImageTopOffset;
  @attr('date') endDate;
  @attr('number') favoritesCount;
  @attr('boolean') nsfw;
  @attr('number') popularityRank;
  @attr('object') posterImage;
  @attr('object') ratingFrequencies;
  @attr('number') ratingRank;
  @attr('string') slug;
  @attr('date') startDate;
  @attr('string') status;
  @attr('string') subtype;
  @attr('string') synopsis;
  @attr('string') tba;
  @attr('object') titles;
  @attr('number') userCount;

  @or('episodeCount', 'chapterCount') unitCount;

  @computed('ratingFrequencies')
  get totalRatings() {
    const keys = Array.apply(null, { length: 19 }).map(Number.call, Number).map(num => num + 2);
    return keys.reduce((previous, current) => (
      previous + (parseInt(this.ratingFrequencies[current], 10) || 0)
    ), 0);
  }

  @computed('startDate')
  get year() {
    return this.startDate ? new Date(this.startDate).getFullYear() : '';
  }
}

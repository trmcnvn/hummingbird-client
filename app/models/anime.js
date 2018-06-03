import Model from 'kitsu/mixins/models/media';
import { attr, hasMany } from 'kitsu/decorators/orbit';

export default class Anime extends Model {
  @attr('string') ageRating;
  @attr('string') ageRatingGuide;
  @attr('number') episodeCount;
  @attr('number') episodeLength;
  @attr('string') youtubeVideoId;

  @hasMany('category', { inverse: 'anime' }) categories;
}

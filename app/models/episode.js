import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class Episode extends Model {
  @attr('date') airdate;
  @attr('string') canonicalTitle;
  @attr('number') length;
  @attr('number') number;
  @attr('number') seasonNumber;
  @attr('string') synopsis;
  @attr('object') thumbnail;
  @attr('object') titles;

  @hasOne('anime', { inverse: null }) media;
}

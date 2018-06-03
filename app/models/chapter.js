import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class Chapter extends Model {
  @attr('date') published;
  @attr('string') canonicalTitle;
  @attr('number') length;
  @attr('number') number;
  @attr('number') volumeNumber;
  @attr('string') synopsis;
  @attr('object') thumbnail;
  @attr('object') titles;

  @hasOne('manga', { inverse: null }) manga;
}

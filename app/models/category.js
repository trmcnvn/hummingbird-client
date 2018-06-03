import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from 'kitsu/decorators/orbit';

export default class Category extends Model {
  @attr('number') childCount;
  @attr('string') description;
  @attr('object') image;
  @attr('boolean') nsfw;
  @attr('string') slug;
  @attr('string') title;
  @attr('number') totalMediaCount;

  @hasOne('category') parent;

  @hasMany('anime', { inverse: 'categories' }) anime;
  @hasMany('manga', { inverse: 'categories' }) manga;
}

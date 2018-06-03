import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class Upload extends Model {
  @attr('object') content;
  @attr('number') uploadOrder;

  @hasOne('user', { inverse: 'uploads' }) user;
  @hasOne(null, { inverse: 'uploads' }) owner; // [Post, Comment]
}

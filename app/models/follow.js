import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class Follow extends Model {
  @attr('boolean') hidden;

  @hasOne('user', { inverse: 'following' }) follower;
  @hasOne('user', { inverse: 'followers' }) followed;
}

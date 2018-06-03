import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class OneSignalPlayer extends Model {
  @attr('string') playerId;
  @attr('string') platform;

  @hasOne('user', { inverse: null }) user;
}

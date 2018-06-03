import Model from 'kitsu/mixins/models/base';
import { hasOne } from 'kitsu/decorators/orbit';

export default class MediaIgnore extends Model {
  @hasOne('user', { inverse: null }) user;
  @hasOne('media', { inverse: null }) media;
}

import Model from 'kitsu/mixins/models/base';
import { hasOne } from 'kitsu/decorators/orbit';

export default class Block extends Model {
  @hasOne('user', { inverse: 'blocks' }) user;
  @hasOne('user', { inverse: null }) blocked;
}

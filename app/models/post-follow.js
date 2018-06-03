import Model from 'kitsu/mixins/models/base';
import { hasOne } from 'kitsu/decorators/orbit';

export default class PostFollow extends Model {
  @hasOne('user', { inverse: null }) user;
  @hasOne('post', { inverse: null }) post;
}

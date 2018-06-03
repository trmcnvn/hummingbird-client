import Model from 'kitsu/mixins/models/base';
import { hasOne } from 'kitsu/decorators/orbit';

export default class CommentLike extends Model {
  @hasOne('comment', { inverse: 'likes' }) comment;
  @hasOne('user', { inverse: null }) user;
}

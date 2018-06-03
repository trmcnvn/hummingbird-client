import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from 'kitsu/decorators/orbit';

export default class Comment extends Model {
  @attr('boolean') blocked;
  @attr('string') content;
  @attr('string') contentFormatted;
  @attr('date') editedAt;
  @attr('object') embed;
  @attr('string') embedUrl;
  @attr('number') likesCount;
  @attr('number') repliesCount;

  @hasOne('comment', { inverse: 'replies' }) parent;
  @hasOne('post', { inverse: 'comments' }) post;
  @hasOne('user', { inverse: null }) user;

  @hasMany('commentLike', { inverse: 'comment' }) likes;
  @hasMany('comment', { inverse: 'parent' }) replies;
  @hasMany('upload', { inverse: 'owner' }) uploads;
}

import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from 'kitsu/decorators/orbit';

export default class Post extends Model {
  @attr('boolean') blocked;
  @attr('number') commentsCount;
  @attr('string') content;
  @attr('string') contentFormatted;
  @attr('date') editedAt;
  @attr('object') embed;
  @attr('string') embedUrl;
  @attr('boolean') nsfw;
  @attr('number') postLikesCount;
  @attr('boolean') spoiler;
  @attr('string') targetInterest;
  @attr('number') topLevelCommentsCount;

  @hasOne(null, { inverse: null }) media;
  @hasOne(null, { inverse: null }) spoiledUnit;
  @hasOne('group', { inverse: null }) targetGroup;
  @hasOne('user', { inverse: null }) targetUser;
  @hasOne('user', { inverse: null }) user;

  @hasMany('comment', { inverse: 'post' }) comments;
  @hasMany('postLike', { inverse: 'post' }) postLikes;
  @hasMany('upload', { inverse: 'owner' }) uploads;
}

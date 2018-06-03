import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class Activity extends Model {
  @attr('string') foreignId;
  @attr('array') mentionedUsers;
  @attr('boolean') nineteenScale;
  @attr('number') postId;
  @attr('number') progress;
  @attr('kitsu-rating') rating;
  @attr('string') reason;
  @attr('string') replyToType;
  @attr('string') replyToUser;
  @attr('string') status;
  @attr('string') streamId;
  @attr('date') time;
  @attr('string') verb;

  @hasOne('user', { inverse: null }) actor;
  @hasOne(null, { inverse: null }) media;
  @hasOne(null, { inverse: null }) subject;
  @hasOne(null, { inverse: null }) target;
  @hasOne(null, { inverse: null }) unit;
}

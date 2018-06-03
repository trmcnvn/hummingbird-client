import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class Report extends Model {
  @attr('number') naughtyId;
  @attr('string') naughtyType;
  @attr('string') reason;
  @attr('string') status;
  @attr('string') explanation;

  @hasOne(null, { inverse: null }) naughty;
  @hasOne('user', { inverse: null }) moderator;
  @hasOne('user', { inverse: null }) user;
}

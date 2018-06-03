import Model from 'kitsu/mixins/models/base';
import { attr, hasMany } from 'kitsu/decorators/orbit';

export default class ActivityGroup extends Model {
  @attr('string') group;
  @attr('boolean') isSeen;
  @attr('boolean') isRead;

  @hasMany('activity', { inverse: null }) activities;
}

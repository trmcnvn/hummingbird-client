import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from 'kitsu/decorators';

export default class GroupInvite extends Model {
  @attr('string') about;
  @attr('object') avatar;
  @attr('object') coverImage;
  @attr('number') leadersCount;
  @attr('string') locale;
  @attr('number') membersCount;
  @attr('string') name;
  @attr('number') neighborsCount;
  @attr('boolean') nsfw;
  @attr('string') privacy;
  @attr('string') rules;
  @attr('string') rulesFormatted;
  @attr('string') slug;
  @attr('string') tagline;

  // @TODO: @hasOne('groupCategory', { inverse: null }) category;

  // @TODO: @hasMany('groupActionLog', { inverse: null }) actionLogs;
  @hasMany('groupInvite', { inverse: 'group' }) invites;
  @hasMany('groupMember', { inverse: 'group' }) members;
  // @TODO: @hasMany('groupNeighbor', { inverse: 'source'}) neighbors;
  // @TODO: @hasMany('groupReport', { inverse: 'group' }) reports;
  // @TODO: @hasMany('groupTicket', { inverse: 'group' }) tickets;
}

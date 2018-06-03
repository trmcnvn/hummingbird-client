import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class GroupInvite extends Model {
  @attr('date') acceptedAt;
  @attr('date') declinedAt;
  @attr('date') revokedAt;

  @hasOne('group', { inverse: 'invites' }) group;
  @hasOne('user', { inverse: null }) sender;
  @hasOne('user', { inverse: null }) user;
}

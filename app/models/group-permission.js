import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class GroupPermission extends Model {
  @attr('string') permission;

  @hasOne('groupMember', { inverse: 'permissions' }) groupMember;
}

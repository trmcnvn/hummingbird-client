import Model from 'kitsu/mixins/models/base';
import { attr, hasOne, hasMany } from '../decorators';

export default class GroupInvite extends Model {
  @attr('string') rank;
  @attr('number') unreadCount;
  @attr('boolean') hidden;

  @hasOne('group', { inverse: 'members' }) group;
  @hasOne('user', { inverse: null }) user;

  @hasMany('groupPermission', { inverse: 'groupMember' }) permissions;

  hasPermission(permission) {
    if (this.permissions) {
      const record = this.permissions.find(record => {
        return record.permission === 'owner' || record.permission === permission;
      });
      return !!record;
    }
    return false;
  }
}

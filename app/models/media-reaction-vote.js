import Model from 'kitsu/mixins/models/base';
import { hasOne } from 'kitsu/decorators/orbit';

export default class MediaReactionVote extends Model {
  @hasOne('mediaReaction', { inverse: 'votes' }) mediaReaction;
  @hasOne('user', { inverse: null }) user;
}

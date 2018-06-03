import Model from 'kitsu/mixins/models/base';
import { hasMany } from 'kitsu/decorators/orbit';

export default class Request extends Model {
  @hasMany(null, { inverse: null }) records;
}

import Model from 'kitsu/mixins/models/base';
import { hasOne } from 'kitsu/decorators/orbit';

export default class CategoryFavorite extends Model {
  @hasOne('user', { inverse: 'categoryFavorites' }) user;
  @hasOne('category', { inverse: null }) category;
}

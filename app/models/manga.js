import Model from 'kitsu/mixins/models/media';
import { hasMany } from 'kitsu/decorators/orbit';

export default class Manga extends Model {
  @hasMany('category', { inverse: 'manga' }) categories;
}

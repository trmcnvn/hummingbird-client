import Model from 'kitsu/mixins/models/base';
import { attr } from 'kitsu/decorators/orbit';

export default class SiteAnnouncement extends Model {
  @attr('string') description;
  @attr('string') imageUrl;
  @attr('string') link;
  @attr('string') title;
}

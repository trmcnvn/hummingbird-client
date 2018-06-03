import { Model } from 'ember-orbit';
import { attr, key } from 'kitsu/decorators/orbit';

export default class Base extends Model {
  @key remoteId;
  @attr('object') _meta;

  @attr('date') createdAt;
  @attr('date') updatedAt;
}

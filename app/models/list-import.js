import Model from 'kitsu/mixins/models/base';
import { attr, hasOne } from 'kitsu/decorators/orbit';

export default class ListImport extends Model {
  @attr('string') errorMessage;
  @attr('string') errorTrace;
  @attr('object') inputFile;
  @attr('string') inputText;
  @attr('string') kind;
  @attr('number') progress;
  @attr('string') status;
  @attr('string') strategy;
  @attr('number') total;

  @hasOne('user', { inverse: null }) user;
}

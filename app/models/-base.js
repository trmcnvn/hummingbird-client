import Model from 'ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  modelType: computed(function() {
    return this.constructor.modelName;
  }).readOnly()
});

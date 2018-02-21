import Transform from 'ember-data/transform';
import { isArray } from '@ember/array';

export default Transform.extend({
  deserialize(value) {
    return isArray(value) ? value : [];
  },

  serialize(value) {
    return this.deserialize(value);
  }
});

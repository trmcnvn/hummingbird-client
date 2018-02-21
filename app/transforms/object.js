import Transform from 'ember-data/transform';
import { typeOf, isEmpty } from '@ember/utils';

export default Transform.extend({
  deserialize(value, options) {
    if (value === null && options !== undefined && options.defaultValue !== undefined) {
      return options.defaultValue;
    }
    return typeOf(value) === 'object' ? value : {};
  },

  serialize(value) {
    return isEmpty(value) ? {} : value;
  }
});

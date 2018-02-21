import Transform from 'ember-data/transform';
import { DateTime } from 'luxon';

export default Transform.extend({
  deserialize(value) {
    return value ? DateTime.fromISO(value, { zone: 'utc' }) : null;
  },

  serialize(value) {
    return value ? value.toJSON() : null;
  }
});

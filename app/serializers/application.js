import JSONAPISerializer from 'ember-data/serializers/json-api';
import { camelize } from '@ember/string';

export default JSONAPISerializer.extend({
  keyForAttribute(attr) {
    return camelize(attr);
  },

  keyForRelationship(attr) {
    return camelize(attr);
  },

  // Only serialize attributes that are changed
  serializeAttribute(snapshot, json, key) {
    if (key in snapshot.changedAttributes()) {
      return this._super(...arguments);
    }
  }
});

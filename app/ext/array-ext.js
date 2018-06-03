import Mixin from '@ember/object/mixin';
import { run } from '@ember/runloop';
import { isArray } from '@ember/array';
import Ember from 'ember';

// Support unshifting objects via `addObjects` for native arrays
const CustomArray = Mixin.create(Ember.NativeArray, {
  addObject(object, before = false) {
    const included = this.includes(object);
    if (!included && object) {
      const action = before ? 'unshiftObject' : 'pushObject';
      this[action](object);
    }
    return this;
  },

  addObjects(objects, before = false) {
    if (isArray(objects)) {
      run(() => {
        objects.forEach(object => this.addObject(object, before));
      });
    }
    return this;
  }
});

CustomArray.apply(Array.prototype);

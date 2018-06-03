import { computed } from '@ember/object';
import { typeOf } from '@ember/utils';
import { some } from '@orbit/utils/arrays';

export function concat(...deps) {
  const keys = deps.map(dep => `${dep}.[]`);
  return computed(...keys, function() {
    const array = deps.map(dep => {
      const value = this.get(dep);
      if (value && typeOf(value) === 'array') {
        return value.slice();
      } else if (value && typeOf(value) === 'instance') {
        return value.toArray().slice();
      }
      return [];
    });
    const flattened = array.reduce((prev, curr) => prev.concat(curr), []);
    return [...flattened];
  });
}

export function taskState(property, ...args) {
  const deps = args.map(arg => `${arg}.${property}`);
  return computed(...deps, function() {
    return some(deps, dep => this.get(dep) === true);
  });
}

export default {
  concat,
  taskState
};

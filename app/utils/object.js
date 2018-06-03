import { typeOf } from '@ember/utils';
import { isObject } from '@orbit/utils';

export const sortObject = (object) => (
  Object.keys(object).reduce((prev, curr) => {
    if (typeOf(object[curr]) === 'object') {
      prev[curr] = sortObject(object[curr]);
      return prev;
    }
    prev[curr] = object[curr];
    return prev;
  }, {})
);

export const compact = (object) => {
  Object.keys(object).forEach((key) => {
    if (isObject(object[key])) {
      compact(object[key]);
    }
    object[key] === undefined && delete object[key];
  });
};

import Controller from '@ember/controller';
import { isEmpty, typeOf } from '@ember/utils';

const MAX_YEAR = (new Date()).getFullYear() + 2;

export const serializeArray = value => {
  const isRange = typeOf(value[0]) !== 'string';
  if (isRange && value.length === 2) {
    return value.join('..');
  } else if (!isRange && value.length > 1) {
    return value.reject(x => isEmpty(x)).join();
  }
  return value.join();
};

export const deserializeArray = value => {
  const isRange = value.includes('..');
  if (isRange) {
    return value.split('..').map(x => {
      if (isEmpty(x)) { return ''; }
      if (Number.isInteger(JSON.parse(x))) {
        return parseInt(x, 10);
      }
      return parseFloat(x);
    });
  }
  return value.split(',');
};

export const DEFAULT_PARAMS = {
  averageRating: {
    defaultValue: [5, 100],
    refresh: true,
    serialize(value) {
      const [lower, upper] = value;
      if (lower === 5 && upper === 100) {
        return undefined;
      } else if (lower === 5) {
        return serializeArray([5, upper]);
      }
      return serializeArray(value);
    },
    deserialize(value = []) {
      const [lower, upper] = deserializeArray(value);
      if (isEmpty(lower)) {
        return [5, upper];
      }
      return [lower, upper];
    }
  },
  categories: {
    defaultValue: [],
    refresh: true,
    serialize(value) {
      return serializeArray(value);
    },
    deserializeArray(value = []) {
      return deserializeArray(value);
    }
  },
  text: {
    defaultValue: null,
    refresh: true
  },
  sort: {
    defaultValue: 'popularity',
    refresh: true
  },
  subtype: {
    defaultValue: [],
    refresh: true,
    serialize(value) {
      return serializeArray(value);
    },
    deserializeArray(value = []) {
      return deserializeArray(value);
    }
  },
  unitCount: {
    defaultValue: [1, 100],
    refresh: true,
    serialize(value) {
      const [lower, upper] = value;
      if (lower === 1 && upper === 100) {
        return undefined;
      } else if (upper === 100) {
        return serializeArray([lower, null]);
      } else if (lower === 1) {
        return serializeArray([null, upper]);
      }
      return serializeArray(value);
    },
    deserializeArray(value = []) {
      const [lower, upper] = deserializeArray(value);
      if (isEmpty(upper)) {
        return [lower, 100];
      } if (isEmpty(lower) && !isEmpty(upper)) {
        return [1, upper];
      }
      return [lower, upper];
    }
  },
  year: {
    defaultValue: [1907, MAX_YEAR],
    refresh: true,
    serialize(value) {
      const [lower, upper] = value;
      if (lower === 1907 && upper === MAX_YEAR) {
        return undefined;
      } if (upper === MAX_YEAR) {
        return serializeArray([lower, null]);
      }
      return serializeArray(value);
    },
    deserialize(value = []) {
      const [lower, upper] = deserializeArray(value);
      if (isEmpty(upper)) {
        return [lower, MAX_YEAR];
      }
      return [lower, upper];
    }
  }
};

export default class Search extends Controller {

}

import Inflector from 'ember-inflector';

/**
 * Don't pluralize these words when
 */
export function initialize() {
  Inflector.inflector.uncountable('anime');
  Inflector.inflector.uncountable('manga');
}

export default {
  name: 'inflections',
  initialize
};

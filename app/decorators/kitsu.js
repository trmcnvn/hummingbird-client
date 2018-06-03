import { concat as _concat, taskState as _taskState } from 'kitsu/utils/computed-macros';
import { computedDecoratorWithParams } from '@ember-decorators/utils/computed';

export const concat = computedDecoratorWithParams((target, key, desc, params) => {
  return _concat(...params);
});

export const taskState = computedDecoratorWithParams((target, key, desc, params) => {
  return _taskState(...params);
});

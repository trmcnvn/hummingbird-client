import { computedDecoratorWithParams } from '@ember-decorators/utils/computed';
import { key as _key, attr as _attr, hasMany as _hasMany, hasOne as _hasOne } from 'ember-orbit';

export const key = computedDecoratorWithParams((target, key, desc, params) => {
  return _key(...params);
});

export const attr = computedDecoratorWithParams((target, key, desc, params) => {
  return _attr(...params);
});

export const hasMany = computedDecoratorWithParams((target, key, desc, params) => {
  return _hasMany(...params);
});

export const hasOne = computedDecoratorWithParams((target, key, desc, params) => {
  return _hasOne(...params);
});

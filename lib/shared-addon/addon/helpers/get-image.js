import Helper from '@ember/component/helper';
import { typeOf } from '@ember/utils';
import { observer } from '@ember/object';

export function getImage(target, size = 'original') {
  if (typeOf(target) === 'object' || typeOf(target) === 'instance') {
    return target[size] || target.original;
  }
  return target;
}

export default class GetImage extends Helper {
  imageChanged = observer('target', 'size', function() {
    this.recompute();
  });

  compute([target, size = 'original']) {
    this.set('target', target);
    this.set('size', size);
    return getImage(target, size);
  }
}

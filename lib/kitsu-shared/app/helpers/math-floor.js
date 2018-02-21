import { helper } from '@ember/component/helper';

export function mathFloor([target = 0]) {
  return Math.floor(target);
}

export default helper(mathFloor);

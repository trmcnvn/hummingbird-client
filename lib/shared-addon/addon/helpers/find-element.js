import { helper } from '@ember/component/helper';

export function findElement([target]) {
  return document.getElementById(target);
}

export default helper(findElement);

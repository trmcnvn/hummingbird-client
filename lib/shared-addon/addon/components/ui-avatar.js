import UIImageComponent from './ui-image';
import { className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';

export default class UIAvatar extends UIImageComponent {
  @argument fallback = '/images/default_avatar.png';

  @className
  @computed
  get avatarSize() {
    return `${this.styleNamespace}--${this.size}`;
  }
}

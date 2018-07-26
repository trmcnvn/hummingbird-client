import Component from '@ember/component';
import template from '../../../../templates/components/app-feed/items/post/content';
import { layout } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

@layout(template)
export default class Content extends Component {
  isGateShown = true;

  @argument isContentGated = false;
  @argument isPermalinkPage = false;

  @computed('post.{nsfw,spoiler}')
  get gateType() {
    if (this.post.nsfw && this.post.spoiler) {
      return 'combo';
    } else if (this.post.nsfw) {
      return 'nsfw';
    }
    return 'spoiler';
  }

  @action
  toggleGate() {
    this.toggleProperty('isGateShown');
    this.onGate(this.isGateShown);
  }
}

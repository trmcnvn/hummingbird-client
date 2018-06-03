import Component from '@ember/component';
import layout from '../../../../templates/components/app-feed/items/post/content';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

export default class Content extends Component {
  layout = layout;
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

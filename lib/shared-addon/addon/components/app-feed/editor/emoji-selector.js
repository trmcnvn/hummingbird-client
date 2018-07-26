import Component from '@ember/component';
import template from '../../../templates/components/app-feed/editor/emoji-selector';
import { layout } from '@ember-decorators/component';
import { EMOJI_BY_CATEGORY } from 'kitsu/utils/emoji-map';
import { computed, action } from '@ember-decorators/object';

@layout(template)
export default class EmojiSelector extends Component {
  emojis = EMOJI_BY_CATEGORY;
  selectedCategory = 'people';

  @computed('selectedCategory')
  get selectedEmojis() {
    return this.emojis[this.selectedCategory];
  }

  @action
  emojiSelected(emoji) {
    this.onClick(emoji);
    document.querySelector(this.triggerElement).click(); // @Cleanup - uhhh...
  }
}

import Component from '@ember/component';
import template from '../../../../templates/components/app-feed/items/post/media';
import { layout, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { getComputedTitle } from '../../../../helpers/computed-title';

@layout(template)
@tagName('')
export default class Media extends Component {
  @argument media = null;
  @argument spoiledUnit = null;
  @service session;

  @computed('spoiledUnit')
  get unitText() {
    const title = getComputedTitle(this.session.currentUser, this.spoiledUnit);
    return title ? `- ${title}` : '';
  }
}

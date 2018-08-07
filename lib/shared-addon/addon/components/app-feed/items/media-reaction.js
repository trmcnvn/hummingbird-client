import Component from '@ember/component';
import template from '../../../templates/components/app-feed/items/media-reaction';
import { layout } from '@ember-decorators/component';
import { alias } from '@ember-decorators/object/computed';
import { computed, action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';

@layout(template)
export default class MediaReaction extends Component {
  @argument onDelete = () => {};

  @alias('activity.subject') reaction;
  @computed('item')
  get activity() {
    return this.item.activities.firstObject;
  }

  @action
  deletedReaction() {
    this.onDelete(null, true, false);
  }
}

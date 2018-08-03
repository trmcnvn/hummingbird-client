import Component from '@ember/component';
import template from '../../../../templates/components/app-feed/items/library-entry/events';
import { layout } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { computed, action } from '@ember-decorators/object';
import { assert } from '@ember/debug';
import { task } from 'ember-concurrency-decorators';

@layout(template)
export default class Events extends Component {
  @argument events = [];
  @argument onDelete = () => {};

  @computed('events.[]')
  get groupedItems() {
    const items = this.events.reduce((prev, curr) => {
      const key = this.getGroupKey(curr);
      prev[key] = prev[key] || [];
      prev[key].addObject(curr);
      return prev;
    }, {});
    return Object.keys(items).reduce((prev, curr) => {
      const item = items[curr];
      const others = item.slice(1).reject(other => (
        other.actor.id === item.firstObject.actor.id
      ));
      prev.addObject({
        item: item.firstObject,
        others
      });
      return prev;
    }, []);
  }

  @task({ drop: true })
  deleteEvent = function* (event) {
    const index = this.events.indexOf(event);
    try {
      this.events.removeAt(index);
      yield this.onDelete(event);
    } catch (error) {
      this.events.insertAt(index, event);
    }
  }

  getGroupKey(item) {
    const verb = item.verb;
    switch (verb) {
      case 'updated': {
        return `${verb}_${item.status}`;
      }
      case 'rated': {
        return `${verb}_${item.rating}`;
      }
      case 'progressed': { // @Legacy
        return `${verb}_${item.progress}`;
      }
      default: {
        assert('This should never happen.', true);
        return 'unknown';
      }
    }
  }

  @action
  getRealRating(item) {
    // @Legacy: Ratings were changed, if this is an activity
    // from before the change we need to multiply it by 4 to get
    // the real value
    return item.nineteenScale ? item.rating : (item.rating * 4);
  }
}

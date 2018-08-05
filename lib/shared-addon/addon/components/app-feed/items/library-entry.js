import Component from '@ember/component';
import template from '../../../templates/components/app-feed/items/library-entry';
import { layout, tagName } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { dasherize, capitalize } from '@ember/string';
import { task } from 'ember-concurrency-decorators';
import { argument } from '@ember-decorators/argument';
import getErrorMessage from 'kitsu/utils/get-error-message';

// This function mimics the functionaly we previoused used moment().calendar(...) for.
// Returns tuple of [humanized, relative]
// # => ['Saturday', '2 days ago']
// # => ['Today', 'today']
const calendar = (context, time) => {
  let relative = context.formatRelative(time, { units: 'day', timeZone: 'UTC' });
  let humanized = capitalize(relative);
  if (relative.includes('ago')) {
    humanized = context.formatTime(time, { weekday: 'long', timeZone: 'UTC' });
  }
  return [humanized, relative];
};

@layout(template)
@tagName('')
export default class LibraryEntry extends Component {
  @argument onDelete = () => {};

  @service fetch;
  @service intl;
  @service('notification-messages') notifications;

  @computed('item')
  get media() {
    const activity = this.item.activities.firstObject;
    return activity && activity.media;
  }

  @computed('item.activities.[]')
  get groupByTime() {
    const activities = this.item.activities.toArray().sort((a, b) => {
      if (a.time < b.time) { return 1; }
      if (a.time > b.time) { return -1; }
      return 0;
    });
    const object = activities.reduce((prev, curr) => {
      const [humanized, relative] = calendar(this.intl, curr.time);
      const key = dasherize(relative);

      if (!(key in prev)) {
        prev[key] = {
          groupingKey: humanized,
          time: curr.time,
          items: []
        };
      }
      prev[key].items.addObject(curr);
      return prev;
    }, {});
    return Object.values(object);
  }

  @task({ drop: true })
  deleteActivity = function* (activity) {
    try {
      const path = `feeds/user/${activity.actor.remoteId}/activities/${activity.remoteId}`;
      yield this.fetch.request(path, { method: 'DELETE' });
      this.onDelete('library-entry', false);
    } catch (error) {
      const message = getErrorMessage(error) || this.intl.t('general.errors.delete');
      this.notifications.error(message, { clearDuration: 5000 });
      throw error; // bubble up
    }
  };
}

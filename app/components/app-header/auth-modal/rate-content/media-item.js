import Component from '@ember/component';
import { classNames } from '@ember-decorators/component';
import { task } from 'ember-concurrency-decorators';
import { service } from '@ember-decorators/service';
import { or } from '@ember-decorators/object/computed';

@classNames('media-item', 'col-sm-4')
export default class MediaItem extends Component {
  @service session;
  @service store;
  @or('addWantedMedia.isRunning', 'addRatedMedia.isRunning') isWorking;

  @task({ drop: true })
  addWantedMedia = function*() {
    try {
      const type = this.item.type;
      const record = {
        type: 'libraryEntry',
        attributes: {
          status: 'planned'
        },
        relationships: {
          user: { data: this.session.currentUser.identity },
          [type]: { data: { type, id: this.item.id } }
        }
      };
      const response = yield this.store.update(t => t.addRecord(record));
      this.onCreate(response);
    } catch (error) { } // eslint-disable-line no-empty
  };

  @task({ drop: true })
  addRatedMedia = function*(rating) {
    try {
      const type = this.item.type;
      const record = {
        type: 'libraryEntry',
        attributes: {
          status: 'completed',
          ratingTwenty: rating
        },
        relationships: {
          user: { data: this.session.currentUser.identity },
          [type]: { data: { type, id: this.item.id } }
        }
      };
      const response = yield this.store.update(t => t.addRecord(record));
      this.onCreate(response);
    } catch (error) { } // eslint-disable-line no-empty
  };
}

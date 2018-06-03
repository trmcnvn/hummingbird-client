import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import { tagName } from '@ember-decorators/component';
import { action } from '@ember-decorators/object';
import { bool } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

@tagName('')
export default class FavoriteCategoryButton extends Component {
  _internalRecord = null;

  @service session;
  @service store;
  @bool('_internalRecord') isFavorited;

  @task({ drop: true })
  fetchFavoriteState = function* () {
    const user = this.session.getCurrentUser();
    const records = yield this.store.request('categoryFavorite', {
      filter: {
        user_id: user.remoteId,
        category_id: this.category.remoteId
      }
    });
    this.set('_internalRecord', records.firstObject);
  };

  @task({ drop: true })
  createFavorite = function* () {
    const record = {
      type: 'categoryFavorite',
      relationships: {
        user: { data: this.session.currentUser.identity },
        category: {  data: this.category.identity }
      }
    };
    const response = yield this.store.addRecord(record);
    this.set('_internalRecord', response);
  };

  @task({ drop: true })
  destroyFavorite = function* () {
    yield this.store.update(t => t.removeRecord(this._internalRecord.identity));
    this.set('_internalRecord', null);
  };

  didReceiveAttrs() {
    if (!this.session.isAuthenticated()) { return; }
    this.fetchFavoriteState.perform();
  }

  @action
  onClick() {
    if (!this.session.isAuthenticated()) {
      return this.session.openAuthenticationModal();
    }
    const action = this._internalRecord ? 'destroyFavorite' : 'createFavorite';
    this[action].perform();
  }
}

import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class Index extends Controller {
  // We can't use the `take` helper here because this is a reference to the data
  // and `take` will recompute when the data is synced from remote -> store
  @computed('model.favorites.value.[]')
  get randomFavorites() {
    if (this._randomRecords) { return this._randomRecords; }
    const records = this.model.favorites.value.toArray();
    const random = records.sort(() => Math.random() - 0.5);
    return this._randomRecords = random.slice(0, 2);
  }
}

import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';

export default class Index extends Controller {
  @computed('model.favorites.value.[]')
  get randomFavorites() {
    if (this._randomRecords) { return this._randomRecords; }
    const records = this.model.favorites.value.toArray();
    const random = records.sort(() => Math.random() - 0.5);
    return this._randomRecords = random.slice(0, 2);
  }
}

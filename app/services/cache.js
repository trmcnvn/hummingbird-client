import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import RSVP from 'rsvp';

export default class Cache extends Service {
  @service store;

  get(key) {
    return this.store.source.bucket.getItem('kitsu-cache').then(cache => {
      return RSVP.resolve(cache[key]);
    }).catch(() => RSVP.resolve(null));
  }

  set(key, value) {
    this.store.source.bucket.getItem('kitsu-cache').then(cache => {
      const data = { ...cache, [key]: value };
      this.store.source.bucket.setItem('kitsu-cache', data).catch(() => {});
    }).catch(() => {
      const data = { [key]: value };
      this.store.source.bucket.setItem('kitsu-cache', data).catch(() => {});
    });
  }
}

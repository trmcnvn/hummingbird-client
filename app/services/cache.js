import Service from '@ember/service';

export default class Cache extends Service {
  canUseLocalStorage = !!window.localStorage;

  get(key) {
    if (!this.canUseLocalStorage) { return null; }
    let value = window.localStorage.getItem('kitsu-cache');
    value = JSON.parse(value) || {};
    return value[key];
  }

  set(key, value) {
    if (!this.canUseLocalStorage) { return null; }
    let object = window.localStorage.getItem('kitsu-cache');
    object = JSON.parse(object) || {};
    const data = { ...object, [key]: value };
    window.localStorage.setItem('kitsu-cache', JSON.stringify(data));
    return value;
  }
}

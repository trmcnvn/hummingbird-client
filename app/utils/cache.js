const CACHE_TIME_HOUR = 730;

export class Cache {
  static get(key) {
    if (!window.localStorage) { return null; }
    let object = window.localStorage.getItem(`kitsu:${key}`);
    if (!object) { return null; }
    object = JSON.parse(object);
    if ((new Date()) > object.expiry) {
      this.clear(key);
    }
    return object.data;
  }

  static set(key, data, expiryTime = CACHE_TIME_HOUR) {
    if (!window.localStorage) { return; }
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + (expiryTime * 60 * 60 * 1000));
    const object = { expiry, data };
    window.localStorage.setItem(`kitsu:${key}`, JSON.stringify(object));
  }

  static clear(key) {
    if (!window.localStorage) { return; }
    window.localStorage.removeItem(`kitsu:${key}`);
  }
}

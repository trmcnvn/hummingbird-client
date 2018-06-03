import Service, { inject as service } from '@ember/service';
import { typeOf } from '@ember/utils';
import RSVP from 'rsvp';

const CACHE_TIME_HOUR = 2;

export default Service.extend({
  store: service(),
  raven: service(),

  init() {
    this._super(...arguments);
    this.cache = {};
  },

  /**
   * Attempts to use cached results so we don't execute to the API for every request.
   *
   * @param {String} type Ember Data Model Type
   * @param {Object} query Request Options
   * @param {Object} options Custom Options for cache
   */
  query(type, query, options = { cache: true }) {
    const task = () => this.store.query(type, query);
    return this._getCachedQuery(type, query, options, task);
  },

  /**
   * Push a record collection into the cache store for the query type.
   *
   * @param {String} type
   * @param {Object} query
   * @param {*} records
   */
  push(type, query, records) {
    const cache = this.cache[type] || (this.cache[type] = {});
    const queryAsString = this._stringifyQuery(query);
    if (records && records.length > 0) {
      cache[queryAsString] = {
        promise: RSVP.resolve(records),
        expiry: this._getExpiryDate()
      };
    }
  },

  get(type, query) {
    const cache = this.cache[type];
    if (!cache) { return; }
    const queryAsString = this._stringifyQuery(query);

    // Attempt to get the cached result
    const result = cache[queryAsString];
    if (result) {
      if (this._isExpired(result)) {
        delete cache[queryAsString];
      }
      return result.promise;
    }
  },

  /**
   * Invalidate an entire model types cache entries
   *
   * @param {String} type
   */
  invalidateType(type) {
    delete this.cache[type];
  },

  /**
   * Invalidate the cache for a specific query
   *
   * @param {String} type
   * @param {Object} query
   */
  invalidateQuery(type, query) {
    const cache = this.cache[type];
    if (!cache) { return; }
    const queryAsString = this._stringifyQuery(query);
    delete cache[queryAsString];
  },

  /**
   * Attempt to get a cached result if it exists and is within the expiry time, otherwise
   * execute the request and cache the results.
   *
   * @param {String} type Ember Data Model Type
   * @param {Object} query Request Options
   * @param {Object} options Cache Options
   * @param {Function} task
   * @private
   */
  async _getCachedQuery(type, query, options, task) {
    const cache = this.cache[type] || (this.cache[type] = {});
    const queryAsString = this._stringifyQuery(query);

    // Attempt to get the cached result
    const cachedResult = cache[queryAsString];
    if (cachedResult) {
      if (this._isExpired(cachedResult)) {
        delete cache[queryAsString];
      } else {
        return cachedResult.promise;
      }
    }

    // Execute the task (API Request), cache and return the results.
    try {
      const records = await task();
      if (options.cache && (records && records.length > 0)) {
        cache[queryAsString] = {
          promise: RSVP.resolve(records),
          expiry: this._getExpiryDate()
        };
      }
      return records;
    } catch (error) {
      this.raven.captureException(error);
      return {};
    }
  },

  /**
   * Returns a stringified sorted version of an object. This is so regardless of how you
   * build your request query, it is cached correctly with sorting.
   *
   * @param {Object} query
   * @private
   */
  _stringifyQuery(query) {
    const sortedObject = this._sortObject(query);
    return JSON.stringify(sortedObject);
  },

  /**
   * Sort an object alphabetically by its keys.
   *
   * @param {Object} object
   * @private
   */
  _sortObject(object) {
    return Object.keys(object).sort().reduce((previous, current) => {
      if (typeOf(object[current]) === 'object') {
        // eslint-disable-next-line
        previous[current] = this._sortObject(object[current]);
        return previous;
      }
      previous[current] = object[current]; // eslint-disable-line
      return previous;
    }, {});
  },

  /**
   * Create a date `CACHE_TIME_HOUR` hours in the future.
   *
   * @private
   */
  _getExpiryDate() {
    const date = new Date();
    date.setTime(date.getTime() + (CACHE_TIME_HOUR * 60 * 60 * 1000));
    return date;
  },

  /**
   * Determines if the expiry date is older than the current time.
   *
   * @param {Object} cachedResult
   * @private
   */
  _isExpired(cachedResult) {
    return (new Date()) > cachedResult.expiry;
  }
});

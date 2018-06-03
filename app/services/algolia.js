import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { waitForProperty } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { isEmpty } from '@ember/utils';
import config from 'kitsu/config/environment';
import algoliasearch from 'algoliasearch';

// Fetch Algolia search keys from the API
export default class Algolia extends Service {
  keys = {};
  @service fetch;

  @task({ drop: true })
  fetchKeys = function* () {
    return yield this.fetch.request('algolia-keys');
  }

  @task
  fetchIndex = function* (name) {
    if (this.keys[name]) {
      return this.keys[name];
    } else if (this.get('fetchKeys').isRunning) { // If we're already fetching, then wait for the initial fetch
      yield waitForProperty(this, 'keys', k => Object.keys(k).length > 0);
    } else {
      const keys = yield this.fetchKeys.perform();
      this.set('keys', keys);
    }

    const info = this.keys[name];
    if (isEmpty(info)) {
      return null;
    }

    const client = algoliasearch(config.kitsu.APIKeys.algolia, info.key);
    const index = client.initIndex(info.index);
    this.keys[name] = index;
    return index;
  };
}

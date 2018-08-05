import { Schema, recordDiffs, buildTransform, RecordException } from '@orbit/data';
import { singularize, pluralize } from 'ember-inflector';
import JSONAPISource from '@orbit/jsonapi';
import { TransformRequestProcessors } from '@orbit/jsonapi/lib/transform-requests';
import { buildFetchSettings } from '@orbit/jsonapi/lib/request-settings';
import { Store } from 'ember-orbit';
import { inject as service } from '@ember/service';
import { toArray, every } from '@orbit/utils';
import { sortObject, compact } from 'kitsu/utils/object';
import ReadOnlyArrayProxy from 'ember-orbit/-private/system/read-only-array-proxy';
import RSVP from 'rsvp';
import { dasherize } from '@ember/string';

// Override pluralize/singularize for model attributes
Schema.prototype.pluralize = function(word) {
  return pluralize(word);
}

Schema.prototype.singularize = function(word) {
  return singularize(word);
}

// We want URL building to be dasherized but serializing to be camelized.
JSONAPISource.prototype.resourceRelationshipURL = function(type, id, relationship) {
  return this.resourceURL(type, id) + '/relationships/' + dasherize(relationship);
}

JSONAPISource.prototype.relatedResourceURL = function(type, id, relationship) {
  return this.resourceURL(type, id) + '/' + dasherize(relationship);
}

// API PATCH requests should sync the response
TransformRequestProcessors.replaceRecord = function(source, request) {
  const record = request.record;
  const { type, id } = record;
  const requestDoc = source.serializer.serializeDocument(record);
  const settings = buildFetchSettings(request, { method: 'PATCH', json: requestDoc });

  return source.fetch(source.resourceURL(type, id), settings).then((raw) => {
    const responseDoc = source.serializer.deserializeDocument(raw);
    const updatedRecord = responseDoc.data;

    const updateOps = recordDiffs(record, updatedRecord);
    return updateOps.length > 0 ? [buildTransform(updateOps)] : [];
  });
}

// Override `ember-orbit` Store service
Store.reopen({
  dataCoordinator: service(),

  // Cache requests based on the type and query request.
  // Response can either be optimistic (cache return & remote sync)
  // or pessimistic (blocking remote request)
  // @Orbit
  request(typeOrPath, query = {}, typeIsRelativePath = false) {
    const remote = this.dataCoordinator.getSource('remote');

    // Build the remote URL
    let url = null;
    if (typeIsRelativePath) {
      const segments = [];
      segments.push(remote.resourceHost());
      segments.push(remote.resourceNamespace());
      segments.push(typeOrPath);
      url = segments.join('/');
    } else {
      url = remote.resourceURL(typeOrPath);
    }

    // Build the cache key
    let key = Object.assign({}, query, { type: typeOrPath });
    key = JSON.stringify(sortObject(key));
    key = btoa(key);

    // Remove `undefined` values
    compact(query);

    // @TODO: Store and check if a request with the same key is already in motion and use that result
    // don't spawn multiple requests that are the same.
    try {
      // try to find a cached request record
      const record = this.cache.findRecord('request', key);
      const valid = every(record.records.toArray(), record => record !== undefined);
      if (!valid) {
        throw new RecordException('Record not found');
      }
      // fetch the remote data in the background to sync the stores
      this._request(url, query, key).catch(() => {
        this.update(t => t.removeRecord(record.identity), { local: true });
      });
      return RSVP.resolve(record.records);
    } catch (error) {
      return this._request(url, query, key);
    }
  },

  // ember-orbit internals extract the type of a relationship via it's
  // defined model type. That doesn't work for us as we use `null` for polymophic relations.
  addRecord(record, options) {
    return this.update(t => t.addRecord(record), options).then(() => {
      return this._identityMap.lookup(record);
    });
  },

  _request(url, query, key) {
    const remote = this.dataCoordinator.getSource('remote');
    const keyMap = this.source.keyMap;

    const { cache = true } = query;
    delete query.cache;

    return remote.fetch(url, { params: query }).then(document => {
      const resource = remote.serializer.deserializeDocument(document);
      const recordsWithMeta = toArray(resource.data).map(record => {
        record.attributes = record.attributes || {};
        record.attributes._meta = document.meta || {};
        return record;
      }); // @Orbit
      const records = [...recordsWithMeta, ...toArray(resource.included)];

      return this.update(t => records.map(record => {
        const id = keyMap.idFromKeys(record.type, record.keys);
        return id ? t.replaceRecord(record) : t.addRecord(record);
      }), { local: true }).then(() => {
        const records = recordsWithMeta.map(record => ({ type: record.type, id: record.id }));
        if (cache) {
          this.update(t => t.addRecord({
            id: key,
            type: 'request',
            relationships: {
              records: { data: records }
            }
          }), { local: true });
        }
        const content = records.map(record => {
          return this.cache.findRecord(record.type, record.id);
        });
        return ReadOnlyArrayProxy.create({ content });
      });
    });
  }
});

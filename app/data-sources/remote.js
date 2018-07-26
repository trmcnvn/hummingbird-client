import JSONAPISource, { JSONAPISerializer } from '@orbit/jsonapi';
import { deepSet } from '@orbit/utils';
import { camelize } from '@ember/string';
import config from 'kitsu/config/environment';

// Handle custom data types here as Orbit does not have something similar to DS.Transform
export class KitsuSerializer extends JSONAPISerializer {
  resourceKey() {
    return 'remoteId';
  }

  resourceRelationship(type, relationship) {
    return camelize(relationship);
  }

  resourceAttribute(type, attr) {
    return camelize(attr);
  }

  serializeAttribute(resource, record, attr) {
    if (attr === '_meta') { return; } // @Orbit

    const type = this.schema.models[record.type].attributes[attr].type;
    let value = record.attributes[attr];
    switch (type) {
      case 'kitsu-rating':
        value = value * 2 || null;
        deepSet(resource, ['attributes', this.resourceAttribute(record.type, attr)], value);
        break;
      default:
        super.serializeAttribute(resource, record, attr);
        break;
    }
  }

  deserializeResource(record) {
    if (!record) { return null; }
    return super.deserializeResource(record);
  }

  deserializeAttribute(record, attr, value) {
    const type = this.schema.models[record.type].attributes[attr].type;
    record.attributes = record.attributes || {};
    switch (type) {
      case 'kitsu-rating':
        record.attributes[attr] = value / 2;
        break;
      default:
        super.deserializeAttribute(record, attr, value);
        break;
    }
  }
}

export default {
  create(injections = {}) {
    injections.name = 'remote';
    injections.host = config.kitsu.APIHost;
    injections.namespace = 'api/edge';
    injections.defaultFetchSettings = { timeout: 10000 };
    injections.SerializerClass = KitsuSerializer;
    injections.requestQueueSettings = { autoProcess: false };
    injections.syncQueueSettings = { autoProcess: false };

    return new JSONAPISource(injections);
  }
}

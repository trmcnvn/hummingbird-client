import SearchController, {
  DEFAULT_PARAMS,
  serializeArray,
  deserializeArray
} from './-private/search';
import QueryParams from 'ember-parachute';
import WithParams from 'shared-addon/mixins/query-params';

const queryParams = new QueryParams(DEFAULT_PARAMS, {
  ageRating: {
    defaultValue: [],
    refresh: true,
    serialize(value) {
      return serializeArray(value);
    },
    deserialize(value = []) {
      return deserializeArray(value);
    }
  },
  streamers: {
    defaultValue: [],
    refresh: true,
    serialize(value) {
      return serializeArray(value);
    },
    deserialize(value = []) {
      return deserializeArray(value);
    }
  },
  season: {
    defaultValue: [],
    refresh: true,
    serialize(value) {
      return serializeArray(value);
    },
    deserialize(value = []) {
      return deserializeArray(value);
    }
  }
});

@WithParams(queryParams)
export default class Anime extends SearchController {
  availableRatings = Object.freeze(['G', 'PG', 'R', 'R18']);
  availableSeasons = Object.freeze(['spring', 'summer', 'fall', 'winter']);
  availableTypes = Object.freeze(['tv', 'special', 'ona', 'ova', 'movie', 'music']);

  queryParamsDidChange({ shouldRefresh }) {
    if (shouldRefresh) {
      // ... send('refresh')
    }
  }
}

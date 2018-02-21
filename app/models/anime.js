import Media from 'kitsu/models/-media';
import EpisodicMixin from 'kitsu/mixins/models/episodic';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Media.extend(EpisodicMixin, {
  ageRating: attr('string'),
  ageRatingGuide: attr('string'),
  youtubeVideoId: attr('string'),

  // animeProductions: hasMany('anime-production'),
  // streamingLinks: hasMany('streaming-link')
});

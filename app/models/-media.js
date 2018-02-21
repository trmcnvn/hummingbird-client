import Base from 'kitsu/models/-base';
import attr from 'ember-data/attr';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { or } from '@ember/object/computed';
import { getComputedTitle } from 'kitsu/utils/get-local-title';

export default Base.extend({
  session: service(),

  abbreviatedTitles: attr('array'),
  averageRating: attr('number'),
  canonicalTitle: attr('string'),
  coverImage: attr('object', { defaultValue: '/images/default_cover.png' }),
  coverImageTopOffset: attr('number'),
  endDate: attr('utc'),
  favoritesCount: attr('number'),
  nsfw: attr('boolean'),
  popularityRank: attr('number'),
  posterImage: attr('object', { defaultValue: '/images/default_poster.png' }),
  ratingFrequencies: attr('object'),
  ratingRank: attr('number'),
  slug: attr('string'),
  startDate: attr('utc'),
  status: attr('string'),
  subtype: attr('string'),
  synopsis: attr('string'),
  tba: attr('string'),
  titles: attr('object'),

  // relationships

  // computed properties
  computedTitle: computed('session.account.titleLanguagePreference', 'titles', function() {
    return getComputedTitle(this.session.getCurrentUser(), this.canonicalTitle, this.titles);
  }).readOnly(),

  totalRatings: computed('ratingFrequencies', function() {
    const keys = Array.apply(null, { length: 19 }).map(Number.call, Number).map(num => num + 2);
    return keys.reduce((previous, current) => (
      previous + (parseInt(this.ratingFrequencies[current], 10) || 0)
    ), 0);
  }).readOnly(),

  year: computed('startDate', function() {
    return this.startDate ? this.startDate.year : '';
  }).readOnly(),

  yearlessTitle: computed('computedTitle', function() {
    return this.computedTitle.replace(/\(\d{4}\)$/, '');
  }).readOnly(),

  unitCount: or('episodeCount', 'chapterCount'),
});

import Base from 'kitsu/models/-base';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Base.extend({
  description: attr('string'),
  slug: attr('string'),
  title: attr('string'),

  parent: belongsTo('category', { inverse: null }),

  anime: hasMany('anime'),
  manga: hasMany('manga')
});

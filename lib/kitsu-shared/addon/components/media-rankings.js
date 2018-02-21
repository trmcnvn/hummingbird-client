import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'kitsu-shared/templates/components/media-rankings';

export default Component.extend({
  layout,
  classNameBindings: ['lengthBinding'],
  length: 'full',

  lengthBinding: computed('styleNamespace', 'length', function() {
    return `${this.styleNamespace}--${this.length}`;
  }).readOnly(),
});

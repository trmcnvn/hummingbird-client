import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'kitsu-shared/templates/components/activity-indicator';

export default Component.extend({
  layout,
  classNameBindings: ['classBinding'],
  classBinding: computed('styleNamespace', 'size', 'dark', function() {
    let className = this.styleNamespace;
    if (this.size) {
      className = `${className}--${this.size}`;
    }
    if (this.dark) {
      className = `${className} dark`;
    }
    return className;
  }).readOnly()
});

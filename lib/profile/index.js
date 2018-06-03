/* eslint-env node */
'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: 'profile',

  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  lazyLoading: {
    enabled: false
  },

  isDevelopingAddon() {
    return true;
  }
});

/* eslint-env node */
'use strict';

const EngineAddon = require('ember-engines/lib/engine-addon');

/* eslint-disable ember/avoid-leaking-state-in-ember-objects */
module.exports = EngineAddon.extend({
  name: 'explore',
  babel: {
    plugins: ['transform-object-rest-spread']
  },

  lazyLoading: {
    enabled: true
  },

  isDevelopingAddon() {
    return true;
  }
});

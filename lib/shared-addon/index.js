/* eslint-env node */
'use strict';

module.exports = {
  name: 'shared-addon',
  options: {
    babel: {
      plugins: ['transform-object-rest-spread']
    }
  },

  isDevelopingAddon() {
    return true;
  }
};

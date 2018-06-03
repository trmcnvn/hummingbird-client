import Application from '../app';
import config from '../config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import { cacheLoadedAssetState, resetLoadedAssetState } from 'ember-asset-loader/test-support/loaded-asset-state';
import manifest from 'kitsu/config/asset-manifest';
import { registerWaiter } from '@ember/test';

// fetch
registerWaiter(() => {
  return window.fetchPendingRequests === 0;
});

setApplication(Application.create(config.APP));
cacheLoadedAssetState();
preloadAssets(manifest).then(() => {
  resetLoadedAssetState(); // Undoes the previous load!
  start();
});

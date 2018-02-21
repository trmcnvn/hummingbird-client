import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.mount('kitsu-dashboard', { path: '/' });
  this.mount('kitsu-explore', { path: '/explore' });
  this.mount('kitsu-media', { as: 'kitsu-anime', path: '/anime' });
  this.mount('kitsu-media', { as: 'kitsu-manga', path: '/manga' });
});

export default Router;

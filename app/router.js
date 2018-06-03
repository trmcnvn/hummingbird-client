import EmberRouter from '@ember/routing/router';
import RouterScroll from 'ember-router-scroll';
import config from './config/environment';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { getOwner } from '@ember/application';

const Router = EmberRouter.extend(RouterScroll, {
  location: config.locationType,
  rootURL: config.rootURL,

  analytics: service(),
  headData: service(),

  willTransition() {
    this._super(...arguments);
    const controller = getOwner(this).lookup('controller:application');
    controller.set('routeIsLoading', true);
  },

  didTransition() {
    this._super(...arguments);
    const controller = getOwner(this).lookup('controller:application');
    controller.set('routeIsLoading', false);
    this.trackPage();
  },

  setTitle(title) {
    this.headData.set('title', title);
  },

  trackPage() {
    scheduleOnce('afterRender', () => {
      const page = this.url;
      const title = this.headData.title || this.currentRouteName;
      this.analytics.trackPage({ page, title });
    });
  }
});

Router.map(function() {
  // Engines
  this.mount('dashboard', { path: '/' });

  this.mount('explore', { path: '/explore' });
  this.mount('explore', { as: 'explore-anime', path: '/anime' });
  this.mount('explore', { as: 'explore-manga', path: '/manga' });

  this.mount('media', { as: 'anime', path: '/anime/:slug' });
  this.mount('media', { as: 'manga', path: '/manga/:slug' });

  this.mount('profile', { path: '/users/:slug' });
  this.route('profile-redirect', { path: '/users' });

  this.mount('feedback', { path: '/feedback' });

  // Host Application
  this.route('posts', { path: '/posts/:id' });
  this.route('comments', { path: '/comments/:id' });
  this.route('reactions', { path: '/reactions/:id' });
  this.route('reactions-redirect', { path: '/media-reactions/:id' });

  // @TODO: Make apart of groups engine
  this.route('group-invite', { path: '/group-invite/:id' });

  this.route('notifications');
  this.route('password-reset');
  this.route('terms');

  this.route('server-error', { path: '/500' });
  this.route('not-found', { path: '/*path' });
});

export default Router;

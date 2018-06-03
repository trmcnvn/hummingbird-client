import Route from '@ember/routing/route';
import { set } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { getOwner } from '@ember/application';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import config from 'kitsu/config/environment';
import RSVP from 'rsvp';

const ONE_SIGNAL_CACHE_KEY = 'oneSignalPlayerId';

export default class Application extends Route.extend(ApplicationRouteMixin) {
  @service algolia;
  @service analytics;
  @service dataCoordinator;
  @service experiments;
  @service headData;
  @service intl;
  @service('head-tags') meta;
  @service raven;
  @service session;
  @service store;

  beforeModel() {
    this.intl.setLocale('en-us');

    return this.cleanDatabase().then(() => {
      const backup = this.dataCoordinator.getSource('backup');
      return backup.pull(q => q.findRecords())
        .then(transform => this.store.sync(transform))
        .then(() => this.dataCoordinator.activate())
        .then(() => {
          const remote = this.dataCoordinator.getSource('remote');
          const promises = [remote.requestQueue.process(), remote.syncQueue.process()];
          remote.requestQueue.autoProcess = true;
          remote.syncQueue.autoProcess = true;
          return RSVP.all(promises);
        })
        .then(() => this.sessionAuthenticated())
        .then(() => this.experiments.getFlags());
    });
  }

  sessionAuthenticated() {
    return this._getCurrentUser();
  }

  sessionInvalidated() {
    this.cleanDatabase(true).then(() => {
      this.analytics.identify({});
      this.raven.callRaven('setUserContext', {});
      super.sessionInvalidated();
    });
  }

  cleanDatabase(force = false) {
    const version = window.localStorage.getItem('kitsu-db-version');
    if (force || version !== config.kitsu.OrbitDBVersion) {
      console.debug('Cleaning Orbit DB'); // @Debug
      const backup = this.dataCoordinator.getSource('backup');
      return backup.deleteDB().finally(() => {
        window.localStorage.setItem('kitsu-db-version', config.kitsu.OrbitDBVersion);
        return RSVP.resolve();
      });
    }
    return RSVP.resolve();
  }

  title(tokens) {
    return `${tokens.reverse().join(' | ')} | Kitsu`;
  }

  headTags() {
    const description = 'Share anime and manga experiences, get recommendations, and see what friends are watching or reading.';
    const tags = [{
      type: 'link',
      tagId: 'link-canonical',
      attrs: {
        rel: 'canonical',
        href: window.location.href
      }
    }, {
      type: 'meta',
      tagId: 'meta-description',
      attrs: {
        name: 'description',
        content: description
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-url',
      attrs: {
        name: 'og:url',
        content: window.location.href
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-title',
      attrs: {
        name: 'og:title',
        content: this.headData.title
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-type',
      attrs: {
        name: 'og:type',
        content: 'website'
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-image',
      attrs: {
        name: 'og:image',
        content: 'https://media.kitsu.io/kitsu-256.png'
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-description',
      attrs: {
        name: 'og:description',
        content: description
      }
    }];
    if (config.kitsu.environment === 'staging') {
      tags.push({
        type: 'meta',
        tagId: 'meta-robots',
        attrs: {
          name: 'robots',
          content: 'noindex, nofollow'
        }
      });
    }
    return tags;
  }

  @action
  loading(transition) {
    transition.promise.finally(() => {
      scheduleOnce('afterRender', () => {
        window.prerenderReady = true;
      });
    });
  }

  @action
  didTransition() {
    scheduleOnce('afterRender', () => {
      this.meta.collectHeadTags();
    });
    return true;
  }

  // Private
  _getCurrentUser() {
    this._setOrbitHeaders();
    return this.session.fetchCurrentUser().then(user => {
      this._registerNotifications(user);
      this.analytics.identify({
        id: user.remoteId
      });
      this.raven.callRaven('setUserContext', {
        id: user.remoteId,
        user: user.slug
      });
    }).catch(() => RSVP.resolve());
  }

  _setOrbitHeaders() {
    if (!this.session.session.isAuthenticated) { return; }
    const { access_token: accessToken } = this.session.authData;
    if (accessToken) {
      const application = getOwner(this);
      const remote = application.lookup('data-source:remote');
      remote.defaultFetchHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  _registerNotifications(user) {
    if (!window.OneSignal || !user.feedCompleted) { return; }
    window.OneSignal.push(() => {
      window.OneSignal.isPushNotificationsEnabled(isEnabled => {
        if (isEnabled) {
          const id = JSON.parse(window.localStorage.getItem(ONE_SIGNAL_CACHE_KEY));
          if (id) {
            this._setupNotifications(id);
          }
        } else {
          window.OneSignal.showHttpPrompt();
          window.OneSignal.on('subscriptionChange', async (isSubscribed) => {
            if (!isSubscribed) { return; }
            const id = await window.OneSignal.getUserId();
            window.localStorage.setItem(ONE_SIGNAL_CACHE_KEY, JSON.stringify(id));
            this._setupNotifications(id);
          });
        }
      });
    });
  }

  _setupNotifications(id) {
    window.OneSignal.push(async () => {
      const record = {
        type: 'oneSignalPlayer',
        attributes: {
          playerId: id,
          platform: 'web'
        },
        relationships: {
          user: { data: this.session.currentUser.identity }
        }
      }
      await this.store.update(t => t.addRecord(record), { blocking: true });
      window.localStorage.removeItem(ONE_SIGNAL_CACHE_KEY);
    });
  }
}

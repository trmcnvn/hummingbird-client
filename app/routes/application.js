import Route from '@ember/routing/route';
import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import Cache from 'kitsu/utils/cache';

export default Route.extend(ApplicationRouteMixin, {
  intl: service(),
  raven: service(),
  session: service(),

  beforeModel() {
    this.intl.setLocale('en-us');
    if (this.session.isAuthenticated()) {
      this.sessionAuthenticated();
    }
  },

  title(tokens) {
    return `${tokens.reverse().join(' | ')} | Kitsu`;
  },

  sessionAuthenticated() {
    this._getCurrentUser();
  },

  sessionInvalidated() {
    this.raven.callRaven('setUserContext', {});
    this._super(...arguments);
  },

  actions: {
    // Set flag for prerender service
    loading(transition) {
      const controller = this.controllerFor(this.routeName);
      set(controller, 'routeIsLoading', true);
      transition.promise.finally(() => {
        scheduleOnce('afterRender', () => {
          window.prerenderReady = true;
        });
        set(controller, 'routeIsLoading', false);
      });
    }
  },

  async _getCurrentUser() {
    const user = await this.session.fetchCurrentUser();
    this._registerNotifications(user);
    this.raven.callRaven('setUserContext', {
      id: user.id,
      user: user.slug
    });
  },

  _registerNotifications(user) {
    if (!window.OneSignal || !user.feedCompleted) { return; }
    window.OneSignal.push(() => {
      window.OneSignal.isPushNotificationsEnabled((isEnabled) => {
        if (isEnabled) {
          const id = Cache.get('oneSignalPlayerId');
          if (id) {
            this._setupNotifications(id);
          }
        } else {
          window.OneSignal.showHttpPrompt();
          window.OneSignal.on('subscriptionChange', async (isSubscribed) => {
            if (!isSubscribed) { return; }
            const id = await window.OneSignal.getUserId();
            Cache.set('oneSignalPlayerId', id);
            this._setupNotifications(id);
          });
        }
      });
    });
  },

  _setupNotifications(id) {
    window.OneSignal.push(async () => {
      const record = this.store.createRecord('one-signal-player', {
        playerId: id,
        platform: 'web',
        user: this.session.getCurrentUser()
      });
      await record.save();
      Cache.clear('oneSignalPlayerId');
    });
  }
});

import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

@tagName('')
export default class AppHeader extends Component {
  query = null;
  isModalShown = false;
  modalComponent = null;

  @service router;
  @service session;

  @computed('router.currentRouteName')
  get isExploreRoute() {
    return this.router.currentRouteName && this.router.currentRouteName.includes('explore');
  }

  @computed('router.currentRouteName')
  get isFeedbackRoute() {
    return this.router.currentRouteName && this.router.currentRouteName.includes('feedback');
  }

  @action
  transitionToDashboard({ metaKey }) {
    if (metaKey) { return; } // Command/Ctrl -- Don't handle this for the current page.
    const currentRouteName = this.router.currentRouteName;
    if (currentRouteName === 'dashboard.index') {
      window.location.reload();
    } else if (this.session.isAuthenticated()) {
      this.router.transitionTo('dashboard.index');
    } else {
      this.router.transitionTo('explore.explore.index', 'anime');
    }
  }

  @action
  openModal(component) {
    this.set('isModalShown', true);
    this.set('modalComponent', component);
  }

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}

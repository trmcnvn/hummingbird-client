import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { capitalize } from '@ember/string';

export default class Index extends Controller {
  feedType = null;
  _feedFilters = [];

  @service cache;
  @service experiments;
  @service session;

  @computed('feedType')
  get feedFilters() {
    if (this.feedType === 'timeline') {
      this._feedFilters.addObject('following');
    } else {
      this._feedFilters.clear();
    }
    return this._feedFilters;
  }

  @computed('feedType')
  get feedPath() {
    if (!this.feedType) { return null; }
    if (this.feedType === 'global') {
      return `${this.feedType}/global`;
    }
    const userId = this.session.currentUser.remoteId;
    if (this.feedInterest) {
      const [type] = this.feedType.split('/');
      const interest = capitalize(this.feedInterest);
      return `${type}/${userId}-${interest}`;
    }
    return `${this.feedType}/${userId}`;
  }

  @computed('feedType')
  get feedInterest() {
    if (!this.feedType) { return null; }
    const [_, interest] = this.feedType.split('/'); // eslint-disable-line no-unused-vars
    return interest;
  }

  constructor(props) {
    super(props);

    const type = this.cache.get('dashboard-feed-type')
    if (type) {
      this.set('feedType', type);
    } else if (this.session.isAuthenticated() && this.session.currentUser.followingCount >= 7) {
      this.set('feedType', 'timeline');
    } else {
      this.set('feedType', 'global');
    }
  }

  @action
  setFeedType(type) {
    window.scrollTo(0, 0);
    this.set('feedType', type);
    this.cache.set('dashboard-feed-type', type);
  }
}

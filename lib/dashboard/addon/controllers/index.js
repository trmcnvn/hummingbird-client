import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { action, computed } from '@ember-decorators/object';
import { capitalize } from '@ember/string';

export default class Index extends Controller {
  feedType = null;
  feedFilters = [];

  @service cache;
  @service experiments;
  @service session;

  @computed('feedType')
  get feedPath() {
    if (!this.feedType) { return null; }
    if (this.feedType === 'global') {
      if (this.experiments.isParticipatingIn('new_global')) {
        return `${this.feedType}/future`;
      }
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
    if (this.experiments.isParticipatingIn('feed_following_filter')) {
      this.feedFilters.push('following');
    }
    this.cache.get('dashboard-feed-type').then(type => {
      if (type) {
        return this.set('feedType', type);
      }
      if (this.session.currentUser && this.session.currentUser.followingCount >= 7) {
        return this.set('feedType', 'timeline');
      }
      this.set('feedType', 'global');
    });
  }

  @action
  setFeedType(type) {
    window.scrollTo(0, 0);
    this.set('feedType', type);
    this.cache.set('dashboard-feed-type', type);
  }
}

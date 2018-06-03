import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import { alias, gte } from '@ember-decorators/object/computed';
import { htmlSafe } from '@ember/string';

export default class UserChecklist extends Component {
  @service session;
  @alias('session.currentUser') user;
  @gte('user.ratingsCount', 5) hasRatings;
  @gte('user.followingCount', 5) hasFollows;
  @gte('user.commentsCount', 1) hasComment;
  @gte('user.likesGivenCount', 3) hasLikes;

  @computed('hasRatings', 'hasFollows', 'hasComment', 'hasLikes')
  get stepsCompleted() {
    const steps = [this.hasRatings, this.hasFollows, this.hasComment, this.hasLikes];
    return 4 - steps.sort().lastIndexOf(false);
  }

  @computed('stepsCompleted')
  get progressPercent() {
    const percent = 20 * this.stepsCompleted;
    return htmlSafe(`width: ${percent}%;`);
  }

  @computed('user.ratingsCount')
  get ratingsLeft() {
    return 5 - this.user.ratingsCount;
  }

  @computed('user.followingCount')
  get followsLeft() {
    return 5 - this.user.followingCount;
  }

  @computed('user.likesGivenCount')
  get likesLeft() {
    return 3 - this.user.likesGivenCount;
  }
}

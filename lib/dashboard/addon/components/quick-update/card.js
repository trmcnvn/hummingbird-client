import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { computed, action } from '@ember-decorators/object';
import { htmlSafe } from '@ember/string';
import { equal } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency-decorators';

@tagName('')
export default class QuickUpdateCard extends Component {
  showReactionComponent = false;
  reactionRecord = null;
  message = null;

  @service intl;
  @equal('libraryEntry.status', 'completed') isCompleted;

  @computed('libraryEntry.progress')
  get nextProgressValue() {
    return this.libraryEntry.progress === this.libraryEntry.media.unitCount
      ? this.libraryEntry.progress : (this.libraryEntry.progress + 1);
  }

  @computed('nextProgressValue')
  get canCompleteEntry() {
    return this.nextProgressValue === this.libraryEntry.media.unitCount;
  }

  @computed('libraryEntry.progress')
  get completedPercent() {
    const result = ((this.libraryEntry.progress / this.libraryEntry.media.unitCount) * 100).toFixed(2);
    return htmlSafe(`width: ${result}%;`);
  }

  @computed('message')
  get buttonTooltipText() {
    let key = 'dashboard.quick-update.actions.tooltips.update';
    key = isEmpty(this.message) ? key : `${key}-post`;
    return this.intl.t(key);
  }

  @computed('isCompleted', 'libraryEntry.{progress,unit}')
  get unitText() {
    if (this.isCompleted) {
      return this.intl.t('dashboard.quick-update.media.complete');
    }

    if (!this.libraryEntry.progress) {
      return this.intl.t('dashboard.quick-update.media.unstarted');
    }

    const unit = this.libraryEntry.unit;
    if (unit) {
      return this.intl.t('dashboard.quick-update.media.unit', {
        type: this.libraryEntry.media.type,
        progress: this.libraryEntry.progress,
        total: this.libraryEntry.media.unitCount,
        title: this.libraryEntry.unit.canonicalTitle
      });
    }

    return this.intl.t('dashboard.quick-update.media.progress', {
      type: this.libraryEntry.media.type,
      progress: this.libraryEntry.progress,
      total: this.libraryEntry.media.unitCount
    });
  }

  @computed('libraryEntry.{media,unit}')
  get posterObject() {
    let object = this.libraryEntry.media.posterImage;
    const thumbnail = this.libraryEntry.get('unit.thumbnail'); // unit may be null
    if (thumbnail && Object.keys(thumbnail).length > 0) {
      object = thumbnail;
    }
    return object;
  }

  @task({ drop: true })
  updateLibraryEntry = function* () {
    const props = { progress: this.nextProgressValue };
    if (this.canCompleteEntry) {
      props.status = 'completed';
    }
    try {
      yield this.onUpdate(this.libraryEntry, props, this.message);
    } catch (error) {
      // ...
    } finally {
      this.set('message', null);
    }
  };

  @action
  onReactionCreated(reaction) {
    this.set('reactionRecord', reaction);
    this.set('showReactionComponent', false);
  }

  @action
  onReactionDeleted() {
    this.set('reactionRecord', null);
    this.set('showReactionComponent', false);
  }
}

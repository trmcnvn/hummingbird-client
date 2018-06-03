import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import layout from '../templates/components/search-popper';
import { service } from '@ember-decorators/service';

export default class SearchPopper extends Component {
  layout = layout;
  isPrimaryPage = true;
  renderInPlace = true;
  groups = ['media', 'groups', 'users'];

  @argument placement = 'bottom-start';
  @className('visible', 'invisible') shouldRender = false;

  @service analytics;

  didReceiveAttrs() {
    const shouldRender = this.query && this.query.length >= 2;
    this.set('shouldRender', shouldRender);
    if (shouldRender) {
      this.analytics.trackEvent({
        category: 'search',
        action: 'query',
        label: this.query
      });
    }
  }

  @action
  transitionToPage(group, response) {
    this.set('group', group);
    this.set('response', response);
    this.set('isPrimaryPage', false);
  }

  @action
  transitionToPrimary() {
    this.set('group', null);
    this.set('isPrimaryPage', true);
  }

  @action
  outsideWasClicked() {
    this.set('shouldRender', false);
  }
}

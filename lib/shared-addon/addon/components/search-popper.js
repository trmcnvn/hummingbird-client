import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { layout, className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import template from '../templates/components/search-popper';

@layout(template)
export default class SearchPopper extends Component {
  groups = Object.freeze(['media', 'groups', 'users']);
  isPrimaryPage = true;

  @className('visible', 'invisible') shouldRender = false;
  @argument placement = 'bottom-start';
  @argument eventTarget = null;
  @argument eventType = null;

  onClick = () => {
    const shouldRender = this.query && this.query.length >= 2;
    this.set('shouldRender', shouldRender);
  };

  didReceiveAttrs() {
    this.onClick();
  }

  didInsertElement() {
    if (!this.eventTarget || !this.eventType) { return; }
    const [element] = document.querySelectorAll(this.eventTarget);
    element.addEventListener(this.eventType, this.onClick);
  }

  willDestroyElement() {
    if (!this.clickTarget || !this.eventType) { return; }
    const [element] = document.querySelectorAll(this.eventTarget);
    element.removeEventListener(this.eventType, this.onClick);
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

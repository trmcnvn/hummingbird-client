import Component from '@ember/component';
import { assert } from '@ember/debug';
import { tagName } from '@ember-decorators/component';
import { or } from '@ember-decorators/object/computed';
import { argument } from '@ember-decorators/argument';
import layout from '../templates/components/ui-button';

@tagName('')
export default class UIButton extends Component {
  layout = layout;

  @argument spinnerColor = 'white';
  @argument buttonClass = '';
  @argument isDestructive = false;
  @argument isLoading = false;
  @argument isDisabled = false;
  @argument isLink = false;
  @argument isExternal = false;
  @argument href = '#';

  @or('isLoading', 'isDisabled') isButtonDisabled;

  didReceiveAttrs() {
    assert('You must specifiy an `onClick` handler', this.onClick || this.isLink);
  }
}

import Component from '@ember/component';
import template from '../templates/components/textarea-autosize';
import { layout, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { assert } from '@ember/debug';
import { guidFor } from '@ember/object/internals';
/* global autosize */

@layout(template)
@tagName('')
export default class TextareaAutosize extends Component {
  guid = guidFor(this);

  @argument placeholder = null;
  @argument maxlength = null;
  @argument onInput = null;
  @argument autofocus = false;

  didReceiveAttrs() {
    assert('You must pass an `onInput` action.', this.onInput);
  }

  didInsertElement() {
    const element = document.getElementById(this.guid);
    autosize(element);
    if (this.autofocus) {
      element.focus();
    }
  }

  willDestroyElement() {
    const element = document.getElementById(this.guid);
    autosize.destroy(element);
  }
}

import Component from '@ember/component';
import { tagName, attribute } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { assert } from '@ember/debug';
/* global autosize */

@tagName('textarea')
export default class TextareaAutosize extends Component {
  @argument @attribute rows = '1';
  @argument @attribute placeholder = null;
  @argument @attribute maxlength = null;
  @argument @attribute value = null;

  @argument onKeys = {};
  @argument onInput = null;
  @argument onPaste = null;
  @argument autofocus = false;

  keyDown(event) {
    if (this.onKeys[event.keyCode]) {
      this.onKeys[event.keyCode](event);
    }
  }

  input({ target }) {
    this.onInput(target.value);
  }

  paste(event) {
    if (this.onPaste) {
      this.onPaste(event);
    }
  }

  didReceiveAttrs() {
    assert('You must pass an `onInput` action.', this.onInput);
  }

  didInsertElement() {
    autosize(this.element);
    if (this.autofocus) {
      this.element.focus();
    }
  }

  willDestroyElement() {
    autosize.destroy(this.element);
  }
}

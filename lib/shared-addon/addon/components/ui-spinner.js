import Component from '@ember/component';
import { assert } from '@ember/debug';
import { computed } from '@ember-decorators/object';
import { layout, className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import template from '../templates/components/ui-spinner';

const VALID_SIZES = ['tiny', 'small', 'large'];
const VALID_COLORS = ['purple', 'white'];

@layout(template)
export default class UISpinner extends Component {
  @argument size = 'small';
  @argument color = 'purple';

  @className
  @computed('styleNamespace', 'size', 'color', 'center')
  get classBinding() {
    let className = this.styleNamespace;
    if (this.size) {
      className = `${className}--${this.size}`;
    }
    if (this.color) {
      className = `${className} ${this.styleNamespace}--${this.color}`;
    }
    if (this.center) {
      className = `${className} ${this.styleNamespace}--center`;
    }
    return className;
  }

  didReceiveAttrs() {
    assert(`size '${this.size}' is not valid`, VALID_SIZES.includes(this.size));
    assert(`color '${this.color}' is not valid`, VALID_COLORS.includes(this.color));
  }
}

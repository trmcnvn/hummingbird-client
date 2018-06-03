import Component from '@ember/component';
import { classNames, tagName } from '@ember-decorators/component';
import layout from '../../../templates/components/search-popper/search-results/groups';

@tagName('li')
@classNames('media')
export default class Groups extends Component {
  layout = layout;
}

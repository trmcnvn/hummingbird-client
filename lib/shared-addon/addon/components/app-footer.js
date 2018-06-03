import Component from '@ember/component';
import layout from '../templates/components/app-footer';
import { tagName } from '@ember-decorators/component';

@tagName('footer')
export default class AppFooter extends Component {
  layout = layout;
}

import Component from '@ember/component';
import template from '../templates/components/app-footer';
import { layout, tagName } from '@ember-decorators/component';

@layout(template)
@tagName('footer')
export default class AppFooter extends Component {}

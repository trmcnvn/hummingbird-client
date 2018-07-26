import Component from '@ember/component';
import { layout, classNames, tagName } from '@ember-decorators/component';
import template from '../../../templates/components/search-popper/search-results/groups';

@layout(template)
@tagName('li')
@classNames('media')
export default class Groups extends Component {}

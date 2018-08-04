import Component from '@ember/component';
import template from '../templates/components/user-card';
import { layout, classNames } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@layout(template)
@classNames('card')
export default class UserCard extends Component {
  @argument user = null;
}

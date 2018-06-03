import Component from '@ember/component';
import layout from '../../../../templates/components/app-feed/items/post/header';
import { argument } from '@ember-decorators/argument';

export default class Header extends  Component {
  layout = layout;
  @argument showGroupAvatar = false;
}

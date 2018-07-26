import Component from '@ember/component';
import template from '../../../../templates/components/app-feed/items/post/header';
import { layout } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@layout(template)
export default class Header extends  Component {
  @argument showGroupAvatar = false;
}

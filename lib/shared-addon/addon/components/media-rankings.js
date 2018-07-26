import Component from '@ember/component';
import template from '../templates/components/media-rankings';
import { layout } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@layout(template)
export default class MediaRankings extends Component {
  @argument length = 'full';
}

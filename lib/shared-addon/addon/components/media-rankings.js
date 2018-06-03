import Component from '@ember/component';
import layout from '../templates/components/media-rankings';
import { argument } from '@ember-decorators/argument';

export default class MediaRankings extends Component {
  layout = layout;
  @argument length = 'full';
}

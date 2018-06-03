import Component from '@ember/component';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';

@tagName('')
export default class ExploreMoreComponent extends Component {
  @argument limit = 20;
  @argument sort = null;
  @argument filters = null;

  didReceiveAttrs() {
    this._buildFetchOptions();
  }

  _buildFetchOptions() {
    let sort = null;
    let filters = {};

    switch (this.key) {
      case 'top-current':
        sort = '-userCount';
        filters.status = 'current';
        break;
      case 'top-upcoming':
        sort = '-userCount';
        filters.status = 'upcoming';
        break;
      case 'highest-rated':
        sort = '-averageRating';
        break;
      case 'most-popular':
        sort = '-userCount';
        break;
      case 'newly-released':
        sort = '-startDate';
        filters.status = 'current,finished';
        break;
      default:
        sort = '-userCount';
        break;
    }
    this.set('sort', sort);
    this.set('filters', filters);
  }
}

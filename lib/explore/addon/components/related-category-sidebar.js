import Component from '@ember/component';
import { setProperties } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { classNames } from '@ember-decorators/component';
import { service } from '@ember-decorators/service';
import { concat } from 'kitsu/decorators';

@classNames('col-sm')
export default class RelatedCategorySidebar extends Component {
  @service store;
  @concat('parent', 'siblings', 'children') categories;

  @task({ drop: true })
  fetchCategories = function* () {
    let parent = this.category.parent;
    let siblings = yield this.fetchChildren.perform(parent);
    const children = yield this.fetchChildren.perform(this.category);
    parent = parent.parent === null ? null : [parent];

    // remove self from siblings
    siblings = siblings.filter(s => s.id !== this.category.id);
    setProperties(this, { parent, siblings, children });
  };

  @task({ drop: true })
  fetchChildren = function* (category) {
    return yield this.store.request('category', {
      filter: { parent_id: category.remoteId },
      page: { limit: 50 }
    });
  };

  didReceiveAttrs() {
    this.fetchCategories.perform();
  }
}

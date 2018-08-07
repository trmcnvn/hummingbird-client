import { assert } from '@ember/debug';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember-decorators/object';

/**
 * @Pagination
 * class MyComponent extends Component { }
 */
export default (TargetClass) => (
  class extends TargetClass {
    paginatedRecords = [];
    _internalState = { offset: 0 };

    @task({ keepLatest: true })
    executePaginationQuery = function* () {
      const expr = this.buildQueryExpression();
      this.updatePaginationState(expr);

      expr.page.offset = this._internalState.offset;
      const records = yield this.store.request(this.paginationType, expr);

      this.addPaginationRecords(records);
      return records;
    };

    constructor() {
      super(...arguments);
      assert('You must inject `service:store` into the parent component.', this.store);
      this.resetPaginationState();
    }

    buildQueryExpression() {
      assert('You must override `buildQueryExpression`', super.buildQueryExpression);
      return super.buildQueryExpression();
    }

    addPaginationRecords(records) {
      if (super.addPaginationRecords) {
        super.addPaginationRecords(records);
      } else {
        this.paginatedRecords.addObjects(records);
      }
    }

    updatePaginationState(expr) {
      if (super.updatePaginationState) {
        this._internalState.offset = super.updatePaginationState();
      } else {
        this._internalState.offset += (expr.page.limit || 10);
      }
    }

    resetPaginationState() {
      this.paginatedRecords.clear();
      this._internalState = { offset: 0 };
    }

    @action
    onPagination() {
      assert('You need to defined `paginationType`', this.paginationType);
      return this.executePaginationQuery.perform();
    }
  }
);

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | reactions', function(hooks) {
  setupTest(hooks);

  test('onDelete transitions to the dashboard', function(assert) {
    assert.expect(1);
    const controller = this.owner.lookup('controller:reactions');
    controller.transitionToRoute = (key) => { assert.equal(key, 'dashboard'); }
    controller.actions.onDelete();
  });
});

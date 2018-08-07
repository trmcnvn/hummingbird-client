import observerManager, { ObserverMap } from 'kitsu/utils/observer-manager';
import { module, test } from 'qunit';

module('Unit | Utility | observer-manager', function(hooks) {
  hooks.beforEeach(() => {
    ObserverMap.clear();
  });

  test('it reuses IntersectionObserver instances', function(assert) {
    observerManager({ abc: 'def' });
    assert.equal(ObserverMap.size, 1);

    // doesn't create a new observer
    observerManager({ abc: 'def' });
    assert.equal(ObserverMap.size, 1);

    // creates a new observer due to unknown key
    observerManager({ def: 'ghi' });
    assert.equal(ObserverMap.size, 2);
  });
});

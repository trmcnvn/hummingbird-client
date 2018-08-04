import getRatingTag from 'kitsu/utils/get-rating-tag';
import { module, test } from 'qunit';

module('Unit | Utility | get-rating-tag', function() {
  test('it works', function(assert) {
    assert.equal(getRatingTag(1), 'awful');
    assert.equal(getRatingTag(4), 'meh');
    assert.equal(getRatingTag(7), 'good');
    assert.equal(getRatingTag(10), 'great');
  });
});

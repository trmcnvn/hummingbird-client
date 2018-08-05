import getErrorMessage from 'kitsu/utils/get-error-message';
import { module, test } from 'qunit';

module('Unit | Utility | get-error-message', function(hooks) {
  test('it works with JSON:API errors', function(assert) {
    let exception = { data: { errors: [{ title: 'You cannot block moderators.', detail: 'blocked - you cannot block moderators.' }] } };
    let result = getErrorMessage(exception);
    assert.equal(result, 'You cannot block moderators.');

    exception = { data: { errors: [{ detail: 'blocked - You cannot block moderators.' }] } };
    result = getErrorMessage(exception);
    assert.equal(result, 'Blocked - You cannot block moderators.');
  });
});

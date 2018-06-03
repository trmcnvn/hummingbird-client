import { module, test } from 'qunit';
import { visit, click, fillIn, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';
import { currentSession } from 'ember-simple-auth/test-support';
import { waitForSource } from '../helpers/wait-for-source';

module('Acceptance | authentication', function(hooks) {
  setupApplicationTest(hooks);
  setupPolly(hooks);

  test('should be able to sign up', async function(assert) {
    this.polly.configure({ recordIfMissing: false });

    await visit('/terms');
    await click('[data-test-sign-up-header]');
    await click('[data-test-sign-up-link]');
    await fillIn('[data-test-sign-up-form] [data-test-username]', 'KitsuTesting');
    await fillIn('[data-test-sign-up-form] [data-test-email]', 'KitsuTesting@vevix.net');
    await fillIn('[data-test-sign-up-form] [data-test-password]', 'KitsuTesting');
    await click('[data-test-sign-up-form] button');
    await waitForSource('store');
    await waitForSource('backup');
    await settled();

    assert.ok(currentSession().session.isAuthenticated);
  });

  test('should be able to sign in', async function(assert) {
    this.polly.configure({ recordIfMissing: false });

    await visit('/terms');
    await click('[data-test-sign-in-header]');
    await fillIn('[data-test-sign-in-form] [data-test-username]', 'KitsuTesting@vevix.net');
    await fillIn('[data-test-sign-in-form] [data-test-password]', 'KitsuTesting');
    await click('[data-test-sign-in-form] button');
    await waitForSource('store');
    await waitForSource('backup');
    await settled();

    assert.ok(currentSession().session.isAuthenticated);
  });
});

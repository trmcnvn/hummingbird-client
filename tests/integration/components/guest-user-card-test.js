import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | guest-user-card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with a user passed', async function(assert) {
    this.set('user', { name: 'Thomas' });
    await render(hbs`{{guest-user-card user=user}}`);
    assert.dom('p').includesText('Thomas');
    assert.dom('button').exists();
  });

  test('it only renders the button when no user is passed', async function(assert) {
    await render(hbs`{{guest-user-card}}`);
    assert.dom('p').doesNotExist();
    assert.dom('button').exists();
  });
});

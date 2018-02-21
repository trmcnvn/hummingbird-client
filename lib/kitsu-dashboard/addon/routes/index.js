import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  redirect() {
    const isAuthenticated = this.session.isAuthenticated();
    if (!isAuthenticated) {
      this.transitionToExternal('kitsu-explore', 'anime');
    }
  }
});

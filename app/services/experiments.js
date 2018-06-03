import Service from '@ember/service';
import { service } from '@ember-decorators/service';

export default class Experiments extends Service {
  experiments = {};
  @service fetch;

  async getFlags() {
    this.experiments = await this.fetch.request('_flags');
  }

  isParticipatingIn(experiment) {
    return !!this.experiments[experiment];
  }
}

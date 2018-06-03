import Helper from '@ember/component/helper';
import { service } from '@ember-decorators/service';

export default class IsParticipatingIn extends Helper {
  @service experiments;

  compute([experiment]) {
    return this.experiments.isParticipatingIn(experiment);
  }
}

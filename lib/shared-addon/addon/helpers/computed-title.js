import Helper from '@ember/component/helper';
import { getProperties } from '@ember/object';
import { getComputedTitle as _getComputedTitle } from 'kitsu/utils/get-local-title';
import { service } from '@ember-decorators/service';

export function getComputedTitle(user, media) {
  const { canonicalTitle, titles } = getProperties(media, 'canonicalTitle', 'titles');
  return _getComputedTitle(user, canonicalTitle, titles);
}

export default class ComputedTitle extends Helper {
  @service session;

  compute([media, stripYear = false]) {
    const user = this.session.getCurrentUser();
    const title = getComputedTitle(user, media);
    if (stripYear) {
      return title.replace(/\(\d{4}\)$/, '');
    }
    return title;
  }
}

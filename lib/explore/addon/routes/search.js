import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import { isEmpty, typeOf } from '@ember/utils';
import { isArray } from '@ember/array';

export default class Application extends Route {
  @service intl;
  @service store;

  get requestOptions() {
    const base = {
      filter: {},
      page: { offset: 0, limit: 20 }
    };

    const params = this.paramsFor(this.routeName);
    Object.keys(params).forEach(param => {
      const value = params[param];
      if (isEmpty(value)) {
        return;
      } else if (isArray(value)) {
        const filtered = value.reject(item => isEmpty(item));
        if (isEmpty(filtered)) { return; }
      }
      if (param !== 'sort') {
        const type = typeOf(value);
        base.filter[param] = this.serializeQueryParam(value, param, type);
      }
    });

    if (!isEmpty(base.filter.unitCount)) {
      const type = this.getMediaType();
      const unitKey = type === 'anime' ? 'episodeCount' : 'chapterCount';
      base.filter[unitKey] = base.filter.unitCount;
      delete base.filter.unitCount;
    }

    if (isEmpty(base.filter.text)) {
      base.sort = this.getSortingKey(params.sort);
    }

    return base;
  }

  beforeModel() {
    // @PrivateAPI
    // if we hit this route from the `explore` mount point,
    // then the user is at `/explore` ... so send them to the
    // primary explore page.
    const handler = this._handlerName;
    const idx = ['explore-anime', 'explore-manga'].findIndex(path => handler.includes(path));
    if (idx === -1) {
      return this.transitionTo('explore', 'anime');
    }

    // Use the correct controller for this media type
    const type = this.getMediaType();
    this.set('controllerName', type);
  }

  model() {
    const type = this.getMediaType();
    const request = this.store.request(type, this.requestOptions);
    return { request };
  }

  activate() {
    document.body.classList.add('no-navbar-padding');
  }

  deactivate() {
    document.body.classList.remove('no-navbar-padding');
  }

  titleToken() {
    const type = this.getMediaType();
    return this.intl.t('explore.titles.explore', { type });
  }

  // @PrivateAPI
  getMediaType() {
    const handler = this._handlerName;
    return handler.includes('anime') ? 'anime': 'manga';
  }

  getSortingKey(sort) {
    switch (sort) {
      case 'rating':
        return '-averageRating';
      case 'date':
        return '-startDate';
      case 'recent':
        return '-createdAt';
      default:
        return '-userCount';
    }
  }

  headTags() {
    const description = `Looking for that ${this.getMediaType()}? Find all the best anime and manga on Kitsu!`;
    return [{
      type: 'meta',
      tagId: 'meta-description',
      attrs: {
        property: 'description',
        content: description
      }
    }, {
      type: 'meta',
      tagId: 'meta-og-description',
      attrs: {
        property: 'og:description',
        content: description
      }
    }];
  }
}

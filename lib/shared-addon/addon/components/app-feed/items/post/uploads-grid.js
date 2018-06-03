import Component from '@ember/component';
import layout from '../../../../templates/components/app-feed/items/post/uploads-grid';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { task } from 'ember-concurrency-decorators';
import { sort, map } from '@ember-decorators/object/computed';
import { all } from 'ember-concurrency';
import { set } from '@ember/object';
import { className } from '@ember-decorators/component';
import { imgixUrl } from '../../../../helpers/imgix-url';
import { service } from '@ember-decorators/service';

const orientation = upload => {
  const { w, h } = upload;
  const ratio = w / h;
  if (ratio > 1.25) { return 1; }
  if (ratio < 0.75) { return 2; }
  return 0;
};

const avgOrientation = (uploads, length) => {
  if (length === 5) {
    return 'landscape';
  }
  let o = 1;
  const os = uploads.map(orientation);
  switch (length) {
    case 2: {
      o = os[0] === os[1] ? os[0] : 0;
      break;
    }
    case 3: {
      const landscapeFreq = os.filter(o => o === 1).length;
      const portraitFreq = os.filter(o => o === 2).length;
      o = landscapeFreq > portraitFreq ? 1 : 2;
      break;
    }
    case 4: {
      [o] = os;
      break;
    }
    default: {
      break;
    }
  }
  switch (o) {
    case 0: {
      return 'square';
    }
    case 1: {
      return 'landscape';
    }
    case 2: {
      return 'portrait';
    }
    default: {
      return null;
    }
  }
};

const thumbSize = (length, orientation, index) => {
  const max = 538;
  const margin = 4;
  if (orientation === 'square') {
    const box = (max - 4) / 2;
    return { width: box, height: box };
  }
  let long;
  let short;
  switch (length) {
    case 1:
      long = max * 1.25;
      short = max;
      break;
    case 2:
      long = max;
      short = (max - margin) / 2;
      break;
    case 3:
      if (index === 0) {
        long = max;
        short = (max - margin) * (2 / 3);
      } else {
        long = (max - margin) / 2;
        short = (max - margin) / 3;
      }
      break;
    case 4:
      if (index === 0) {
        long = max;
        short = (max - margin) * (2 / 3);
      } else {
        long = (max - (2 * margin)) / 3;
        short = (max - margin) / 3;
      }
      break;
    case 5:
      if (index < 2) {
        long = (max - margin) / 2;
        short = ((max * 0.83) - margin) * (3 / 5);
      } else {
        long = (max - (2 * margin)) / 3;
        short = ((max * 0.83) - margin) * (2 / 5);
      }
      break;
    default:
  }
  if (orientation === 'landscape') {
    return { width: long, height: short };
  }
  return { width: short, height: long };
};

export default class UploadsGrid extends Component {
  layout = layout;
  gridLength = 0;
  gridOrientation = null;
  items = [];
  @argument uploads = [];

  @service intl;

  uploadSortOrder = Object.freeze(['uploadOrder']);
  @sort('uploads', 'uploadSortOrder') sortedUploads;

  @map('sortedUploads')
  galleryItems(upload) {
    const src = upload.content.original;
    const url = imgixUrl(src, { fm: 'json' });
    return fetch(url).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    }).then(data => ({
      src,
      w: data.PixelWidth,
      h: data.PixelHeight,
      type: data['Content-Type']
    })).catch(() => {});
  }

  @className
  @computed('gridLength', 'gridOrientation')
  get gridStyle() {
    return `photo-grid-${this.gridLength} ${this.gridOrientation}`;
  }

  @task({ restartable: true })
  buildItems = function* () {
    const items = yield all(this.galleryItems);
    const gridLength = items.length < 5 ? items.length : 5;
    const gridOrientation = avgOrientation(items, gridLength);
    items.forEach((item, index) => {
      const { width: w, height: h } = thumbSize(gridLength, gridOrientation, index);
      const thumbParams = { w, h };
      if (items.length > 1) {
        thumbParams.fit = 'crop';
      } else if (orientation(item) === 2) {
        thumbParams.fit = 'crop';
        thumbParams.crop = 'edges';
      }
      set(item, 'thumbSrc', imgixUrl(item.src, thumbParams));
    });
    this.setProperties({
      items,
      gridLength,
      gridOrientation
    });
  };

  didReceiveAttrs() {
    this.buildItems.perform();
  }

  @action
  getPhotoOptions(index) {
    return {
      index,
      shareEl: true,
      shareButtons: [{
        id: 'download',
        label: this.intl.t('shared-addon.app-feed.items.post.uploads.download'),
        url: '{{raw_image_url}}',
        download: true
      }]
    };
  }
}

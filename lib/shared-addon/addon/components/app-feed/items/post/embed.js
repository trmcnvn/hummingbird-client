import Component from '@ember/component';
import layout from '../../../../templates/components/app-feed/items/post/embed';
import { action, computed } from '@ember-decorators/object';
import { isObject } from '@orbit/utils';
import { attribute } from '@ember-decorators/component';
import { htmlSafe } from '@ember/string';
import { assert } from '@ember/debug';

export default class Embed extends Component {
  layout = layout;
  shouldRenderVideo = false;

  @computed('embed.{kind,video}')
  get isVideo() {
    return this.embed.kind && this.embed.kind.includes('video') && isObject(this.embed.video);
  }

  @attribute('style')
  @computed('isVideo', 'embed.video.{width,height}')
  get videoStyle() {
    if (this.isVideo) {
      const { width, height } = this.embed.video;
      return htmlSafe(`padding-bottom: calc(100% * (${height} / ${width}))`);
    }
    return null;
  }

  @computed('isVideo', 'embed.video.type')
  get requiresIFrame() {
    if (!this.isVideo) { return false; }
    return this.embed.video.type !== 'video/mp4';
  }

  @computed('isVideo', 'embed.{site.name,video.url}')
  get videoSrc() {
    if (!this.isVideo) { return null; }
    const url = this.embed.video.url;
    if (this.embed.site.name === 'YouTube') {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
    }
    return url;
  }

  @computed('embed.image.{width,height}')
  get orientation() {
    if (this.embed.kind === 'image') {
      return 'landscape';
    }

    if (this.embed.image) {
      const { width, height } = this.embed.image;
      const ratio = width / height;
      if (ratio > 1.25) {
        return 'landscape';
      }
    }
    return 'portrait';
  }

  didReceiveAttrs() {
    assert('`embed` must be valid!', this.embed);
  }

  @action
  revealVideo() {
    this.set('shouldRenderVideo', true);
  }
}

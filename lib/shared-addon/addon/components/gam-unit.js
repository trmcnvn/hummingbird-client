import Component from '@ember/component';
import template from '../templates/components/gam-unit';
import { layout } from '@ember-decorators/component';
import config from 'kitsu/config/environment';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { service } from '@ember-decorators/service';
import RSVP from 'rsvp';

// Lazily inject the script for ads, but only ever do it once.
const _injectedScripts = {};
const _injectedScriptsLoading = {};
const injectScript = (src) => {
  return new RSVP.Promise((resolve, reject) => {
    if (_injectedScripts[src]) { return resolve(); }
    if (_injectedScriptsLoading[src]) { return _injectedScriptsLoading[src].then(resolve); }

    let done = null;
    _injectedScriptsLoading[src] = new RSVP.Promise((resolve) => {
      done = resolve;
    });
    _injectedScriptsLoading[src].then(() => { delete _injectedScriptsLoading[src]; });

    const element = document.createElement('script');
    element.async = true;
    element.src = src;
    element.onload = () => {
      _injectedScripts[src] = true;
      done();
      resolve();
    };
    element.onerror = () => {
      done();
      reject();
    };
    document.head.appendChild(element);
  });
};

// Inject GPT script and initialize
let _googleScriptIsLoaded = false;
let _googleScriptPromise = null;
const loadGoogleScript = () => {
  if (_googleScriptIsLoaded) { return RSVP.resolve(); }
  if (_googleScriptPromise) { return _googleScriptPromise; }

  const src = '//www.googletagservices.com/tag/js/gpt.js';
  _googleScriptPromise = injectScript(src).then(() => {
    _googleScriptIsLoaded = true;
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    window.googletag.cmd.push(() => {
      window.googletag.pubads().enableSingleRequest();
      window.googletag.pubads().disableInitialLoad();
      window.googletag.pubads().collapseEmptyDivs();
      window.googletag.enableServices();
    });
  });
  return _googleScriptPromise;
};

@layout(template)
export default class GAMUnit extends Component {
  ref = null;
  viewports = Object.freeze({
    mobile: [340, 400],
    tablet: [750, 200],
    desktop: [1024, 200]
  });

  @argument unit = null;
  @argument sizes = [];
  @argument targeting = {};
  @service session;

  @computed('session.{hasSession,currentUser.isPro}')
  get shouldShowAd() {
    return !(this.session.hasSession && this.session.currentUser.isPro);
  }

  @computed('unit')
  get unitPath() {
    const { networkId } = config.kitsu.APIKeys.google;
    return `/${networkId}/${this.unit}`;
  }

  get unitId() {
    return `gpt-ad-unit-${this.elementId}`;
  }

  didReceiveAttrs() {
    if (!this.shouldShowAd) { return; }
    this.requestUnit();
  }

  willDestroyElement() {
    this.removeUnit();
  }

  async requestUnit() {
    try {
      await loadGoogleScript();
      if (this.isDestroyed) { return; }
      window.googletag.cmd = window.googletag.cmd || [];
      window.googletag.cmd.push(() => {
        if (this.isDestroyed) { return; }
        this.refreshUnit();
      });
    } catch (error) { } // eslint-disable-line no-empty
  }

  removeUnit() {
    if (window.googletag && window.googletag.defineSlots && this.ref) {
      window.googletag.destroySlots([this.ref]);
    }
  }

  refreshUnit() {
    let mapping = window.googletag.sizeMapping();
    mapping.addSize([0, 0], [1, 1]);
    Object.keys(this.viewports).forEach(viewport => {
      const viewSize = this.viewports[viewport];
      const unitSize = this.sizes[viewport];
      if (unitSize) { mapping.addSize(viewSize, unitSize); }
    });
    mapping = mapping.build();

    const [initialSize] = Object.values(this.sizes);
    const slot = window.googletag.defineSlot(this.unitPath, initialSize || [], this.unitId)
      .defineSizeMapping(mapping)
      .addService(window.googletag.pubads());
    Object.keys(this.targeting).forEach(key => {
      slot.setTargeting(key, this.targeting[key]);
    });
    this.set('ref', slot);

    window.googletag.display(this.unitId);
    window.googletag.pubads().refresh([slot]);
  }
}

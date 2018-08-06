import EmberPopper from 'ember-popper/components/ember-popper';

/**
 * If `eventsEnabled` is set to true then Popper will recompute its position
 * based on the space available in the viewport. When you have a lot of instances on
 * a single page (such as our feed) it causes a massive hit to performance.
 *
 * We don't care about the re-computation so we can just globally disable the events.
 */
EmberPopper.reopen({
  init() {
    this._super(...arguments);
    this.set('eventsEnabled', false);
  }
});

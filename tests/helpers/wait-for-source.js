import { getContext } from '@ember/test-helpers';
import { Promise } from 'rsvp';

export async function waitForSource(sourceName) {
  let { owner } = getContext();
  let source = owner.lookup(`data-source:${sourceName}`);
  if (!source) {
    throw new Error(`data-source:${sourceName} not found. Maybe you misspelled it?`);
  }

  let promise;
  if (source.requestQueue.empty) {
    promise = Promise.resolve();
  } else {
    promise = new Promise(function (resolve, reject) {
      source.requestQueue.on('complete', resolve);
      source.requestQueue.on('fail', reject);
    });
  }
  return promise.then(() => {
    if (source.syncQueue.empty) {
      return Promise.resolve();
    } else {
      return new Promise(function(resolve, reject) {
        source.syncQueue.on('complete', resolve);
        source.syncQueue.on('fail', reject);
      });
    }
  });
}

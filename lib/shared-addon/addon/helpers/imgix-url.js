import { helper } from '@ember/component/helper';

export function imgixUrl(src, params = {}) {
  const filledParams = { auto: 'format', fm: 'png', ch: 'Width,DPR', ...params };
  const options = Object.keys(filledParams).map(key => (
    [key, filledParams[key]].map(encodeURIComponent).join('=')
  )).join('&');
  // @TODO: Replace with config keys
  const url = src.replace('https://media.kitsu.io/', 'https://kitsu.imgix.net/')
    .replace('https://media-staging.kitsu.io/', 'https://kitsu-staging.imgix.net/');
  return options ? `${url}&${options}` : url;
}

export default helper(params => imgixUrl(...params));

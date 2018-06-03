import { helper } from '@ember/component/helper';
import { EMOJI_MAP, EMOJI_CODES } from 'kitsu/utils/emoji-map';

// @Performance
export function formatContent([content]) {
  // convert short code (:tada:) to emoji
  let parsed = content;
  EMOJI_CODES.forEach(code => {
    parsed = parsed.replace(`:${code}:`, EMOJI_MAP[code].char);
  })
  return parsed;
}

export default helper(formatContent);

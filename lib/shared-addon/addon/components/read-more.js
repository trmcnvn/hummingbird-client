import Component from '@ember/component';
import { htmlSafe, isHTMLSafe } from '@ember/string';
import { layout, tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { computed } from '@ember-decorators/object';
import template from '../templates/components/read-more';
import clipper from 'text-clipper';

@layout(template)
@tagName('p')
export default class ReadMore extends Component {
  @argument htmlSafe = false;
  @argument isExpanded = false;
  @argument maxLines = Infinity;
  @argument moreText = 'shared-addon.read-more.more';
  @argument lessText = 'shared-addon.read-more.less';

  @computed('text', 'limit', 'htmlSafe', 'maxLines')
  get truncatedText() {
    const options = { html: this.htmlSafe, maxLines: this.maxLines };
    if (!this.text) { return null; }
    const string = isHTMLSafe(this.text) ? this.text.string : this.text;
    return htmlSafe(clipper(string, this.limit, options));
  }

  @computed('truncatedText')
  get shouldTruncate() {
    const length = isHTMLSafe(this.text) ? this.text.string.length : this.text.length;
    const truncated = this.truncatedText;
    return truncated.string.length < length;
  }
}

import Component from 'ember-popper/components/ember-popper';

// @Hack: !!!
// This is a quick-fix workaround to an issue with popper and vertical-collection
// Many items in some of our vertical collections use ember-bootstrap dropdowns
// which are backed by popper. popper tries to do some logic after the element
// has been killed by vertical-collection (when scrolling very fast)
export default class EmberPopper extends Component {
  _updatePopper() {
    try {
      super._updatePopper(...arguments);
    } catch (error) { } // eslint-disable-line no-empty
  }

  willDestroyElement() {
    try {
      super.willDestroyElement();
    } catch (error) { } // eslint-disable-line no-empty
  }
}

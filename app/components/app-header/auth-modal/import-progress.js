import Component from './-base';

export default class ImportProgress extends Component {
  isAccountCreation = true;
  siteName = null;

  didReceiveAttrs() {
    this.set('siteName', this.data.siteName);
    this.set('isAccountCreation', this.data.isAccountCreation || this.isAccountCreation);
  }
}

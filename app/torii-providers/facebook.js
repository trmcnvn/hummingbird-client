import FacebookConnectProvider from 'torii/providers/facebook-connect';

export default class Facebook extends FacebookConnectProvider {
  settings() {
    const original = super.settings();
    return { ...original, cookie: false, status: false };
  }
}

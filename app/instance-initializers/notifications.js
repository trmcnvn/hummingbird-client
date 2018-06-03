export function initialize(application) {
  const service = application.lookup('service:notification-messages');
  service.setDefaultAutoClear(true);
  service.setDefaultClearDuration(3000);
}

export default {
  initialize
};

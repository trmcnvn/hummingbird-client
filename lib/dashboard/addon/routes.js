import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  // @Legacy
  this.route('redirect', { path: '/dashboard' });
});

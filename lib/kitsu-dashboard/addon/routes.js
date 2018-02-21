import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  // Handle Hummingbird-era route
  this.route('redirect', { path: '/dashboard' });
});

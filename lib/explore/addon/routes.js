import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  this.route('explore', { path: '/:type' }, function() {
    this.route('more', { path :'/:key' });
    this.route('category', { path: '/category/:slug' }, function() {
      this.route('more', { path: '/:key' });
    });
  });

  this.route('search', { path: '/' });
});

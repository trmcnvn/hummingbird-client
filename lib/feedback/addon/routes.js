import buildRoutes from 'ember-engines/routes';

export default buildRoutes(function() {
  ['bugs', 'feature-requests', 'database-requests', 'mobile-bugs', 'mobile-features'].forEach(r => {
    this.route(r, function() {
      this.route('posts', { path: '/*path' });
    })
  });
});

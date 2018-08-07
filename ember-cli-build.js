'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const svgoUniqueIds = require('svgo-plugin-unify-ids');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    hinting: EmberApp.env() === 'test',
    tests: EmberApp.env() === 'test',

    babel: {
      comments: false,
      plugins: ['transform-object-rest-spread']
    },

    vendorFiles: {
      'jquery.js': null
    },

    addons: {
      // These addons are used in engines only, we don't want them bundled with
      // the host application. Revisit this when ember-engines is further developed.
      // as this will still bundle any underlying imports into the host's vendor.
      // @Engines
      blacklist: [
        'ember-cli-swiper'
      ]
    },

    fingerprint: {
      exclude: [
        'OneSignalSDKWorker.js',
        'OneSignalSDKUpdaterWorker.js',
        'hulu-embed-frame.html'
      ]
    },

    sourcemaps: {
      enabled: EmberApp.env() === 'production',
      extensions: ['js']
    },

    sassOptions: {
      includePaths: ['node_modules/bootstrap/scss']
    },

    orbit: {
      packages: [
        '@orbit/jsonapi',
        '@orbit/indexeddb-bucket',
        '@orbit/indexeddb'
      ]
    },

    pollyjs: {
      enabled: EmberApp.env() === 'test'
    },

    svgJar: {
      sourceDirs: ['public/svgs'],
      optimizer: {
        plugins: [
          { removeTitle: true },
          { removeDesc: true },
          { removeXMLNS: true },
          { convertShapeToPath: false },
          { uniqueIds: svgoUniqueIds }
        ]
      }
    },

    'ember-service-worker': {
      versionStrategy: 'every-build',
      registrationStrategy: 'inline',
      enabled: EmberApp.env() === 'production'
    },

    'ember-cli-password-strength': {
      bundleZxcvbn: false
    },

    'ember-bootstrap': {
      bootstrapVersion: 4,
      importBootstrapFont: false,
      importBootstrapCSS: false,
      // @TODO: Treeshaking
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  app.import('node_modules/algoliasearch/dist/algoliasearchLite.min.js', {
    using: [
      { transformation: 'amd', as: 'algoliasearch' }
    ]
  });
  app.import('node_modules/text-clipper/dist/index.js', {
    using: [
      { transformation: 'cjs', as: 'text-clipper' }
    ]
  });
  app.import('node_modules/getstream/dist/js/getstream.js');
  app.import('node_modules/autosize/dist/autosize.js');
  app.import('node_modules/clipboard/dist/clipboard.min.js');
  app.import('node_modules/html5sortable/dist/html5sortable.amd.js', {
    using: [
      { transformation: 'amd', as: 'html5sortable' }
    ]
  });
  return app.toTree();
};

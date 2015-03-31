/* jshint node: true */
'use strict';

module.exports = {
  name: 'eureka-widget-model-map',

  included: function(app) {
    this._super.included(app);
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet.js');
    app.import(app.bowerDirectory + '/leaflet/dist/leaflet.css');
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers-2x.png', { destDir: '/images' });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon-2x.png', { destDir: '/images' });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-shadow.png', { destDir: '/images' });
    app.import(app.bowerDirectory + '/leaflet/dist/images/layers.png', { destDir: '/images' });
    app.import(app.bowerDirectory + '/leaflet/dist/images/marker-icon.png', { destDir: '/images' });
  }
};

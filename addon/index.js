import Ember from 'ember';
import WidgetModel from 'ember-eureka/widget-model';
import L from './leaflet';

export default WidgetModel.extend({

    label: Ember.computed.alias('config.label'),

    latitudeProperty: function() {
        return this.getWithDefault('config.latitudeProperty', 'latitude');
    }.property('config.latitudeProperty'),

    longitudeProperty: function() {
        return this.getWithDefault('config.longitudeProperty', 'longitude');
    }.property('config.longitudeProperty'),

    _getCoordinateTypePromise: function(coordinateType, modelPropertyName) {
        var _this = this;
        return new Ember.RSVP.Promise(function(resolve, reject) {
            if (modelPropertyName.split('.').length > 1) {
                var relationField = modelPropertyName.split('.')[0];
                var relationPropertyName = modelPropertyName.split('.')[1];
                var relation = _this.get('model.'+relationField);
                if (!relation) {
                    return resolve(null);
                }
                relation.then(function(relation) {
                    var value = relation.get(relationPropertyName);
                    if (value) {
                        return resolve(value);
                    } else {
                        return reject('widget-model-map> unknown', coordinateType, 'for the model', _this.get('modelMeta.resource'));
                    }
                });
            } else {
                var value = _this.get('model.'+modelPropertyName);
                return resolve(value);
            }
        });
    },

    latitudePromise: function() {
        var latitudeProperty = this.get('config.latitudeProperty');
        if (!latitudeProperty) {
            console.error('widget-model-map> not latitudeProperty found in config');
        }
        return this._getCoordinateTypePromise('latitude', latitudeProperty);
    }.property('config.latitudeProperty'),

    longitudePromise: function() {
        var longitudeProperty = this.get('config.longitudeProperty');
        if (!longitudeProperty) {
            console.error('widget-model-map> not longitudeProperty found in config');
        }
        return this._getCoordinateTypePromise('longitude', longitudeProperty);
    }.property('config.longitudeProperty'),

    coordinatesPromise: function() {
        var latitudePromise = this.get('latitudePromise');
        var longitudePromise = this.get('longitudePromise');
        return Ember.RSVP.all([latitudePromise, longitudePromise]);
    }.property('latitudePromise', 'longitudePromise'),

    zoom: function() {
        return this.getWithDefault('config.zoom', 5);
    }.property('config.zoom'),

    minZoom: function() {
        return this.getWithDefault('config.minZoom', 2);
    }.property('config.minZoom'),

    _map: null,

    initializeMap: function() {
        var minZoom = this.get('minZoom');
        var zoom = this.get('zoom');

        var _this = this;

        var _map = L.map(_this.$('.panel-body')[0], {
            center: [20.0, 5.0],
            zoom: zoom,
            minZoom: minZoom,
        });

        _this.set('_map', _map);

        var coordinatesPromise = this.get('coordinatesPromise');

        if (coordinatesPromise) {
            coordinatesPromise.then(function(coordinates) {

                var latitude = coordinates[0];
                var longitude = coordinates[1];

                if (latitude && longitude) {

                    L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a>',
                        subdomains: ['otile1','otile2','otile3','otile4']
                    }).addTo(_map);


                    var pinIcon = L.icon({
                        iconUrl: '/images/marker-icon.png',
                        iconRetinaUrl: '/images/marker-icon-2x.png',
                    });

                    var marker = new L.marker([latitude, longitude], {icon: pinIcon});
                    marker.addTo(_map);
                    _map.panTo([latitude, longitude],{animate: true});

                    _map.scrollWheelZoom.disable();
                }

            });
        }
    }.on('didInsertElement'),

    tearDownMap: function() {
        if (this.get('_map')) {
            this.get('_map').remove();
        }
    }.on('willDestroy')

});

import Ember from 'ember';
import layout from '../templates/components/widget-model-map';
import WidgetModel from 'ember-eureka/widget-model';
import L from 'ember-leaflet-hurry';


export default WidgetModel.extend({
    layout: layout,

    label: Ember.computed.alias('config.label'),

    latitudeProperty: Ember.computed('config.latitudeProperty', function() {
        return this.getWithDefault('config.latitudeProperty', 'latitude');
    }),

    longitudeProperty: Ember.computed('config.longitudeProperty', function() {
        return this.getWithDefault('config.longitudeProperty', 'longitude');
    }),

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

    latitudePromise: Ember.computed('config.latitudeProperty', function() {
        var latitudeProperty = this.get('config.latitudeProperty');
        if (!latitudeProperty) {
            console.error('widget-model-map> not latitudeProperty found in config');
        }
        return this._getCoordinateTypePromise('latitude', latitudeProperty);
    }),

    longitudePromise: Ember.computed('config.longitudeProperty', function() {
        var longitudeProperty = this.get('config.longitudeProperty');
        if (!longitudeProperty) {
            console.error('widget-model-map> not longitudeProperty found in config');
        }
        return this._getCoordinateTypePromise('longitude', longitudeProperty);
    }),

    coordinatesPromise: Ember.computed('latitudePromise', 'longitudePromise', function() {
        var latitudePromise = this.get('latitudePromise');
        var longitudePromise = this.get('longitudePromise');
        return Ember.ObjectProxy.extend(Ember.PromiseProxyMixin).create({
            promise: Ember.RSVP.hash({
                latitude: latitudePromise,
                longitude: longitudePromise
            })
        });
    }),

    /** mapProvider
     * see http://leaflet-extras.github.io/leaflet-providers/preview/index.html for all
     * layer available
     */
    mapProvider: Ember.computed('config.mapProvider', function() {
        // ex: 'Esri.WorldImagery'
        return this.getWithDefault('config.mapProvider', 'MapQuestOpen.OSM');
    }),

    zoom: Ember.computed('config.zoom', function() {
        return this.getWithDefault('config.zoom', 5);
    }),

    minZoom: Ember.computed('config.minZoom', function() {
        return this.getWithDefault('config.minZoom', 2);
    }),

    maxZoom: Ember.computed('config.maxZoom', function() {
        return this.getWithDefault('config.maxZoom', 20);
    }),

    _map: null,

    hasCoordinates: Ember.computed(
        'coordinatesPromise.isFulfilled', 'coordinatesPromise.latitude',
        'coordinatesPromise.longitude', function() {
            if (this.get('coordinatesPromise.isFulfilled')) {
                return this.get('coordinatesPromise.latitude') && this.get('coordinatesPromise.longitude');
            }
            return false;
    }),

    renderMap: Ember.observer('coordinatesPromise.isFulfilled', 'mapProvider', function() {
        var map = this.get('_map');
        if (!map) {
            map = this.initializeMap();
            this.set('_map', map);
        } else {
            map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
        }

        var mapProvider = this.get('mapProvider');

        var pinIcon = L.icon({
            iconUrl: '/images/leaflet/marker-icon.png',
            iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
            iconAnchor: [12.5, 41] // needed to position the marker correctly
        });


        this.get('coordinatesPromise').then(function(coordinates) {
            var latitude = coordinates.latitude;
            var longitude = coordinates.longitude;
            if (latitude && longitude) {
                L.tileLayer.provider(mapProvider).addTo(map);
                let latLong = new L.LatLng(latitude, longitude);
                let marker = new L.marker(latLong, {icon: pinIcon});
                marker.addTo(map);
                map.panTo(latLong, {animate: true});
            }
        });
    }),

    initializeMap: function() {
        var zoom = this.get('zoom');
        var minZoom = this.get('minZoom');
        var maxZoom = this.get('maxZoom');

        var map = L.map(this.$('.panel-body')[0], {
            center: [20.0, 5.0],
            zoom: zoom,
            minZoom: minZoom,
            maxZoom: maxZoom
        });

        map.scrollWheelZoom.disable();

        return map;
    },

    tearDownMap: function() {
        if (this.get('_map')) {
            this.get('_map').remove();
            this.set('_map', null);
        }
    }.on('willDestroy')

});

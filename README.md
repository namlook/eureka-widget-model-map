# Eureka-widget-model-map

A widget that geolocalize an Eureka model. Usage:

    {
        type: 'model-map',

        // the model property name that represente the latitude
        latitudeProperty: 'latitude',

        // the model property name that represente the longitude
        longitudeProperty: 'longitude',

        // the panel header label
        label: null

        // the minimal zoom authorized
        minZoom: 2,

        // the zoom level when initializing the map
        zoom: 5
    }

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

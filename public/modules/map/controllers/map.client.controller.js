'use strict';

angular.module('map').controller('MapController', ['$scope', 'Authentication', 'ApiKeys', '$http', 'CensusDataService',
    function ($scope, Authentication, ApiKeys, $http, CensusDataService) {

        $scope.markers = true;
        $scope.filters = true;

        $scope.censusDataTractLayer = true;
        $scope.googlePlacesLayer = false;

        var toggleProjectDetails = true;
        $scope.toggleDetails = true;

        //style the polygon tracts
        var style = {
            'stroke': true,
            'clickable': true,
            'color': "#00D",
            'fillColor': "#00D",
            'weight': 1.0,
            'opacity': 0.2,
            'fillOpacity': 0.0,
            'className': ''  //String that sets custom class name on an element
        };
        var hoverStyle = {
            'color': "#00D",
            "fillOpacity": 0.5,
            'weight': 1.0,
            'opacity': 0.2,
            'className': ''  //String that sets custom class name on an element
        };
        var hoverOffset = new L.Point(30, -16);


        var censusTractData = null;

        //console.log(CensusDataService.callCensusApi());

        CensusDataService.callCensusApi()
            //console.log(CensusDataService.callCensusApi());
            .success(function (censusData) {
                censusPopulationData(censusData);
                //console.log(censusData);
            });

        var censusPopulationData = function () {
            //write code to overlay tract data with correct tract polygon
        };

        ApiKeys.getApiKeys()
            .success(function (data) {
                mapFunction(data.mapboxKey, data.mapboxSecret);

            })
            .error(function (data, status) {
                alert('Failed to load Mapbox API key. Status: ' + status);
            });

        var mapFunction = function (key, accessToken) {

            //creates a Mapbox Map
            L.mapbox.accessToken = accessToken;

            //'info' id is part of creating tooltip with absolute position
            var info = document.getElementById('info');

            var map = L.mapbox.map('map')
                .setView([40.773, -111.902], 12)
                //allow users to share maps on social media
                // source: https://www.mapbox.com/mapbox.js/api/v2.1.5/l-mapbox-sharecontrol/
                .addControl(L.mapbox.shareControl())
                .addControl(L.mapbox.geocoderControl('mapbox.places'));

            L.control.layers({
                'Main Map': L.mapbox.tileLayer('poetsrock.la999il2').addTo(map),
                'Topo Map': L.mapbox.tileLayer('poetsrock.la97f747'),
                'Green Map': L.mapbox.tileLayer('poetsrock.jdgpalp2')
            }, {
                //this is where you would add optional tilelayers. This sedction is required,
                //even if no tileLayers are present.
                //'Tract Boundaries': L.mapbox.tileLayer('examples.bike-lanes'),
            }).addTo(map);



            //get the json file on the backend (/config/env/) for the Census Tract Data
            var tractData = $http.get('/tractData')
                .success(function (tractGeoJson) {
                    tractDataLayer(tractGeoJson);
                })
                .error(function (tractErrorData) {
                }
            );

            var tractDataLayer = function (tractGeoJson) {
                censusTractData = L.geoJson(tractGeoJson, {
                        style: style,
                        onEachFeature: function (feature, layer) {
                            if (feature.properties) {
                                //console.log('feature.properties: ', feature.properties);
                                var popupString = '<div class="popup">';
                                for (var k in feature.properties) {
                                    var v = feature.properties[k];
                                    popupString += k + ': ' + v + '<br />';
                                }
                                popupString += '</div>';
                                layer.bindPopup(popupString);
                            }
                            if (!(layer instanceof L.Point)) {
                                layer.on('mouseover', function () {
                                    layer.setStyle(hoverStyle);
                                    //layer.setStyle(hoverOffset);
                                });
                                layer.on('mouseout', function () {
                                    layer.setStyle(style);
                                    //layer.setStyle(hoverOffset);
                                });
                            }

                        }
                    }
                );
                censusTractData.addTo(map);
            };



            L.mapbox.featureLayer({
                // this feature is in the GeoJSON format: see geojson.org
                // for the full specification
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    // coordinates here are in longitude, latitude order because
                    // x, y is the standard for GeoJSON and many formats
                    coordinates: [
                        -111.902,
                        40.773
                    ]
                },
                properties: {
                    title: 'Peregrine Espresso',
                    description: '1718 14th St NW, Washington, DC',
                    // one can customize markers by adding simplestyle properties
                    // https://www.mapbox.com/guides/an-open-platform/#simplestyle
                    'marker-size': 'large',
                    'marker-color': '#BE9A6B',
                    'marker-symbol': 'cafe'
                }
            })
                .on('click', function () {
                    if (toggleProjectDetails === true) {
                        setStyle({
                            className: 'test'
                        });
                    }else{
                        layer.setStyle({
                            className: 'test-2'
                        });
                    }
                    //if (toggleProjectDetails === true) {
                    //    document.getElementById('map').style.width='80%';
                    //    document.getElementById('map').style.transition = 'all 0.7s ease';
                    //    document.getElementById('filters').style.right='384px';
                    //    document.getElementById('filters').style.transition = 'all 0.7s ease';
                    //    document.getElementById('sidebar-view').style.display='block';
                    //    document.getElementById('sidebar-view').style.transition = 'all 0.7s ease';
                    //    toggleProjectDetails = false;
                    //} else {
                    //    document.getElementById('map').style.width='100%';
                    //    document.getElementById('filters').style.right='0';
                    //    document.getElementById('sidebar-view').style.display='block inline';
                    //    document.getElementById('sidebar-view').style.transition = 'all 0.7s ease';
                    //    toggleProjectDetails = true;
                    //}
                })
                .addTo(map);




            var dataBoxStaticPopup = L.mapbox.featureLayer().addTo(map);

            var geoJson = [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-111.902, 40.783]
                    },
                    properties: {
                        title: 'Marker one',
                        description: '<em>Wow</em>, this tooltip is breaking all the rules.',
                        'marker-color': '#548cba'
                    }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-111.922, 40.773]
                    },
                    properties: {
                        title: 'Marker two',
                        description: 'Another marker, including <a href="http://mapbox.com">a link</a>.',
                        'marker-color': '#548cba'
                    }
                }
            ];

            //onEachFeature-function: if(feature.properties.name=='Montana') {console.log(feature.id); }

            dataBoxStaticPopup.setGeoJSON(geoJson);

            // Listen for individual marker clicks.
            dataBoxStaticPopup.on('mouseover', function (e) {
                // Force the popup closed.
                e.layer.closePopup();

                var feature = e.layer.feature;
                var content = '<div><strong>' + feature.properties.title + '</strong>' +
                    '<p>' + feature.properties.description + '</p></div>';

                info.innerHTML = content;

            });

            ////the below line of code centers the map when the marker is clicked
            ////source: https://www.mapbox.com/mapbox.js/example/v1.0.0/centering-markers/
            //map.panTo(e.layer.getLatLng());


            // Clear the tooltip when map is clicked.
            map.on('move', empty);

            // Trigger empty contents when the script
            // has loaded on the page.
            empty();

            function empty() {
                info.innerHTML = '<div><strong>Click a marker</strong></div>';
            }


            //create toggle/filter functionality for Census Tract Data
            $scope.toggleCensusData = function () {
                if ($scope.censusDataTractLayer) {
                    map.removeLayer(censusTractData);
                    map.removeLayer(dataBoxStaticPopup);
                    //map.removeLayer(markers);
                } else {
                    map.addLayer(censusTractData);
                    map.addLayer(dataBoxStaticPopup);
                    //map.addLayer(markers);
                }
            };

            //Google Places API
            var googlePlacesMarker = null;
            var googlePlacesMarkerLayer = null;
            var googlePlacesMarkerArray = [];

            var googlePlacesData = function () {
                $http.get('/places').success(function (poiData) {

                    var placeLength = poiData.results.length;
                    for (var place = 0; place < placeLength; place++) {

                        var mapLat = poiData.results[place].geometry.location.lat;
                        var mapLng = poiData.results[place].geometry.location.lng;
                        var mapTitle = poiData.results[place].name;

                        googlePlacesMarker = L.marker([mapLat, mapLng]).toGeoJSON();

                        googlePlacesMarkerArray.push(googlePlacesMarker);
                    } //end of FOR loop

                    googlePlacesMarkerLayer = L.geoJson(googlePlacesMarkerArray, {
                        style: function (feature) {
                            return {
                                'title': mapTitle,
                                'marker-size': 'large',
                                //'marker-symbol': mapSymbol(),
                                'marker-symbol': 'marker',
                                'marker-color': '#00295A',
                                'riseOnHover': true,
                                'riseOffset': 250,
                                'opacity': 0.5,
                                'clickable': true
                            }
                        }
                    })
                        .addTo(map);
                    console.log('googlePlacesMarkerLayer: ', googlePlacesMarkerLayer);
                    console.log('googlePlacesMarkerArray: ', googlePlacesMarkerArray);

                });

            };

            $scope.toggleGooglePlacesData = function () {
                if ($scope.googlePlacesLayer) {
                    map.addLayer(googlePlacesData());
                    //map.removeLayer(googlePlacesData());
                } else {
                    //map.addLayer(googlePlacesMarkerLayer);
                    map.removeLayer(googlePlacesMarkerLayer);

                }
            };

        };
    }
]);
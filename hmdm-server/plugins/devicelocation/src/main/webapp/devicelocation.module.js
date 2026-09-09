// Device Tracking plugin.
//
// Where the positions come from
// -----------------------------
// The launcher already reports its last known fix, and the server already turns that into
// a DeviceLocationUpdatedEvent - twice over, in fact: once per sync from the device info
// payload, and once per batch from the deviceinfo plugin's dynamic data upload. This plugin
// listens to the event, so it does not care which path a position took.
//
// How often
// ---------
// Two levers, both per device rather than per fleet:
//   * requestUpdates in the sync response decides whether the launcher collects a fix at all
//   * the deviceinfo plugin's interval decides how often it uploads
// In normal operation both come from account settings - a few times a day is all a working
// fleet needs. A device reported lost overrides both, for as long as the flag is set.
//
// Why so few points are kept
// --------------------------
// These are health workers' devices. A long history of where a named person has been is a
// liability rather than a feature, so the default is the last five positions, trimmed on
// every insert. A lost device is the exception, because that history is the entire point.

angular.module('plugin-devicelocation', ['ngResource', 'ui.bootstrap', 'ui.router', 'ncy-angular-breadcrumb'])
    .config(function ($stateProvider) {
        try {
            $stateProvider.state('plugin-devicelocation', {
                url: "/" + 'plugin-devicelocation/{deviceNumber}',
                params: {
                    deviceNumber: {value: null, squash: true}
                },
                templateUrl: 'app/components/main/view/content.html',
                controller: 'TabController',
                ncyBreadcrumb: {
                    label: '{{"breadcrumb.plugin.devicelocation.main" | localize}}'
                },
                resolve: {
                    openTab: function () { return 'plugin-devicelocation'; }
                }
            });
        } catch (e) {
            console.log('An error when adding state plugin-devicelocation', e);
        }

        try {
            $stateProvider.state('plugin-settings-devicelocation', {
                url: "/" + 'plugin-settings-devicelocation',
                templateUrl: 'app/components/main/view/content.html',
                controller: 'TabController',
                ncyBreadcrumb: {
                    label: '{{"breadcrumb.plugin.devicelocation.settings" | localize}}'
                },
                resolve: {
                    openTab: function () { return 'plugin-settings-devicelocation'; }
                }
            });
        } catch (e) {
            console.log('An error when adding state plugin-settings-devicelocation', e);
        }
    })

    /**
     * Loads the vendored Leaflet build on demand.
     *
     * A plugin cannot add tags to index.html, and loading a mapping library on every page
     * of the panel to serve one tab would be rude. This injects the CSS and the script the
     * first time the map is opened and hands back a promise that every later caller shares.
     */
    .factory('leafletLoader', function ($q, $document, $window) {
        var base = 'app/components/plugins/devicelocation/lib/leaflet/';
        var promise = null;

        return {
            load: function () {
                if (promise) {
                    return promise;
                }
                var deferred = $q.defer();

                if ($window.L) {
                    deferred.resolve($window.L);
                    promise = deferred.promise;
                    return promise;
                }

                var head = $document[0].getElementsByTagName('head')[0];

                var css = $document[0].createElement('link');
                css.rel = 'stylesheet';
                css.href = base + 'leaflet.css';
                head.appendChild(css);

                var script = $document[0].createElement('script');
                script.src = base + 'leaflet.js';
                script.onload = function () {
                    if ($window.L) {
                        deferred.resolve($window.L);
                    } else {
                        deferred.reject('loaded but window.L is missing');
                    }
                };
                script.onerror = function () {
                    deferred.reject('could not load ' + base + 'leaflet.js');
                };
                head.appendChild(script);

                promise = deferred.promise;
                return promise;
            }
        };
    })

    .factory('pluginDeviceLocationService', function ($resource) {
        return $resource('', {}, {
            map: {url: 'rest/plugins/devicelocation/private/map', method: 'GET'},
            history: {url: 'rest/plugins/devicelocation/private/device/:number',
                      method: 'GET', params: {number: '@number'}},
            clearHistory: {url: 'rest/plugins/devicelocation/private/device/:number',
                           method: 'DELETE', params: {number: '@number'}},
            reportLost: {url: 'rest/plugins/devicelocation/private/lost/:number',
                         method: 'POST', params: {number: '@number'}},
            reportFound: {url: 'rest/plugins/devicelocation/private/found/:number',
                          method: 'POST', params: {number: '@number'}},
            getSettings: {url: 'rest/plugins/devicelocation/private/settings', method: 'GET'},
            saveSettings: {url: 'rest/plugins/devicelocation/private/settings', method: 'PUT'}
        });
    })

    .controller('PluginDevicelocationTabController',
        function ($scope, $rootScope, $stateParams, $timeout, $interval,
                  pluginDeviceLocationService, leafletLoader, confirmModal, authService,
                  localization) {

        $scope.hasPermission = authService.hasPermission;
        $rootScope.settingsTabActive = false;
        $rootScope.pluginsTabActive = true;

        $scope.points = [];
        $scope.lost = [];
        $scope.selected = null;
        $scope.trail = [];
        $scope.errorMessage = null;
        $scope.successMessage = null;
        $scope.mapError = null;
        $scope.deviceCount = 0;
        $scope.devicesWithoutLocation = 0;
        $scope.keepPoints = 5;
        $scope.diagnostics = {};

        // Remembered per browser: someone who has read the explanation and is working
        // through it should not have to scroll past it on every visit. Wrapped because
        // storage throws outright in some privacy modes.
        var BANNER_KEY = 'hmdm.devicelocation.coverageBannerCollapsed';
        try {
            $scope.bannerCollapsed = window.localStorage.getItem(BANNER_KEY) === '1';
        } catch (e) {
            $scope.bannerCollapsed = false;
        }
        $scope.toggleBanner = function () {
            $scope.bannerCollapsed = !$scope.bannerCollapsed;
            try {
                window.localStorage.setItem(BANNER_KEY, $scope.bannerCollapsed ? '1' : '0');
            } catch (e) {
                // not fatal - it just will not be remembered next time
            }
        };

        var map = null;
        var L = null;
        var markerLayer = null;
        var trailLayer = null;
        var tileUrl = null;
        var tileAttribution = null;

        var clearMessages = function () {
            $scope.errorMessage = null;
            $scope.successMessage = null;
        };

        var requestFailed = function () {
            $scope.errorMessage = localization.localize('error.request.failure');
        };

        var showResponseError = function (response) {
            $scope.errorMessage = localization.localizeServerResponse(response);
        };

        $scope.hasPosition = function (point) {
            return !!point && point.lat !== null && point.lat !== undefined
                && point.lon !== null && point.lon !== undefined;
        };

        $scope.age = function (point) {
            if (!point || !point.ts) {
                return localization.localize('plugin.devicelocation.age.never');
            }
            var mins = Math.round((Date.now() - point.ts) / 60000);
            if (mins < 1) {
                return localization.localize('plugin.devicelocation.age.now');
            }
            if (mins < 60) {
                return localization.localize('plugin.devicelocation.age.mins')
                    .replace('${n}', mins);
            }
            var hours = Math.round(mins / 60);
            if (hours < 48) {
                return localization.localize('plugin.devicelocation.age.hours')
                    .replace('${n}', hours);
            }
            return localization.localize('plugin.devicelocation.age.days')
                .replace('${n}', Math.round(hours / 24));
        };

        $scope.isLost = function (deviceNumber) {
            return $scope.lost.some(function (l) { return l.deviceNumber === deviceNumber; });
        };

        // ------------------------------------------------------------------- map

        var ensureMap = function () {
            if (map) {
                return true;
            }
            var el = document.getElementById('devicelocation-map');
            if (!el || !L) {
                return false;
            }
            map = L.map(el).setView([8.4606, -11.7799], 7);   // Sierra Leone, a sane default
            L.tileLayer(tileUrl || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: tileAttribution || '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            markerLayer = L.layerGroup().addTo(map);
            trailLayer = L.layerGroup().addTo(map);
            return true;
        };

        var drawMarkers = function () {
            if (!ensureMap()) {
                return;
            }
            markerLayer.clearLayers();

            var bounds = [];
            $scope.points.forEach(function (p) {
                if (p.lat === null || p.lat === undefined
                        || p.lon === null || p.lon === undefined) {
                    return;   // a device we have never had a position from
                }
                var marker = L.circleMarker([p.lat, p.lon], {
                    radius: p.lost ? 10 : 7,
                    color: p.lost ? '#b30000' : '#1f5fa9',
                    fillColor: p.lost ? '#e04545' : '#4a90d9',
                    fillOpacity: 0.85,
                    weight: 2
                });
                marker.bindPopup(
                    '<strong>' + escapeHtml(p.deviceNumber) + '</strong><br/>' +
                    escapeHtml($scope.age(p)) +
                    (p.lost ? '<br/><span style="color:#b30000">'
                            + escapeHtml(localization.localize('plugin.devicelocation.marker.lost'))
                            + '</span>' : ''));
                marker.on('click', function () {
                    $scope.$apply(function () { $scope.select(p.deviceNumber); });
                });
                marker.addTo(markerLayer);
                bounds.push([p.lat, p.lon]);
            });

            if (bounds.length > 0) {
                map.fitBounds(bounds, {padding: [40, 40], maxZoom: 15});
            }
            // The container is sized by CSS after Angular renders it; without this the tiles
            // lay out against a zero-height box and the map appears as a grey strip.
            $timeout(function () { if (map) { map.invalidateSize(); } }, 100);
        };

        var drawTrail = function () {
            if (!ensureMap() || !trailLayer) {
                return;
            }
            trailLayer.clearLayers();
            var line = $scope.trail
                .filter(function (p) { return p.lat !== null && p.lon !== null; })
                .map(function (p) { return [p.lat, p.lon]; });
            if (line.length > 1) {
                L.polyline(line, {color: '#b30000', weight: 3, opacity: 0.7, dashArray: '6 4'})
                    .addTo(trailLayer);
            }
            if (line.length > 0) {
                map.fitBounds(line, {padding: [40, 40], maxZoom: 16});
            }
        };

        var escapeHtml = function (s) {
            return ('' + (s === null || s === undefined ? '' : s))
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };

        // --------------------------------------------------------------- loading

        $scope.load = function () {
            pluginDeviceLocationService.map(function (response) {
                if (response.status === 'OK') {
                    $scope.points = response.data.points || [];
                    $scope.lost = response.data.lost || [];
                    $scope.deviceCount = response.data.deviceCount || 0;
                    $scope.devicesWithoutLocation = response.data.devicesWithoutLocation || 0;
                    $scope.keepPoints = response.data.keepPoints || 5;
                    $scope.diagnostics = response.data.diagnostics || {};
                    tileUrl = response.data.tileUrl;
                    tileAttribution = response.data.tileAttribution;

                    leafletLoader.load().then(function (lib) {
                        L = lib;
                        $scope.mapError = null;
                        drawMarkers();
                        if ($scope.selected) {
                            drawTrail();
                        }
                    }, function (reason) {
                        // Say it plainly. A blank rectangle where a map should be is the
                        // kind of failure that gets diagnosed as "the plugin is broken".
                        $scope.mapError = localization
                            .localize('plugin.devicelocation.error.map')
                            .replace('${reason}', reason);
                    });
                } else {
                    showResponseError(response);
                }
            }, requestFailed);
        };

        $scope.select = function (deviceNumber) {
            clearMessages();
            $scope.selected = deviceNumber;
            pluginDeviceLocationService.history({number: deviceNumber}, function (response) {
                if (response.status === 'OK') {
                    $scope.trail = response.data.points || [];
                    drawTrail();
                } else {
                    showResponseError(response);
                }
            }, requestFailed);
        };

        $scope.clearSelection = function () {
            $scope.selected = null;
            $scope.trail = [];
            if (trailLayer) {
                trailLayer.clearLayers();
            }
            drawMarkers();
        };

        // ------------------------------------------------------------- lost/found

        $scope.reportLost = function (deviceNumber) {
            clearMessages();
            confirmModal.getUserConfirmation(
                localization.localize('plugin.devicelocation.confirm.lost')
                    .replace('${name}', deviceNumber),
                function () {
                    pluginDeviceLocationService.reportLost({number: deviceNumber}, {},
                        function (response) {
                            if (response.status === 'OK') {
                                $scope.successMessage = localization
                                    .localize('plugin.devicelocation.lost.reported')
                                    .replace('${name}', deviceNumber);
                                $scope.load();
                            } else {
                                showResponseError(response);
                            }
                        }, requestFailed);
                });
        };

        $scope.reportFound = function (deviceNumber) {
            clearMessages();
            pluginDeviceLocationService.reportFound({number: deviceNumber}, {},
                function (response) {
                    if (response.status === 'OK') {
                        $scope.successMessage = localization
                            .localize('plugin.devicelocation.found.reported')
                            .replace('${name}', deviceNumber);
                        $scope.load();
                    } else {
                        showResponseError(response);
                    }
                }, requestFailed);
        };

        $scope.clearHistory = function (deviceNumber) {
            clearMessages();
            confirmModal.getUserConfirmation(
                localization.localize('plugin.devicelocation.confirm.clear')
                    .replace('${name}', deviceNumber),
                function () {
                    pluginDeviceLocationService.clearHistory({number: deviceNumber},
                        function (response) {
                            if (response.status === 'OK') {
                                $scope.successMessage = localization
                                    .localize('plugin.devicelocation.history.cleared');
                                $scope.trail = [];
                                if (trailLayer) { trailLayer.clearLayers(); }
                                $scope.load();
                            } else {
                                showResponseError(response);
                            }
                        }, requestFailed);
                });
        };

        // A lost device reports every couple of minutes, so the map is worth refreshing
        // while someone is watching it. Cancelled on destroy - an interval that outlives
        // its scope keeps firing requests for a page nobody is looking at.
        var refresh = $interval(function () { $scope.load(); }, 60 * 1000);
        $scope.$on('$destroy', function () {
            if (refresh) { $interval.cancel(refresh); }
            if (map) { map.remove(); map = null; }
        });

        $scope.load();
        if ($stateParams.deviceNumber) {
            $scope.select($stateParams.deviceNumber);
        }
    })

    .controller('PluginDevicelocationSettingsController',
        function ($scope, $rootScope, pluginDeviceLocationService, authService, localization) {

        $scope.hasPermission = authService.hasPermission;
        $scope.settings = {};
        $scope.errorMessage = null;
        $scope.successMessage = null;

        var requestFailed = function () {
            $scope.errorMessage = localization.localize('error.request.failure');
        };

        $scope.load = function () {
            pluginDeviceLocationService.getSettings(function (response) {
                if (response.status === 'OK') {
                    $scope.settings = response.data;
                } else {
                    $scope.errorMessage = localization.localizeServerResponse(response);
                }
            }, requestFailed);
        };

        $scope.save = function () {
            $scope.errorMessage = null;
            $scope.successMessage = null;
            pluginDeviceLocationService.saveSettings($scope.settings, function (response) {
                if (response.status === 'OK') {
                    $scope.settings = response.data;
                    $scope.successMessage =
                        localization.localize('plugin.devicelocation.settings.saved');
                } else {
                    $scope.errorMessage = localization.localizeServerResponse(response);
                }
            }, requestFailed);
        };

        $scope.load();
    })

    .run(function ($rootScope, $location, localization) {
        $rootScope.$on('plugin-devicelocation-device-selected', function (event, device) {
            $location.url('/plugin-devicelocation/' + device.number);
        });
        localization.loadPluginResourceBundles("devicelocation");
    });

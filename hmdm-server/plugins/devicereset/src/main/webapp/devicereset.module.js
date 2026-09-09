angular.module('plugin-devicereset', ['ngResource', 'ui.bootstrap', 'ui.router', 'ncy-angular-breadcrumb'])
    .config(function ($stateProvider) {
        try {
            $stateProvider.state('plugin-devicereset', {
                url: "/" + 'plugin-devicereset',
                templateUrl: 'app/components/main/view/content.html',
                controller: 'TabController',
                ncyBreadcrumb: {
                    label: '{{"breadcrumb.plugin.devicereset.main" | localize}}'
                },
                resolve: {
                    openTab: function () {
                        return 'plugin-devicereset';
                    }
                }
            });
        } catch (e) {
            console.log('An error when adding state plugin-devicereset', e);
        }
    })
    .factory('pluginDeviceResetService', function ($resource) {
        return $resource('', {}, {
            resetPin: {url: 'rest/plugins/devicereset/private/reset', method: 'POST'},
            history: {url: 'rest/plugins/devicereset/private/history', method: 'GET'},
            reboot: {url: 'rest/plugins/devicereset/private/reboot', method: 'POST'},
            commands: {url: 'rest/plugins/devicereset/private/commands', method: 'GET'},
            factoryReset: {url: 'rest/plugins/devicereset/private/factoryreset', method: 'POST'},
            lock: {url: 'rest/plugins/devicereset/private/lock', method: 'POST'},
            unlock: {url: 'rest/plugins/devicereset/private/unlock', method: 'POST'},
            locked: {url: 'rest/plugins/devicereset/private/locked', method: 'GET'},
            deviceStatus: {url: 'rest/plugins/devicereset/private/status/:number', method: 'GET',
                           params: {number: '@number'}},
            lookupDevices: {url: 'rest/private/devices/autocomplete', method: 'POST'}
        });
    })
    .filter('deviceResetStatus', function () {
        return function (input) {
            switch (input) {
                case 0: return 'plugin.devicereset.status.pending';
                case 1: return 'plugin.devicereset.status.delivered';
                case 2: return 'plugin.devicereset.status.confirmed';
            }
        };
    })
    .controller('PluginDeviceresetTabController',
        function ($scope, $rootScope, $location, pluginDeviceResetService, confirmModal,
                  authService, localization) {

        $scope.hasPermission = authService.hasPermission;

        $rootScope.settingsTabActive = false;
        $rootScope.pluginsTabActive = true;

        // The device list emits plugin-devicereset-device-selected and routes here
        // with ?deviceNumber=..., so arrive with the device already filled in.
        $scope.request = { deviceNumber: $location.search().deviceNumber || '', pinLength: 6 };
        $scope.generatedPin = null;
        $scope.generatedFor = null;
        $scope.errorMessage = null;
        $scope.working = false;
        $scope.history = [];
        $scope.commands = [];
        $scope.rebootQueued = null;
        $scope.actionResult = null;
        $scope.lockedDevices = [];
        $scope.lockMessage = '';
        $scope.confirmDeviceNumber = '';
        $scope.deviceStatus = null;

        $scope.getDevices = function (val) {
            return pluginDeviceResetService.lookupDevices({value: val}).$promise.then(function (response) {
                if (response.status === 'OK') {
                    return response.data.map(function (device) { return device.name; });
                }
                return [];
            });
        };

        $scope.loadCommands = function () {
            pluginDeviceResetService.commands(function (response) {
                if (response.status === 'OK') {
                    $scope.commands = response.data;
                }
            });
        };

        // The device confirms a reboot BEFORE rebooting, so "acknowledged" is the
        // strongest signal we get - there is nobody to report back afterwards.
        $scope.rebootDevice = function () {
            $scope.errorMessage = null;
            $scope.rebootQueued = null;
        $scope.actionResult = null;
        $scope.lockedDevices = [];
        $scope.lockMessage = '';
        $scope.confirmDeviceNumber = '';
        $scope.deviceStatus = null;

            if (!$scope.request.deviceNumber) {
                $scope.errorMessage = localization.localize('plugin.devicereset.error.device.required');
                return;
            }

            // confirmModal is the panel's own dialog - same look as every other
            // confirmation in the app, and it does not block the browser.
            confirmModal.getUserConfirmation(
                localization.localize('plugin.devicereset.confirm.reboot')
                    .replace('{{device}}', $scope.request.deviceNumber),
                function () {
                    doReboot($scope.request.deviceNumber);
                },
                'plugin.devicereset.button.reboot');
        };

        var doReboot = function (deviceNumber) {
            $scope.working = true;
            pluginDeviceResetService.reboot({deviceNumber: deviceNumber},
                function (response) {
                    $scope.working = false;
                    if (response.status === 'OK') {
                        $scope.rebootQueued = response.data.deviceNumber;
                        $scope.loadCommands();
                    } else {
                        $scope.errorMessage = localization.localizeServerResponse(response);
                    }
                }, function () {
                    $scope.working = false;
                    $scope.errorMessage = localization.localizeServerResponse('error.request.failure');
                });
        };

        // Checked whenever the device number changes, so an admin sees "not found"
        // or "locked" before they click anything rather than after.
        $scope.checkDevice = function () {
            var number = $scope.request.deviceNumber;
            if (!number) {
                $scope.deviceStatus = null;
                return;
            }
            pluginDeviceResetService.deviceStatus({number: number}, function (response) {
                if (response.status === 'OK') {
                    $scope.deviceStatus = response.data;
                } else {
                    $scope.deviceStatus = null;
                }
            }, function () {
                $scope.deviceStatus = null;
            });
        };

        $scope.$watch('request.deviceNumber', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.checkDevice();
            }
        });

        $scope.loadLocked = function () {
            pluginDeviceResetService.locked(function (response) {
                if (response.status === 'OK') {
                    $scope.lockedDevices = response.data;
                }
            });
        };

        var runAction = function (call, payload, successKey) {
            $scope.working = true;
            $scope.errorMessage = null;
            $scope.actionResult = null;
            call(payload, function (response) {
                $scope.working = false;
                if (response.status === 'OK') {
                    $scope.actionResult = localization.localize(successKey)
                        .replace('{{device}}', response.data.deviceNumber);
                    $scope.loadCommands();
                    $scope.loadLocked();
                    $scope.checkDevice();
                } else {
                    $scope.errorMessage = localization.localizeServerResponse(response);
                }
            }, function () {
                $scope.working = false;
                $scope.errorMessage = localization.localizeServerResponse('error.request.failure');
            });
        };

        $scope.lockDevice = function () {
            if (!$scope.request.deviceNumber) {
                $scope.errorMessage = localization.localize('plugin.devicereset.error.device.required');
                return;
            }
            runAction(pluginDeviceResetService.lock,
                {deviceNumber: $scope.request.deviceNumber, message: $scope.lockMessage},
                'plugin.devicereset.result.locked');
        };

        $scope.unlockDevice = function (deviceNumber) {
            runAction(pluginDeviceResetService.unlock,
                {deviceNumber: deviceNumber || $scope.request.deviceNumber},
                'plugin.devicereset.result.unlocked');
        };

        // Irreversible: gated by a separate permission server-side, and the admin must
        // retype the device number before the confirmation dialog even appears.
        $scope.factoryResetDevice = function () {
            $scope.errorMessage = null;

            if (!$scope.request.deviceNumber) {
                $scope.errorMessage = localization.localize('plugin.devicereset.error.device.required');
                return;
            }
            if ($scope.confirmDeviceNumber !== $scope.request.deviceNumber) {
                $scope.errorMessage = localization.localize('plugin.devicereset.error.confirm.mismatch');
                return;
            }

            confirmModal.getUserConfirmation(
                localization.localize('plugin.devicereset.confirm.factoryreset')
                    .replace('{{device}}', $scope.request.deviceNumber),
                function () {
                    runAction(pluginDeviceResetService.factoryReset,
                        {deviceNumber: $scope.request.deviceNumber,
                         confirmDeviceNumber: $scope.confirmDeviceNumber},
                        'plugin.devicereset.result.wiping');
                    $scope.confirmDeviceNumber = '';
        $scope.deviceStatus = null;
                },
                'plugin.devicereset.button.factoryreset');
        };

        $scope.loadHistory = function () {
            pluginDeviceResetService.history(function (response) {
                if (response.status === 'OK') {
                    $scope.history = response.data;
                }
            });
        };

        $scope.resetPin = function () {
            $scope.errorMessage = null;
            $scope.generatedPin = null;

            if (!$scope.request.deviceNumber) {
                $scope.errorMessage = localization.localize('plugin.devicereset.error.device.required');
                return;
            }

            $scope.working = true;
            pluginDeviceResetService.resetPin($scope.request, function (response) {
                $scope.working = false;
                if (response.status === 'OK') {
                    $scope.generatedPin = response.data.pin;
                    $scope.generatedFor = response.data.deviceNumber;
                    $scope.loadHistory();
                } else {
                    $scope.errorMessage = localization.localizeServerResponse(response);
                }
            }, function () {
                $scope.working = false;
                $scope.errorMessage = localization.localizeServerResponse('error.request.failure');
            });
        };

        $scope.dismissPin = function () {
            $scope.generatedPin = null;
            $scope.generatedFor = null;
        };

        $scope.loadHistory();
        $scope.loadCommands();
        $scope.loadLocked();
        $scope.checkDevice();
    })
    .run(function ($rootScope, $location, localization) {
        $rootScope.$on('plugin-devicereset-device-selected', function (event, device) {
            $location.url('/plugin-devicereset?deviceNumber=' + device.number);
        });
        localization.loadPluginResourceBundles("devicereset");
    });

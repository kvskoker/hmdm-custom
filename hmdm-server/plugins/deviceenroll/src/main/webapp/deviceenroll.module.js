// Device Enrollment plugin.
//
// One rule per group; several groups may share one configuration.
//
// The QR code a device scans is built from two things: the configuration's qrCodeKey in
// the path, and "?create=1&group=<id>" in the query. The first tells a factory-reset device
// which launcher to install and which configuration to adopt; the second tells the server
// which group to put the new device in. The core panel's own QR page emits exactly this.
//
// So the configuration is shared - one set of applications maintained in one place - and
// the group is what varies per location. That is why the rule hangs off the group.

angular.module('plugin-deviceenroll', ['ngResource', 'ui.bootstrap', 'ui.router', 'ncy-angular-breadcrumb'])
    .config(function ($stateProvider) {
        try {
            $stateProvider.state('plugin-deviceenroll', {
                url: "/" + 'plugin-deviceenroll',
                templateUrl: 'app/components/main/view/content.html',
                controller: 'TabController',
                ncyBreadcrumb: {
                    label: '{{"breadcrumb.plugin.deviceenroll.main" | localize}}'
                },
                resolve: {
                    openTab: function () { return 'plugin-deviceenroll'; }
                }
            });
        } catch (e) {
            console.log('An error when adding state plugin-deviceenroll', e);
        }
    })
    .factory('pluginDeviceEnrollService', function ($resource) {
        return $resource('', {}, {
            rules: {url: 'rest/plugins/deviceenroll/private/rules', method: 'GET'},
            saveRule: {url: 'rest/plugins/deviceenroll/private/rules?groupName=:groupName',
                       method: 'POST', params: {groupName: '@groupName'}},
            overwriteRule: {url: 'rest/plugins/deviceenroll/private/rules?overwrite=true&groupName=:groupName',
                            method: 'POST', params: {groupName: '@groupName'}},
            deleteRule: {url: 'rest/plugins/deviceenroll/private/rules/:id',
                         method: 'DELETE', params: {id: '@id'}},
            assignments: {url: 'rest/plugins/deviceenroll/private/assignments', method: 'GET'}
        });
    })
    .controller('PluginDeviceenrollTabController',
        function ($scope, $rootScope, pluginDeviceEnrollService, configurationService,
                  groupService, confirmModal, authService, localization) {

        $scope.hasPermission = authService.hasPermission;
        $rootScope.settingsTabActive = false;
        $rootScope.pluginsTabActive = true;

        $scope.rules = [];
        $scope.assignments = [];
        $scope.configurations = [];
        $scope.groups = [];
        $scope.errorMessage = null;
        $scope.successMessage = null;
        $scope.working = false;

        var GROUP_NEW = '__new__';
        $scope.GROUP_NEW = GROUP_NEW;

        var emptyForm = function () {
            return {
                id: null,
                groupChoice: GROUP_NEW,
                newGroupName: '',
                configurationId: null,
                prefix: '',
                digits: 3,
                nextSeq: 1,
                enabled: true
            };
        };

        $scope.form = emptyForm();

        var clearMessages = function () {
            $scope.errorMessage = null;
            $scope.successMessage = null;
        };

        // Every $resource call passes an error callback. Without one, a failed request
        // rejects a promise nobody is holding, and AngularJS logs "Possibly unhandled
        // rejection" instead of anything that says what failed.
        var requestFailed = function () {
            $scope.working = false;
            $scope.errorMessage = localization.localize('error.request.failure');
        };

        var showResponseError = function (response) {
            $scope.working = false;
            $scope.errorMessage = localization.localizeServerResponse(response);
        };

        // ---------------------------------------------------------------- display

        // create=1 is what puts com.hmdm.CONFIG in the QR payload, and group=<id> is what
        // puts com.hmdm.GROUP there. Without create=1 the device falls back to the global
        // "create new devices" setting and this rule never applies.
        //
        // useId=serial emits com.hmdm.DEVICE_ID_USE, and that is what stops the launcher
        // asking the technician to type a device ID. MainActivity tries
        // SystemUtils.autoSetDeviceId() first and only shows the dialog when it returns
        // false, so with this set the device enrols under its serial unattended - and
        // AutoNumberSyncHook renames it to this rule's next number on the first sync.
        // Without it the launcher falls back to BuildConfig.DEVICE_ID_CHOICE, which is
        // "user": one prompt per device, 647 times.
        //
        // A handset that will not report a serial (Build.getSerial() is restricted on
        // some Android 10+ devices) still prompts. That is a fallback, not a failure:
        // whatever is typed is replaced by the rule's number on the first sync.
        $scope.qrUrl = function (rule) {
            if (!rule || !rule.qrCodeKey) {
                return null;
            }
            return 'rest/public/qr/' + rule.qrCodeKey
                 + '?create=1&group=' + rule.groupId + '&useId=serial&size=260';
        };

        var pad = function (value, digits) {
            var s = '' + value;
            while (s.length < (digits || 3)) {
                s = '0' + s;
            }
            return s;
        };

        $scope.nextNumber = function (rule) {
            if (!rule || !rule.prefix) {
                return '';
            }
            return rule.prefix + pad(rule.nextSeq, rule.digits);
        };

        $scope.preview = function () {
            var f = $scope.form;
            if (!f.prefix) {
                return '';
            }
            return f.prefix.toUpperCase() + pad(f.nextSeq || 1, f.digits);
        };

        // A configuration with no main application cannot produce a QR code at all: the
        // code has to tell a factory-reset device which APK to install as device owner.
        // Say so while the configuration is being chosen, not after the QR comes back blank.
        $scope.selectedHasNoMainApp = function () {
            var id = $scope.form.configurationId;
            if (!id) {
                return false;
            }
            var c = $scope.configurations.filter(function (x) { return x.id === id; })[0];
            return !!c && !c.mainAppId;
        };

        // ---------------------------------------------------------------- loading

        var loadRules = function () {
            pluginDeviceEnrollService.rules(function (response) {
                if (response.status === 'OK') {
                    $scope.rules = response.data;
                } else {
                    showResponseError(response);
                }
            }, requestFailed);
        };

        var loadAssignments = function () {
            pluginDeviceEnrollService.assignments(function (response) {
                if (response.status === 'OK') {
                    $scope.assignments = response.data;
                }
            }, requestFailed);
        };

        var loadConfigurations = function () {
            configurationService.getAllConfigurations(function (response) {
                if (response.status === 'OK') {
                    $scope.configurations = response.data;
                    if (!$scope.form.configurationId && response.data.length > 0) {
                        var usable = response.data.filter(function (c) { return c.mainAppId; })[0];
                        $scope.form.configurationId = (usable || response.data[0]).id;
                    }
                }
            }, requestFailed);
        };

        var loadGroups = function () {
            groupService.getAllGroups(function (response) {
                if (response.status === 'OK') {
                    $scope.groups = response.data;
                }
            }, requestFailed);
        };

        $scope.load = function () {
            loadRules();
            loadAssignments();
        };

        // ------------------------------------------------------------------ save

        var toRule = function (f) {
            return {
                id: f.id,
                groupId: f.groupChoice === GROUP_NEW ? 0 : parseInt(f.groupChoice, 10),
                configurationId: f.configurationId,
                prefix: f.prefix.trim().toUpperCase(),
                digits: f.digits,
                nextSeq: f.nextSeq,
                enabled: f.enabled
            };
        };

        $scope.save = function () {
            clearMessages();

            var f = $scope.form;
            if (f.groupChoice === GROUP_NEW && !(f.newGroupName || '').trim()) {
                $scope.errorMessage = localization.localize('plugin.deviceenroll.error.group.required');
                return;
            }
            if (!f.configurationId) {
                $scope.errorMessage = localization.localize('plugin.deviceenroll.error.configuration.required');
                return;
            }
            if (!(f.prefix || '').trim()) {
                $scope.errorMessage = localization.localize('plugin.deviceenroll.error.prefix.required');
                return;
            }

            var rule = toRule(f);
            var groupName = f.groupChoice === GROUP_NEW ? f.newGroupName.trim() : '';

            var onDone = function (response) {
                $scope.working = false;
                if (response.status === 'OK') {
                    $scope.successMessage = localization.localize('plugin.deviceenroll.saved');
                    var configuration = f.configurationId;
                    $scope.form = emptyForm();
                    $scope.form.configurationId = configuration;
                    $scope.load();
                    loadGroups();
                } else if (response.message === 'plugin.deviceenroll.error.rule.exists') {
                    // One rule per group is a hard constraint - the QR code names the group,
                    // so two rules on one group could never be told apart. Offer to replace.
                    confirmModal.getUserConfirmation(
                        localization.localize('plugin.deviceenroll.confirm.replace'),
                        function () {
                            $scope.working = true;
                            pluginDeviceEnrollService.overwriteRule(
                                {groupName: groupName}, rule, onDone, requestFailed);
                        });
                } else {
                    showResponseError(response);
                }
            };

            $scope.working = true;
            pluginDeviceEnrollService.saveRule({groupName: groupName}, rule, onDone, requestFailed);
        };

        $scope.edit = function (rule) {
            clearMessages();
            $scope.form = {
                id: rule.id,
                groupChoice: '' + rule.groupId,
                newGroupName: '',
                configurationId: rule.configurationId,
                prefix: rule.prefix,
                digits: rule.digits,
                nextSeq: rule.nextSeq,
                enabled: rule.enabled
            };
        };

        $scope.clear = function () {
            clearMessages();
            var configuration = $scope.form.configurationId;
            $scope.form = emptyForm();
            $scope.form.configurationId = configuration;
        };

        $scope.remove = function (rule) {
            clearMessages();
            confirmModal.getUserConfirmation(
                localization.localize('plugin.deviceenroll.confirm.delete')
                    .replace('${name}', rule.groupName),
                function () {
                    pluginDeviceEnrollService.deleteRule({id: rule.id}, function (response) {
                        if (response.status === 'OK') {
                            $scope.successMessage =
                                localization.localize('plugin.deviceenroll.deleted');
                            $scope.load();
                        } else {
                            showResponseError(response);
                        }
                    }, requestFailed);
                });
        };

        loadConfigurations();
        loadGroups();
        $scope.load();
    })
    .run(function ($rootScope, $location, localization) {
        localization.loadPluginResourceBundles("deviceenroll");
    });

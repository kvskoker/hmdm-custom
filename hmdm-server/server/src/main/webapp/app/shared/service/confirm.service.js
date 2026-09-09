// Localization completed
angular.module('headwind-kiosk')
    .factory('confirmModal', function ($uibModal) {
        return {
            getUserConfirmation: function (message, callback, okButtonTextKey) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'app/shared/view/confirm.html',
                    controller: 'ConfirmController',
                    resolve: {
                        message: function () {
                            return message;
                        },
                        okButtonTextKey: function () {
                            if (okButtonTextKey) {
                                return okButtonTextKey;
                            } else {
                                return 'button.yes';
                            }
                        }
                    }
                });

                // The rejection handler is not optional: dismissing the dialog rejects this
                // promise, and a rejection nobody handles is what produces
                // "Possibly unhandled rejection: undefined" in the console on every Cancel.
                modalInstance.result.then(function () {
                    if (callback) callback();
                }, function () {
                    // dismissed - nothing to do
                });
            }
        }
    })
    .controller('ConfirmController', function ($scope, $uibModalInstance, message, okButtonTextKey) {
        $scope.message = message;
        $scope.okButtonTextKey = okButtonTextKey;

        $scope.OK = function () {
            $uibModalInstance.close();
        }
        $scope.cancel = function () {
            $uibModalInstance.dismiss()
        }
    });

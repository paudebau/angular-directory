'use strict';

angular.module('fbFactory', ['ngTouch', 'ui.router', 'ngAnimate', 'fbFactory.services'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/');

        // $locationProvider.html5Mode(true);

        $stateProvider
            .state('employees',
                   {url: '/', templateUrl: 'partials/employee-list.html', controller: 'EmployeeListController'})
            .state('details',
                    {url: '/employees/:employeeId', templateUrl: 'partials/employee-detail.html', controller: 'EmployeeDetailController'})
            .state('reports',
                   {url: '/reports/:employeeId', templateUrl: 'partials/report-list.html', controller: 'ReportListController'});
    }])

    .controller('EmployeeListController',
                ['$scope', '$firebaseArray', 'directoryService', EmployeeListController])
    .controller('EmployeeDetailController',
                ['$scope', '$stateParams', '$timeout', 'employeeService', EmployeeDetailController])
    .controller('ReportListController',
                ['$scope', '$stateParams', 'reportsService', ReportsListController])

    .run(['$rootScope', '$window', '$location', 'Auth', function initialize($rootScope, $window, $location, Auth) {
        // Navigation
        $rootScope.slide = '';
        $rootScope.back = function () { $rootScope.slide = 'slide-right'; $window.history.back(); };
        // Tracing state transitions
        $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
            console.log('go %s >> %s', oldUrl, newUrl);
        });
    }]);

function EmployeeListController($scope, $firebaseArray, directoryService) {
    $scope.employees = $firebaseArray(directoryService.ls('employees'));
}

function EmployeeDetailController($scope, $stateParams, $timeout, employeeService) {
    function callback (employee) {
        $timeout(function () {
            $scope.employee = employee;
        });
    }
    employeeService.details($stateParams.employeeId, callback);
}

function ReportsListController($scope, $stateParams, reportsService) {
    $scope.employees = reportsService.query($stateParams.employeeId);
}


angular.module('fbFactory.services', ['firebase'])
    .factory("Auth", ["$firebaseAuth", function ($firebaseAuth) { return $firebaseAuth(); }])
    .factory('directoryService', ['$window' , directoryService])
    .factory('employeeService', ['directoryService', '$firebaseObject', employeeService])
    .factory('reportsService', ['directoryService', '$firebaseArray', reportsService]);

function directoryService($window) {
    var ref = $window.firebase.database().ref('factory'); // should be a constant
    return {
        ref: function (path) {
            return $window.firebase.database().ref('factory/' + path);
        },
        ls: function (node) {
            return ref.child(node); }
    };
}

function employeeService(directoryService, $firebaseObject) {
    return {
        details: function (employeeId, cont) {
            var ref_e = directoryService.ref('employees/' + employeeId);
            ref_e.on("value", function (snap_e) {
                var employee = snap_e.val();
                employee.id = snap_e.key;
                employee.managerName = '';
                var ref_d = directoryService.ref('departments/' + employee.department);
                ref_d.on("value", function (snap_d) {
                    employee.city = snap_d.val();
                    if (employee.managerId !== employeeId) {
                        var ref_m = directoryService.ref('employees/' +employee.managerId);
                        ref_m.on("value",  function (snap_m) {
                            var manager = snap_m.val();
                            employee.managerName = manager.firstName + ' ' + manager.lastName;
                            cont(employee);
                        });
                    } else {
                        cont(employee);
                    }
                });
            });
        }
    };
}

function reportsService(directoryService, $firebaseArray) {
    return {
        query: function (employeeId) {
            return $firebaseArray(directoryService.ls('employees').orderByChild('managerId').equalTo(employeeId));
        }
    };
}

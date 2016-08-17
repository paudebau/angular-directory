'use strict';

angular.module('factory', ['ngTouch', 'ui.router', 'ngAnimate', 'myApp.firebaseServices'])

    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/employees');

        $locationProvider.html5Mode(true);

        $stateProvider
            .state('employees',
                   {url: '/employees', templateUrl: 'partials/employee-list.html', controller: 'EmployeeListController'})
            .state('details',
                    {url: '/employees/:employeeId', templateUrl: 'partials/employee-detail.html', controller: 'EmployeeDetailController'})
            .state('reports',
                   {url: '/reports/:employeeId', templateUrl: 'partials/report-list.html', controller: 'ReportListController'});
    }])

    .controller('EmployeeListController',
                ['$scope', '$firebaseArray', 'directoryService', EmployeeListController])
    .controller('EmployeeDetailController',
                ['$scope', '$stateParams', '$firebaseObject', 'directoryService', EmployeeDetailController])
    .controller('ReportListController',
                ['$scope', '$stateParams', 'reportService', ReportListController])

    .run(['$rootScope', '$window', '$location', 'Auth', function initialize($rootScope, $window, $location, Auth) {
        // Navigation
        $rootScope.slide = '';
        $rootScope.back = function () { $rootScope.slide = 'slide-right'; $window.history.back(); };

        $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
            console.log('go %s ===> %s', oldUrl, newUrl);
        });
    }]);

function EmployeeListController($scope, $firebaseArray, directoryService) {
    $scope.employees = $firebaseArray(directoryService.ls('employees'));
}

function EmployeeDetailController($scope, $stateParams, $firebaseObject, directoryService) {
    var employee = null, employeeId = $stateParams.employeeId;
    var employees = directoryService.ls('employees');
    var departments = directoryService.ls('departments');
    employee = new $firebaseObject(employees.child(employeeId));
    employee.$loaded().then(function () { // $on("value", fn) should suffice
        $scope.employee = employee;
        employee.managerName = '';
        var dept = new $firebaseObject(departments.child(employee.department));
        dept.$loaded().then(function () {
            employee.city = dept.$value;
            if (employee.managerId !== employeeId) {
                var manager = new $firebaseObject(employees.child(employee.managerId));
                manager.$loaded().then(function () {
                    employee.managerName = manager.firstName + ' ' + manager.lastName;
                });
            }
        });
    });
}

function ReportListController($scope, $stateParams, reportService) {
    $scope.employees = reportService.query($stateParams.employeeId);
}


angular.module('myApp.firebaseServices', ['firebase'])
    .factory("Auth", ["$firebaseAuth", function ($firebaseAuth) { return $firebaseAuth(); }])
    .factory('directoryService', ['$window' , directoryService])
    .factory('reportService', ['directoryService', '$firebaseArray', reportService]);

function directoryService($window) {
    var db = $window.firebase.database().ref('factory'); // should be a constant
    return {
        ls: function (node) {
            return db.child(node); }
    };
}

function reportService(directoryService, $firebaseArray) {
    return {
        query: function (employeeId) {
            return $firebaseArray(directoryService.ls('employees').orderByChild('managerId').equalTo(employeeId));
        }
    };
}

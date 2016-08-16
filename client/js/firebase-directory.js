'use strict';

angular.module('myApp', ['ngTouch', 'ngRoute', 'ngAnimate', 'myApp.firebaseServices'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/employees',
                            {templateUrl: 'partials/employee-list.html', controller: 'EmployeeListController'});
        $routeProvider.when('/employees/:employeeId',
                            {templateUrl: 'partials/employee-detail.html', controller: 'EmployeeDetailController'});
        $routeProvider.when('/employees/:employeeId/reports',
                            {templateUrl: 'partials/report-list.html', controller: 'ReportListController'});
        $routeProvider.otherwise({redirectTo: '/employees'});
    }])

    .controller('EmployeeListController',
                ['$scope', '$firebaseArray', 'directoryService', EmployeeListController])
    .controller('EmployeeDetailController',
                ['$scope', '$routeParams', '$firebaseObject', 'directoryService', EmployeeDetailController])
    .controller('ReportListController',
                ['$scope', '$routeParams', 'reportService', ReportListController])

    .run(['$rootScope', '$window', '$location', 'Auth', function initialize($rootScope, $window, $location, Auth) {
        // Navigation
        $rootScope.slide = '';        
        $rootScope.back = function () { $rootScope.slide = 'slide-right'; $window.history.back(); };
        $rootScope.go = function (path) { $rootScope.slide = 'slide-left'; $location.url(path); };
    }]);

function EmployeeListController($scope, $firebaseArray, directoryService) {
    $scope.employees = $firebaseArray(directoryService.ls('employees'));
}

function EmployeeDetailController($scope, $routeParams, $firebaseObject, directoryService) {
    var employee = null, employeeId = $routeParams.employeeId;    
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

function ReportListController($scope, $routeParams, reportService) {
    $scope.employees = reportService.query($routeParams.employeeId);
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

//$api_user = 'api';
//$api_pass = '73B6557F5987';

angular.module('Main', ['ngRoute', 'ngResource', 'ngCookies', 'pascalprecht.translate'])
    .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
        $httpProvider.interceptors.push('httpRequestInterceptor');

        $routeProvider
            .when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl'
            })
            .when('/logout', {
                templateUrl: 'partials/home.html',
                action: 'logout()',
                controller: 'LoginCtrl'
            })
            .when('/reservations', {
                templateUrl: 'partials/reservations.html',
                controller: 'ReservationCtrl'
            })
            .when('/contact', {
                templateUrl: 'partials/contact.html',
                controller: 'MainCtrl'
            })
            .otherwise({ redirectTo: '/reservations'})
    }]);

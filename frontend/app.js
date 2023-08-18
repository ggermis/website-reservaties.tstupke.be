//$api_user = 'api';
//$api_pass = '73B6557F5987';

angular.module('Main', ['ngRoute', 'ngResource', 'ngCookies', 'pascalprecht.translate', 'xeditable'])
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
            .when('/welcome', {
                templateUrl: 'partials/home.html',
                controller: 'MainCtrl'
            })
            .when('/accommodations', {
                templateUrl: 'partials/accommodations.html',
                controller: 'MainCtrl'
            })
            .when('/pricing', {
                templateUrl: 'partials/pricing.html',
                controller: 'MainCtrl'
            })
            .when('/reservations', {
                templateUrl: 'partials/reservations.html',
                controller: 'ReservationCtrl'
            })
            .otherwise({ redirectTo: '/welcome'})
    }])
    .config(['$translateProvider', function($translateProvider) {
        $translateProvider.translations('nl', {
            BUTTON_WELCOME: 'Welkom',
            BUTTON_ACCOMODATIONS: 'Accomodaties',
            BUTTON_PRICES: 'Prijzen',
            BUTTON_RESERVATIONS: 'Reservaties',
            BUTTON_CONTACT: 'Contact',
        });

        $translateProvider.translations('fr', {
            BUTTON_WELCOME: 'Bienvenu',
            BUTTON_ACCOMODATIONS: 'Acomodations',
            BUTTON_PRICES: 'Prix',
            BUTTON_RESERVATIONS: 'Reservations',
            BUTTON_CONTACT: 'Contacter',
        });
        $translateProvider.preferredLanguage('nl');
    }]);
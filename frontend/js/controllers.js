angular.module('Main').controller('MainCtrl', ['$scope', '$rootScope', '$location', '$translate', function ($scope, $rootScope, $location, $translate) {
}]);

angular.module('Main').controller('LoginCtrl', ['$rootScope', '$window', 'AuthService', function($rootScope, $window, AuthService) {
    $rootScope.login = function (username, pass) {
        $rootScope.login_message = 'Logging in...';
        var md5 = CryptoJS.MD5(pass).toString(CryptoJS.enc.Base64);
        AuthService.login({}, {username: username, password: md5}).$promise
            .then(function (data) {
                $rootScope.login_message = 'Login success';
                $window.sessionStorage.token = data.token;
                $rootScope.auth_token = data.token;
                $window.location.href = '/';
            }, function (error) {
                $rootScope.login_message = 'Login failed';
                delete $window.sessionStorage.token;
                delete $rootScope.auth_token;
            });
    };

    $rootScope.logout = function() {
        AuthService.logout({}).$promise
            .then(function(data) {
                delete $window.sessionStorage.token;
                delete $rootScope.auth_token;
                $window.location.href = '/';
            })
    };
}]);


angular.module('Main').controller('ReservationCtrl', ['$scope', '$filter', 'Reservations', 'Mailer', function ($scope, $filter, Reservations, Mailer) {
    $scope.reset = function () {
        $scope.message = '';
        $scope.status = 'ok';
        $scope.reservation = {};
        $scope.reservation._type = 'bivak';
        $scope.set_limits($scope.reservation);
        $scope.already_sending = false;
        $scope.reservation_button = 'Reserveer nu!';
    };

    $scope.set_limits = function(reservation) {
        if (reservation._type == 'bivak') {
            $scope.min_nr_of_people = 60;
            $scope.max_nr_of_people = 200;
            $scope.min_days = 5;
            $scope.max_days = 365;
        } else {
            $scope.min_nr_of_people = 1;
            $scope.max_nr_of_people = 40;
            $scope.min_days = 2;
            $scope.max_days = 2;
        }
        reservation._nr_of_people = 0;
//        reservation._nr_of_people = $scope.min_nr_of_people;
        reservation._arrival = '';
        reservation._departure = '';
    };

    $scope.today = new Date();
    $scope.year = $scope.today.getFullYear();
    $scope.years = [$scope.year, $scope.year + 1, $scope.year + 2, $scope.year + 3, $scope.year + 4, $scope.year + 5];
    $scope.reservation_status = ['pending', 'confirmed', 'closed'];
    $scope.reservation_types = ['weekend', 'bivak'];
    $scope.reset();

    $scope.is_authorized = function() {
        return $scope.auth_token != null;
    };

    Reservations.getAll(function (response) {
        $scope.reset();
        $scope.reservations = response;
    });

    $scope.numberOfDays = function(from_date, to_date) {
        var days = Math.abs(Math.floor(( Date.parse(from_date) - Date.parse(to_date) ) / 86400000));
        return days;
    };

    $scope.submitReservationForm = function (item, event) {
        $scope.already_sending = true;
        $scope.reservation_button = 'De reservatie wordt verstuurd...';
        Reservations.create({}, $scope.reservation).$promise
            .then(function (data) {
                $scope.status = 'ok';
                $scope.reservation_button = 'Reservatie succesvol verstuurd!';
                Reservations.getAll(function (response) {
                    $scope.reservations = response;
                });
                mail = {};
                mail.message = $scope.reservation;
                Mailer.sendMail({}, mail);
            }, function (error) {
                $scope.reservation_button = 'Fout bij versturen van reservatie. Probeer later opnieuw.';
                $scope.already_sending = false;
                $scope.message = error.data;
            });
    };

    $scope.deleteReservation = function (id) {
        if (!confirm('Ben je zeker?')) {
            return;
        }
        $scope.message = 'Verwijderen reservatie ' + id + '...';
        Reservations.delete({id: id}).$promise
            .then(function (data) {
                Reservations.getAll(function (response) {
                    $scope.status = 'ok';
                    $scope.message = 'Reservatie succesvol verwijderd';
                    $scope.reservations = response;
                })
            }, function (error) {
                $scope.status = 'Fout bij verwijderen van reservatie';
                $scope.message = error.response;
            });
    };

    $scope.updateReservation = function (reservation) {
        $scope.message = 'Updaten reservatie ' + reservation._id + '...';
        Reservations.update({id: reservation._id}, reservation).$promise
            .then(function (data) {
                $scope.status = 'ok';
                $scope.message = 'Reservatie succesvol geupdate';
                Reservations.getAll(function (response) {
                    $scope.reservations = response;
                });
            }, function (error) {
                $scope.status = 'Fout bij updaten van reservatie';
                $scope.message = error.data;
                Reservations.getAll(function (response) {
                    $scope.reservations = response;
                });
            });
    };

}]);

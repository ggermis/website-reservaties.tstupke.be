angular.module('Main').factory('httpRequestInterceptor', ['$rootScope', '$window', function ($rootScope, $window) {
    return {
        request: function ($config) {
            var token = $rootScope.auth_token || $window.sessionStorage.token;
            if (token) {
                $rootScope.auth_token = token;
                $config.headers['X-Access-Token'] = token;
            }
            return $config;
        }
    };
}]);

angular.module('Main').factory('Reservations', ['$resource', function ($resource) {
    return $resource('/api/reservation/:id', {}, {
        getAll: { method: 'GET', isArray: true },
        create: { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded'} },
        update: { method: 'PUT', params: {id: '@id'} },
        delete: {method: 'DELETE', params: {id: '@id'} }
    })
}]);

angular.module('Main').factory('AuthService', ['$resource', function ($resource) {
    return $resource('/auth/:action', {}, {
        login: { method: 'POST', params: {action: 'login'}, headers: { 'Content-Type': 'application/x-www-form-urlencoded'} },
        logout: { method: 'POST', params: {action: 'logout'} }
    })
}]);

angular.module('Main').factory('CalendarHelper', function () {
    return {
        getReservation: function (reservations, date) {
            var result = null;
            if (reservations) {
                reservations.forEach(function (entry) {
                    var arrival = new Date(entry._arrival);
                    arrival.setDate(arrival.getDate());
                    var departure = new Date(entry._departure);
                    arrival.setHours(0, 0, 0, 0);
                    departure.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);
                    if (arrival.valueOf() <= date.valueOf() && date.valueOf() <= departure.valueOf()) {
                        result = entry;
                    }
                });
            }
            return result;
        },

        isReservationBorder: function (reservation, date) {
            var arrival = new Date(reservation._arrival);
            var departure = new Date(reservation._departure);
            arrival.setHours(0, 0, 0, 0);
            departure.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return arrival.valueOf() == date.valueOf() || departure.valueOf() == date.valueOf();
        },

        existsReservationBetween: function (reservations, start_date, end_date) {
            if (reservations) {
                return reservations.some(function (entry) {
                    var arrival = new Date(entry._arrival);
                    var departure = new Date(entry._departure);
                    arrival.setHours(0, 0, 0, 0);
                    departure.setHours(0, 0, 0, 0);
                    start_date.setHours(0, 0, 0, 0);
                    end_date.setHours(0, 0, 0, 0);
                    var doubleBooking = ((start_date.valueOf() < arrival.valueOf()) && (arrival.valueOf() < end_date.valueOf())) ||
                                        ((arrival.valueOf() < start_date.valueOf()) && (start_date.valueOf() < departure.valueOf()));
                    // console.log("Start: " + start_date +", end: " + end_date + ", Arrival: " + arrival + ", Departure: " + departure + " -> " + doubleBooking);
                    if (entry._status != 'pending' && doubleBooking) {
                        return true;
                    }
                });
            }
            return false;
        },

        isDayFree: function (reservations, date, type, start_date) {
            var reservation = this.getReservation(reservations, date);
            if (type == 'weekend') {
                var day = date.getDay();
                var month = date.getMonth();
                var isFriday = day == 5;
                var isSummer = (month == 6 || month == 7);
                return (reservation == null || reservation._status === 'pending') && isFriday; // && !isSummer;
            } else {
                var isFreeDate = (reservation == null || this.isReservationBorder(reservation, date));
                start_date = (typeof start_date === "undefined") ? null : start_date;
                if (start_date) {
                    var enclosedReservation = this.existsReservationBetween(reservations, start_date, date);
                    return enclosedReservation ? false : isFreeDate;
                }
                return reservation == null || reservation._status == 'pending' || isFreeDate;
            }
        }
    }
});

angular.module('Main').factory('Mailer', ['$resource', function ($resource) {
    return $resource('/mailer', {}, {
        sendMail: { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded'} }
    })
}]);

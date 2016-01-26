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
    return {
      all: $resource('/api/reservation/all/:year', {}, {
        get: { method: 'GET', isArray: true },
      }),
      single: $resource('/api/reservation/:id', {}, {
        create: { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded'} },
        update: { method: 'PUT', params: {id: '@id'} },
        delete: { method: 'DELETE', params: {id: '@id'} }
      })
    }
}]);

angular.module('Main').factory('EmailHistory', ['$resource', function($resource) {
    return $resource('/api/email_history/:id', {}, {
        find: { method: 'GET', params: {id: '@id'}, isArray: true }
    })
}]);

angular.module('Main').factory('Notes', ['$resource', function($resource) {
    return {
        all: $resource('/api/note/reservation/:id', {}, {
            find: { method: 'GET', params: {id: '@id'}, isArray: true },
        }),
        single: $resource('/api/note/:id', {}, { 
            create: { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded'} },
            delete: { method: 'DELETE', params: {id: '@id'} }
        })
    }
}]);

angular.module('Main').factory('AuthService', ['$resource', function ($resource) {
    return $resource('/auth/:action', {}, {
        login: { method: 'POST', params: {action: 'login'}, headers: { 'Content-Type': 'application/x-www-form-urlencoded'} },
        logout: { method: 'POST', params: {action: 'logout'} }
    })
}]);

angular.module('Main').factory('CalendarHelper', function () {
    return {
        doRangesOverlap: function(start_a, end_a, start_b, end_b) {
            return (start_a < end_b) && (end_a > start_b);
        },

        getReservationsWithOverlap: function(reservations, date) {
            var result = [];
            var self = this;
            var r = this.getReservations(reservations, date);
            reservations.forEach(function (reservation) {
                r.forEach(function (res) {
                    if ( self.doRangesOverlap(res._arrival, res._departure, reservation._arrival, reservation._departure) ) {
                        if (result.indexOf(reservation) == -1) {
                            result.push(reservation);
                        }
                    }
                });                
            });
            return result;
        },

        getReservations: function (reservations, date) {
            var result = [];
            if (reservations) {
                reservations.forEach(function (entry) {
                    var arrival = new Date(entry._arrival);
                    arrival.setDate(arrival.getDate());
                    var departure = new Date(entry._departure);
                    arrival.setHours(0, 0, 0, 0);
                    departure.setHours(0, 0, 0, 0);
                    date.setHours(0, 0, 0, 0);
                    if (arrival.valueOf() <= date.valueOf() && date.valueOf() <= departure.valueOf()) {
                        result.push(entry);
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

        existsReservationBetween: function (reservations, start_date, end_date, exact) {
            if (reservations) {
                return reservations.some(function (entry) {
                    var arrival = new Date(entry._arrival);
                    var departure = new Date(entry._departure);
                    arrival.setHours(0, 0, 0, 0);
                    departure.setHours(0, 0, 0, 0);
                    start_date.setHours(0, 0, 0, 0);
                    end_date.setHours(0, 0, 0, 0);
                    if ((start_date.getFullYear() >= 2019) && exact) {
                        var doubleBooking = (start_date.valueOf() == arrival.valueOf()) && (end_date.valueOf() == departure.valueOf());
                    } else if (exact) {
                        var doubleBooking = ((start_date.valueOf() <= arrival.valueOf()) && (arrival.valueOf() < end_date.valueOf())) ||
                                            ((arrival.valueOf() <= start_date.valueOf()) && (start_date.valueOf() < departure.valueOf()));                        
                    } else {
                        var doubleBooking = ((start_date.valueOf() <= arrival.valueOf()) && (arrival.valueOf() <= end_date.valueOf())) ||
                                            ((arrival.valueOf() <= start_date.valueOf()) && (start_date.valueOf() <= departure.valueOf()));
                    }
                    // if (start_date.getDate() == 1 && arrival.getFullYear() == 2017 && arrival.getMonth() == 6) {
                    //     console.log("Start: " + start_date +", end: " + end_date + ", Arrival: " + arrival + ", Departure: " + departure + " -> " + doubleBooking);
                    // }
                    if (entry._status != 'pending' && doubleBooking) {
                        return true;
                    }
                });
            }
            return false;
        },

        isBlockFree: function (reservations, start_date, end_date) {
            var start = new Date(start_date);
            var end = new Date(end_date);
            return start.valueOf() > new Date().valueOf() && !this.existsReservationBetween(reservations, start, end, true);  
        },

        isDayFree: function (reservations, date, type, start_date) {
            var found_reservations = this.getReservations(reservations, date);
            var reservation = found_reservations.length == 0 ? null : found_reservations[0];
            if (type == 'weekend') {
                var day = date.getDate();
                var month = date.getMonth();
                var isSummer = (month == 6 || (month == 7 && day <= 14) );
                if (!isSummer && (reservation == null || reservation._status === 'pending')) {
                    // check if 2 days from now is free too (weekend lasts 3 days)
                    var future_date = new Date(date.valueOf() + 60*60*24*1*1000); // 1 days from now
                    var found_future_reservations = this.getReservations(reservations, future_date);
                    var future_reservation = found_future_reservations.length == 0 ? null : found_future_reservations[0];
                    return !isSummer && (future_reservation == null || future_reservation._status == 'pending');
                }
                return false;
            } else {
                var isFreeDate = (reservation == null || this.isReservationBorder(reservation, date));
                start_date = (typeof start_date === "undefined") ? null : start_date;
                if (start_date) {
                    var enclosedReservation = this.existsReservationBetween(reservations, start_date, date, false);
                    return enclosedReservation ? false : isFreeDate;
                }
                return reservation == null || reservation._status == 'pending' || isFreeDate;
            }
        }
    }
});

angular.module('Main').factory('Util', function() {
    return {
        createGuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    }
});

angular.module('Main').factory('Mailer', ['$resource', function ($resource) {
    return $resource('/mailer', {}, {
        sendMail: { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded'} }
    })
}]);

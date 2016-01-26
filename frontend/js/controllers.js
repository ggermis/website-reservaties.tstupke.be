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


angular.module('Main').controller('ReservationCtrl', ['$scope', '$filter', 'Reservations', 'Mailer', 'EmailHistory', 'Notes', 'CalendarHelper', 'Util', function ($scope, $filter, Reservations, Mailer, EmailHistory, Notes, CalendarHelper, Util) {
    $scope.reset = function () {
        $scope.message = '';
        $scope.status = 'ok';
        $scope.reservation = {};
        $scope.reservation._type = 'weekend';
        $scope.set_limits($scope.reservation);
        $scope.already_sending = false;
        $scope.reservation_button = 'Reserveer nu!';
        $scope.selected_block = "0";
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
        reservation._arrival = '';
        reservation._departure = '';
        $scope.block.selected_block = "0";
    };

    $scope.note = {};
    $scope.note_reservation = {};
    $scope.today = new Date();
    $scope.state = {};
    $scope.state.year = $scope.today.getFullYear();
    if ($scope.auth_token != null) {
        $scope.years = [];
        for (var i=2015; i<=$scope.state.year+5; i++) {
            $scope.years.push(i);
        }
    } else {
        $scope.years = [$scope.state.year, $scope.state.year + 1, $scope.state.year + 2, $scope.state.year + 3, $scope.state.year + 4, $scope.state.year + 5];
    }
    $scope.block = {
        year: $scope.today.getFullYear(),
        legacy_blocks_2016: [
            { "id": 1, "from": "07-01", "to": "07-10", disabled: false },
            { "id": 2, "from": "07-12", "to": "07-23", disabled: false },
            { "id": 3, "from": "07-23", "to": "08-03", disabled: false },
            { "id": 4, "from": "08-03", "to": "08-14", disabled: false }
        ],
        legacy_blocks_2018: [
            { "id": 1, "from": "07-01", "to": "07-10", disabled: false },
            { "id": 2, "from": "07-10", "to": "07-21", disabled: false },
            { "id": 3, "from": "07-21", "to": "08-01", disabled: false },
            { "id": 4, "from": "08-01", "to": "08-12", disabled: false }
        ],
        default_blocks: [
            { "id": 1, "from": "07-01", "to": "07-12", disabled: false },
            { "id": 2, "from": "07-12", "to": "07-23", disabled: false },
            { "id": 3, "from": "07-23", "to": "08-03", disabled: false },
            { "id": 4, "from": "08-03", "to": "08-14", disabled: false }
        ],
        selected_block: "0"        
    };

    $scope.reservation_status = ['pending', 'confirmed', 'closed'];
    $scope.reservation_types = ['weekend', 'bivak'];

    $scope.email_history = [];
    $scope.reset();

    function loadReservations(reset) {
        Reservations.all.get({}, function (response) {
            $scope.all_reservations = response;
            $scope.reservations = response.filter(function(reservation) {
                var regexp = new RegExp('^' + $scope.state.year + '-');
                return regexp.test(reservation._arrival) || regexp.test(reservation._departure);
            });
            $scope.reservation_count = $scope.reservations.filter(function(reservation) {
                return reservation._status != 'closed';
            }).length;
            if (!$scope.already_sending) {
                $scope.loadReservationBlocks(true);
            }
        });
    }

    $scope.loadEmailHistory = function (reservation) {
        $scope.clearEmailHistory();
        $('#emailModal').appendTo("body");
        $scope.email_reservation = reservation;
        EmailHistory.find({id: reservation._id}, function (response) {
            $scope.email_history = response;
        });
    };

    $scope.clearEmailHistory = function () {
        $scope.email_reservation = '';
        $scope.email_history = [];
    };

    $scope.loadNotes = function (reservation) {
        $('#notesModal').appendTo("body");
        $scope.note_reservation = reservation;
        $scope.note._note = "";
        $scope.note._reservation = reservation._id;
        Notes.all.find({id: reservation._id}, function (response) {
            $scope.notes = response;
        })
    };

    $scope.createNote = function () {
        Notes.single.create({}, $scope.note).$promise
            .then(function (data) {
                $scope.status = 'ok';
                $scope.note_reservation['_has_notes'] = true;
                Reservations.single.update({id: $scope.note_reservation._id}, $scope.note_reservation).$promise
                    .then(function (data) {
                        $scope.status = 'ok';
                        loadReservations(false);
                    }, function (error) {
                        $scope.message = error.data;
                        loadReservations(false);
                    });
                $scope.loadNotes($scope.note_reservation);
            }, function (error) {
                $scope.status = 'error';
                $scope.message = error.data;
            });
    };

    $scope.deleteNote = function (id) {
        Notes.single.delete({id: id}).$promise
            .then(function (data) {
                if ($scope.notes.length == 1) {
                    $scope.note_reservation['_has_notes'] = false;
                    Reservations.single.update({id: $scope.note_reservation._id}, $scope.note_reservation).$promise
                        .then(function (data) {
                            $scope.status = 'ok';
                            loadReservations(false);
                        }, function (error) {
                            $scope.message = error.data;
                            loadReservations(false);
                        });
                }
                $scope.loadNotes($scope.note_reservation);
            }, function (error) {
                $scope.status = 'Fout bij verwijderen van reservatie';
                $scope.message = error.response;
            });
    };

    $scope.is_authorized = function() {
        return $scope.auth_token != null;
    };

    // loadReservations();

    $scope.numberOfDays = function(from_date, to_date) {
        var days = Math.abs(Math.floor(( Date.parse(from_date) - Date.parse(to_date) ) / 86400000));
        return days;
    };

    $scope.submitAdminReservationForm = function(item, event) {
        $scope.message = "Wordt opgeslagen...";

        $scope.reservation._name = "'t Stupke";
        $scope.reservation._address = "Stroekestraat, Val-Meer";
        $scope.reservation._email = "kampplaats@tstupke.be";
        $scope.reservation._phone = "0495/246650";
        $scope.reservation._agreed = true;
        $scope.reservation._status = 'confirmed';

        var isDoubleBooked = CalendarHelper.existsReservationBetween($scope.reservations, new Date($scope.reservation._arrival), new Date($scope.reservation._departure), false);
        if (isDoubleBooked) {
            $scope.status = 'error';
            $scope.message = 'Dubbele boeking! Reservatie niet opgeslagen!';
        } else {
            Reservations.single.create({}, $scope.reservation).$promise
                .then(function(data) {
                    $scope.status = 'ok';
                    $scope.message = 'Reservatie succesvol aangemaakt!';
                    loadReservations();
                    $scope.current_reservations = [ data ];
                }, function(error) {
                    $scope.message = 'Fout bij aanmaken van reservatie. Probeer later opnieuw.';
                    $scope.message = error.data;
                });
        }
    };

    $scope.submitReservationForm = function (item, event) {
        $scope.already_sending = true;
        $scope.reservation_button = 'De reservatie wordt verstuurd...';
        $scope.reservation._code = $scope.reservation._arrival + '-' + Util.createGuid();
        Reservations.single.create({}, $scope.reservation).$promise
            .then(function (data) {
                $scope.status = 'ok';
                $scope.reservation_button = 'Reservatie succesvol verstuurd!';
                loadReservations(false);
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
        Reservations.single.delete({id: id}).$promise
            .then(function (data) {
                $scope.current_reservations = [];
                $scope.message = 'Reservatie succesvol verwijderd';
                loadReservations(false);
            }, function (error) {
                $scope.status = 'Fout bij verwijderen van reservatie';
                $scope.message = error.response;
            });
    };

    $scope.updateReservation = function (reservation) {
        $scope.message = 'Updaten reservatie ' + reservation._id + '...';
        Reservations.single.update({id: reservation._id}, reservation).$promise
            .then(function (data) {
                $scope.status = 'ok';
                $scope.message = 'Reservatie succesvol geupdate';
                loadReservations(false);
            }, function (error) {
                $scope.status = 'Fout bij updaten van reservatie';
                $scope.message = error.data;
                loadReservations(false);
            });
    };

    $scope.reservation_class = function(reservation) {
        return new Date(reservation._arrival).valueOf() < new Date().valueOf() ? 'done' : 'todo';
    }

    $scope.reservation_expired = function(reservation) {
        var creation_date = new Date(reservation._created.split(' ')[0]);
        return ((reservation._status == 'pending') && ((new Date() - creation_date) > 12096e5)); // 12096e5 = 14 days
    }

    $scope.loadReservationBlocks = function(keep_year) {
        $scope.block.selected_block = "0";
        if (!keep_year) {
            $scope.state.year = $scope.block.year;
        }        
        for (var $i=0; $i<$scope.block[$scope.blocks_to_use].length; $i++) {
            var $block = $scope.block[$scope.blocks_to_use][$i];
            var $start_date = $scope.block.year + "-" + $block.from;
            var $end_date = $scope.block.year + "-" + $block.to;
            $block.disabled = !CalendarHelper.isBlockFree($scope.all_reservations, $start_date, $end_date);
        }        
        $scope.selectedReservationBlock();
    }    

    $scope.selectedReservationBlock = function() {
        var block_id = parseInt($scope.block.selected_block) - 1;
        if (block_id >= 0 && block_id < $scope.block[$scope.blocks_to_use].length) {
            $scope.reservation._arrival = $scope.block.year + "-" + $scope.block[$scope.blocks_to_use][block_id].from;
            $scope.reservation._departure = $scope.block.year + "-" + $scope.block[$scope.blocks_to_use][block_id].to;
        } else {
            $scope.reservation._arrival = "";
            $scope.reservation._departure = "";                          
        }
    }

    $scope.updateCalendarSelection = function() {
       $('.selected_period').removeClass('selected_period');
       var start_date = new Date($scope.reservation._arrival);
       start_date.setHours(0, 0, 0, 0);
       var end_date = new Date($scope.reservation._departure)
       end_date.setHours(0, 0, 0, 0);
       while (start_date <= end_date) {
            $(".d" + start_date.getFullYear() + "-" + ("0" + (start_date.getMonth() + 1)).slice(-2) + "-" + ("0" + start_date.getDate()).slice(-2)).addClass('selected_period');
            start_date = new Date(start_date.valueOf() + 60*60*24*1*1000); // 1 days from now
       }
    }

    $scope.$watch('reservation._arrival', function (newValue, oldValue) {
       $scope.updateCalendarSelection();
    }, true);

    $scope.$watch('reservation._departure', function (newValue, oldValue) {
       $scope.updateCalendarSelection();
    }, true);

    $scope.$watch('state.year', function (newValue, oldValue) {
        $scope.current_reservations = [];
        $scope.block.year = newValue;
        var legacy_blocks = "legacy_blocks_" + $scope.state.year;
        $scope.blocks_to_use = (typeof $scope.block[legacy_blocks] === "undefined") ? "default_blocks" : legacy_blocks;
        loadReservations();
    }, true);

}]);

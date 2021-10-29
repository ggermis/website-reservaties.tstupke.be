angular.module('Main')

    .directive('dateFrom', [ '$filter', 'CalendarHelper', function ($filter, CalendarHelper) {
        return {
            link: function (scope, element, attrs) {
                var withTo = $('#' + attrs.withTo);
                element.datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeYear: true,
                    changeMonth: true,
                    yearRange: "-0:+5",
                    minDate: '0',
                    beforeShowDay: function (date) {
                        return [CalendarHelper.isDayFree(scope.all_reservations, date, scope.reservation._type), ""];
                    },
                    onChangeMonthYear: function (year, month, inst) {
                        scope.state.year = year;
                        scope.$apply();
                    },
                    onSelect: function (date) {
                        scope.reservation._arrival = date;
                        if (! scope.is_authorized()) {
                            var toDate = new Date(element.datepicker("getDate"));
                            if (scope.reservation._type == 'weekend') {
                                toDate.setDate(toDate.getDate() + scope.min_days);
                                withTo.datepicker('option', 'minDate', toDate);
                                scope.reservation._departure = $filter('date')(toDate, 'yyyy-MM-dd', toDate.getTimezoneOffset());
                            }
                        }
        
                        $('#departure').datepicker("option", "defaultDate", date);
                        $('#departure').datepicker("option", "minDate", date);
                        if (scope.reservation._type === 'bivak') {
                            $('#departure').prop("disabled", false);    
                        }
                        scope.$apply();
                    }
                });
            }
        }
    }])

    .directive('dateTo', ['CalendarHelper', function (CalendarHelper) {
        return {
            link: function (scope, element, attrs) {
                var withFrom = $('#' + attrs.withFrom);
                element.datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeYear: true,
                    changeMonth: true,
                    yearRange: "-0:+5",
                    minDate: '0',
                    beforeShowDay: function (date) {
                        var from_date = new Date(withFrom.val());
                        var r = scope.all_reservations.filter(res => !res._deleted && res._status === 'confirmed' && from_date.getYear() == new Date(res._arrival).getYear() && from_date <= new Date(res._arrival));
                        var nextReservations = r.slice().sort((a, b) => a._arrival > b._arrival && 1 || -1);
                        if (nextReservations.length > 0) {
                            var max = new Date(nextReservations[0]._arrival);
                            if (date >= max) {
                                return [false, ""];
                            }
                        }
                        return [true, ""];
                    },
                    onChangeMonthYear: function (year, month, inst) {
                        scope.state.year = year;
                        scope.$apply();
                    },
                    onSelect: function (date) {
                        scope.reservation._departure = date;
                        scope.$apply();
                    }
                });
            }
        }
    }])

    .directive('datepicker', [function() {
        return {
            link: function (scope, element, attrs) {
                element.datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeYear: true,
                    changeMonth: true
                });
            }
        }
    }])

    .directive('myCalendar', ['CalendarHelper', function (CalendarHelper) {
        return {
            link: function (scope, element, attrs) {
                function updateCalendar(year) {
                    element.empty();

                    var tbl = document.createElement('table');
                    for (var i=0; i<39; i++) {
                        tbl.appendChild(document.createElement('colgroup'));
                    }
                    var tblBody = document.createElement('tbody');

                    var days = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
                    var months = ['jan', 'feb', 'maa', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

                    Date.prototype.mGetDay = function () {
                        return (this.getDay() + 6) % 7;
                    };

                    function daysInMonth(month, year) {
                        return new Date(year, month, 0).getDate();
                    }

                    function firstDayOfMonth(month, year) {
                        return new Date(year, month, 1).mGetDay();
                    }

                    for (var j = 0; j < 14; j++) { // rows
                        var row = document.createElement('tr');
                        for (var i = 0; i < 39; i++) { // cols
                            var cell = document.createElement('td');
                            var cellText;

                            if ((j == 0 || j == 13) && (i > 0 && i <= 37)) {
                                // day titles
                                var currentDay = (i - 1) % 7;
                                cellText = document.createTextNode(days[currentDay]);
                                cell.className = 'title';
                                cell.appendChild(cellText);
                            } else if ((i == 0 || i == 38) && (j == 0 || j == 13)) {
                                cell.className = 'title';
                            } else if ((i == 0 || i == 38) && (j > 0 && j < 13)) {
                                // month titles
                                var currentMonth = (j - 1) % 12;
                                cellText = document.createTextNode(months[currentMonth]);
                                cell.className = 'title';
                                cell.appendChild(cellText);
                            } else if ((i > 0 && i <= 37) && (j > 0 && j < 13)) {
                                // day values
                                var nrOfDays = daysInMonth(j, year);
                                var firstDay = firstDayOfMonth(j - 1, year); // Mo = 0
                                if (i > firstDay && i <= nrOfDays + firstDay) {
                                    var d = new Date(year, j - 1, i - firstDay, 0, 0, 0);
                                    var formattedDate = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)
                                    cellText = document.createTextNode(d.getDate());
                                    cell.appendChild(cellText);


                                    if (scope.is_authorized()) {
                                        function captureArrivalDate(d) {
                                            return function(event) { 
                                                scope.message = '';
                                                scope.reservation._arrival = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);;
                                                scope.reservation._departure = '';
                                                scope.current_reservations = CalendarHelper.getReservations(scope.reservations, d);
                                                scope.$apply();
                                            }
                                        }
                                        function captureDepartureDate(d) {
                                            return function(event) {
                                                var departure_date = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);;
                                                if (new Date(departure_date).valueOf() < new Date(scope.reservation._arrival)) {
                                                    scope.reservation._departure = scope.reservation._arrival;
                                                    scope.reservation._arrival = departure_date;
                                                } else {
                                                    scope.reservation._departure = departure_date;
                                                }
                                                // $('#entity').focus();
                                                scope.$apply();
                                            }
                                        }
                                        cell.onmousedown = captureArrivalDate(d);
                                        cell.onmouseup = captureDepartureDate(d);
                                    }                                    
                                    var found_reservations = CalendarHelper.getReservations(scope.reservations, d);
                                    var reservation = found_reservations.length == 0 ? null : found_reservations[0];
                                    var statuses = (reservation ? reservation._status : 'free');
                                    

                                    // support multiple reservation statuses
                                    if (found_reservations.length > 0) {
                                        statuses = scope.is_authorized() ? ("r" + found_reservations.length + " ") : "";
                                        statuses = found_reservations.map(function (r) {
                                            if (r._status == 'closed') {
                                                return r._status;
                                            } 

                                            var result = "";
                                            if (formattedDate == r._arrival) {
                                                result += " free start-" + r._status;
                                            }
                                            if (formattedDate == r._departure) {
                                                result += " free end-" + r._status;
                                            } 
                                            if (!result) {
                                                result = scope.is_authorized() ? ("r" + found_reservations.length + " ") : "";
                                                result += r._status;
                                            }
                                            return result;
                                        }).join(' ');
                                    }

                                    cell.className = "day " + statuses;
                                    if (scope.is_authorized() && reservation) {
                                        cell.title = reservation._name + ' (' + reservation._entity + ')';
                                    }

                                    cell.className = cell.className + " d" + formattedDate;

                                    var now = new Date();
                                    var yesterday = new Date().setDate(now.getDate()-1);
                                    if (d.valueOf() < yesterday.valueOf()) {
                                        if (scope.is_authorized()) {
                                            cell.className = cell.className + " done";
                                        } else {
                                            cell.className = "day free done";
                                        }
                                    }
                                    if ((d.getYear() == now.getYear()) && (d.getMonth() == now.getMonth()) && (d.getDate() == now.getDate())) {
                                        cell.className = cell.className + " today";
                                    }                                

                                    // if (d.getMonth() == 6 || d.getMonth() == 7) {
                                    //     for (var $i=0; $i<scope.block[scope.blocks_to_use].length; $i++) {
                                    //         var $block = scope.block[scope.blocks_to_use][$i];
                                    //         var $start_date = new Date(scope.block.year + "-" + $block.from).setHours(0, 0, 0, 0);
                                    //         var $end_date = new Date(scope.block.year + "-" + $block.to).setHours(0, 0, 0, 0);
                                    //         if (new Date($start_date).valueOf() <= d.valueOf() && d.valueOf() <= new Date($end_date)) {
                                    //            cell.className = cell.className + " period" + ($i+1); 
                                    //         }
                                    //     }
                                    // }
                                }
                            }
                            row.appendChild(cell);
                        }
                        tblBody.appendChild(row);
                    }

                    if (scope.is_authorized()) {
                        scope.reservation._arrival = '';
                        scope.reservation._departure = '';
                        scope.reservation._entity = '';
                    }
                    
                    tbl.appendChild(tblBody);
                    element.append(tbl);
                }

                scope.$watch('state.year', function (newValue, oldValue) {
                    updateCalendar(newValue);

                    var today = new Date();
                    $('#arrival').datepicker("option", "defaultDate", new Date(newValue, today.getMonth(), today.getDay()));
                    $('#departure').datepicker("option", "defaultDate", new Date(newValue, today.getMonth(), today.getDay()));
                }, true);
                scope.$watch('reservations', function (newValue, oldValue) {
                    updateCalendar(scope.state.year);
                }, true);
            }
        }
    }]);
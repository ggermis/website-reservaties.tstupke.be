angular.module('Main')
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);

angular.module('Main')
	.filter('filter_types', function() {
		return function(reservations, scope) {
			if (reservations == null) { return; }
			return reservations.filter(function(reservation) {
				return (scope.reservation_filter.confirmed && reservation._status == 'confirmed' && ! reservation._deleted) ||
					   (scope.reservation_filter.pending && reservation._status == 'pending' && ! reservation._deleted) ||
					   (scope.reservation_filter.closed && reservation._status == 'closed' && ! reservation._deleted) ||
					   (scope.reservation_filter.deleted && reservation._deleted)
			})
		}
	});
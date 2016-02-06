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
				return (scope.reservation_filter.confirmed && reservation._status == 'confirmed') ||
					   (scope.reservation_filter.pending && reservation._status == 'pending') ||
					   (scope.reservation_filter.closed && reservation._status == 'closed')
			})
		}
	});
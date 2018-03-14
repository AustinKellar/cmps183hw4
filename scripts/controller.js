
var app = angular.module('app', []);
app.filter('orderObjectBy', function() {
	return function(items, field, reverse) {
		var filtered = [];
		angular.forEach(items, function(item) {
			filtered.push(item);
		});
		filtered.sort(function (a, b) {
			return (new Date(a[field]) > new Date(b[field]) ? 1 : -1);
		});
		if(reverse) filtered.reverse();
		return filtered;
	};
});
app.controller('MainController', ['$scope', '$window', '$http', function($scope, $window, $http) {
	$scope.courses = [
		{ number: 'CMPS109', title: 'Advanced Programming', dept: 'Computer Science', quarter: 'Fall' },
		{ number: 'CMPS180', title: 'Database Systems', dept: 'Computer Science', quarter: 'Fall' },
		{ number: 'ARTG80G', title: 'Interactive Design', dept: 'Art and Design', quarter: 'Fall' },
		{ number: 'CMPS128', title: 'Distributed Systems', dept: 'Computer Science', quarter: 'Winter' },
		{ number: 'CMPS183', title: 'Web Applications', dept: 'Computer Science', quarter: 'Winter' },
		{ number: 'CMPM176', title: 'Game Systems', dept: 'Computational Media', quarter: 'Winter' }
	];

	$scope.todoInit = function() {
		$http({
			method: 'GET',
			url: '/get-todos'
		}).then(function successCallback(response) {
			$scope.todos = response.data;
			for(var i=0; i<$scope.todos.length; i++) {
				$scope.todos[i].completed = ($scope.todos[i].completed == 1);
				$scope.todos[i].posted = new Date($scope.todos[i].posted);
				$scope.todos[i].lastUpdated = new Date($scope.todos[i].lastUpdated);
				$scope.todos[i].due = new Date($scope.todos[i].due);
				$scope.todos[i].visible = true;
				$scope.todos[i].edit = false;
				$scope.todos[i].buttonText = 'Edit';

			}
		}, function errorCallback(response) {
			
		});
		$scope.filter = 'Show All';
		$scope.sortBy = 'due';
		$scope.orderBy = $scope.sortBy;
		$scope.filterTable();
		$scope.editing = false;
	};

	$scope.updateDB = function() {
		
	};

	$scope.changeSort = function() {
		var temp = $scope.sortBy;
		if($scope.editing) {
			alert('Cannot sort while editing!')
		} else {
			$scope.orderBy = $scope.sortBy;
		}
	};

	$scope.edit = function(id, type) {
		if(!$scope.editing && type == 'Edit') {
			$scope.editing = true;
			for(var i=0; i<$scope.todos.length; i++) {
				if($scope.todos[i].id == id) {
					$scope.orderBy = '';
					var temp = $scope.todos[0];
					$scope.todos[0] = $scope.todos[i];
					$scope.todos[i] = temp;
					$scope.todos[0].edit = true;
					$scope.todos[0].lastUpdated = new Date();
					$scope.todos[0].buttonText = 'Save';
				}
			}
		} else if(type == 'Save') {
			$scope.editing = false;
			for(var i=0; i<$scope.todos.length; i++) {
				if($scope.todos[i].id == id) {
					$scope.todos[i].edit = false;
					$scope.todos[i].buttonText = 'Edit';
					$scope.orderBy = $scope.sortBy;

					$http.post('/update-todo', $scope.todos[i]).then(function(response) {
						console.log(response.data);
			        }, function (error) {
			            console.log('Could not update the row');
			        });
				}
			}
		} else {
			alert('You can only edit 1 row at a time!');
		}
	};

	$scope.delete = function(id) {
		for(var i=0; i<$scope.todos.length; i++) {
			if($scope.todos[i].id == id) {
				$http.post('/delete', {id: $scope.todos[i].id}).then(function(response) {
					console.log(response.data);
		        }, function (error) {
		            console.log('Could not update the row');
		        });
				$scope.todos.splice(i, 1);
				break;
			}
		}
		$scope.editing = false;
	};

	$scope.check = function(id) {
		for(var i=0; i<$scope.todos.length; i++) {
			if($scope.todos[i].id == id) {
				$http.post('/update-checkbox', {
					completed: $scope.todos[i].completed, 
					id: $scope.todos[i].id
				}).then(function(response) {
					console.log(response.data);
		        }, function (error) {
		            console.log('Could not update the row');
		        });
				$scope.filterTable();
			}
		}
	};

	$scope.filterTable = function() {
		if($scope.todos != undefined) {
			if($scope.filter == 'Show All') {
				for(var i=0; i<$scope.todos.length; i++) {
					$scope.todos[i].visible = true;
				}
			} else if($scope.filter == 'Show Completed') {
				for(var i=0; i<$scope.todos.length; i++) {
					if($scope.todos[i].completed) {
						$scope.todos[i].visible = true;
					} else {
						$scope.todos[i].visible = false;
					}
				}
			} else {
				for(var i=0; i<$scope.todos.length; i++) {
					if(!$scope.todos[i].completed) {
						$scope.todos[i].visible = true;
					} else {
						$scope.todos[i].visible = false;
					}
				}
			}
		}
	};

	$scope.initForm = function() {
		$scope.submission = {
			title: undefined,
			due: undefined,
			notes: undefined
		};
	}

	$scope.submitTask = function() {
		if($scope.submission.title == undefined || $scope.submission.due == undefined || $scope.submission.notes == undefined) {
			alert('You must fill out all fields before submitting!');
		} else {
			if($scope.submission.due < $scope.submission.posted) {
				alert('The due date cannot be before tomorrow\'s date!')
			} else {
				$http.post('/insert', $scope.submission).then(function(response) {
					console.log(response.data);
					alert('Task Submitted!');
					$scope.submission.title = undefined;
					$scope.submission.due = undefined;
					$scope.submission.notes = undefined;
					var host = $window.location.host;
			        var landingUrl = "/list";
			        $window.location.href = landingUrl;
		        }, function (error) {
		            console.log('Could not update the row');
		        });
			}
		}
	};
}]);
angular.module("BlankApp", ["ngMaterial", "ngCookies"])

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .dark();
})
.controller('SecureChatController', ['$scope', '$http', '$cookies', '$window', function ($scope, $http, $cookies, $window) {
  $scope.name = "";
  $scope.users = [];
  $scope.selectedUser;
  $scope.typedMessage = null;
  $scope.messages = [];

  if ($cookies.get('user')) {
    $scope.name = $cookies.get('user');
    $scope.socket = io.connect('http://127.0.0.1:8080');
    $scope.socket.on('connect', function (data) {
      $scope.socket.emit("handshake", {'username': $cookies.get('user')});
      $scope.users.push($scope.name);
      console.log("users = ", $scope.users, $scope.users.length);
      $scope.$apply();
    });

      $scope.socket.on('userJoined', function (data) {
        console.log("joined", data.nickname);
        $scope.users.push(data.nickname);
     });

  };

  $scope.sendMessage = function(typedMessage) {
    console.log("m = ", typedMessage);
    var grainedMessage = {
      content: new String(typedMessage),
      from: $scope.name,
      to: $scope.selectedName,
      date: (new Date()).toISOString()      
    };

    $scope.socket.emit("message", {message: grainedMessage});
    $scope.messages.push(grainedMessage);
    typedMessage = "";
    console.log($scope.messages);
  };


  $scope.selectUser = function(user) {
    if($scope.selectedUser === user) {
      $scope.selectedUser = null;
    } else {
      $scope.selectedUser = user;
    }
  };

  $scope.signout = function() {
        $cookies.remove("user");
        $window.location.reload( function (err, res) {
          console.log(err, res);
        });
  };

  $scope.login = function () {
    $http.post('users/signin', {name: $scope.name}).then(function (data) {
      
      console.log(data);
      if(data) {
        console.log("put cookies", data.data.nickname);
        $cookies.put("user", data.data.nickname);
        $window.location.reload( function (err, res) {
          console.log(err, res);
        });
      }
    });
  };
}
]);


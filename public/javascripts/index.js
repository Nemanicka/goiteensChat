angular.module("BlankApp", ["ngMaterial", "ngCookies"])

.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
  .dark();
})
.controller('SecureChatController', ['$scope', '$http', '$cookies', '$window', '$timeout', '$document', function ($scope, $http, $cookies, $window, $timeout, $document) {
  $scope.name = "";
  $scope.users = [];
  $scope.selectedUser;
  $scope.typedMessage = '';
  $scope.messages = [];

  if ($cookies.get('user')) {
    $scope.name = $cookies.get('user');
    $scope.socket = io.connect('http://127.0.0.1:8080');
    $scope.socket.on('connect', function (data) {
      $scope.socket.on('handshake', function (data) {
        console.log("handshake", data.users);
        $scope.users = $scope.users.concat(data.users);
        $scope.$apply();
        console.log($scope.users);
      });

      $scope.socket.emit("handshake", {'username': $cookies.get('user')});
      $scope.users.push($scope.name);
      console.log("users = ", $scope.users, $scope.users.length);
      $scope.$apply();
    });

    $scope.socket.on('userLeft', function (data) {
      console.log($scope.users);
      console.log("left", data.nickname);
      var index = $scope.users.indexOf(data.nickname);
      console.log("idx = ", index);
      if(index !== -1)
        $scope.users.splice(index, 1);
      $scope.$apply();
    });

      $scope.socket.on('userJoined', function (data) {
        console.log("joined", data.nickname);
        console.log($scope.users);
        $scope.users.push(data.nickname);
        $scope.$apply();
     });

    $scope.socket.on('message', function (data) {
      console.log("onMessage", data);
      console.log(data.message.from, $scope.selectedUser);
      if ($scope.selectedUser === data.message.from) {
        $scope.messages.push(data.message);
        $scope.$apply();
      }
    });

  };

  $scope.$watch(function () {
      return $scope.messages.length;
    }, 
    function(newValue, oldValue) {
      if (newValue !== oldValue) {
        $timeout(function() {
          var lastEc = angular.element($document[0].querySelector("md-content"));
          lastEc[0].scrollTop = lastEc[0].scrollHeight;
        });
      }
    }
  );

  $scope.getRoughDate = function (date) {
    var fullDate = new Date(date);
    return fullDate.getDate() + '.' + fullDate.getMonth() + '.' + fullDate.getFullYear();
  }

  $scope.getPreciseDate = function (date) {
    var fullDate = new Date(date);
    return fullDate.getHours() + ':' + fullDate.getMinutes();
  }

  $scope.sendMessage = function(typedMessage) {
    console.log("m = ", typedMessage);
    var message = String(typedMessage);
    console.log("m = ", message);
    var grainedMessage = {
      content: message,
      from: $scope.name,
      to: $scope.selectedUser,
      date: (new Date()).toISOString()      
    };

    $scope.socket.emit("message", {message: grainedMessage});
    $scope.messages.push(grainedMessage);
    typedMessage = '';
    console.log($scope.messages);
  };


  $scope.selectUser = function(user) {
    if($scope.selectedUser === user) {
      $scope.selectedUser = null;
    } else {
      $scope.selectedUser = user;
      $http.post('users/dialog', {from: user, to: $scope.name}).then(function (data) {
        console.log(data);
        $scope.messages = data.data;
      });
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


var socketsApp=angular.module('socketsApp', ['ngRoute']);

socketsApp.config(function($routeProvider){
    $routeProvider.when('/admin',{
        pageTitle: 'admin',
        templateUrl:'partials/admin.html' 
    }).when('/user',{
        pageTitle: 'user',
        templateUrl: 'partials/user.html'
    })
})


socketsApp.controller('startController',function($scope,socketFactory,$location,$rootScope){
    $scope.User = {
        userName:"",
        userCategory:""
    };
    $rootScope.isCategorySelected = false;
    
    $scope.routeUser = function(){
        $rootScope.userName = $scope.User.userName;
        if($scope.User.userCategory === 'Adminstrator'){
            $location.path('/admin');
        }else{
            $location.path('/user');
        }
        $rootScope.isCategorySelected = true;
    }
}).controller('adminController', function($rootScope, $scope, socketFactory) {

    $rootScope.isCategorySelected = true;
    $scope.activeMessages = [];
    socketFactory.emit("adminEntered", "administrator");
    
    socketFactory.on('__UsersAtOnline', function(data){

        console.log(data);
        $scope.usersOnline = data.userData;
    });

    socketFactory.on('userMessageRecieved', function(data) {
        
        console.log(data.uname+" :: "+data.message+" :: "+data.id);
        if(!$scope.usersOnline[data.id].messages) {

            $scope.usersOnline[data.id].messages = [data.message];
        }else {

            $scope.usersOnline[data.id].messages.push(data.message);
        }
        console.log($scope.usersOnline);
    });
}).controller('userController',function($rootScope, $scope, socketFactory) {
    
    $rootScope.isCategorySelected = true;
    socketFactory.emit("userEntered",$rootScope.userName);

    socketFactory.on('catchAdminSocketId', function(data) {

        console.log(data);
    });

    $scope.activeUser = {
        message: ""
    };

    $scope.userMessages = []
    $scope.sendMessage = function(){

        socketFactory.emit('userMessageSent', {
            message: $scope.activeUser.message,
            uname: $rootScope.userName
        });
        $scope.userMessages.push($scope.activeUser.message);
        console.log($scope.userMessages);
        $scope.activeUser.message = "";
    };
});

socketsApp.factory('socketFactory', function($rootScope) {

    var socketFactory = {};
    var Socket = io.connect('http://localhost:3000');

    socketFactory.on = function(eventName, callback) {

        Socket.on(eventName, function(data) {

            $rootScope.$apply(function() {

                if(callback) {

                    callback.call(Socket, data);
                }
            });
        });
    };

    socketFactory.emit = function(eventName, data, callback) {

        if(!callback) {

            Socket.emit(eventName, data);
        } else {

            Socket.emit(eventName,data, function(data) {

                $rootScope.$apply(function(){

                    callback.call(Socket, data);
                });
            });
        }
    };
    return socketFactory;
})
/* define our modules */
angular.module('quizme.services', []);
angular.module('quizme.filters', []);
angular.module('quizme.directives', []);
angular.module('quizme.controllers', []);

// load controllers
require('./js/controllers/home_controller.js');
require('./js/controllers/login_controller.js');

window.QuizMe = angular.module('QuizMe', [
  'ui.router',
  'quizme.directives',
  'quizme.controllers',
  'quizme.filters',
  'quizme.services',
  'ngAnimate',
  'ngMaterial',
  'lumx'
]);

/* application routes */
QuizMe.config(['$stateProvider','$locationProvider',
 function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'views/login.html'
    })
    .state('app', {
      url: '/app',
      templateUrl: 'views/appframe.html'
    })
    .state('home', {
      url: '/home',
      templateUrl: 'views/home.html'
    })
    .state('/', {
      url: '/',
      templateUrl: 'views/login.html'
    });
}]);



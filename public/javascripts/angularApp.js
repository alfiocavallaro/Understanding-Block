var app = angular.module('understandingBlock', ['ui.router']);
//ui.router è una dipendenza da una libreria esterna!


app.config([ //configurazione. Da qua impostiamo i percorsi di navigazione
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider){
	
	$stateProvider
		.state('home', { //Navigazione al template home -> nostra start page
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl', //Ad essa associamo il controller MainCtrl
			//Utilizzando il resolve in questo modo, assicuriamo che ogni volta che 
			//viene inserito lo stato in Home, verranno richiesti tutti i post dal backend
			//prima che lo stato termina il caricamento.
			resolve: { //chiama la funzione getAll() nel punto appropriato
				postPromise: ['requests', function(requests){
					return requests.getAll();
				}]
			}
		});
	
	$urlRouterProvider.otherwise('home'); //Specifichiamo cosa accade quando riceviamo un url non definito.
}]);

app.factory('requests', ['$http', function($http){ //Definizione di un servizio di tipo factory. Ricordiamo che il
//controller viene istanziato quando necessario e deallocato quando non serve. Per tale motivo
//memorizziamo i post all'interno di un servizio (Singleton) che ne rende possibile l'accesso anche
//da ulteriori controllori
	var o = {					
		requests: [] //lo definiamo all'interno di un oggetto in modo da poterne eventualemente aggiungere campi
	};
	
	o.getAll = function() {
		return $http.get('/requests').success(function(data){
			angular.copy(data, o.requests); //This ensures that the $scope.posts variable
			//in MainCtrl will also be updated, ensuring the new values are reflect in our view.
		});
	};
	
	o.create = function(request){
		return $http.post('/requests?' + request).success(function(res){
			o.getAll();
		});
	};

	o.get = function(id){
		return $http.get('/requests/' + id).then(function(res){
			return res.data;
		});
	};
	
	o.cancel = function(id){
		return $http.delete('/requests/' + id).then(function(res){
			return res.data;
		});
	};
	
	o.deleteAll = function(){
		return $http.delete('/requests').then(function(res){
			o.getAll();
		});
	};

	return o;
}]);


//Controllore che gestisce la logica principale
app.controller('MainCtrl', [
'$scope', //quando viene invocato, ne passiamo lo $scope -> realizza il databinding
'requests',
function($scope, requests){
	$scope.requests = requests.requests;
	
	$scope.parseTrigger = function(trigger){
		if(trigger){
			var tr = JSON.parse(trigger);
			var ret = tr.subject + " ";
			if(tr.room) ret += tr.room + " ";
			ret += tr.sign + " " + tr.object;
			return ret;
		}else{
			return "---";
		}
		
	};
	
	$scope.parseAction = function(action){
		if(!action) return "";
		var act = JSON.parse(action);
		var ret = act.command;
		if(act.value) ret += " " + act.value;
		ret += " " + act.target;
		if(act.room) ret += " " + act.room;
		return ret;
	};
	
	$scope.parseResponse = function(response){
		return JSON.parse(response).replace("[", '').replace("]", '');
	};
	
	$scope.cancel = function(index){
		
		requests.cancel($scope.requests[index]._id);
		$scope.requests.splice(index,1);
	};
	
	$scope.deleteAll = function(){
		requests.deleteAll();
	};
	
	$scope.getConfig = function(){
		window.location = "/config";
	};
	
	$scope.newRequest = function(){
		
		if(!$scope._then) {return;}
		
		var _then = $scope._then;
		
		if($scope._if){
			var _if = $scope._if;
			if($scope._repeat) var _repeat = $scope._repeat;
			else var _repeat = "NO";
		} 
		if($scope._else && _if) var _else = $scope._else;
		
		if(_if) var richiesta = "if=" + _if + "&then=" + _then;
		else var richiesta = "then=" + _then;
		
		if(_else) richiesta += "&else=" + _else;
		if(_repeat) richiesta += "&repeat=" + _repeat;
		
		requests.create(richiesta);
		
		$scope._if = '';
		$scope._then = '';
		$scope._else = '';
	};
	
	$scope.view = function(id){
		requests.get(id);
	};
}]);



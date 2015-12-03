var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var http = require('http');

//Request to Task Coordinator
var options = {
	host: 'localhost',
	path: '/goals',
	port: '3001',
	method: 'POST',
	headers: {
              'Content-Type': 'application/json',
          }
};

router.get('/config', function(req, res, next) {
	var opt = {
		host: 'localhost',
		path: '/config',
		port: '3002',
		method: 'GET'
	};
	
	var httpReq = http.request(opt, function(response) {
		var data = '';
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			res.set('Content-Type', 'text/xml');
			res.send(data);
		});
	}).end();
});

/* Create a new request */
router.post('/requests', function(req, res, next){
	var _if = req.query.if; 
	var _then  = req.query.then; 
	var _else = req.query.else;
	var _repeat = req.query.repeat;	
	
	if(_then != undefined) var action = parseThen(_then);
	if(action == undefined){
		res.send("Malformed Request");
		return;
	}
	
	var request = new Object();
	request.action = action;
	if(_if){
		request.trigger = parseIF(_if);
		if(_else) request.elseAction = parseThen(_else);
		if(_repeat) request.repeat = _repeat;
	}
	
	var json_data = JSON.stringify(request);
	
	var httpReq = http.request(options, function(response) {
		var data = '';
		response.on('data', function (chunk) {
			data += chunk;
		});
		response.on('end', function () {
			saveInMongoDB(request,data); 
			res.send(data);
		});
	});
	
	httpReq.write(json_data);
	httpReq.end();
});


function saveInMongoDB(request, response){
	
	var date = new Date();
	var timestamp = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() +
		"T" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();
	
	var req = new Request();
	req.repeat = request.repeat;
	req.trigger = JSON.stringify(request.trigger);
	req.action = JSON.stringify(request.action);
	req.elseAction = JSON.stringify(request.elseAction);
	req.response = JSON.stringify(response);
	req.timestamp = timestamp;
	req.save();
}

function parseIF(_if){
	var array = _if.split(" ");

	if(array.length == 3 || array.length == 4){
		
		var trigger = new Object();
		trigger.subject = array[0];
		
		if(isSign(array[1])){
			trigger.sign = array[1];
			trigger.object = array[2];
		}else{
			trigger.room = array[1];
			trigger.sign = array[2];
			trigger.object = array[3];
		}
		return trigger;	
	}
}

function isSign(data){
	if(data == "==" || data == "!=" || data == "=!" || data == "=") return true;
	
	if(data == "<" || data == ">" || data == "<=" || data == ">=") return true;
		
	return false;
}

function parseThen(_then){
	var array = _then.split(" ");
	var action = new Object();
	action.command = array[0];
	if(action.command.toLowerCase() == "set"){
		action.value = array[1];
		action.target = array[2];
		action.room = array[3];
	}else if(action.command.toLowerCase() == "get"){
		action.target = array[1];
		action.room = array[2];
	}else{
		return undefined;
	}
	return action;
}

router.param('request', function(req,res,next,id){
	var query = Request.findById(id);
	
	query.exec(function(err, request){
		if(err) {return next(err); }
		if(!request) {return next(new Error('can\'t find request'));}
		
	req.request = request;
	return next();
		
	});
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Understanding Block Request' });
});

/* GET List of Requests*/
router.get('/requests', function(req, res, next) {
	Request.find(function(err, requests){
		if(err){return next(err);}
		res.json(requests)
	})
});

router.delete('/requests', function(req, res, next){
	var r = new Request();
    r.collection.drop(function (err) { 
		res.send("Collection Dropped!");
	});
});

router.get('/requests/:request', function(req, res) {
  res.json(req.request);
});

router.delete('/requests/:request', function(req, res) {
  var id = req.request._id;
  req.request.remove();
  res.send("Dropped: " + id);
});

module.exports = router;

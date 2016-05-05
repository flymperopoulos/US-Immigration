var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/',function(req, res){
	res.sendFile('', { root: path.join(__dirname, './public') });
});

app.get('/final',function(req, res){
	res.sendFile('final.html', { root: path.join(__dirname, './public/views') });
});

app.get('/story',function(req, res){
	res.sendFile('story.html', { root: path.join(__dirname, './public/views') });
});

app.get('/team',function(req, res){
	res.sendFile('team.html', { root: path.join(__dirname, './public/views') });
});
	
var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("Application running on port:", PORT);
});
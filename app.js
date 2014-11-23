//feedback everything
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var buf = new Float32Array(4096);

var num=0;
var audiobuf=[];
var userArr = [];

var app = express();

// all environments
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index',{id: num, title: 'chat'+ num});
  num++;
});

var port = process.env.PORT || 3000;
var server = http.createServer(app).listen(port);
var io = require('socket.io').listen(server);
io.set('log level', 1);
//socket.io動作
io.sockets.on('connection', function(socket) {
  socket.on('status_from_client', function(data) {
    userArr.push(socket.id);
    console.log("now connecting ");
    console.log(userArr[userArr.length-1]);
  });
  
  socket.on('stream_from_client', function(data) {
    var sendID = userArr[Math.floor(Math.random()*(userArr.length-1))];
    socket.to(sendID).json.emit('stream_from_server', {
      id: data.id,
      stream: data.stream
    });
    console.log("emit random from " + data.id + " to " + sendID);
  });

  socket.on("disconnect", function () {
    for(var i = 0; i < userArr.length; i++){
      if (socket.id == userArr[i]) {
        console.log("id:" + i + "(" + userArr[i] + ")...disconnect");
        userArr.splice(i,1);
        console.log("log in list: " + userArr);
      }
    }
  });
});


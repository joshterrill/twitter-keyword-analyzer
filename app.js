var express = require("express");  
var app = express();  
var http = require("http");  
var server = http.createServer(app);  
var io = require("socket.io").listen(server);
var Twit = require("twit");
var OAuth = require('oauth');

server.listen(8080);

app.use(express.static(__dirname + "/views"));

app.get("/", function (req, res) {  
  res.sendFile(__dirname + "/views/index.html");
});

var twit = new Twit({  
  consumer_key: "", 
  consumer_secret: "", 
  access_token: "", 
  access_token_secret: ""
});

io.sockets.on("connection", function (socket) {  
  console.log("Someone connected!");
  var word = ["president"];
  var stream = twit.stream("statuses/filter", { track: word });
  console.log("Tracking new word " + word);
  stream.on("tweet", function (tweet) {  
    io.sockets.emit("stream", tweet);
  });

  socket.on("disconnect", function(socket) {
    console.log("Someone disconnected");
  });
  
  socket.on("gettimeline", function(data) {
    var oauth = new OAuth.OAuth('https://api.twitter.com/oauth/request_token', 'https://api.twitter.com/oauth/access_token', 'consumer_key', 'consumer_secret', '1.0A', null, 'HMAC-SHA1');

    oauth.get( 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=' + data + '&count=5', 'access_token','access_token_secret', 
              function (err, data, result) {
                if (!err) {
                  //console.log(JSON.parse(data));
                  io.sockets.emit("gottimeline", JSON.parse(data))
                }
              });
  });
  
});
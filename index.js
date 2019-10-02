var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/assets',express.static(__dirname + '/assets'));
app.use('/js',express.static(__dirname + '/js'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");
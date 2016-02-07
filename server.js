var express = require('express'),
	app = express(),
	http = require('http'),
	io = require('socket.io'),
	fs = require('fs'),
	port = process.env.PORT || 3000;

http = http.createServer(app);
io = io(http);//Making our server to listen to websockets

var adminSocket = "";
var users = {};

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    //Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', false);

    next();

});



// To serve static files like html, js, css and images
app.use(express.static(__dirname + '/public'));	

// Load socket connection here
io.on('connection', function(socket) {

	socket.on('adminEntered', function(data) {

		adminSocket = socket;
		updateUsers();
	});

	socket.on('userEntered', function(data) {

		socket.nickName = data;
		users[socket.id] = {
			name: socket.nickName,
			id: socket.id
		};
		socket.emit('catchAdminSocketId', adminSocket.id);
		updateUsers();
	});

	socket.on('disconnect', function() {

		delete users[socket.id];
		updateUsers();
	});

	socket.on('userMessageSent', function(data) {
		data.id = socket.id;
		adminSocket.emit('userMessageRecieved', data);
	});

	var updateUsers = function() {

		io.emit('__UsersAtOnline', {
			userData: users
		});
	};
});

app.get('/getData', function(req, res) {

	console.log("Api called");
	fs.readFile('public/partials/chat-ui.html', 'utf8', function(err, data) {

		res.send(data);
	})
});
// Application running on port
http.listen(port, function() {

	console.log("Server is running on port" + port);
});

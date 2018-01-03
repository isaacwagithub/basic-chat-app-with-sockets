//importing express modules and setting the app
var express = require('express');
var app = express();
//creating the server
var server = app.listen(4000,serverListening);

function serverListening(){
	console.log('server listening on http://localhost:4000');
}
//importing socket.io modules
var socket = require('socket.io');
//setting the io
var io = socket(server);
//storing usernames in an array
var usernames = [];
//static files
app.use(express.static('public'));
//socket connection
io.sockets.on('connection',newConnection);

function newConnection(socket){
	console.log(socket.id+' has connected...');
	//socket listening for 'chat' event from client side
	socket.on('chat',emitToClient);
	
	function emitToClient(data){
		console.log(data);
		io.sockets.emit('chat',{message:data,username:socket.username});
	}
	//socket listening for user is 'typing' event from client side
	socket.on('typing',emitTyper);
	
	function emitTyper(data){
		console.log(data.handle);
		socket.broadcast.emit('typing',data);
	}
	
	//socket listening for 'new user' event from client side
	socket.on('new user',newUser);
	
	function newUser(data,callback){
		if(usernames.indexOf(data)!=-1){
			callback(false);
		}else{
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
	        }
	}
	function updateUsernames(){
		io.sockets.emit('showUsers',usernames);
	}
	//when client disconnect
	socket.on('disconnect',disconnectClient);
	
	function disconnectClient(data){
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username),1);
		updateUsernames();
	}
}
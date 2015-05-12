var net = require('net');
var fs = require('fs');

var HOST = '192.168.2.38';
var PORT = 4514;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {
   	  
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
    
    // Add a 'data' event handler to this instance of socket
	this.buf='';
	var sum=0;
    sock.on('data', function(data) {
		//sum+=data.length;
//	console.log(data.toString('ascii'));
        console.log('DATA ',data,data.length);
		var cmd = data.toString('ascii');
		console.log(cmd);
		if(cmd=="MR:ReadFlash:SD-US")
		{
			sock.write("Error Read Unit");
			console.log("Error Read Unit");
		}
		else
		{
		//sock.write("ABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJABCDEFGHIJ");
			sock.write("Switch ON");
			console.log("Switch ON");
			//sock.end();
		}

	});
    
    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);

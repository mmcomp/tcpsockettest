var exec = require('cordova/exec');
function ByteSocketClientPlugin() { 
	console.log("ByteSocketClientPlugin.js: is created");
}
ByteSocketClientPlugin.prototype.sendStringByteAsArray = function(aString){ 
	console.log("ByteSocketClientPlugin.js: sendStringByteAsArray"); 
	exec(function(result){
		/*alert("OK" + reply);*/
	}, function(result){
		/*alert("Error" + reply);*/
	} ,"ByteSocketClientPlugin",aString,[]);
}
var ByteSocketClientPlugin = new ByteSocketClientPlugin(); 
module.exports = ByteSocketClientPlugin;


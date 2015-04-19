var exec = require('cordova/exec');
function CoolPlugin() { 
	//console.log("CoolPlugin.js: is created");
}
CoolPlugin.prototype.send = function(aString,ip,port,successC){ 
	//console.log("CoolPlugin.js: showToast"); 
	exec(function(result){ successC(result); },function(result){} ,"CoolPlugin",'send,'+ip+','+port+','+aString,[]);
}
var coolPlugin = new CoolPlugin(); 
module.exports = coolPlugin;

cordova.define("com.matd.coolplugin.CoolPlugin", function(require, exports, module) { var exec = require('cordova/exec');
function CoolPlugin() { 
	console.log("CoolPlugin.js: is created");
}
CoolPlugin.prototype.showToast = function(aString){ 
	console.log("CoolPlugin.js: showToast"); 
	exec(function(result){
		/*alert("OK" + reply);*/
	}, function(result){
		/*alert("Error" + reply);*/
	} ,"CoolPlugin",aString,[]);
}
var CoolPlugin = new CoolPlugin(); 
module.exports = CoolPlugin;


});

var fileSystem,fileEntry_recv,fileEntry_send,writer_recv,file_send;
var files_ready= true;
var myApp,mainView;
var host = "192.168.2.104",
    data = "-- data to be sent --",
    key = "",
    port = 8124;
var CoolPlugin;            
document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener("backbutton", backPress, false);
function backPress(e)
{
    if(mainView.activePage.name==='index')
       exitApp();
    else
        mainView.goBack();   
}
function exitApp()
{
    myApp.confirm('آیا مایل به خروج هستید؟' ,'خروج',
        function () {
            navigator.app.exitApp();
        }
    );
}
function onDeviceReady(){
    CoolPlugin = ByteSocketPlugin;
    myApp=new Framework7();
    $$=Dom7;
    mainView=myApp.addView('.view-main',{dynamicNavbar:true});
    myApp.onPageInit('index',function(page){
       
    });
    myApp.onPageInit('CMDMRFI',function(page){
       CMDMRFI();
    });
}
function readFromFile(fn){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		fileSystem.root.getFile("log_send.txt", {create: true}, function(fileEntry){
			fileEntry.file(function(file){
				//readDataUrl(file);
				//readAsText(file,fn);
                                readFile(file,fn);
			},fail);
		}, fail);
	}, fail);
}
/*
function readDataUrl(file) {
var reader = new FileReader();
reader.onloadend = function(evt) {
    console.log("Read as data URL");
    console.log(evt.target.result);
};
reader.readAsDataURL(file);
}
*/
function readAsText(file,fn) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
	    console.log("Read as text");
	    console.log(evt.target.result);
	    if(typeof fn === 'function')
	        fn(evt.target.result);
	};
	reader.readAsText(file);
}
function readFile(file,fn) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
	    console.log("Read as text");
            var ab = evt.target.result;
            var ia = new Uint8Array(ab);
	    console.log(ia);
	    if(typeof fn === 'function')
	        fn(ia);
	};
	reader.readAsArrayBuffer(file);
}
function saveToFile(data,fn){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		fileSystem.root.getFile("log_recive.txt", {create: true}, function(fileEntry){
			fileEntry.createWriter(function(writer){
				writer.onwrite = function(evt) {
				    console.log("write success");
				    if(typeof fn === 'function')
					fn();
				};
				writer.write(readyToSave(data));
				writer.abort();
				// contents of file now 'some different text'
			}, fail);
		}, fail);
	}, fail);
}
function readyToSave(inp)
{
    var out='';
    var tmp = inp.split(',');
    for(var i=0;i<tmp.length;i++)
    {
        out+=String.fromCharCode(tmp[i]);
    }   
    return(out);
}
function fail(error) {
	console.log("error : "+error.code);
}

function stub(d) {
	console.log('stub',d);
	alert(d);
}
        
function onConnect(k) {
    console.log('Established connection with ', k);
    key = k;
}

function connect() {
    setHost();
    window.tlantic.plugins.socket.connect(onConnect, stub, host, port);
    //window.tlantic.plugins.socket.connect(stub, stub, host, 18004);
}
function hexToSend(inp){
    var out = [];//String.fromCharCode(0);
    var tmp = String(inp).split("");
    console.log('tmp : ',tmp);
    var buf = '';
    var bite_complte = 0;
    var nm1 = 0;
    for(var i = 0;i <tmp.length; i++)
    {
        buf += tmp[i];
        if(bite_complte >= 1 || i === tmp.length-1)
        {
            bite_complte = -1;
            console.log('converting "'+buf+'" ',buf);
            try {
                nm1 = parseInt(buf,16);
            }
            catch(e){
                nm1=0;
            }
            
            console.log('result : ',nm1,String.fromCharCode(nm1));
            out.push(nm1);
            buf = '';
        }
        bite_complte ++;
    }
    console.log('out = ',out);
    return(out);
}
function newSend(dt)
{
    var ip =$("#host").val().trim();
    var port = $("#port").val().trim();
    var tt='';
    for(var i=0;i<dt.length;i++)
        tt+= (tt===''?'':',')+dt[i];
    CoolPlugin.send(tt,ip,port,-1,function(res){
        console.log(res);
        if(res.split('|')[0]==='true')
        {
            alert('ارسال با موفقیت انجام شد');
            
            if($("#saveinfile").val()==='1')
		saveToFile(res.split('|')[1]);
            else
               $("#repon").html(res.split('|')[1]);
            
        }
        else
        {
            alert('خطا در ارسال ' + res);
        } 
    });
    //dt=[65,65];
    /*
    for(var i in dt)
    {
        tt+=String.fromCharCode(dt[i]);
    }    
    window.tlantic.plugins.socket.sendNoEnter(stub, stub, key, tt);
    */
    
}
function send(id) {
    data = $('#cmd'+id).val().trim();
    //if($("#is_hex").prop('checked')===true)
    if($("#is_hex").val()==='1')
    {    
        if(isNaN(parseInt(data,16)))
        {
            alert('عدد در مبنای 16  وارد کنید');
            return(0);
        }
        data = hexToSend(data);
        data = data.join();
    }
    else
    {
        if(isNaN(parseInt(data,10)))
        {
            alert('عدد وارد کنید');
            return(0);
        }    
    }    
    console.log('send : ',data);
    var ip =$("#host").val().trim();
    var port = $("#port").val().trim();
    //window.tlantic.plugins.socket.send(stub, stub, key, data);
    CoolPlugin.send(data,ip,port,-1,function(res){
        console.log(res);
        if(res.split('|')[0]==='true')
        {
            alert('ارسال با موفقیت انجام شد');

            if($("#saveinfile").val()==='1')
		saveToFile(res.split('|')[1]);
            else
            {   
                $("#repon").html(''); 
                var tt = res.split('|')[1].split(',');
                for(var i=0;i<tt.length;i++)
                    $("#repon").append( decimalToHexString(parseInt(tt[i],10))+(( i>0 && i%16===0)?'<br/>':''));  
                    
           }   

        }
        else
        {
            alert('خطا در ارسال ' + res);
        }    
    });
}
function sendFromFile()
{
	readFromFile(function(data){
            /*
            var dt = '';
            for(var i = 0;i < data.length;i++)
            {
                dt += String.fromCharCode(data[i]);
            }
            console.log(dt);
            */
            //var stringdata = String.fromCharCode.apply(null, data);
            //var stringdata = '';//data.join(',');
            //for(var i = 0;i < data.length;i++)
                //stringdata += ((i>0)?',':'')+String(data[i]);
            //console.log(stringdata);
            //window.tlantic.plugins.socket.send(stub, stub, key, data);
            newSend(data);
	});
}
function disconnect() {
    window.tlantic.plugins.socket.disconnect(stub, stub, key);
}

function disconnectAll() {
    window.tlantic.plugins.socket.disconnectAll(stub, stub);
}

function isConnected() {
    window.tlantic.plugins.socket.isConnected(key, stub, stub);
}

document.addEventListener('SOCKET_RECEIVE_DATA_HOOK', function (ev) {
	console.log('Data has been received: ', JSON.stringify(ev.metadata));
	//if($("#saveinfile").prop("checked")===true)
        if($("#saveinfile").val()==='1')
		saveToFile(ev.metadata.data);
	else
		$("#repon").html(ev.metadata.data);
});
function setHost()
{
	if($("#host").val().trim()!=='')
		host = $("#host").val().trim();
	if($("#port").val().trim()!=='')
		port = $("#port").val().trim();
}
function decimalToHexString(number)
{
    if (number < 0)
    {
    	number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}
function stringToAscii(inp)
{
    var out='';
    for(var i=0;i<inp.length;i++)
    {
        out+= ((out==='')?'':',')+inp[i].charCodeAt();
    }
    return(out);
}
function inToString(inp)
{
    out='';
    var tmp = inp.split(',');
    for(var i=0;i<tmp.length;i++)
    {
        if(tmp[i]!=='0')
        {
            out+= String.fromCharCode(tmp[i]);
        }    
    }
    return (out);
}
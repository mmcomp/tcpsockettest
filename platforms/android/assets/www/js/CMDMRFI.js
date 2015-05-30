var ip =$("#host").val().trim();
var port = $("#port").val().trim();
var continue_loop = true;
function CMDMRFI()
{
    var cmd=stringToAscii('MR:ReadFlash:IC-SD');
    CoolPlugin.send(cmd,ip,port,10,function(res){
        if(res.split('|')[0]==='true')
        {
            var input_str = inToString(res.split('|')[1]);
            console.log('CMDMRFI',input_str);
            if(input_str==='Switch OFF')
            {
                openNot('لطفا سوئیچ را باز کنید');
                if(continue_loop)
                    startLoop();
                else
                {
                    continue_loop = true;
                    sendXX();
                }
            }
            else if (input_str==='Switch ON')
            {
                isComunicate();
            }    
        }
    });
}
function isComunicate()
{
    var cmd=stringToAscii('MR:ReadFlash:SD-US');
    console.log(cmd);
    CoolPlugin.send(cmd,ip,port,15,function(res){
        if(res.split('|')[0]==='true')
        {
            var input_str = inToString(res.split('|')[1]);
            console.log('isComunicate',input_str);
            if(input_str === 'Switch OFF')
            {
                console.log('Switch Off');
            }
            else if(input_str==='Switch ON')
            {
                openNot('لطفا سوئیچ را ببندید');
                if(continue_loop)
                    isComunicate();
                else
                {
                    continue_loop = true;
                    sendXX();
                }
            }
            else if(input_str==='Error Read Unit')
            {
                openNot('خطا در برقراری ارتباط با یونیت');
            }
        }   
    });

}
function openNot(inp)
{
    /*
    myApp.addNotification({
        title: 'پیام',
        message: inp
    });
    */
   $("#CMDMRFI_msg").html(inp);
}
function startLoop()
{
    setTimeout(function(){
        CMDMRFI();
    },2000);
}
function stopLoop()
{
    continue_loop = false;
}
function sendXX()
{
    var cmd=stringToAscii('XX');
    CoolPlugin.send(cmd,ip,port,0,function(res){
        console.log('XX Done.');
        mainView.loadPage('index.html');
    });
}
function startSql()
{
    sql_stack_index = 0;
    if(sql_stack_index < sql_stack_objs.length)
    {
        if($.trim(sql_stack_objs[sql_stack_index].sql_stack)!=='')
        {
            //console.log(sql_stack_objs[sql_stack_index]);
            sql = '';
            ex_sql_det(sql_stack_objs[sql_stack_index].sql_stack,function(dataset,inId,err){
                var fn = sql_stack_objs[sql_stack_index].sql_callback_stack;
                if(typeof fn === 'function')
                    fn(dataset,inId,err);
                //console.log(dataset,inId,err);
                sql_stack_objs[sql_stack_index].done = true;
                //sql_stack_index++;
                sql_stack_objs.splice(0,1);
                startSql();
            });
        }
        else
        {
            //sql_stack_index++;
            //startSql();
            //console.log('empty query : ',sql_stack_objs[sql_stack_index]);
        }   
    }
    else
    {
        //sql_stack_index = 0;
        //startSql();
        //console.log('DONE SQLS');
    }
}
function createTable1(tx)
{
    for(var i = 0;i < intialQuery.length;i++)
            tx.executeSql(intialQuery[i]);
}
function createTable()
{
    for(var i = 0;i < intialQuery.length;i++)
    {
            //sql_stack.push(intialQuery[i]);
            //sql_callback_stack.push(false);
            ex_sql(intialQuery[i],false);
    }
}
function errorCB(err) {
    console.log(sql,err);
    myApp.alert("Error processing SQL: "+err.message,alert_head);
    if(typeof ex_sql_callback==='function')
        ex_sql_callback([],-1,err);
    db_bussy = false;
    return false;
}

function successCB() {
    db_bussy = false;
}

function populateDBIn(tx) {
    if(sql!=='')
    {
        tx.executeSql(sql);
        if(typeof ex_sqlx_callback==='function')
            ex_sqlx_callback();
    }
}
function populateDBInOut(tx) {
    if(sql!=='')
    {
        tx.executeSql(sql,[], querySuccess, errorCB);
        sql = '';
    }
}
function querySuccess(tx, results) {
    dataset = [];
    inId = -1;
    res = results;
    rowss = res.rows;
    for(var i = 0;i < rowss.length; i++)
    {
        var row = rowss.item(i);
        dataset.push(row);
    }
    try{
        if(res.rowsAffected>0)
                inId = res['insertId'];
    }catch(e){
    }
    if(typeof ex_sql_callback==='function')
        ex_sql_callback(dataset,inId);
}
function ex_sqlx_det(sqlIn,fn)
{
    sql = sqlIn;
    ex_sqlx_callback = fn;
    db.transaction(populateDBIn, errorCB, successCB);
}
function ex_sql_det(sqlIn,fn)
{
    sql = sqlIn;
    ex_sql_callback = fn;
    db.transaction(populateDBInOut, errorCB, successCB);
}
function ex_sql(sqlIn,fn)
{
    //sql_stack.push(sqlIn);
    //sql_callback_stack.push(fn);
    var sql_started = (sql_stack_objs.length>0);
    sql_stack_objs.push({
       "sql_stack" : sqlIn,
       "sql_callback_stack" : fn,
       "done" : false
    });
    if(!sql_started)
        startSql();
}
//---------------------Conf-------------------------------------
function conf_add(key,value,fn)
{
    ex_sql("select id from conf where key = '"+key+"'",function(data,a){
       if(data.length > 0) 
       {
           ex_sql("update conf set value='"+value+"' where id = "+data[0].id,function(a,b){
               if(typeof fn === 'function')
                    fn(data[0].id);
           });
       }
       else
       {
           ex_sql("insert into conf (key,value) values ('"+key+"','"+value+"')",function(a,id){
               if(typeof fn === 'function')
                    fn(id);
           });
       }
    });
}
function conf_get(key,fn)
{

    ex_sql("select * from conf where key = '"+key+"'",function(data,a){

        if(data.length > 0) 
        {
            if(typeof fn === 'function')
                fn(data[0]);
        }
        else
        {
            if(typeof fn === 'function')
                fn({
                    "id" : 0,
                    "key" : "",
                    "value" : ""
                });
        }
    });

}
function conf_remove(key,fn)
{
    //console.log("delete from conf where key = '"+key+"'");
    ex_sql("delete from conf where key = '"+key+"'",function(b,a){
        //console.log('delete done');
        if(typeof fn === 'function')
            fn();
    });

}
//--------------------------------------------------------------
//---------------------User-------------------------------------
function logoutUser(fn)
{
    //-----ClearManifestData-------------------------
    ex_sql("delete from manifest",function(){
        ex_sql("delete from manifest_det",function(){
            conf_remove('user',function(){
                conf_remove('pass',function(){
                    user = '';
                    pass = '';
                    if(typeof fn === 'function')
                        fn();
                });
            });            
        });
    });

}
function loginUser(username,password,fn)
{
    user = username;
    pass = password;
    conf_add('user',user,function(){
        conf_add('pass',pass,function(){
            if(typeof fn === 'function')
                fn();
        });
    });
}
function loadUser(fn)
{
    conf_get('user',function(obj1){
        user = obj1.value;
        conf_get('pass',function(obj2){
            pass = obj2.value;
            if(typeof fn === 'function')
                fn();
        });
    });
}
//---------------------Manifest---------------------------------
function manifest(){
    this.construct = function(id,fn){
        var mani = this;
        ex_sql("select * from manifest where id = "+id,function(data,b){
            if(data.length === 1)
            {
                for(i in data[0])
                    mani[i] = data[0][i];
            }
            if(typeof fn === 'function')
                fn(mani);
        });
    };
    this.load = function(f_number,f_date,fn){
        var mani = this;
        ex_sql("select * from manifest where f_number = '"+f_number+"' and f_date = '"+f_date+"'",function(data,b){
            if(data.length === 1)
            {
                for(i in data[0])
                    mani[i] = data[0][i];
            }
            if(typeof fn === 'function')
                fn(mani);
        });
    };
    this.loadAll = function(fn){
        ex_sql("select * from manifest ",function(data,b){
            if(typeof fn === 'function')
                fn(data);
        });
    };
    this.loadSync = function(fn){
        ex_sql("select * from manifest where is_sync = 1",function(data,b){
            var odata = [];
            var j;
            for(var i = 0;i < data.length;i++)
            {
                var tmp = new manifest();
                for(j in data[i])
                    tmp[j] = data[i][j];
                odata.push(tmp);
            }
            if(typeof fn === 'function')
                fn(odata);
        });
    };
    this.loadUnSync = function(fn){
        ex_sql("select * from manifest where is_sync = 0 order by f_date desc",function(data,b){
            var odata = [];
            var j;
            for(var i = 0;i < data.length;i++)
            {
                var tmp = new manifest();
                for(j in data[i])
                    tmp[j] = data[i][j];
                odata.push(tmp);
            }
            if(typeof fn === 'function')
                fn(odata);
        });
    };
    this.add = function(f_number,f_date,fn)
    {
        var mani = this;
        ex_sql("select * from manifest where f_number = '"+f_number+"' and f_date = '"+f_date+"'",function(data,b){
            if(data.length >0)
            {
                for(i in data[0])
                    mani[i] = data[0][i];
                if(typeof fn === 'function')
                        fn(mani['id']);
            }
            else
            {
                ex_sql("insert into manifest (f_number,f_date,is_sync) values ('"+f_number+"','"+f_date+"','0')",function(a,id){
                    mani['id'] = id;
                    mani['f_number'] = f_number;
                    mani['f_date'] = f_date;
                    mani['is_sync'] = 0;
                    if(read_from_web===true)
                    {
                        hs_update_manifest_det = true;
                        manifest_refresh = true;
                        console.log("insert into manifest (f_number,f_date,is_sync) values ('"+f_number+"','"+f_date+"','0')");
                    }
                    if(typeof fn === 'function')
                        fn(id);
                });
            }
        });
    };
    this.delete = function(delete_det,fn){
        if(typeof this.id !== 'undefined' && this.id > 0)
        {
            var id = this.id;
            ex_sql("delete from manifest where id = "+id,function(a,b){
                if(delete_det === true)
                {
                    ex_sql("delete from manifest_det where manifest_id = "+id,function(a,b){
                        if(typeof fn === 'function')
                            fn(true);
                    });
                }else if(typeof fn === 'function')
                    fn(true);
            });
        }
        else
            fn(false);
    };
    this.deleteDet = function(fn){
        if(typeof this.id !== 'undefined' && this.id > 0)
        {
            var id = this.id;
            ex_sql("delete from manifest_det where manifest_id = "+id,function(a,b){
                if(typeof fn === 'function')
                    fn(true);
            });
        }
        else
            fn(false);
    };
    this.manifestCount = function(fn){
        if(typeof this.id !== 'undefined' && this.id > 0)
        {
            var id = this.id;
            ex_sql("select count(id) as cid from manifest_det where manifest_id = "+id,function(data,b){
                fn(id,data[0].cid);
            });
        }
        else
            fn(-1,-1);
    };
    this.checkSync = function(fn){
        var mn = this;
        ex_sql("select id from manifest_det where is_sync = 0 and manifest_id = "+mn.id,function(data,b){
            var is_sync_mn = ((data.length===0)?'1':'0');
            ex_sql("update manifest set is_sync = "+is_sync_mn+" where id = "+mn.id,function(a,b){
                if(typeof fn === 'function')
                    fn(true);
            });
        });
    };
}
//--------------------------------------------------------------
//------------------ManifestDet---------------------------------
function manifest_det(){
    this.construct = function(id,fn){
        var mani = this;
        ex_sql("select * from manifest_det where id = "+id,function(data,b){
            if(data.length === 1)
            {
                for(i in data[0])
                    mani[i] = data[0][i];
            }
            if(typeof fn === 'function')
                fn(mani);
        });
    };
    this.load = function(wer,fn){
        ex_sql("select * from manifest_det "+wer,function(data,b){
            if(typeof fn === 'function')
                fn(data);
        });
    };
    this.add = function(manifest_obj,is_sync,ticket_type,stat,mablagh,seet,pass_id,serial,customer_name,name,family,age,mobile,passport,expiredate,birthday,sex,user_id,voucher_id,fn)
    {
        console.log('adding started ...');
        var manifest_id = manifest_obj.id;
        var check_q = "select manifest_det.id as oid,manifest_det.name as oname,manifest_det.family as ofamily,manifest_det.stat as ostat,manifest_det.user_id as ouser_id from manifest_det left join manifest on (manifest_id=manifest.id) where pass_id = '"+pass_id+"' and f_number = '"+manifest_obj.f_number+"' and f_date = '"+manifest_obj.f_date+"'";
        var mani = this;
        var old_id = -1;
        var old_stat = 0;
        var ouser_id = 0;
        var new_stat = parseInt(stat,10);
        var q = "insert into manifest_det (manifest_id,is_sync,ticket_type,stat,mablagh,seet,pass_id,serial,customer_name,name,family,age,mobile,passport,expiredate,birthday,sex,user_id,voucher_id) values ";
        q+= "('"+manifest_id+"','"+is_sync+"','"+ticket_type+"','"+stat+"','"+$.trim(mablagh)+"','"+$.trim(seet)+"','"+$.trim(pass_id)+"','"+$.trim(serial)+"','"+$.trim(customer_name)+"','"+$.trim(name)+"','"+$.trim(family)+"','"+$.trim(age)+"','"+$.trim(mobile)+"','"+$.trim(passport)+"','"+$.trim(expiredate)+"','"+$.trim(birthday)+"','"+$.trim(sex)+"','"+$.trim(user_id)+"','"+$.trim(voucher_id)+"')";
        console.log(check_q);
        ex_sql(check_q,function(data1,b1){
            console.log(data1);
            if(data1.length === 0)
            {
                //console.log(check_q);
                console.log(q);
                ex_sql(q,function(a,id){
                    mani['id'] = id;
                    mani['manifest_id'] = manifest_id;
                    mani['is_sync'] = is_sync;
                    mani['ticket_type'] = ticket_type;
                    mani['stat'] = stat;
                    mani['mablagh'] = mablagh;
                    mani['seet'] = seet;
                    mani['pass_id'] = pass_id;
                    mani['serial'] = serial;
                    mani['customer_name'] = customer_name;
                    mani['name'] = name;
                    mani['family'] = family;
                    mani['age'] = age;
                    mani['mobile'] = mobile;
                    mani['passport'] = passport;
                    mani['expiredate'] = expiredate;
                    mani['birthday'] = birthday;
                    mani['sex'] = sex;
                    mani['user_id'] = user_id;
                    mani['voucher_id'] = voucher_id;
                    if(read_from_web===true)
                    {
                        hs_update_manifest_det = true;
                        manifest_refresh = true;
                        console.log(q);
                    }
                    //console.log('id = '+id);
                    if(typeof fn === 'function')
                        fn(id);
                });
            }
            else if(!isNaN(new_stat) && new_stat>0)
            {
                old_id = data1[0].oid;
                old_stat = parseInt(data1[0].ostat,10);
                ouser_id = parseInt(data1[0].ouser_id,10);
                if(isNaN(ouser_id))
                    ouser_id = 0;
                if(new_stat !== old_stat && (old_stat !== 1 || (old_stat === 1 && ouser_id<=0)))
                {
                    console.log("update manifest_det set name = '"+name+"' , family = '"+family+"',stat = "+new_stat+",user_id = '"+user_id+"',voucher_id='"+voucher_id+"' where id = "+old_id);
                    ex_sql("update manifest_det set name = '"+name+"' , family = '"+family+"',stat = "+new_stat+",user_id = '"+user_id+"',voucher_id='"+voucher_id+"' where id = "+old_id,function(){
                        if(read_from_web===true)
                        {
                            hs_update_manifest_det = true;
                            manifest_refresh = true;
                            console.log("update manifest_det set name = '"+name+"' , family = '"+family+"',stat = "+new_stat+",user_id = '"+user_id+"',voucher_id='"+voucher_id+"' where id = "+old_id);
                        }
                        if(typeof fn === 'function')
                            fn(old_id);
                    });
                }
                else
                {
                    if(typeof fn === 'function')
                        fn(old_id);
                }
            }
            else if($.trim(data1[0].oname)!==$.trim(name) || $.trim(data1[0].ofamily)!==$.trim(family))
            {
                old_id = data1[0].oid;
                console.log("update manifest_det set name = '"+name+"' , family = '"+family+"',user_id = '"+user_id+"',voucher_id='"+voucher_id+"' where id = "+old_id);
                ex_sql("update manifest_det set name = '"+name+"' , family = '"+family+"',user_id = '"+user_id+"',voucher_id='"+voucher_id+"' where id = "+old_id,function(){
                    if(read_from_web===true)
                    {
                        hs_update_manifest_det = true;
                        manifest_refresh = true;
                        console.log("update manifest_det set name = '"+name+"' , family = '"+family+"',user_id = '"+user_id+"',voucher_id='"+voucher_id+"' where id = "+old_id);
                    }
                    if(typeof fn === 'function')
                        fn(old_id);
                });
            }
            else
            {
                console.log('can not add id=',data1);
                old_id = data1[0].oid;
                if(typeof fn === 'function')
                    fn(old_id);
            }
        });
    };
    this.setStat = function (stat,fn){
        var id = this.id;
        if(typeof this.stat === 'undefined')
        {
            this.construct(id,function(){
                var old_stat = this.stat;
                var user_id = parseInt(this.user_id,10);
                if(old_stat === 1 && (isNaN(user_id) || (!isNaN(user_id) && user_id<=0)))
                {
                    if(typeof fn === 'function')
                        fn(id);
                }
                else
                {
                    ex_sql("update manifest_det set stat = '"+stat+"' where id = "+id,function(){
                        if(read_from_web===true)
                            hs_update_manifest_det = true;
                        if(typeof fn === 'function')
                            fn(id);
                    });
                }
            });
        }
        else
        {
            var old_stat = this.stat;
            var user_id = parseInt(this.user_id,10);
            if(old_stat === 1 && (isNaN(user_id) || (!isNaN(user_id) && user_id<=0)))
            {
                if(typeof fn === 'function')
                    fn(id);
            }
            else
            {
                ex_sql("update manifest_det set stat = '"+stat+"' where id = "+id,function(){
                    if(read_from_web===true)
                        hs_update_manifest_det = true;
                    if(typeof fn === 'function')
                        fn(id);
                });
            }
        }
    };
    this.setSync = function (is_sync,fn){
        var id = this.id;
        ex_sql("update manifest_det set is_sync = '"+is_sync+"' where id = "+id,function(){
            if(typeof fn === 'function')
                fn(id);
        });
    };
    this.removeOthers = function (manifest_id,fn){
        //console.log('remove others ...');
        if(pass_ids.length > 0)
        {
            var ptmp = pass_ids.join();
            pass_ids = [];
            //console.log("delete from manifest_det where manifest_id = "+manifest_id+" and not (pass_id in ("+ptmp+"))");
            ex_sql("delete from manifest_det where manifest_id = "+manifest_id+" and not (pass_id in ("+ptmp+"))",function(a,b,c){
                if(typeof fn === 'function')
                    fn();
            });
        }
    };
}
//--------------------------------------------------------------
function shownTicket(manifest_det_id,in_stat)
{
    var md = new manifest_det();
    md['id'] = manifest_det_id;
    md.setStat(in_stat,function(){
        md.construct(manifest_det_id,function(obj){
            addFlownRow(obj);
            var mn = new manifest();
            mn.construct(md.manifest_id,function(){
                var hamed;
                var found_index = -1;
                for(hamed in mani_det_to_send)
                    if(mani_det_to_send[hamed].id === md.id)
                    {
                        found_index = hamed;
                    }
                if(found_index >= 0)
                    mani_det_to_send.splice(found_index,1);
                mani_det_to_send.push({
                    "f_number" : mn.f_number,
                    "f_date"   : mn.f_date,
                    "pass_id"  : md.pass_id,
                    "serial"   : md.serial,
                    "id"       : md.id,
                    "stat"     : md.stat,
                    "manifest_id" : mn.id,
                    "manifest_det_obj" : md
                });                
            });
        });
    });
}
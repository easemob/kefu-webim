/*
    数据和配置参数初始化
*/
EasemobWidget.init = function(obj, callback) {
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    //音频暂停的兼容，还未使用
    typeof HTMLAudioElement !== 'undefined' && (HTMLAudioElement.prototype.stop = function() {
        this.pause(); 
        this.currentTime = 0.0; 
    });


    var wrapper = $('#normal');
    var message = new EmMessage();
    var tenantId = obj.json.tenantId;

    
    $.when(
        EasemobWidget.api.getTo(tenantId)
        , EasemobWidget.api.getStatus(tenantId)
        , EasemobWidget.api.getTheme(tenantId)
        , EasemobWidget.api.getWord(tenantId)
    )
    .done(function(toinfo, sinfo, tinfo, winfo){

        obj.offline = sinfo;
        if(toinfo.length > 0) {
            obj.to = toinfo[0].imServiceNumber;
            obj.orgName = toinfo[0].orgName;
            obj.appName = toinfo[0].appName;
            obj.tenantName = toinfo[0].tenantName;
            obj.appkey = toinfo[0].orgName + '#' + toinfo[0].appName;
        } else {
            return;
        }

        obj.theme = tinfo && tinfo.length ? tinfo[0].optionValue : '天空之城';
        obj.word = winfo && winfo.length ? winfo[0].optionValue : '';

        var curUser;
        if(obj.root) {
            curUser = Emc.getcookie('emKefuChannel') != (obj.to + '*' + obj.orgName + '*' + obj.appName) 
                ? null 
                : Emc.getcookie('emKefuUser');

            Emc.setcookie('emKefuChannel', obj.to + '*' + obj.orgName + '*' + obj.appName);
        } else {
            curUser = obj.json.c != (obj.to + '*' + obj.orgName + '*' + obj.appName) 
                ? null 
                : obj.json.u;

            message.sendToParent('setchannel@' + obj.to + '*' + obj.orgName + '*' + obj.appName);
        }

        /*
            如果取到缓存user，获取密码，否则新创建
        */
        if(curUser) {
            obj.user = curUser;
            
            $.when(
                EasemobWidget.api.getPwd(obj)
                , EasemobWidget.api.getGroup(obj)
            )
            .done(function(p, g){
                wrapper.attr('data-group', g);
                obj.password = p;
                typeof callback == 'function' && callback();
            })
            .fail(function(){});
        } else {
            wrapper.attr('data-history', 1);//新用户不获取历史记录
            $.when(EasemobWidget.api.getUser(obj))
            .done(function(info){
                obj.user = info.userId;
                obj.password = info.userPassword;
                obj.root ? Emc.setcookie('emKefuUser', obj.user) : message.sendToParent('setuser@' + obj.user);
                typeof callback == 'function' && callback();
            });
        }
    })
    .fail(function(){});
}

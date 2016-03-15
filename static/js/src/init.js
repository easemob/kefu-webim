/*
 * 数据和配置参数初始化
 */

var EasemobWidget = EasemobWidget || {};
EasemobWidget.init = function(obj, callback) {
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    //音频暂停的兼容，还未使用
    typeof HTMLAudioElement !== 'undefined' && (HTMLAudioElement.prototype.stop = function() {
        this.pause(); 
        this.currentTime = 0.0; 
    });


    var wrapper = $('#normal');
    var message = new TransferMessage();
    var tenantId = obj.json.tenantId;

    
	EasemobWidget.api.getTo(tenantId)
    .done(function(toinfo){

        if(toinfo.length > 0) {
            obj.to = toinfo[0].imServiceNumber;
            obj.orgName = toinfo[0].orgName;
            obj.appName = toinfo[0].appName;
            obj.avatar = toinfo[0].tenantAvatar || 'static/img/default_avatar.png';
            obj.tenantName = toinfo[0].tenantName;
            obj.appkey = toinfo[0].orgName + '#' + toinfo[0].appName;
			obj.logo = toinfo[0].tenantLogo || '';
        } else {
            return;
        }

        var curUser;
        if ( obj.root ) {
            if ( Emc.getcookie('emKefuChannel') != (obj.to + '*' + obj.orgName + '*' + obj.appName) ) {
                curUser = null;
                Emc.setcookie('emKefuChannel', obj.to + '*' + obj.orgName + '*' + obj.appName);
            } else {
                if ( obj.json && obj.json.emgroup ) {
                    curUser = Emc.getcookie(obj.json.emgroup);
                } else {
                    curUser = Emc.getcookie('emKefuUser');
                }
            }

        } else {
            curUser = obj.json.c != (obj.to + '*' + obj.orgName + '*' + obj.appName) 
                ? null 
                : obj.json.u;

            message.sendToParent('setchannel@' + obj.to + '*' + obj.orgName + '*' + obj.appName);
        }

		obj.user = curUser;
		typeof callback == 'function' && callback();
        
    });
};

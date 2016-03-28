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
		var curIdx = 0;

        if(toinfo.length > 0) {
            obj.to = toinfo[curIdx].imServiceNumber;
            obj.orgName = toinfo[curIdx].orgName;
            obj.appName = toinfo[curIdx].appName;
            obj.apiUrl = toinfo[curIdx].restDomain ? '//' + toinfo[curIdx].restDomain : '//a1.easemob.com';

			var cluster = toinfo[curIdx].restDomain ? toinfo[curIdx].restDomain.match(/vip[\d]/) : '';
            obj.cluster = cluster && cluster.length > 0 ? '.' + cluster[0] : '';
            obj.avatar = toinfo[curIdx].tenantAvatar || 'static/img/default_avatar.png';
            obj.tenantName = toinfo[curIdx].tenantName;
            obj.appkey = toinfo[curIdx].orgName + '#' + toinfo[curIdx].appName;
			obj.logo = toinfo[curIdx].tenantLogo || '';
        } else {
            return;
        }

        var curUser;
        if ( obj.root ) {
            if ( Emc.get('emKefuChannel' + tenantId, obj.json.tenants) != (obj.to + '*' + obj.orgName + '*' + obj.appName) ) {
                curUser = null;
                Emc.set('emKefuChannel' + tenantId, obj.to + '*' + obj.orgName + '*' + obj.appName, obj.json.tenants);
            } else {
                if ( obj.json && obj.json.emgroup ) {
                    curUser = Emc.get(obj.json.emgroup + tenantId, obj.json.tenants);
                } else {
                    curUser = Emc.get('emKefuUser' + tenantId, obj.json.tenants);
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

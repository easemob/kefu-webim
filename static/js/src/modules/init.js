/*
 * 数据和配置参数初始化
 */

var EasemobWidget = EasemobWidget || {};
EasemobWidget.init = function ( obj, callback ) {

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

			var cluster = toinfo[curIdx].restDomain ? toinfo[curIdx].restDomain.match(/vip\d/) : '';
            obj.cluster = cluster && cluster.length > 0 ? cluster[0] : '';
            obj.avatar = toinfo[curIdx].tenantAvatar || 'static/img/default_avatar.png';
            obj.tenantName = toinfo[curIdx].tenantName;
            obj.appkey = toinfo[curIdx].orgName + '#' + toinfo[curIdx].appName;
			obj.logo = toinfo[curIdx].tenantLogo || '';
        } else {
            return;
        }

        if ( obj.mobile ) {
			Emc.set('emKefuChannel' + tenantId, obj.to + '*' + obj.orgName + '*' + obj.appName, obj.json.tenants);
        } else {
            message.sendToParent({ event: 'setchannel', channel:  obj.to + '*' + obj.orgName + '*' + obj.appName, tenantId: tenantId });
        }

		typeof callback == 'function' && callback();
    });
};

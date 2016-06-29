;(function () {
    return false;
	var wechat = /MicroMessenger/.test(navigator.userAgent);
	var wechatAuth = easemobim.utils.query('wechatAuth');
    var code = easemobim.utils.query('code'),
        tenantId = easemobim.utils.query('tenantId');

	if ( !wechat || !wechatAuth || !tenantId ) {
		return false;
	}


	

	/*var getProfile = function ( code, callback ) {
		//get profile
		easemobim.emajax({
			url: '/v1/weixin/sns/userinfo/' + code
			, data: { tenantId: tenantId }
			, type: 'GET'
			, success: function ( info ) {
				callback(info);
			}
			, error: function ( info ) {
				callback(info);
			}
		});
	};*/

	if ( !code ) {
		//step1 get code
		var url = encodeURIComponent(location.href);
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx1e7ed77036581061&redirect_uri=' + url + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';

	} /*else {
		
		getProfile(code, function ( resp ) {
			alert(JSON.stringify(resp));
		});
	}*/
}());

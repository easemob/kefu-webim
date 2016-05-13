;(function () {

	/*var wechat = /MicroMessenger/.test(navigator.userAgent);
	var wechatAuth = easemobim.utils.query('wechatAuth');


	if ( !wechat || !wechatAuth ) {
		return false;
	}


	var code = easemobim.utils.query('code');

	var getProfile = function ( code, callback ) {
		//step3 get profile
		easemobim.emajax({
			url: ''
			, data: null
			, type: 'GET'
			, success: function ( info ) {
				
			}
			, error: function ( info ) {

			}
		});
	};

	if ( !code ) {

		//step1 get code
		var url = encodeURIComponent(location.href);
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf0e81c3bee622d60&redirect_uri=' + url + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';

	} else {
		
		getProfile(code, function ( resp ) {
			alert(JSON.stringify(resp));
		});
	}*/
}());

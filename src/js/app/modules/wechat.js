;(function () {
	var wechat = /MicroMessenger/.test(navigator.userAgent);
	var wechatAuth = easemobim.utils.query('wechatAuth');
	var appid = easemobim.utils.query('appid');
	var code = easemobim.utils.query('code');
	var tenantId = easemobim.utils.query('tenantId');


	if ( !wechat || !wechatAuth || !tenantId || !appid ) {
		return;
	}

	easemobim.wechat = function ( callback ) {
		//get profile
		var getComponentId = function ( callback ) {
			easemobim.emajax({
				url: '/v1/weixin/admin/appid'
				, success: function ( info ) {
					callback(info);
				}
				, error: function ( e ) {
					callback(null);
				}
			});
		};


		var getProfile = function ( code, callback ) {
			//get profile
			easemobim.emajax({
				url: '/v1/weixin/sns/userinfo/' + appid + '/' + code
				, data: { tenantId: tenantId }
				, type: 'GET'
				, success: function ( info ) {
					callback(info);
				}
				, error: function ( e ) {
					var url = location.href.replace(/&code=[^&]+/, '');

					if ( url.indexOf('appid') !== url.lastIndexOf('appid') ) {
						url = url.replace(/&appid=wx[^&]+/, '');
					}
					location.href = url;
				}
			});
		};

		if ( !code ) {
			getComponentId(function ( id ) {
				if ( !id ) {
					callback();
					return;
				}

				var url = encodeURIComponent(location.href);
				var redirect = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + url + '&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=' + id + '#wechat_redirect';

				location.href = redirect;
			});

		} else {
			getProfile(code, function ( resp ) {
				if ( !resp ) {
					callback();
					return;
				}
				callback(resp);
			});
		}
	};
}());

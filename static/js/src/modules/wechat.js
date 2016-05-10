;(function () {

	/*var wechat = /MicroMessenger/.test(navigator.userAgent);
	var wechatAuth = easemobim.utils.query('wechatAuth');


	if ( !wechat || !wechatAuth ) {
		return false;
	}


	var code = easemobim.utils.query('code');

	var getToken = function ( code, callback ) {
		//step2 get token
		easemobim.emajax({
			url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx1e7ed77036581061&secret=d6a53d79eedc926b6072b53b56b76833&code=' + code + '&grant_type=authorization_code'
			, data: null
			, type: 'GET'
			, success: function ( info ) {
				if ( info && info.access_token ) {
					alert('suc1');
					typeof callback === 'function' && callback(info);
				}
			}
			, error: function ( info ) {
				
				alert(JSON.stringify(info));
			}
		});
	};

	var getProfile = function ( token, openid, callback ) {
		//step3 get profile
		easemobim.emajax({
			url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + token + '&openid=' + openid + '&lang=zh_CN'
			, data: null
			, type: 'GET'
			, success: function ( info ) {
				if ( info && info.openid ) {
					alert('suc2');
					window.easemobim.visitor = {
						trueName: '',
						qq: '',
						phone: '',
						companyName: '',
						userNickname: info.nickname,
						description: '',
						email: ''
					};
					easemobim.utils.extend(easemobim.visitor, info);
				}
			}
			, error: function ( info ) {
				alert('error2');

			}
		});
	};

	if ( !code ) {

		//step1 get code
		var url = encodeURIComponent(location.href);
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf0e81c3bee622d60&redirect_uri=' + url + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';

	} else {
		
		getToken(code, function ( resp ) {
			alert(JSON.stringify(resp));
			getProfile(resp.access_token, rest.oppenid, function ( resp ) {
				alert(JSON.stringify(resp));
			});
		});
	}*/
}());

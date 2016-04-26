;(function () {

	var wechat = navigator.userAgent.test(/a/),
		host = location.host,
		tenantId = 0,
		url = encodeURIComponent('https://' + host + '/webim/im.html?tenantId=' + tenantId);


	
	if ( true ) {

		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf0e81c3bee622d60&redirect_uri=' + url + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
	}
}());

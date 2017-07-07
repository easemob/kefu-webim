
// 微信授权登录步骤
// 1. get Wechat Component Id (code does not exist)
// 2. redirectTo open.weixin.qq.com
// 3. callback with code
// 4. get Wechat Profile by code
// 5. cache Wechat nickname
// 6. create Wechat im user
// 7. exec success callback

var utils = require('../../common/utils');
var emajax = require('../../common/ajax');
var apiHelper = require('./apiHelper');
var profile = require('./tools/profile');

var isWechatBrowser = /MicroMessenger/.test(navigator.userAgent);
var appid = utils.query('appid');
var code = utils.query('code');
var tenantId = utils.query('tenantId');

module.exports = function (success, fail) {
	if (!isWechatBrowser || !tenantId || !appid){
		fail();
		return;
	}

	if (!code) {
		apiHelper.getWechatComponentId().then(function (id){
			location.href =  'https://open.weixin.qq.com/connect/oauth2/authorize?'
				+ 'appid=' + appid
				+ '&redirect_uri=' + encodeURIComponent(location.href)
				+ '&response_type=code'
				+ '&scope=snsapi_userinfo'
				+ '&state=STATE'
				+ '&component_appid=' + id
				+ '#wechat_redirect'
			;
		}, function (err){
			console.warn(err);
			fail();
		});
	}
	else {
		apiHelper.getWechatProfile(tenantId, appid, code).then(function (info){
			// cache wechat nickname
			profile.config.visitor.userNickname = info.nickname;

			apiHelper.createWechatImUser(info.openid).then(function (entity){
				success(entity);
			}, function (err){
				console.warn(err);
				fail();
			});
		}, function (err){
			if (err === 'unexpected response value.'){
				fail();
			}
			else {
				// 这段代码不知何意，暂时保留
				var url = location.href.replace(/&code=[^&]+/, '');

				if (url.indexOf('appid') !== url.lastIndexOf('appid')) {
					url = url.replace(/&appid=wx[^&]+/, '');
				}
				location.href = url;
			}
		});
	}
};

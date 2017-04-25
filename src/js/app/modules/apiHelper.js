easemobim.apiHelper = (function (utils, api) {
	var config;
	var apiList = {
		getCurrentServiceSession: function(){
			return new Promise(function(resolve, reject){
				api('getCurrentServiceSession', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					imServiceNumber: config.toUser,
					id: config.user.username
				}, function (msg) {
					resolve(msg.data);
				}, function (err){
					reject(err);
				});
			});
		},
		getSessionQueueId: function(){
			return new Promise(function(resolve, reject){
				api('getSessionQueueId', {
					tenantId: config.tenantId,
					visitorUsername: config.user.username,
					techChannelInfo: config.orgName + '%23' + config.appName + '%23' + config.toUser
				}, function (msg) {
					resolve(msg.data);
				}, function(err){
					reject(err);
				});
			});
		}
	};

	return {
		init: function(cfg){
			config = cfg;
		},
		fetch: function (apiName) {
			if(apiList.hasOwnProperty(apiName)){
				return apiList[apiName]();
			}
			else{
				throw 'unknown api';
			}
		}
	};
}(easemobim.utils, easemobim.api));

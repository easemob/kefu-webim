easemobim.apiHelper = (function (utils, api, emajax) {
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
		},
		// 这个函数有副作用，会cache token
		getToken: function(){
			return new Promise(function(resolve, reject){
				var token = config.user.token;
				if (token){
					resolve(token);
				}
				else {
					emajax({
						url: location.protocol + '//' + config.restServer + '/' + config.orgName +
							'/' + config.appName + '/token',
						dataType: 'json',
						data: {
							grant_type: 'password',
							username: config.user.username,
							password: config.user.password
						},
						type: 'POST',
						success: function(resp){
							var token = resp.access_token;

							// cache token
							config.user.token = token;
							resolve(token);
						},
						error: function(err){
							reject(err);
						}
					});
				}
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
}(easemobim.utils, easemobim.api, easemobim.emajax));

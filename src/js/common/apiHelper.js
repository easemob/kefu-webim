// 以下调用会缓存参数
// getVisitorId
// getProjectId
// getToken

easemobim.apiHelper = (function (_const, utils, emajax) {
	var config;
	var cache = {};
	api = easemobim.api;
	var apiTransfer;

	function getToken(){
		return new Promise(function(resolve, reject){
			var token = config.user.token;
			if (token){
				resolve(token);
			}
			else {
				emajax({
					url: location.protocol + '//' + config.restServer + '/' + config.orgName +
						'/' + config.appName + '/token',
					useXDomainRequestInIE: true,
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
	
	function getAgentInputState(sessionId){
		return new Promise(function(resolve, reject){
			getToken().then(function(token){
				api('getAgentInputState', {
					username: config.user.username,
					orgName: config.orgName,
					appName: config.appName,
					tenantId: config.tenantId,
					serviceSessionId: sessionId,
					token: token,
				}, function (msg) {
					resolve(msg.data.entity);
				}, function(err){
					reject(err);
				});
			});
		});
	}

	return {

		getToken: getToken,
		getAgentInputState: getAgentInputState,
		setCacheItem: function(key, value){
			cache[key] = value;
		},
		clearCacheItem: function(key){
			cache[key] = void 0;
		},
		init: function(cfg){
			config = cfg;
		}
	};
}(easemobim._const, easemobim.utils, easemobim.emajax));

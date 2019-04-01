var utils = require("@/common/utils");
var Transfer = require("@/common/transfer");
var profile = require("@/app/tools/profile");
var commonConfig = require("@/common/config");

// 以下调用会缓存参数
// getVisitorId
// getProjectId
// getToken
var config;
var cache = {
	appraiseTags: {}
};
var cachedApiCallbackTable = {};
var apiTransfer;

function initApiTransfer(){
	apiTransfer = new Transfer("cross-origin-iframe", "data", true);

	apiTransfer.listen(function(msg){
		var apiName = msg.call;
		var timestamp = msg.timespan;
		var isSuccess = msg.status === 0;
		var callbacks;
		var successCallback;
		var errorCallback;

		if(cachedApiCallbackTable[apiName] && cachedApiCallbackTable[apiName][timestamp]){

			callbacks = cachedApiCallbackTable[apiName][timestamp];
			delete cachedApiCallbackTable[apiName][timestamp];

			successCallback = callbacks.success;
			errorCallback = callbacks.error;

			if(isSuccess){
				typeof successCallback === "function" && successCallback(msg);
			}
			else{
				typeof errorCallback === "function" && errorCallback(msg);
			}
		}
	}, ["api"]);
}

function api(apiName, data, success, error){
	var uuid = utils.uuid();

	// cache
	cachedApiCallbackTable[apiName] = cachedApiCallbackTable[apiName] || {};

	cachedApiCallbackTable[apiName][uuid] = {
		success: success,
		error: error
	};

	apiTransfer.send({
		api: apiName,
		data: data,
		timespan: uuid,
		// 标记postMessage使用object，47.9 增加
		useObject: true
	});
}

function getConfig(configId){
	return new Promise(function(resolve, reject){
		api("getConfig", {
			configId: configId
		}, function(msg){
			var entity = utils.getDataByPath(msg, "data.entity");
			resolve(entity);
		}, function(err){
			reject(err);
		});
	});
}

// 以下几个接口是 config 还没初始化完时调用的，需要从 config 中获取值

function getTheme(){
	var cfg = commonConfig.getConfig();
	return new Promise(function(resolve, reject){
		if(cfg.isWebChannelConfig){
			resolve(cfg.themeName);
		}
		else{
			api("getTheme", {
				tenantId: cfg.tenantId
			}, function(msg){
				var themeName = utils.getDataByPath(msg, "data.0.optionValue");
				resolve(themeName);
			}, function(err){
				reject(err);
			});
		}
	});
}

function getPassword(){
	var cfg = commonConfig.getConfig();
	return new Promise(function(resolve, reject){
		api("getPassword2", {
			userId: cfg.user.username,
			orgName: cfg.orgName,
			appName: cfg.appName,
			imServiceNumber: cfg.toUser,
		}, function(msg){
			var status = utils.getDataByPath(msg, "data.status");
			var password = utils.getDataByPath(msg, "data.entity.userPassword");

			if(status === "OK"){
				resolve(password);
			}
			else{
				reject(new Error("unable to get password."));
			}
		}, function(err){
			var status = utils.getDataByPath(err, "data.status");
			var errorDescription = utils.getDataByPath(err, "data.errorDescription");

			if(status === "FAIL"){
				if(errorDescription === "IM user create fail."){
					profile.imRestDown = true;
					resolve("");
					return;
				}
				else if(errorDescription === "IM user not found."){
					reject(new Error("im user not found"));
					return;
				}
			}
			reject(new Error("unknown error when get password"));
		});
	});
}

function getRelevanceList(){
	var cfg = commonConfig.getConfig();
	return new Promise(function(resolve, reject){
		api("getRelevanceList", {
			tenantId: cfg.tenantId
		}, function(msg){
			var relevanceList = msg.data;

			if(_.isArray(relevanceList) && !_.isEmpty(relevanceList)){
				resolve(relevanceList);
			}
			else{
				reject(new Error(__("prompt.no_valid_channel")));
			}
		}, function(err){
			reject(err);
		});
	});
}

module.exports = {
	getTheme: getTheme,
	getPassword: getPassword,
	getRelevanceList: getRelevanceList,
	initApiTransfer: initApiTransfer,
	api: api,
	getConfig: getConfig,

	setCacheItem: function(key, value){
		cache[key] = value;
	},
	clearCacheItem: function(key){
		cache[key] = null;
	},
	update: function(cfg){
		config = cfg;
	}
};

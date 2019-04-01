var utils = require("@/common/utils");
var apiHelper = require("@/app/common/apiHelper");

// 以下调用会缓存参数
// getVisitorId
// getProjectId
// getToken
var config;

var api = apiHelper.api;

function getFaqList(){
	return new Promise(function(resolve, reject){
		api("getFaqList", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(msg){
			var status = utils.getDataByPath(msg, "data.status");
			var entities = utils.getDataByPath(msg, "data.entities");
			if(status === "OK"){
				resolve(entities);
			}
			else{
				reject(msg.data);
			}
		}, function(error){
			reject(error);
		});
	});
}
function getSelfServiceList(){
	return new Promise(function(resolve, reject){
		api("getSelfServiceList", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(msg){
			var status = utils.getDataByPath(msg, "data.status");
			var entities = utils.getDataByPath(msg, "data.entities");
			if(status === "OK"){
				resolve(entities);
			}
			else{
				reject(msg.data);
			}
		}, function(error){
			reject(error);
		});
	});
}

module.exports = {
	getFaqList: getFaqList,
	getSelfServiceList: getSelfServiceList,
	update: function(cfg){
		config = cfg;
	}
};

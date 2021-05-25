var utils = require("@/common/utils");
var apiHelper = require("@/app/common/apiHelper");
var commonConfig = require("@/common/config");

// 以下调用会缓存参数
// getVisitorId
// getProjectId
// getToken
var config;

var api = apiHelper.api;

function getFaqList(){
	var config = commonConfig.getConfig()
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
function recordFaqClick(issueId){
	return new Promise(function(resolve, reject){
		api("recordFaqClick", {
			tenantId: config.tenantId,
			configId: config.configId,
			issueId: issueId,
		}, function(msg){
			if(status === "OK"){
				resolve();
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
	var config = commonConfig.getConfig()
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

function getSelfServiceAndFaq(){
	var config = commonConfig.getConfig()
	if(config.configId){
		return new Promise(function(resolve, reject){
			Promise.all([
				getSelfServiceList(),
				getFaqList()
			]).then(function(result){
				resolve(result);
			});
		});
	}
	else{
		return new Promise(function(resolve, reject){
			resolve([[],[]]);
		});
	}
}



module.exports = {
	getFaqList: getFaqList,
	getSelfServiceList: getSelfServiceList,
	recordFaqClick: recordFaqClick,
	getSelfServiceAndFaq:getSelfServiceAndFaq,
	update: function(cfg){
		config = cfg;
	}
};

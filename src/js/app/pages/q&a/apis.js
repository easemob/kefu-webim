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

function getIframeEnable(){
	return new Promise(function(resolve, reject){
		api("getIframeEnable", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(dat){
			resolve(entities);
		}, function(err){
			reject(err);
		});
	});
}
function getIframeSetting(){
	return new Promise(function(resolve, reject){
		api("getIframeSetting", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(dat){
			resolve(entities);
		}, function(err){
			reject(err);
		});
	});
}



module.exports = {
	getIframeEnable: getIframeEnable,
	getIframeSetting: getIframeSetting,
	getFaqList: getFaqList,
	getSelfServiceList: getSelfServiceList,
	recordFaqClick: recordFaqClick,
	update: function(cfg){
		config = cfg;
	}
};

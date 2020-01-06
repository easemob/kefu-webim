var profile = require("@/app/tools/profile");
var emajax = require("@/common/ajax");
var utils = require("@/common/utils");

var config;
var cache = {
	appraiseTags: {}
};

function getToken(){
	return new Promise(function(resolve, reject){
		var token = profile.imToken;

		// 超时降级
		setTimeout(function(){
			if(profile.imToken === null){
				profile.imToken = "";
				resolve("");
			}
		}, 5000);
		if(token !== null || profile.imRestDown){
			resolve(token);
			return;
		}
		emajax({
			url: location.protocol + "//" + config.restServer + "/" + config.orgName +
				"/" + config.appName + "/token",
			useXDomainRequestInIE: true,
			dataType: "json",
			data: {
				grant_type: "password",
				username: config.user.username,
				password: config.user.password
			},
			type: "POST",
			success: function(resp){
				var token = resp.access_token;

				// cache token
				profile.imToken = token;
				resolve(token);
			},
			error: function(err){
				if(err.error_description === "user not found"){
					reject(err);
				}
				else{
					// 未知错误降级走第二通道
					profile.imToken = "";
					resolve("");
				}
			}
		});
	});
}

function getProjectId(){
	return new Promise(function(resolve, reject){
		if(cache.projectId){
			resolve(cache.projectId);
		}
		else{
			getToken().then(function(token){
				emajax({
					url: "__WEBIM_SLASH_KEY_PATH__/tenants/" + config.tenantId + "/projects",
					useXDomainRequestInIE: true,
					dataType: "json",
					data: {
						tenantId: config.tenantId,
						"easemob-target-username": config.toUser,
						"easemob-appkey": config.appKey,
						"easemob-username": config.user.username,
					},
					headers: { Authorization: "Easemob IM " + token },
					type: "GET",
					success: function(msg){
						var projectId = utils.getDataByPath(msg, "entities.0.id");
						if(projectId){
							// cache projectId
							cache.projectId = projectId;
							resolve(projectId);
						}
						else{
							reject(new Error("no project id exist."));
						}
					},
					error: function(err){
						reject(err);
					}
				});
			});
		}
	});
}

function createTicket(opt){
	return new Promise(function(resolve, reject){
		emajax({
			url: "__WEBIM_SLASH_KEY_PATH__/tenants/" + config.tenantId
			+ "/projects/" + config.projectId
			+ "/tickets?tenantId=" + config.tenantId
			+ "&easemob-target-username=" + config["easemob-target-username"]
			+ "&easemob-appkey=" + config["easemob-appkey"]
			+ "&easemob-username=" + config["easemob-username"]
			+ "&config_id=" + config.config_id,
			useXDomainRequestInIE: true,
			dataType: "json",
			data: {
				tenantId: config.tenantId,
				"easemob-target-username": config.toUser,
				"easemob-appkey": config.appKey.replace("#", "%23"),
				"easemob-username": config.user.username,
				config_id: config.configId,
				config_name: config.configName,
				origin_type: "webim",
				projectId: opt.projectId,
				subject: "",
				content: opt.content,
				status_id: "",
				priority_id: "",
				category_id: opt.category_id,
				session_id: opt.session_id,
				creator: {
					name: opt.name,
					avatar: "",
					email: opt.mail,
					phone: opt.phone,
					qq: "",
					company: "",
					description: ""
				},
				attachments: null
			},
			headers: { Authorization: "Easemob IM " + opt.token },
			type: "GET",
			success: function(msg){
				if(msg.id){
					resolve();
				}
				else{
					reject(new Error("unknown error."));
				}
			},
			error: function(err){
				reject(err);
			}
		});
	});
}

module.exports = {
	getToken: getToken,
	getProjectId: getProjectId,
	createTicket: createTicket,

	update: function(cfg){
		config = cfg;
	}
};

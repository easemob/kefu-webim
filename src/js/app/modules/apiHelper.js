var utils = require("../../common/utils");
var _const = require("../../common/const");
var emajax = require("../../common/ajax");
var Transfer = require("../../common/transfer");
var profile = require("./tools/profile");

var config;
var cache = {
	projectId: null,
	evaluationDegrees: null,
	isRobotOpen: null,
	appraiseTags: {}
};
var cachedApiCallbackTable = {};
var apiTransfer;
var defaultHeaders = { "Content-Type": "application/json" };
var tenantId;
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
function api(apiName, ajaxOption, success, error){
	var uuid = utils.uuid();
	var timeout = ajaxOption.timeout;

	if(timeout){
		// 超时自动 reject
		setTimeout(function(){
			var errorCallback = utils.getDataByPath(cachedApiCallbackTable, apiName + "." + uuid + ".error");
			if(typeof errorCallback === "function"){
				errorCallback(new Error("timeout"));
				delete cachedApiCallbackTable[apiName][uuid];
			}
		}, timeout);
	}
	// cache
	cachedApiCallbackTable[apiName] = cachedApiCallbackTable[apiName] || {};
	cachedApiCallbackTable[apiName][uuid] = {
		success: success,
		error: error
	};
	apiTransfer.send({
		api: apiName,
		data: ajaxOption,
		timespan: uuid,
		// 标记postMessage使用object，47.9 增加
		useObject: true
	});
}
function api2(ajaxOption){
	return new Promise(function(resolve, reject){
		api.call(null, "easemob-kefu-general-ajax-call", ajaxOption, resolve, reject);
	});
}
function getCurrentServiceSession(visitorId){
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId
		+ "/visitors/" + visitorId + "/current-service-session"
	})
	.then(function(msg){
		return msg.data;
	});
	// todo: confirm this !! when nodata
}
function getOptions(){
	var optionNames = [
		"WelcomeMsgTenantContent",
		"WelcomeMsgTenantEnable",
		"agentNicenameEnable",
	].join(",");
	var defaultValue = { displayAgentNickname: true, enterpriseWelcomeMessage: "" };
	return api2({
		url: "/v1/webimplugin/tenants/" + tenantId + "/options",
		params: optionNames,
	}).then(function(msg){
		var status = msg.data.status;
		var entities = msg.data.entities;
		var tmpResult;
		if(status !== "OK") throw new Error("error to get options.");
		tmpResult = _.chain(entities)
		.map(function(item){
			return [item.optionName, item.optionValue];
		})
		.object()
		.value();

		return _.defaults({
			displayAgentNickname: tmpResult.agentNicenameEnable === "true",
			enterpriseWelcomeMessage: tmpResult.WelcomeMsgTenantEnable === "true"
				&& tmpResult.WelcomeMsgTenantContent
		}, defaultValue);
	}, function(err){
		console.error("error to get options, downgrade to defaults.", err);
		return Promise.resolve(defaultValue);
	});
}
function getNotice(){
	if(profile.isConfigFromBackend) return Promise.resolve(profile.options.noticeWord);
	return api2({
		url: "/v1/webimplugin/notice/options",
		params: { tenantId: tenantId },
	})
	.then(function(msg){
		return msg.data[0].optionValue;
	});
}
function getTheme(){
	if(profile.isConfigFromBackend) return Promise.resolve(profile.options.themeName);
	return api2({
		url: "/v1/webimplugin/theme/options",
		params: { tenantId: tenantId },
	})
	.then(function(msg){
		return msg.data[0].optionValue;
	});
}
function getConfig(configId){
	// todo: add error handler
	return api2({ url: "/v1/webimplugin/settings/visitors/configs/" + configId })
	.then(function(msg){
		var entity = msg.data.entity;
		if(entity) return entity;
		throw new Error("failed to get config");
	});
}
function getProjectId(){
	if(cache.projectId) return Promise.resolve(cache.projectId);
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/projects",
	})
	.then(function(msg){
		var projectId = msg.data.entities[0].id;
		if(!projectId) throw new Error("failed to get project id.");
		// cache projectId
		cache.projectId = projectId;
		return projectId;
	});
}
function getNoteCategories(){
	return getProjectId().then(function(projectId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId + "/projects/" + projectId + "/categories",
		})
		.then(function(msg){
			var entities = msg.data.entities;
			if(!entities) throw new Error("failed to get note categories.");
			return entities;
		});
	});
}
function createTicket(options){
	return getProjectId().then(function(projectId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId + "/projects/" + projectId + "/tickets",
			params: {
				channelType: "webim",
				techChannelId: profile.channelId,
			},
			method: "POST",
			headers: defaultHeaders,
			body: {
				tenantId: tenantId,
				origin_type: "webim",
				projectId: projectId,
				subject: "",
				content: options.content,
				status_id: "",
				priority_id: "",
				category_id: options.category_id || "",
				session_id: options.session_id || "",
				creator: {
					name: options.name,
					username: profile.options.imUsername,
					type: "VISITOR",
					avatar: "",
					email: options.mail || "",
					phone: options.phone || "",
					qq: "",
					company: "",
					description: "",
				},
				attachments: null,
			},
		})
		.then(function(msg){
			var id = msg.data.id;
			if(!id) throw new Error("failed to createTicket.");
			return id;
		});
	});
}
function getOfficalAccounts(){
	var visitorId = profile.visitorInfo.kefuId;
	// 没有 kefuVisitorId 自动reject，仅 im-channel 有这种情况，ds-channel 初始化后必有visitorId
	if(!visitorId) return Promise.reject();
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors/" + visitorId + "/official-accounts",
		params: { page: 0, size: 99 },
	})
	.then(function(msg){
		var entities = msg.data.entities;
		if(_.isArray(entities) && !_.isEmpty(entities)) return entities;
		throw new Error("failed to get official account list, auto downgrade.");
	});
}
function getOfficalAccountMessage(officialAccountId, startId){
	var visitorId = profile.visitorInfo.kefuId;
	var params;
	// 没有 kefuVisitorId 自动reject，仅 im-channel 有这种情况，ds-channel 初始化后必有visitorId
	if(!visitorId) return Promise.reject();

	params = {
		direction: "before",
		size: _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME,
		startId: startId,
	};
	// 当 startId 为空时 不传递此参数
	if(!startId) delete params.startId;
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors/" + visitorId
			+ "/official-accounts/" + officialAccountId + "/messages",
		params: params,
	})
	.then(function(msg){
		var entities = msg.data.entities;
		if(_.isArray(entities)) return entities;
		throw new Error("unexpect data format.");
	});
}
function getDutyStatus(){
	var defaultValue = true;
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/show-message",
		params: {
			channelType: "kefuim",
			originType: "kefuim",
			channelId: profile.channelId,
		},
	})
	.then(function(msg){
		var entity = msg.data.entity;
		var status = msg.data.status;
		if(status === "OK" && typeof entity === "boolean") return !entity;
		throw new Error("unexpected resp from show-message");
	})
	// 此接口失败也要 resolve 并能返回默认值
	// 这种写法可以捕捉 上一个 fulfilled callback 中的异常
	.then(null, function(err){
		console.error(err);
		return Promise.resolve(defaultValue);
	});
}
function getGrayList(){
	return api2({
		url: "/v1/grayscale/tenants/" + tenantId
	})
	.then(function(msg){
		return _.chain(msg.data.entities)
		.map(function(item){
			var keyName = item.grayName;
			var status = item.status;
			var enable = status !== "Disable";
			return [keyName, enable];
		})
		.object()
		.value();
	})
	.then(null, function(err){
		console.error("error occurred when attempt to get gray list: ", err);
		return Promise.resolve({});
	});
}
function getRobertGreeting(){
	return api2({
		url: "/v1/webimplugin/tenants/robots/welcome",
		params: {
			channelType: "easemob",
			originType: "webim",
			channelId: profile.channelId,
			tenantId: config.tenantId,
			agentUsername: config.agentName,
			queueName: config.emgroup,
		},
	})
	.then(function(msg){
		return msg.data.entity || {};
	})
	.then(null, function(err){
		console.error(err);
		return Promise.resolve({});
	});
}
function getRobertIsOpen(){
	if(typeof cache.isRobotOpen === "boolean"){
		return Promise.resolve(cache.isRobotOpen);
	}
	return api2({
		url: "/v1/webimplugin/tenants/robot-ready",
		params: {
			channelType: "easemob",
			originType: "webim",
			channelId: profile.channelId,
			tenantId: config.tenantId,
			agentUsername: config.agentName,
			queueName: config.emgroup,
		},
	})
	.then(function(msg){
		var entity = msg.data.entity;
		if(typeof entity !== "boolean") throw new Error("unexpected response");
		cache.isRobotOpen = entity;
		return entity;
	})
	.then(null, function(err){
		console.error(err);
		return Promise.resolve(false);
	});
}
function getSystemGreeting(){
	return api2({
		url: "/v1/webimplugin/welcome",
		params: { tenantId: tenantId },
	})
	.then(function(msg){
		return msg.data || "";
	})
	.then(null, function(err){
		console.error("unexpected response getSystemGreeting", err);
		return Promise.resolve("");
	});
}
function getOnlineAgentCount(){
	var visitorId;
	if(profile.deepStreamChannelEnable){
		visitorId = profile.visitorInfo.kefuId;
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors/" + visitorId + "/schedule-data-ex",
			params: {
				channelType: "easemob",
				originType: "webim",
				channelId: profile.channelId,
				queueName: config.emgroup,
				agentUsername: config.agentName,
			},
		})
		.then(function(msg){
			var entity = msg.data.entity;
			if(entity) return entity;
			throw new Error("unexpected data format.");
		});
	}
	return api2({
		url: "/v1/webimplugin/visitors/" + profile.options.imUsername + "/schedule-data-ex2",
		params: {
			techChannelInfo: config.orgName + "#" + config.appName + "#" + config.toUser,
			channelType: "easemob",
			originType: "webim",
			channelId: profile.channelId,
			queueName: config.emgroup,
			agentUsername: config.agentName,
			tenantId: tenantId,
		},
	})
	.then(function(msg){
		var entity = msg.data.entity;
		if(entity) return entity;
		throw new Error("unexpected data format.");
	});
}
function getAgentStatus(agentUserId){
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/agents/" + agentUserId + "/agentstate",
	})
	.then(function(msg){
		var state = msg.data.entity.state;
		if(state) return state;
		throw new Error("unexpected resp from getAgentStatus");
	});
}
function getLatestSession(officialAccountId){
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors/" + visitorId
				+ "/official-accounts/" + officialAccountId + "/latest-session",
		})
		.then(function(msg){
			var entity = msg.data.entity;
			if(entity) return entity;
			throw new Error(_const.ERROR_MSG.SESSION_DOES_NOT_EXIST);
		});
	});
}
function getSkillgroupMenu(){
	return api2({
		url: "/v1/webimplugin/tenants/" + tenantId + "/skillgroup-menu",
	})
	.then(function(msg){
		return msg.data.entities[0];
	})
	.then(null, function(err){
		console.error("error occurred in getSkillgroupMenu", err);
		return Promise.resolve();
	});
}
function reportVisitorAttributes(sessionId){
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/sessions/" + sessionId + "/attributes",
		method: "POST",
		headers: defaultHeaders,
		body: { referer: document.referrer },
	})
	.then(function(msg){
		var status = msg.data.status;
		if(status === "OK") return;
		throw new Error("error when report visitor attributes.");
	});
}
function reportPredictMessage(sessionId, content){
	// todo: confirm this 该接口没有用到appkey,直接用原来接口就行。
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webimplugin/servicesessions/" + sessionId + "/messagePredict",
			params: { userName: profile.options.imUsername },
			method: "POST",
			headers: defaultHeaders,
			body: {
				visitor_user_id: visitorId,
				content: content,
				timestamp: _.now(),
			},
		});
	});
}
function getAgentInputState(sessionId){
	// todo: add sessionId issue
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId
				+ "/visitors/" + visitorId + "/agent-input-state",
		})
		.then(function(msg){
			return msg.data.entity;
		});
	});
}
function getWaitListNumber(sessionId, queueId){
	return api2({
		url: "/v1/visitors/waitings/data",
		params: {
			tenantId: config.tenantId,
			queueId: queueId,
			serviceSessionId: sessionId
		},
	})
	.then(function(msg){
		return msg.data.entity;
	});
}
function getNickNameOption(){
	return api2({
		url: "/v1/webimplugin/agentnicename/options",
		params: { tenantId: tenantId },
	})
	.then(function(msg){
		var optionValue = msg.data[0].optionValue;
		return optionValue === "true";
	})
	.then(null, function(msg){
		console.error("error to get nickname option, downgrade default");
		return Promise.resolve(true);
	});
}
function closeServiceSession(sessionId){
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors/" + visitorId
				+ "/servicesessions/" + sessionId + "/stop",
			method: "POST",
			headers: defaultHeaders,
		})
		.then(function(msg){
			if(msg.data.status === "OK") return;
			throw new Error("error when report visitor attributes.");
		});
	});
}
function createKefuVisitor(visitorInfo){
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors",
		method: "POST",
		headers: defaultHeaders,
		body: visitorInfo,
	})
	.then(function(msg){
		return msg.data.entity;
	});
}
function getKefuVisitorId(username){
	var visitorId = profile.visitorInfo.kefuId;

	// 在 ds-channel 里边已经可以确保初始化后必须有 kefu visitor id
	// 在 im-channel 里边还未做相应改造，所以还要有这个逻辑
	if(visitorId) return Promise.resolve();

	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/visitors",
		params: {
			userName: username,
			techChannelInstanceId: profile.channelId,
		},
	})
	.then(function(msg){
		var visitorId = msg.data.entity.userId;
		// 缓存 visitor id
		profile.visitorInfo.kefuId = visitorId;
		if(visitorId) return visitorId;
		throw new Error("visitor not found.");
	});
}
function getRelevanceList(){
	return api2({
		url: "/v1/webimplugin/targetChannels",
		params: { tenantId: tenantId },
	})
	.then(function(msg){
		var relevanceList = msg.data;
		if(_.isArray(relevanceList)){
			if(!_.isEmpty(relevanceList)) return relevanceList;
			throw new Error(_const.ERROR_MSG.NO_VALID_CHANNEL);
		}
		throw new Error("unexpected response data", msg);
	});
}
function deleteEvent(gid){
	return api2({
		url: "/v1/event_collector/event/" + encodeURIComponent(gid),
		method: "DELETE",
	});
}
function reportEvent(url, userType, userId){
	return api2({
		url: "/v1/event_collector/events",
		method: "POST",
		headers: defaultHeaders,
		body: {
			type: "VISIT_URL",
			tenantId: config.tenantId,
			url: url,
			designatedAgent: config.agentName || "",
			userId: {
				type: userType,
				id: userId,
			},
		},
	})
	.then(function(msg){
		var resp = msg.data;
		if(resp) return resp;
		throw new Error("unexpected resopnse data.");
	});
}
function kefuUploadFile(file){
	// 由于 visitor id 机制差异，导致还需要适配老的 media-files 接口
	var visitorId;

	if(profile.deepStreamChannelEnable){
		visitorId = profile.visitorInfo.kefuId;
		return api2({
			url: "/v1/media-service/tenants/" + tenantId + "/visitors/" + visitorId + "/media-files",
			method: "POST",
			body: file,
		})
		.then(function(msg){
			var resp = msg.data;
			if(resp) return resp;
			throw new Error("unexpected resp from kefuUploadFile");
		});
	}
	return api2({
		url: "/v1/Tenant/" + tenantId + "/" + config.orgName + "/" + config.appName
			+ "/" + profile.options.imUsername + "/MediaFiles",
		method: "POST",
		headers: {
			Authorization: "Bearer " + profile.imToken,
		},
		body: file,
	})
	.then(function(msg){
		var resp = msg.data;
		if(resp) return resp;
		throw new Error("unexpected resp from kefuUploadFile");
	});
}
function reportMarketingTaskDelivered(marketingTaskId){
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId
				+ "/marketing-tasks/" + marketingTaskId + "/delivered",
			method: "PUT",
			body: { visitor_id: visitorId },
		})
		.then(function(msg){
			var status = msg.data.status;
			if(status !== "OK") throw new Error("unexpected resp data.");
		});
	});
}
function reportMarketingTaskOpened(marketingTaskId){
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId
				+ "/marketing-tasks/" + marketingTaskId + "/opened",
			method: "PUT",
			body: { visitor_id: visitorId },
		})
		.then(function(msg){
			var status = msg.data.status;
			if(status !== "OK") throw new Error("unexpected resp data.");
		});
	});
}
function reportMarketingTaskReplied(marketingTaskId){
	return getKefuVisitorId().then(function(visitorId){
		return api2({
			url: "/v1/webim/kefuim/tenants/" + tenantId
				+ "/marketing-tasks/" + marketingTaskId + "/replied",
			method: "PUT",
			body: { visitor_id: visitorId },
		})
		.then(function(msg){
			var status = msg.data.status;
			if(status !== "OK") throw new Error("unexpected resp data.");
		});
	});
}
function getLatestMarketingTask(officialAccountId){
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId + "/"
			+ "official-accounts/" + officialAccountId + "/marketing-tasks",
	})
	.then(function(msg){
		return msg.data.entity;
	});
}
function getEvaluationDegrees(){
	if(cache.evaluationDegrees) return Promise.resolve(cache.evaluationDegrees);
	return api2({ url: "/v1/webim/kefuim/tenants/" + tenantId + "/evaluationdegrees" })
	.then(function(msg){
		var entities = msg.data.entities;
		if(_.isArray(entities)){
			cache.evaluationDegrees = entities;
			return entities;
		}
		throw new Error("unexpected reaponse value.");
	});
}
function getAppraiseTags(evaluateId){
	var targetTag = cache.appraiseTags[evaluateId];
	if(targetTag) return Promise.resolve(targetTag);
	return api2({
		url: "/v1/webim/kefuim/tenants/" + tenantId
		+ "/evaluationdegrees/" + evaluateId + "/appraisetags",
	})
	.then(function(msg){
		var entities = msg.data.entities;
		if(entities){
			cache.appraiseTags[evaluateId] = entities;
			return entities;
		}
		throw new Error("unexpected reaponse value.");
	});
}
function getWechatComponentId(){
	return new Promise(function(resolve, reject){
		emajax({
			url: "/v1/weixin/admin/appid",
			type: "GET",
			success: function(id){
				if(id){
					resolve(id);
				}
				else{
					reject(new Error("unexpected response value."));
				}
			},
			error: function(err){
				reject(err);
			}
		});
	});
}
function getWechatProfile(tenantId, appId, code){
	return new Promise(function(resolve, reject){
		emajax({
			url: "/v1/weixin/sns/userinfo/" + appId + "/" + code + "?tenantId=" + tenantId,
			type: "GET",
			success: function(resp){
				var parsed;
				try{
					parsed = JSON.parse(resp);
				}
				catch(e){}
				if(parsed){
					resolve(parsed);
				}
				else{
					reject(new Error("unexpected response value."));
				}
			},
			error: function(err){
				reject(err);
			}
		});
	});
}
function createWechatImUser(openId){
	return new Promise(function(resolve, reject){
		emajax({
			url: "/v1/webimplugin/visitors/wechat/"
				+ [
				config.tenantId,
				config.orgName,
				config.appName,
				config.toUser,
				openId,
			].join("_")
				+ "?tenantId=" + config.tenantId,
			data: {
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser
			},
			type: "POST",
			success: function(resp){
				var parsed;
				try{
					parsed = JSON.parse(resp);
				}
				catch(e){}
				if((parsed && parsed.status) === "OK"){
					resolve(parsed.entity);
				}
				else{
					reject();
				}
			},
			error: function(err){
				reject(err);
			}
		});
	});
}
function getCustomEmojiPackages(){
	return api2({ url: "/v1/webimplugin/emoj/tenants/" + tenantId + "/packages" })
	.then(function(msg){
		var entities = msg.data.entities;
		if(_.isArray(entities)) return entities;
		throw new Error("unexpected emoji package list.");
	});
}
function getCustomEmojiFiles(){
	return api2({ url: "/v1/webimplugin/emoj/tenants/" + tenantId + "/files" })
	.then(function(msg){
		var entities = msg.data.entities;
		if(_.isArray(entities)) return entities;
		throw new Error("unexpected emoji package list.");
	});
}
function getSatisfactionTipWord(){
	var defaultWord = __("evaluation.rate_my_service");
	// todo: merge options
	return api2({
		url: "/v1/webimplugin/tenants/" + tenantId + "/options/GreetingMsgEnquiryInvite",
	})
	.then(function(msg){
		return msg.data.entities[0].optionValue || defaultWord;
	})
	.then(null, function(err){
		// 有异常时，返回默认提示语
		console.log("unexpected response data", err);
		return Promise.resolve(defaultWord);
	});
}
function getDeepStreamServer(){
	var defaultDeepStreamServer = "sandbox-fym.kefu.easemob.com/ws";
	return api2({ url: "/v1/webim/kefuim/tenants/" + tenantId + "/deepstream/websocket" })
	.then(function(msg){
		var entity = msg.data.entity;
		var status = msg.data.status;
		var protocol;
		if(status === "OK"){
			protocol = location.protocol === "https:" ? "wss://" : "ws://";
			return protocol + entity + "/ws";
		}
		throw new Error("unexpected response value.");
	})
	.then(null, function(err){
		// 有异常时，返回默认地址
		console.error("unexpected response data: getDeepStreamServer", err);
		return Promise.resolve(defaultDeepStreamServer);
	});
}
function postMessage(messageBody){
	if(profile.deepStreamChannelEnable){
		return api2({
			url: "/v1/kefuim-gateway-partner/messages",
			method: "POST",
			headers: defaultHeaders,
			body: messageBody,
		})
		.then(function(msg){
			if(msg.data.status === "OK") return;
			throw new Error("failed to send message with second channel.");
		});
	}
	return api2({
		url: "/v1/imgateway/messages",
		method: "POST",
		headers: defaultHeaders,
		body: {
			from: profile.options.imUsername,
			to: config.toUser,
			tenantId: config.tenantId,
			// todo: get body, get ext
			bodies: messageBody.bodies,
			ext: messageBody.ext,
			orgName: config.orgName,
			appName: config.appName,
			originType: "webim"
		},
	})
	.then(function(msg){
		if(msg.data.status === "OK") return;
		throw new Error("failed to send message with second channel.");
	});
}
function getMessage(){
	if(profile.deepStreamChannelEnable){
		return api2({
			url: "/v1/kefuim-gateway-partner/messages",
			params: {
				tenantId: tenantId,
				channelId: profile.channelId,
				visitorUserId: profile.visitorInfo.kefuId,
			},
		})
		.then(function(msg){
			if(msg.data.status === "OK") return msg.data.entities;
			throw new Error("failed to send message with second channel.");
		});
	}
	return api2({
		url: "/v1/imgateway/messages",
		params: {
			orgName: config.orgName,
			appName: config.appName,
			easemobId: config.toUser,
			tenantId: tenantId,
			visitorEasemobId: profile.options.imUsername,
		},
	})
	.then(function(msg){
		if(msg.data.status === "OK") return msg.data.entities;
		throw new Error("failed to send message with second channel.");
	});
}
function getPassword(){
	return api2({
		url: "/v1/webimplugin/visitors/password2",
		params: {
			userId: profile.options.imUsername,
			orgName: config.orgName,
			appName: config.appName,
			imServiceNumber: config.toUser,
		},
	})
	.then(function(msg){
		var status = msg.data.status;
		var password = msg.data.entity.userPassword;

		if(status === "OK") return password;
		throw new Error("unable to get password.");
	}, function(err){
		var status = utils.getDataByPath(err, "data.status");
		var errorDescription = utils.getDataByPath(err, "data.errorDescription");

		if(status === "FAIL"){
			if(errorDescription === "IM user create fail."){
				profile.imRestDown = true;
				return Promise.resolve("");
			}
			else if(errorDescription === "IM user not found."){
				throw new Error("im user not found");
			}
		}
		throw new Error("unknown error when get password");
	});
}
function getToken(){
	// 已有token直接resolve，im挂掉直接resolve
	if(profile.imToken !== null || profile.imRestDown){
		return Promise.resolve(profile.imToken);
	}
	return api2({
		url: location.protocol + "//" + profile.options.imRestServer + "/"
			+ profile.config.orgName + "/" + profile.config.appName + "/token",
		useXDomainRequestInIE: true,
		method: "POST",
		body: {
			grant_type: "password",
			username: profile.options.imUsername,
			password: profile.options.imPassword,
		},
		timeout: 5000,
	})
	.then(function(msg){
		var token = profile.imToken = msg.data.access_token;
		return token;
	}, function(msg){
		// todo: 仅当user not found 时才重新创建访客
		console.error(msg.data);
		throw new Error("failed to login im xmppServer");
	});
}
function createImVisitor(specifiedUserName){
	return api2({
		url: "/v1/webimplugin/visitors",
		method: "POST",
		headers: defaultHeaders,
		body: {
			orgName: config.orgName,
			appName: config.appName,
			imServiceNumber: config.toUser,
			tenantId: tenantId,
			specifiedUserName: specifiedUserName || ""
		},
	})
	.then(function(msg){
		var entity = msg.data;
		if(entity) return entity;
		throw new Error("unexpected response when attempt to create im visitor.");
	});
}
module.exports = {
	createImVisitor: createImVisitor,
	getToken: getToken,
	getPassword: getPassword,
	postMessage: postMessage,
	getMessage: getMessage,
	getDeepStreamServer: getDeepStreamServer,
	getCurrentServiceSession: getCurrentServiceSession,
	getNotice: getNotice,
	getTheme: getTheme,
	getConfig: getConfig,
	getProjectId: getProjectId,
	createTicket: createTicket,
	getOfficalAccounts: getOfficalAccounts,
	getOfficalAccountMessage: getOfficalAccountMessage,
	getDutyStatus: getDutyStatus,
	getGrayList: getGrayList,
	getRobertGreeting: getRobertGreeting,
	getRobertIsOpen: getRobertIsOpen,
	getSystemGreeting: getSystemGreeting,
	getOnlineAgentCount: getOnlineAgentCount,
	getAgentStatus: getAgentStatus,
	getLatestSession: getLatestSession,
	getSkillgroupMenu: getSkillgroupMenu,
	getNoteCategories: getNoteCategories,
	reportVisitorAttributes: reportVisitorAttributes,
	reportPredictMessage: reportPredictMessage,
	getAgentInputState: getAgentInputState,
	getWaitListNumber: getWaitListNumber,
	getNickNameOption: getNickNameOption,
	closeServiceSession: closeServiceSession,
	createKefuVisitor: createKefuVisitor,
	getKefuVisitorId: getKefuVisitorId,
	getRelevanceList: getRelevanceList,
	deleteEvent: deleteEvent,
	reportEvent: reportEvent,
	kefuUploadFile: kefuUploadFile,
	reportMarketingTaskDelivered: reportMarketingTaskDelivered,
	reportMarketingTaskOpened: reportMarketingTaskOpened,
	reportMarketingTaskReplied: reportMarketingTaskReplied,
	getLatestMarketingTask: getLatestMarketingTask,
	getEvaluationDegrees: getEvaluationDegrees,
	getAppraiseTags: getAppraiseTags,
	getWechatComponentId: getWechatComponentId,
	getWechatProfile: getWechatProfile,
	createWechatImUser: createWechatImUser,
	getCustomEmojiPackages: getCustomEmojiPackages,
	getCustomEmojiFiles: getCustomEmojiFiles,
	getSatisfactionTipWord: getSatisfactionTipWord,
	getOptions: getOptions,

	initApiTransfer: initApiTransfer,
	init: function(cfg){
		config = cfg;
		tenantId = config.tenantId;
	}
};

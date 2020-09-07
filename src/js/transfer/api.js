// 此文件只可新增不可修改！！！ 否则会影响定制开发版本
var emajax = require("../common/ajax");
var Transfer = require("../common/transfer");
var utils = require("@/common/utils");
// 此文件用于跨域请求api，故为了兼容老版本，接口不能删
// 新增接口一律写在后边，按照时间顺序
// 主要入口的url上附加tenantId，用于限流
// post 请求时，所有msg.data参数都会被序列化为request body，如果需要去除参数需要使用 delete


// 此处由于要兼容老版本，所以在实例化对象时不能指定 useObject = true，而是依据 options.msg.useObject 来判断
// 这个通信的名字应该是 up2Im, 因为定制开发客户的代码改不了，所以还用以前的 "api"
var up2Im = new Transfer(null, "api");



function emitAjax(options){
	var headers = null;
	var msg = options.msg;
	var data = msg.data;
	var useObject = msg.useObject;
	var api = msg.api;
	var timestamp = msg.timespan;

	if(data && data.headers){
		headers = data.headers;
		delete data.headers;
	}

	emajax({
		url: options.url,
		headers: headers,
		data: options.excludeData ? null : data,
		type: options.type,
		isFileUpload: options.isFileUpload,
		success: function(resp, xhr){
			try{
				resp = JSON.parse(resp);
			}
			catch(e){}
			up2Im.send({
				call: api,
				timespan: timestamp,
				status: 0,
				data: resp,
				statusCode: xhr.status,
				useObject: useObject
			});
		},
		error: function(resp, xhr){
			try{
				resp = JSON.parse(resp);
			}
			catch(e){}
			up2Im.send({
				call: api,
				timespan: timestamp,
				status: 1,
				data: resp,
				statusCode: xhr.status,
				useObject: useObject
			});
		}
	});
}

function parseReferer(ref){
	var i;
	var len;
	var idx;
	var tmp = [];
	var referer = {};
	var arr;
	var elementA;
	if(!ref){
		return {};
	}
	ref = utils.decode(ref);
	elementA = document.createElement("a");
	elementA.href = ref;
	idx = ref.indexOf("?");
	referer.domain = elementA.origin;
	arr = ref.slice(idx + 1).split("&");
	for(i = 0, len = arr.length; i < len; i++){
		tmp = arr[i].split("=");
		referer[tmp[0]] = tmp.length > 1 ? tmp[1] : "";
	}
	return referer;
}

up2Im.listen(function(msg){
	var apiName = msg.api;
	var params = msg.data || {};
	var tenantId = params.tenantId;
	var techChannelInfo = params.orgName
		+ "%23" + params.appName
		+ "%23" + params.imServiceNumber;

	var url;
	var referer;

	up2Im.targetOrigin = msg.origin;

	switch(apiName){
	case "getRelevanceList":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/targetChannels",
			type: "GET",
			msg: msg
		});
		break;
	case "getDutyStatus":
	// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/showMessage",
			type: "GET",
			msg: msg
		});
		break;
	case "getWechatVisitor":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/wechat/" + params.openid
				+ "?tenantId=" + tenantId,
			msg: msg,
			type: "POST"
		});
		break;
	case "createVisitor":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors?tenantId=" + tenantId,
			msg: msg,
			type: "POST"
		});
		break;
	case "getSession":
		// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/" + params.id
				+ "/schedule-data?techChannelInfo=" + techChannelInfo
				+ "&tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getExSession":
	// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/" + params.id
				+ "/schedule-data-ex?techChannelInfo=" + techChannelInfo
				+ "&tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getPassword":
	// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/password",
			type: "GET",
			msg: msg
		});
		break;
	case "getGroup":
		// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/" + params.id
				+ "/ChatGroupId?techChannelInfo=" + techChannelInfo
				+ "&tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getGroupNew":
		// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenant/" + tenantId
				+ "/visitors/" + params.id +
				"/ChatGroupId?techChannelInfo=" + techChannelInfo
				+ "&tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getHistory":
		// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/msgHistory",
			type: "GET",
			msg: msg
		});
		break;
	case "getSlogan":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/notice/options",
			type: "GET",
			msg: msg
		});
		break;
	case "getTheme":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/theme/options",
			type: "GET",
			msg: msg
		});
		break;
	case "getSystemGreeting":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/welcome",
			type: "GET",
			msg: msg
		});
		break;
	case "getTransferManualMenu":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/welcome/transfer-manual-menu",
			type: "GET",
			msg: msg
		});
		break;
	case "getRobertGreeting":
	// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/Tenants/"
				+ tenantId
				+ "/robots/visitor/greetings/"
				+ params.originType
				+ "?tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "sendVisitorInfo":
	// DEPRECATED!!!
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
				+ "/visitors/" + params.visitorId +
				"/attributes?tenantId=" + tenantId,
			msg: msg,
			type: "POST"
		});
		break;
	case "getProject":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/tenants/" + tenantId + "/projects",
			type: "GET",
			msg: msg
		});
		break;
	case "createTicket":
		url = "__WEBIM_SLASH_KEY_PATH__/tenants/" + tenantId
		+ "/projects/" + params.projectId
		+ "/tickets?tenantId=" + tenantId
		+ "&easemob-target-username=" + params["easemob-target-username"]
		+ "&easemob-appkey=" + params["easemob-appkey"]
		+ "&easemob-username=" + params["easemob-username"]
		+ "&config_id=" + params.config_id;
		if(params.config_name){
			url += "&config_name=" + params.config_name;
		}
		emitAjax({
			url: url,
			msg: msg,
			type: "POST"
		});
		break;
	case "getNoteCategories":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/tenants/" + tenantId
				+ "/projects/" + params.projectId
				+ "/categories?tenantId=" + tenantId
				+ "&easemob-target-username=" + params["easemob-target-username"]
				+ "&easemob-appkey=" + params["easemob-appkey"]
				+ "&easemob-username=" + params["easemob-username"],
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "receiveMsgChannel":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/imgateway/messages",
			type: "GET",
			msg: msg
		});
		break;
	case "sendMsgChannel":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/imgateway/messages?tenantId=" + tenantId,
			msg: msg,
			type: "POST"
		});
		break;
	case "getAgentStatus":
		// 没有token时不发送请求
		if(!params.token){
			console.error("token does not exist.");
			return;
		}
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/tenants/" + tenantId
				+ "/agents/" + params.agentUserId + "/agentstate",
			type: "GET",
			msg: msg
		});
		break;
	case "getNickNameOption":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/agentnicename/options?tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	// 本接口是一个通用的专供 webim 获取坐席 options 的接口
	case "getOptForShowTrackMsg":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/showTrackMsg",
			msg: msg,	// cfg
			type: "GET",
			excludeData: true
		});
		break;
	case "getOptForManualMenuGuide":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/transferManualMenuGuideEnable",
			msg: msg,	// cfg
			type: "GET",
			excludeData: true
		});
		break;
	// 此接口使用的是单独的微服务，无需限流
	case "reportEvent":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/event_collector/events",
			msg: msg,
			type: "POST"
		});
		break;
	case "deleteEvent":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/event_collector/event/" + encodeURIComponent(params.userId),
			msg: msg,
			type: "DELETE",
			excludeData: true
		});
		break;
	case "mediaStreamUpdateStatus":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/rtcmedia/media_streams/" + params.streamId;
		delete params.streamId;
		emitAjax({
			url: url,
			msg: msg,
			type: "PUT"
		});
		break;
	// DEPRECATED!!!
	case "graylist":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/management/graylist",
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getCurrentServiceSession":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenant/"
				+ tenantId
				+ "/visitors/"
				+ params.id
				+ "/CurrentServiceSession?techChannelInfo=" + techChannelInfo
				+ "&tenantId="
				+ tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "messagePredict":
	// DEPRECATED!!!
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/agents/" + params.agentId
			+ "/messagePredict"
			+ "?tenantId=" + params.tenantId;

		// fake: 避免多余的参数传递到 post body 中
		delete params.tenantId;
		delete params.agentId;

		emitAjax({
			url: url,
			msg: msg,
			type: "POST"
		});
		break;
	case "getSessionQueueId":
	// DEPRECATED!!!
		url = "__WEBIM_SLASH_KEY_PATH__/v1/visitors/" + params.visitorUsername + "/waitings/sessions";

		delete params.visitorUsername;

		emitAjax({
			url: url,
			msg: msg,
			type: "GET"
		});
		break;
	case "getWaitListNumber":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/visitors/waitings/data",
			msg: msg,
			type: "GET"
		});
		break;
	case "getDutyStatus_2":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/show-message",
			type: "GET",
			msg: msg
		});
		break;
	case "getRobertGreeting_2":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/robots/welcome",
			type: "GET",
			msg: msg
		});
		break;
	case "getSkillgroupMenu":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/skillgroup-menu",
			type: "GET",
			msg: msg,
			excludeData: true
		});
		break;
	case "getAgentInputState":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/sessions/" + params.serviceSessionId
			+ "/agent-input-state?tenantId=" + tenantId
			+ "&orgName=" + params.orgName + "&appName=" + params.appName
			+ "&userName=" + params.username + "&token=" + params.token,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "closeServiceSession":
		url = "__WEBIM_SLASH_KEY_PATH__/webimplugin/tenants/" + tenantId
			+ "/visitors/" + params.userName
			+ "/servicesessions/" + params.serviceSessionId
			+ "/stop-wait-session?tenantId=" + tenantId;
		delete params.serviceSessionId;
		emitAjax({
			url: url,
			msg: msg,
			type: "POST"
		});
		break;
	case "uploadImgMsgChannel":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/Tenant/" + tenantId
				+ "/" + params.orgName + "/" + params.appName
				+ "/" + params.userName + "/MediaFiles",
			msg: msg,
			isFileUpload: true,
			type: "POST"
		});
		break;
	case "getVisitorInfo":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
				+ "/visitors?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token
				+ "&techChannelInfo=" + techChannelInfo,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getOfficalAccounts":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
				+ "/visitors/" + params.visitorId
				+ "/official-accounts?page=0&size=100"
				+ "&orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getOfficalAccountMessage":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
				+ "/visitors/" + params.visitorId
				+ "/official-accounts/" + params.officialAccountId
				+ "/messages"
				+ "?size=" + params.size
				// 当startId为空时不传
				+ (params.startId ? "&startId=" + params.startId : "")
				+ "&direction=" + params.direction
				+ "&orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getConfig":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/settings/visitors/configs/" + params.configId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	// 会话创建前 获取该会话  是否将于机器人进行
	case "getRobertIsOpen":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/robot-ready",
			type: "GET",
			msg: msg
		});
		break;
	case "getExSession_2":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/" + params.username
				+ "/schedule-data-ex2"
				+ "?techChannelInfo=" + techChannelInfo
				+ "&channelType=" + params.channelType
				+ "&originType=" + params.originType
				+ "&channelId=" + params.channelId
				+ "&queueName=" + params.queueName
				+ "&agentUsername=" + params.agentUsername
				+ "&tenantId=" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getLastSession":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
				+ "/visitors/" + params.visitorId
				+ "/official-accounts/" + params.officialAccountId
				+ "/latest-session"
				+ "?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token
				+ "&techChannelInfo=" + techChannelInfo,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "reportVisitorAttributes":
		referer = parseReferer(params.docReferer);
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
			+ "/sessions/" + params.sessionId
			+ "/attributes"
			+ "?orgName=" + params.orgName
			+ "&appName=" + params.appName
			+ "&userName=" + params.userName
			+ "&token=" + params.token
			+ "&techChannelInfo=" + techChannelInfo;

		msg.data.searchType = referer.domain || "直接访问";
		msg.data.keyword = referer.word || referer.wd;
		msg.data.keyword = msg.data.keyword ? decodeURIComponent(msg.data.keyword) : "";
		msg.data.accessUrl = params.fromUrl;

		delete params.tenantId;
		delete params.sessionId;

		delete params.orgName;
		delete params.appName;
		delete params.userName;
		delete params.token;
		delete params.imServiceNumber;
		delete params.fromUrl;
		delete params.docReferer;

		emitAjax({
			url: url,
			msg: msg,
			type: "POST"
		});
		break;
	case "messagePredict_2":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/servicesessions/" + params.sessionId
			+ "/messagePredict"
			+ "?orgName=" + params.orgName
			+ "&appName=" + params.appName
			+ "&userName=" + params.userName
			+ "&token=" + params.token
			+ "&techChannelInfo=" + techChannelInfo;

		delete params.sessionId;

		delete params.orgName;
		delete params.appName;
		delete params.userName;
		delete params.token;
		delete params.imServiceNumber;

		emitAjax({
			url: url,
			msg: msg,
			type: "POST"
		});
		break;
	case "reportMarketingTaskDelivered":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
			+ "/marketing-tasks/" + params.marketingTaskId
			+ "/delivered"
			+ "?orgName=" + params.orgName
			+ "&appName=" + params.appName
			+ "&userName=" + params.userName
			+ "&token=" + params.token;

		delete params.tenantId;
		delete params.marketingTaskId;

		delete params.orgName;
		delete params.appName;
		delete params.userName;
		delete params.token;

		emitAjax({
			url: url,
			msg: msg,
			type: "PUT"
		});
		break;
	case "reportMarketingTaskOpened":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
			+ "/marketing-tasks/" + params.marketingTaskId
			+ "/opened"
			+ "?orgName=" + params.orgName
			+ "&appName=" + params.appName
			+ "&userName=" + params.userName
			+ "&token=" + params.token;

		delete params.tenantId;
		delete params.marketingTaskId;

		delete params.orgName;
		delete params.appName;
		delete params.userName;
		delete params.token;

		emitAjax({
			url: url,
			msg: msg,
			type: "PUT"
		});
		break;
	case "reportMarketingTaskReplied":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
			+ "/marketing-tasks/" + params.marketingTaskId
			+ "/replied"
			+ "?orgName=" + params.orgName
			+ "&appName=" + params.appName
			+ "&userName=" + params.userName
			+ "&token=" + params.token;

		delete params.tenantId;
		delete params.marketingTaskId;

		delete params.orgName;
		delete params.appName;
		delete params.userName;
		delete params.token;

		emitAjax({
			url: url,
			msg: msg,
			type: "PUT"
		});
		break;
	case "getLatestMarketingTask":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId
				+ "/official-accounts/" + params.officialAccountId
				+ "/marketing-tasks"
				+ "?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getEvaluationDegrees":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/"
				+ tenantId
				+ "/evaluationdegrees"
				+ "?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "getAppraiseTags":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/"
				+ tenantId
				+ "/evaluationdegrees/"
				+ params.evaluateId
				+ "/appraisetags"
				+ "?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token,
			msg: msg,
			type: "GET",
			excludeData: true
		});
		break;
	case "grayScale":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/grayscale/tenants/" + tenantId,
			msg: msg,
			type: "GET",
			excludeData: true,
		});
		break;
	case "getCustomEmojiPackages":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/emoj/tenants/" + tenantId + "/packages",
			msg: msg,
			type: "GET",
			excludeData: true,
		});
		break;
	case "getCustomEmojiFiles":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/emoj/tenants/" + tenantId + "/files",
			msg: msg,
			type: "GET",
			excludeData: true,
		});
		break;
	case "getSatisfactionTipWord":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/GreetingMsgEnquiryInvite",
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;
	case "getServiceSessionResolved":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/problemSolvingOnServiceSessionResolved",
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;

	case "getEvaluteSolveWord":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/evaluteSolveWord",
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;
	case "getPassword2":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/visitors/password2"
			+ "?userId=" + params.userId
			+ "&orgName=" + params.orgName
			+ "&appName=" + params.appName
			+ "&imServiceNumber=" + params.imServiceNumber,
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;
	case "updateCustomerInfo":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/tenants/" + tenantId
				+ "/visitors/" + params.visitorId + "/customer-info"
				+ "?orgName=" + params.orgName
				+ "&appName=" + params.appName
				+ "&userName=" + params.userName
				+ "&token=" + params.token;
		delete params.tenantId;
		delete params.visitorId;
		delete params.orgName;
		delete params.appName;
		delete params.userName;
		delete params.token;
		emitAjax({
			url: url,
			msg: msg,
			type: "put"
		});
		break;
	case "getArticleJson":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/robot/news/" + params.media_id,
			type: "GET",
			msg: msg,
		});
		break;
	case "getInfo":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/info",
			type: "GET",
			msg: msg,
		});
		break;
	case "getGuessList":
		url = "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + params.tenantId
		+ "/servicesessions/"
		+ params.sessionId
		+ "/standard_suggestion/questions?input=" + params.inputValue + "&robotId=" + params.robotId;
		delete params.tenantId;
		delete params.sessionId;
		delete params.inputValue;
		delete params.robotId;
		emitAjax({
			url: url,
			type: "GET",
			msg: msg
		});
		break;
	case "getSatisfactionCommentTags":
		emitAjax({
			url: "/v1/webimplugin/tenants/" + tenantId + "/robot-agents/" + params.robotAgentId + "/satisfaction-comment/tags",
			msg: msg,
			type: "GET",
			excludeData: true,
		});
		break;
	case "getIframeSetting":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/information/menu",
			msg: msg,
			type: "GET",
		});
		break;
	case "getIframeEnable":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/visitors/options/webim-menu/status",
			msg: msg,
			type: "GET",
		});
		break;
	case "getFaqList":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/information/issues?page=0&size=1000",
			msg: msg,
			type: "GET",
		});
		break;
	case "recordFaqClick":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/information/issues/" + params.issueId + "/increase",
			msg: {
				data: {
					counts: 1
				}
			},
			type: "PUT",
		});
		break;
	case "getSelfServiceList":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/information/self-service?page=0&size=8",
			msg: msg,
			type: "GET",
		});
		break;
	case "getFaqOrSelfServiceStatus":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/visitors/options/" + params.type + "/status",
			msg: msg,
			type: "GET",
		});
		break;
	case "getInviteInfo":
		emitAjax({
			url: "/v1/webimplugin/settings/tenants/" + tenantId + "/configs/" + params.configId + "/information/invitations/",
			msg: msg,
			type: "GET",
		});
		break;
	case "startKeep":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/visitors/" + params.visitorId + "/servicesessions/" + params.serviceSessionId + "/keepalive",
			msg: msg,
			type: "POST"
		});
		break;
	case "closeChatDialog":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/visitors/" + params.visitorId + "/servicesessions/" + params.serviceSessionId + "/closechat",
			msg: msg,
			type: "POST"
		});
		break;
	case "getSessionEnquires":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/servicesessions/" + params.serviceSessionId + "/enquiries",
			msg: msg,
			type: "GET"
		});
		break;
	case "getDefaultFiveStarEnable":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/defaultFiveStarEnable",
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;
	case "getEvaluatePrescription":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/evaluatePrescription",
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;
	// 本接口是一个通用的专供 webim 获取坐席 options 的接口，用于确定是否需要隐藏在线状态
	case "getOnlineCustomerStatus":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/webimplugin/tenants/" + tenantId + "/options/onlineCustomerStatus",
			type: "GET",
			msg: msg,
			excludeData: true,
		});
		break;
	case "deleteVideoInvitation":
		emitAjax({
			url: "__WEBIM_SLASH_KEY_PATH__/v1/rtcmedia/serviceSession/" + params.serviceSessionId + "/conferences",
			type: "DELETE",
			msg: msg,
		});
		break;
	case "visitorCloseSession":
		url = "__WEBIM_SLASH_KEY_PATH__/webimplugin/tenants/" + tenantId + "/visitors/" + params.visitorId + "/servicesessions/" + params.serviceSessionId + "/stop";
		delete msg.data;
		emitAjax({
			url: url,
			msg: msg,
			type: "POST"
		});
		break;

	default:
		console.error("unexpect api name: " + apiName);
		break;
	}
	// from Im
}, ["data"]);

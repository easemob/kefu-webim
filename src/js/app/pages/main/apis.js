var utils = require("@/common/utils");
var apiHelper = require("@/app/common/apiHelper");
var _const = require("@/common/const");
var emajax = require("@/common/ajax");
var profile = require("@/app/tools/profile");

// 以下调用会缓存参数
// getVisitorId
// getProjectId
// getToken
var config;
var cache = {
	appraiseTags: {}
};
var api = apiHelper.api;

function getGrayList(tenantId){
	return new Promise(function(resolve/* , reject */){
		api("grayScale", {
			tenantId: tenantId,
		}, function(msg){
			var grayScaleDescription = utils.getDataByPath(msg, "data.entities") || [];
			var grayScaleList = _.chain(grayScaleDescription)
			.map(function(item){
				var keyName = item.grayName;
				var status = item.status;
				var enable = status !== "Disable";

				return [keyName, enable];
			})
			.object()
			.value();

			resolve(grayScaleList);
		}, function(err){
			console.error("unable to get gray list: ", err);
			// 获取失败返回空对象
			resolve({});
		});
	});
}

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
function getNotice(){
	return new Promise(function(resolve, reject){
		if(config.isWebChannelConfig){
			resolve(config.notice);
		}
		else{
			api("getSlogan", {
				tenantId: config.tenantId
			}, function(msg){
				var content = utils.getDataByPath(msg, "data.0.optionValue");
				var notice = {
					enabled: !!content,
					content: content
				};
				resolve(notice);
			}, function(err){
				reject(err);
			});
		}
	});
}


function getProjectId(){
	return new Promise(function(resolve, reject){
		if(cache.projectId){
			resolve(cache.projectId);
		}
		else{
			getToken().then(function(token){
				api("getProject", {
					tenantId: config.tenantId,
					"easemob-target-username": config.toUser,
					"easemob-appkey": config.appKey.replace("#", "%23"),
					"easemob-username": config.user.username,
					headers: { Authorization: "Easemob IM " + token }
				}, function(msg){
					var projectId = utils.getDataByPath(msg, "data.entities.0.id");
					if(projectId){
						// cache projectId
						cache.projectId = projectId;
						resolve(projectId);
					}
					else{
						reject(new Error("no project id exist."));
					}
				}, function(err){
					reject(err);
				});
			});
		}
	});
}

function getNoteCategories(){
	return new Promise(function(resolve, reject){
		Promise.all([
			getToken(),
			getProjectId()
		]).then(function(result){
			var token = result[0];
			var projectId = result[1];

			api("getNoteCategories", {
				tenantId: config.tenantId,
				"easemob-target-username": config.toUser,
				"easemob-appkey": config.appKey.replace("#", "%23"),
				"easemob-username": config.user.username,
				headers: { Authorization: "Easemob IM " + token },
				projectId: projectId,
			}, function(msg){
				var list = utils.getDataByPath(msg, "data.entities");
				resolve(list);

			}, function(err){
				reject(err);
			});
		});
	});
}

function createTicket(opt){
	return new Promise(function(resolve, reject){
		api("createTicket", {
			tenantId: config.tenantId,
			"easemob-target-username": config.toUser,
			"easemob-appkey": config.appKey.replace("#", "%23"),
			"easemob-username": config.user.username,
			config_id: config.configId,
			config_name: config.configName,
			origin_type: "webim",
			headers: { Authorization: "Easemob IM " + opt.token },
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
		}, function(msg){
			if(utils.getDataByPath(msg, "data.id")){
				resolve();
			}
			else{
				reject(new Error("unknown error."));
			}
		}, function(err){
			reject(err);
		});
	});
}

function getVisitorId(){
	return new Promise(function(resolve, reject){
		if(cache.visitorId){
			resolve(cache.visitorId);
		}
		else{
			getToken().then(function(token){
				api("getVisitorInfo", {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					imServiceNumber: config.toUser,
					token: token
				}, function(msg){
					var visitorId = utils.getDataByPath(msg, "data.entity.userId");
					if(visitorId){
						// cache visitor id
						cache.visitorId = visitorId;
						resolve(visitorId);
					}
					else{
						reject(_const.ERROR_MSG.VISITOR_DOES_NOT_EXIST);
					}
				}, function(err){
					reject(err);
				});
			});
		}
	});
}

function getOfficalAccounts(){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("getOfficalAccounts", {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				visitorId: visitorId,
				token: token
			}, function(msg){
				var list = utils.getDataByPath(msg, "data.entities");
				if(_.isArray(list)){
					resolve(list);
				}
				else{
					resolve([]);
					console.error("unexpect data format: ", list);
				}
			}, function(err){
				reject(err);
			});
		})
		// 未创建会话时 visitor不存在，此时 getVisitorId 会reject 特定error，需要捕获此错误
		["catch"](function(err){
			reject(err);
		});
	});
}

function getOfficalAccountMessage(officialAccountId, startId){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("getOfficalAccountMessage", {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				token: token,
				visitorId: visitorId,
				officialAccountId: officialAccountId,
				direction: "before",
				size: _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME,
				startId: startId
			}, function(msg){
				var list = utils.getDataByPath(msg, "data.entities");
				if(_.isArray(list)){
					resolve(list);
				}
				else{
					reject(new Error("unexpect data format."));
				}
			}, function(err){
				reject(err);
			});
		})
		["catch"](function(err){
			reject(err);
		});
	});
}

// 获取上下班状态，false 代表上班，true 代表下班
function getDutyStatus(){
	return new Promise(function(resolve/* , reject */){
		api("getDutyStatus_2", {
			channelType: "easemob",
			originType: "webim",
			channelId: config.channelId,
			tenantId: config.tenantId,
			queueName: encodeURIComponent(config.emgroup),
			agentUsername: config.agentName,
			timeScheduleId: config.timeScheduleId,
		}, function(msg){
			resolve(!utils.getDataByPath(msg, "data.entity"));
		}, function(err){
			console.error("unable to get duty state: ", err);
			// 获取状态失败则置为上班状态
			resolve(true);
		});
	});
}

function getRobertGreeting(){
	var referer = parseReferer(config.referer);
	var keyword1 = referer.word || referer.wd; // 百度
	var keyword2 = referer.q; // 360/神马
	var keyword3 = referer.query || referer.keyword; // 搜狗
	var keyword = keyword1 || keyword2 || keyword3;
	return new Promise(function(resolve, reject){
		api("getRobertGreeting_2", {
			channelType: "easemob",
			originType: "webim",
			channelId: config.channelId,
			tenantId: config.tenantId,
			agentUsername: config.agentName,
			queueName: encodeURIComponent(config.emgroup),
			keyword: keyword || ""
		}, function(msg){
			resolve(msg.data.entity || {});
		}, function(err){
			reject(err);
		});
	});
}

function getRobertIsOpen(){
	return new Promise(function(resolve, reject){
		if(typeof cache.isRobotOpen === "boolean"){
			resolve(cache.isRobotOpen);
		}
		else{
			api("getRobertIsOpen", {
				channelType: "easemob",
				originType: "webim",
				channelId: config.channelId,
				tenantId: config.tenantId,
				agentUsername: config.agentName,
				queueName: encodeURIComponent(config.emgroup)
			}, function(msg){
				var entity = msg.data.entity;

				cache.isRobotOpen = entity;
				resolve(entity);
			}, function(err){
				reject(err);
			});
		}
	});
}

function getSystemGreeting(){
	return new Promise(function(resolve, reject){
		api("getSystemGreeting", {
			tenantId: config.tenantId
		}, function(msg){
			resolve(msg.data);
		}, function(err){
			reject(err);
		});
	});
}

function getTransferManualMenu(){
	return new Promise(function(resolve, reject){
		api("getTransferManualMenu", {
			tenantId: config.tenantId,
			channelId: config.channelId,
			channelType: "easemob"
		}, function(msg){
			var entity = utils.getDataByPath(msg, "data.entity");
			if(entity){
				resolve(entity);
			}
			else{
				reject(new Error("unexpected data format."));
			}
		}, function(err){
			reject(err);
		});
	});
}


function getExSession(){
	return new Promise(function(resolve, reject){
		api("getExSession_2", {
			username: config.user.username,
			orgName: config.orgName,
			appName: config.appName,
			imServiceNumber: config.toUser,
			channelType: "easemob",
			originType: "webim",
			channelId: config.channelId,
			queueName: encodeURIComponent(config.emgroup),
			agentUsername: config.agentName,
			tenantId: config.tenantId
		}, function(msg){
			var entity = utils.getDataByPath(msg, "data.entity");
			if(entity){
				resolve(entity);
			}
			else{
				reject(new Error("unexpected data format."));
			}
		}, function(err){
			reject(err);
		});
	});
}

function getAgentStatus(agentUserId){
	return new Promise(function(resolve, reject){
		// todo: discard this
		// 没有token 不发送请求 也不报错
		if(!profile.imToken){
			resolve();
			return;
		}

		api("getAgentStatus", {
			tenantId: config.tenantId,
			orgName: config.orgName,
			appName: config.appName,
			agentUserId: agentUserId,
			userName: config.user.username,
			token: profile.imToken,
			imServiceNumber: config.toUser
		}, function(msg){
			resolve(utils.getDataByPath(msg, "data.state"));
		}, function(err){
			reject(err);
		});
	});
}

function getLastSession(officialAccountId){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("getLastSession", {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				officialAccountId: officialAccountId,
				userName: config.user.username,
				visitorId: visitorId,
				token: token
			}, function(msg){
				var entity = utils.getDataByPath(msg, "data.entity");
				if(entity){
					resolve(entity);
				}
				else{
					reject(_const.ERROR_MSG.SESSION_DOES_NOT_EXIST);
				}
			}, function(err){
				reject(err);
			});
		})
		// 未创建会话时 visitor不存在，此时 getVisitorId 会reject 特定error，需要捕获此错误
		["catch"](function(err){
			reject(err);
		});
	});
}

function getSkillgroupMenu(){
	return new Promise(function(resolve, reject){
		api("getSkillgroupMenu", {
			tenantId: config.tenantId
		}, function(msg){
			resolve(utils.getDataByPath(msg, "data.entities.0"));
		}, function(err){
			reject(err);
		});
	});
}

function reportVisitorAttributes(sessionId){
	return new Promise(function(resolve, reject){
		getToken().then(function(token){
			api("reportVisitorAttributes", {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				sessionId: sessionId,
				userName: config.user.username,
				referer: document.referrer,
				token: token,
				fromUrl: config.fromUrl,
				docReferer: config.referer
			}, function(){
				resolve();
			}, function(err){
				reject(err);
			});
		});
	});
}

function reportPredictMessage(sessionId, content){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(), // 获取访客信息
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("messagePredict_2", {
				sessionId: sessionId,
				visitor_user_id: visitorId,
				content: content,
				timestamp: _.now(),
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				imServiceNumber: config.toUser,
				token: token
			}, function(){
				resolve();
			}, function(err){
				reject(err);
			});
		});
	});
}

function getAgentInputState(sessionId){
	return new Promise(function(resolve, reject){
		getToken().then(function(token){
			api("getAgentInputState", {
				username: config.user.username,
				orgName: config.orgName,
				appName: config.appName,
				tenantId: config.tenantId,
				serviceSessionId: sessionId,
				token: token,
			}, function(msg){
				resolve(msg.data.entity);
			}, function(err){
				reject(err);
			});
		});
	});
}

function getWaitListNumber(sessionId, queueId){
	return new Promise(function(resolve, reject){
		api("getWaitListNumber", {
			tenantId: config.tenantId,
			queueId: queueId,
			serviceSessionId: sessionId
		}, function(msg){
			resolve(msg.data.entity);
		}, function(err){
			reject(err);
		});
	});
}

function getNickNameOption(){
	return new Promise(function(resolve, reject){
		api("getNickNameOption", {
			tenantId: config.tenantId
		}, function(msg){
			var optionValue = utils.getDataByPath(msg, "data.0.optionValue");
			resolve(optionValue === "true");
		}, function(err){
			reject(err);
		});
	});
}

function closeServiceSession(sessionId){
	return new Promise(function(resolve, reject){
		getToken().then(function(token){
			api("closeServiceSession", {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				token: token,
				serviceSessionId: sessionId
			}, function(){
				resolve();
			}, function(err){
				reject(err);
			});
		});
	});
}

function deleteEvent(gid){
	return new Promise(function(resolve, reject){
		api("deleteEvent", {
			userId: gid
		}, function(){
			resolve();
		}, function(err){
			reject(err);
		});
	});
}

function receiveMsgChannel(tabId){
	return new Promise(function(resolve, reject){
		api("receiveMsgChannel", {
			orgName: config.orgName,
			appName: config.appName,
			easemobId: config.toUser,
			tenantId: config.tenantId,
			visitorEasemobId: config.user.username,
			tabId:tabId
		}, function(msg){
			var status = utils.getDataByPath(msg, "data.status");
			var entities = utils.getDataByPath(msg, "data.entities");

			if(status === "OK"){
				resolve(entities);
			}
			else{
				reject(new Error("unexpected response data."));
			}
		}, function(err){
			reject(err);
		});
	});
}

function sendMsgChannel(body, ext){
	return new Promise(function(resolve, reject){
		api("sendMsgChannel", {
			from: config.user.username,
			to: config.toUser,
			tenantId: config.tenantId,
			bodies: [body],
			ext: ext,
			orgName: config.orgName,
			appName: config.appName,
			originType: "webim"
		}, function(msg){
			resolve(msg.data);
		}, function(err){
			reject(err);
		});
	});
}

function uploadImgMsgChannel(file){
	return new Promise(function(resolve, reject){
		getToken().then(function(token){
			api("uploadImgMsgChannel", {
				userName: config.user.username,
				tenantId: config.tenantId,
				file: file,
				auth: "Bearer " + token,
				orgName: config.orgName,
				appName: config.appName,
			}, function(msg){
				resolve(msg.data);
			}, function(err){
				reject(err);
			});
		});
	});
}

function reportMarketingTaskDelivered(marketingTaskId){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("reportMarketingTaskDelivered", {
				marketingTaskId: marketingTaskId,
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				token: token,
				visitor_id: visitorId,
			}, function(msg){
				var status = utils.getDataByPath(msg, "data.status");

				if(status === "OK"){
					resolve();
				}
				else{
					reject(new Error("unexpected reaponse status."));
				}
				resolve(msg.data);
			}, function(err){
				reject(err);
			});
		});
	});
}

function reportMarketingTaskOpened(marketingTaskId){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("reportMarketingTaskOpened", {
				marketingTaskId: marketingTaskId,
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				token: token,
				visitor_id: visitorId,
			}, function(msg){
				var status = utils.getDataByPath(msg, "data.status");

				if(status === "OK"){
					resolve();
				}
				else{
					reject(new Error("unexpected reaponse status."));
				}
				resolve(msg.data);
			}, function(err){
				reject(err);
			});
		});
	});
}

function reportMarketingTaskReplied(marketingTaskId){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];

			api("reportMarketingTaskReplied", {
				marketingTaskId: marketingTaskId,
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				userName: config.user.username,
				token: token,
				visitor_id: visitorId,
			}, function(msg){
				var status = utils.getDataByPath(msg, "data.status");

				if(status === "OK"){
					resolve();
				}
				else{
					reject(new Error("unexpected reaponse status."));
				}
				resolve(msg.data);
			}, function(err){
				reject(err);
			});
		});
	});
}

function getLatestMarketingTask(officialAccountId){
	return new Promise(function(resolve, reject){
		getToken().then(function(token){
			api("getLatestMarketingTask", {
				tenantId: config.tenantId,
				orgName: config.orgName,
				appName: config.appName,
				officialAccountId: officialAccountId,
				userName: config.user.username,
				token: token
			}, function(msg){
				var entity = utils.getDataByPath(msg, "data.entity");
				resolve(entity);
			}, function(err){
				reject(err);
			});
		});
	});
}

function getEvaluationDegrees(){
	return new Promise(function(resolve, reject){
		if(cache.evaluationDegrees){
			resolve(cache.evaluationDegrees);
		}
		else{
			getToken().then(function(token){
				api("getEvaluationDegrees", {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					token: token
				}, function(msg){
					var entities = utils.getDataByPath(msg, "data.entities");
					if(_.isArray(entities)){
						cache.evaluationDegrees = entities;
						resolve(entities);
					}
					else{
						reject(new Error("unexpected reaponse value."));
					}
				}, function(err){
					reject(err);
				});
			});
		}
	});
}

function getAppraiseTags(evaluateId){
	return new Promise(function(resolve, reject){
		if(cache.appraiseTags[evaluateId]){
			resolve(cache.appraiseTags[evaluateId]);
		}
		else{
			getToken().then(function(token){
				api("getAppraiseTags", {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					token: token,
					evaluateId: evaluateId
				}, function(msg){
					var entities = utils.getDataByPath(msg, "data.entities");
					if(entities){
						cache.appraiseTags[evaluateId] = entities;
						resolve(entities);
					}
					else{
						reject(new Error("unexpected reaponse value."));
					}
				}, function(err){
					reject(err);
				});
			});
		}
	});
}

function getCustomEmojiPackages(){
	return new Promise(function(resolve, reject){
		api("getCustomEmojiPackages", { tenantId: config.tenantId }, function(msg){
			var entities = utils.getDataByPath(msg, "data.entities");

			if(_.isArray(entities)){
				resolve(entities);
			}
			else{
				reject(new Error("unexpected emoji package list."));
			}
		}, function(err){
			reject(err);
		});
	});
}

function getCustomEmojiFiles(){
	return new Promise(function(resolve, reject){
		api("getCustomEmojiFiles", { tenantId: config.tenantId }, function(msg){
			var entities = utils.getDataByPath(msg, "data.entities");

			if(_.isArray(entities)){
				resolve(entities);
			}
			else{
				reject(new Error("unexpected emoji package list."));
			}
		}, function(err){
			reject(err);
		});
	});
}

function getSatisfactionTipWord(){
	return new Promise(function(resolve, reject){
		api("getSatisfactionTipWord", {
			tenantId: config.tenantId
		}, function(msg){
			var tipWord = utils.getDataByPath(msg, "data.entities.0.optionValue") || __("evaluation.rate_my_service");
			resolve(tipWord);
		}, function(){
			// 异常时，满意度提示语为默认提示语，无reject
			var tipWord = __("evaluation.rate_my_service");
			resolve(tipWord);
		});
	});
}

function getEvaluteSolveWord(){
	return new Promise(function(resolve, reject){
		api("getEvaluteSolveWord", {
			tenantId: config.tenantId
		}, function(msg){
			var tipWord = utils.getDataByPath(msg, "data.entities.0.optionValue") || __("evaluation.rate_my_evalute");
			resolve(tipWord);
		}, function(){
			// 异常时，问题解决评价引导语为默认提示语，无reject
			var tipWord = __("evaluation.rate_my_evalute");
			resolve(tipWord);
		});
	});
}

function getServiceSessionResolved(){
	return new Promise(function(resolve, reject){
		var webim = false;
		api("getServiceSessionResolved", { tenantId: config.tenantId }, function(res){
			var val = utils.getDataByPath(res, "data.entities.0.optionValue");
			if(typeof val === "string"){
				val = val.replace(/&quot;/g, "\"");
				val = JSON.parse(val);
				if(val.webim){
					webim = true;
				}
			}
			resolve(webim);
		}, function(err){
			reject(err);
		});
	});
}

function getDefaultFiveStarEnable(){
	return new Promise(function(resolve, reject){
		var webim = false;
		api("getDefaultFiveStarEnable", { tenantId: config.tenantId }, function(res){
			var val = utils.getDataByPath(res, "data.entities.0.optionValue");
			if(typeof val === "string"){
				if(val == "true"){
					webim = true;
				}
			}
			resolve(webim);
		}, function(err){
			reject(err);
		});
	});
}

function getEvaluatePrescription(){
	return new Promise(function(resolve, reject){
		api("getEvaluatePrescription", { tenantId: config.tenantId }, function(res){
			var val = utils.getDataByPath(res, "data.entities.0.optionValue");
			resolve(val);
		}, function(err){
			reject(err);
		});
	});
}

function updateCustomerInfo(data){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
			getToken()
		]).then(function(result){
			var visitorId = result[0];
			var token = result[1];
			data.visitorId = visitorId;
			data.tenantId = config.tenantId;
			data.orgName = config.orgName;
			data.appName = config.appName;
			data.userName = config.user.username;
			data.token = token;
			api("updateCustomerInfo", data, function(msg){
				// resolve(msg.data);
			}, function(err){
				// reject(err);
			});
		});
	});
}

function getArticleJson(data){
	return new Promise(function(resolve, reject){
		api("getArticleJson", {
			media_id: data.media_id,
			tenantId: config.tenantId,
			userId: config.user.userName,
			orgName: config.orgName,
			appName: config.appName,
			token: 0,
		}, function(ret){
			var articles = utils.getDataByPath(ret, "data.entity.articles");
			resolve(articles);
		});
	});
}
// 猜你想说 接口列表
function getGuessList(data){
	var officialAccount = profile.currentOfficialAccount;
	if(!officialAccount) return;
	return new Promise(function(resolve, reject){
		api("getGuessList", {
			tenantId: config.tenantId,
			sessionId: officialAccount.sessionId,
			robotId: officialAccount.agentId,
			inputValue: data
		}, function(msg){
			resolve(msg);
		});
	});
}

function getStatisfyYes(robotAgentId, satisfactionCommentKey){
	return new Promise(function(resolve, reject){
		emajax({
			url: "/v1/webimplugin/tenants/" + config.tenantId + "/robot-agents/" + robotAgentId + "/satisfaction-comment",
			data: {
				satisfactionCommentKey: satisfactionCommentKey,
				type: 1
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
					reject(parsed);
				}
			},
			error: function(e){
				reject(e);
			}
		});
	});
}
function getStatisfyNo(robotAgentId, satisfactionCommentKey){
	return new Promise(function(resolve, reject){
		emajax({
			url: "/v1/webimplugin/tenants/" + config.tenantId + "/robot-agents/" + robotAgentId + "/satisfaction-comment",
			data: {
				satisfactionCommentKey: satisfactionCommentKey,
				type: 2
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
					reject(parsed);
				}
			},
			error: function(e){
				reject(e);
			}
		});
	});
}

function getSatisfactionCommentTags(robotAgentId){
	return new Promise(function(resolve, reject){
		api("getSatisfactionCommentTags", {
			tenantId: config.tenantId,
			robotAgentId: robotAgentId
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
function confirmSatisfaction(robotAgentId, satisfactionCommentKey, selected){
	var data = {
		satisfactionCommentKey: satisfactionCommentKey,
		type: 2,
	};
	selected && (data.reasonTag = selected);

	return new Promise(function(resolve, reject){
		emajax({
			url: "/v1/webimplugin/tenants/" + config.tenantId + "/robot-agents/" + robotAgentId + "/satisfaction-comment",
			data: data,
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
					reject(parsed);
				}
			},
			error: function(e){
				reject(e);
			}
		});
	});
}

function getGradeType(){
	return new Promise(function(resolve, reject){
		api("getInfo", {
			tenantId: config.tenantId,
		}, function(resp){
			if(resp){
				resolve(resp.data);
			}
			else{
				reject(new Error("unexpected response value."));
			}
		}, function(err){
			reject(err);
		});
	});
}

function getOptForShowTrackMsg(){
	return new Promise(function(resolve, reject){
		api("getOptForShowTrackMsg", {
			tenantId: config.tenantId,
		}, function(res){
			var val = utils.getDataByPath(res, "data.entities.0.optionValue");
			if(typeof val === "string"){
				if(val == (false + "")){
					val = false;
				}
				else if(val == (true + "")){
					val = true;
				}
			}
			resolve(val);
		}, function(err){
			reject(err);
		});
	});
}

function getOptForManualMenuGuide(){
	return new Promise(function(resolve, reject){
		api("getOptForManualMenuGuide", {
			tenantId: config.tenantId,
		}, function(res){
			var val = utils.getDataByPath(res, "data.entities.0.optionValue");
			if(typeof val === "string"){
				if(val == (false + "")){
					val = false;
				}
				else if(val == (true + "")){
					val = true;
				}
			}
			resolve(val);
		}, function(err){
			reject(err);
		});
	});
}

function getlaiyeHtml(url){
	return emajax({
		url: url,
		type: "GET",
		async: false
	});
}
function getArticleHtml(articleUrl){
	var url = "/v1/robot/integration/tenants/material/news/article/html?url=" + articleUrl;
	return emajax({
		url: url,
		type: "GET",
		async: false
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

function startKeep(data){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
		]).then(function(result){
			var visitorId = result[0];
			data.visitorId = visitorId;
			data.tenantId = config.tenantId;
			api("startKeep", data, function(msg){
				// resolve(msg.data);
			}, function(err){
				// reject(err);
			});
		});
	});
}

function closeChatDialog(data){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
		]).then(function(result){
			var visitorId = result[0];
			data.visitorId = visitorId;
			data.tenantId = config.tenantId;
			api("closeChatDialog", data, function(msg){
				// resolve(msg.data);
			}, function(err){
				// reject(err);
			});
		});
	});
}

function getSessionEnquires(serviceSessionId){
	return new Promise(function(resolve, reject){
		api("getSessionEnquires", {
			tenantId: config.tenantId,
			serviceSessionId: serviceSessionId
		}, function(msg){
			var result = utils.getDataByPath(msg, "data.entities");
			resolve(result);
		}, function(err){
			reject(err);
		});
	});
}

function getRobotNotReachableENEnable(){
	return emajax({
		url: "/v1/webimplugin/tenants/"
				+ config.tenantId
				+ "/options/robotNotReachableENEnable",
		type: "GET",
		async: false,
	});
}

function getOnlineCustomerStatus(){
	return new Promise(function(resolve, reject){
		api("getOnlineCustomerStatus", {
			tenantId: config.tenantId,
		}, function(res){
			var val = utils.getDataByPath(res, "data.entities.0.optionValue");
			if(typeof val === "string"){
				if(val == (false + "")){
					val = false;
				}
				else if(val == (true + "")){
					val = true;
				}
			}
			resolve(val);
		}, function(err){
			reject(err);
		});
	});
}

function deleteVideoInvitation(serviceSessionId){
	return new Promise(function(resolve, reject){
		api("deleteVideoInvitation", {
			serviceSessionId: serviceSessionId,
		}, function(){
			resolve();
		}, function(err){
			reject(err);
		});
	});
}

function visitorCloseSession(data){
	return new Promise(function(resolve, reject){
		Promise.all([
			getVisitorId(),
		]).then(function(result){
			var visitorId = result[0];
			data.visitorId = visitorId;
			data.tenantId = config.tenantId;
			api("visitorCloseSession", data, function(msg){
				// resolve(msg.data);
			}, function(err){
				// reject(err);
			});
		});
	});
}

function getEvaluateVerify(serviceSessionId){
	return new Promise(function(resolve, reject){
		api("getEvaluateVerify", {
			tenantId: config.tenantId,
			serviceSessionId: serviceSessionId
		}, function(msg){
			var result = utils.getDataByPath(msg, "data");
			resolve(result);
		}, function(err){
			reject(err);
		});
	});
}

function getInputTopButton(){
	return new Promise(function(resolve, reject){
		api("getInputTopButton", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(msg){
			var result = utils.getDataByPath(msg, "data");
			resolve(result);
		}, function(err){
			reject(err);
		});
	});
}
function getInputTopStatus(){
	return new Promise(function(resolve, reject){
		api("getInputTopStatus", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(msg){
			var result = utils.getDataByPath(msg, "data");
			resolve(result);
		}, function(err){
			reject(err);
		});
	});
}
function getInputH5Button(){
	return new Promise(function(resolve, reject){
		api("getInputH5Button", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(msg){
			var result = utils.getDataByPath(msg, "data");
			resolve(result);
		}, function(err){
			reject(err);
		});
	});
}
function getInputH5Status(){
	return new Promise(function(resolve, reject){
		api("getInputH5Status", {
			tenantId: config.tenantId,
			configId: config.configId
		}, function(msg){
			var result = utils.getDataByPath(msg, "data");
			resolve(result);
		}, function(err){
			reject(err);
		});
	});
}

module.exports = {
	getGrayList: getGrayList,
	getToken: getToken,
	getNotice: getNotice,
	getProjectId: getProjectId,
	createTicket: createTicket,
	getVisitorId: getVisitorId,
	getOfficalAccounts: getOfficalAccounts,
	getOfficalAccountMessage: getOfficalAccountMessage,
	getDutyStatus: getDutyStatus,
	getRobertGreeting: getRobertGreeting,
	getRobertIsOpen: getRobertIsOpen,
	getSystemGreeting: getSystemGreeting,
	getExSession: getExSession,
	getAgentStatus: getAgentStatus,
	getLastSession: getLastSession,
	getSkillgroupMenu: getSkillgroupMenu,
	getNoteCategories: getNoteCategories,
	reportVisitorAttributes: reportVisitorAttributes,
	reportPredictMessage: reportPredictMessage,
	getAgentInputState: getAgentInputState,
	getWaitListNumber: getWaitListNumber,
	getNickNameOption: getNickNameOption,
	closeServiceSession: closeServiceSession,
	deleteEvent: deleteEvent,
	receiveMsgChannel: receiveMsgChannel,
	sendMsgChannel: sendMsgChannel,
	uploadImgMsgChannel: uploadImgMsgChannel,
	reportMarketingTaskDelivered: reportMarketingTaskDelivered,
	reportMarketingTaskOpened: reportMarketingTaskOpened,
	reportMarketingTaskReplied: reportMarketingTaskReplied,
	getLatestMarketingTask: getLatestMarketingTask,
	getEvaluationDegrees: getEvaluationDegrees,
	getAppraiseTags: getAppraiseTags,
	getCustomEmojiPackages: getCustomEmojiPackages,
	getCustomEmojiFiles: getCustomEmojiFiles,
	getSatisfactionTipWord: getSatisfactionTipWord,
	updateCustomerInfo: updateCustomerInfo,
	getArticleJson: getArticleJson,
	getGuessList: getGuessList,

	getStatisfyYes: getStatisfyYes,
	getStatisfyNo: getStatisfyNo,
	getSatisfactionCommentTags: getSatisfactionCommentTags,
	confirmSatisfaction: confirmSatisfaction,
	getGradeType: getGradeType,
	getTransferManualMenu: getTransferManualMenu,

	// opts
	getOptForShowTrackMsg: getOptForShowTrackMsg,
	getOptForManualMenuGuide: getOptForManualMenuGuide,
	getlaiyeHtml: getlaiyeHtml,
	getArticleHtml: getArticleHtml,
	getEvaluteSolveWord: getEvaluteSolveWord,
	getServiceSessionResolved: getServiceSessionResolved,

	startKeep: startKeep,
	closeChatDialog: closeChatDialog,
	visitorCloseSession: visitorCloseSession,
	getSessionEnquires: getSessionEnquires,

	getRobotNotReachableENEnable: getRobotNotReachableENEnable, // 获取机器人英文开关状态
	getDefaultFiveStarEnable: getDefaultFiveStarEnable,  // 获取默认五星评价的开关
	getEvaluatePrescription: getEvaluatePrescription,   // 满意度评价时效开关
	// opt获取是否隐藏状态
	getOnlineCustomerStatus: getOnlineCustomerStatus,
	deleteVideoInvitation: deleteVideoInvitation, // 取消视频邀请
	getEvaluateVerify: getEvaluateVerify,
	getInputTopButton:getInputTopButton,
	getInputTopStatus:getInputTopStatus,
	getInputTopButton:getInputTopButton,
	getInputH5Button:getInputH5Button,
	getInputH5Status:getInputH5Status,
	update: function(cfg){
		config = cfg;
	}

};

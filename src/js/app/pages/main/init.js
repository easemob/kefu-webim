require("es6-promise").polyfill();
require("@/common/polyfill");
require("../../libs/modernizr");
require("../../libs/sdk/webim.config");
require("underscore");

var utils = require("@/common/utils");
var _const = require("@/common/const");

var uikit = require("./uikit");
var apiHelper = require("./apiHelper");
var eventCollector = require("./eventCollector");
var chat = require("./chat");
var channel = require("./channel");
var profile = require("@/app/tools/profile");
var doWechatAuth = require("./wechat");
var commonConfig = require("@/common/config");
var hasChatEntryInitialized;
var extendMessageSender = require("./chat/extendMessageSender");


module.exports = {
	init: init,
	initChat: initChat,
	initChatEntry: initChatEntry,
};

function init(){
	utils.on(window, "message", function(e){
		updateCustomerInfo(e);
	});
}

function updateCustomerInfo(e){
	var trackMsg;
	var temp;
	var data = e.data;
	if(typeof data === "string"){
		data = JSON.parse(data);
	}
	temp = utils.getDataByPath(data, "easemob.kefu.cta");
	if(temp){
		trackMsg = {
			ext: {
				msgtype: {
					track: {
						// 消息标题
						title: "从\"" + temp.title + "\"提交的手机号码：",
						// 商品描述
						desc: temp.phone,
						// 商品图片链接
						// img_url: "/images/robot/article_image.png",
						// 商品页面链接
						item_url: temp.item_url
					}
				}
			}
		};
		apiHelper.updateCustomerInfo({
			phone: temp.phone
		});
		channel.sendText("转人工客服", trackMsg);
	}
}

function initChat(){
	apiHelper.getGrayList().then(function(grayList){
		// 灰度列表
		profile.grayList = grayList;

		// 访客回呼功能
		if(!utils.isMobile && commonConfig.getConfig().eventCollector && !eventCollector.isStarted()){
			eventCollector.startToReport(function(targetUserInfo){
				initChatEntry(targetUserInfo);
			});
		}
		else{
			// 获取关联，创建访客，调用聊天窗口
			initChatEntry();
		}
	});
}



function initChatEntry(targetUserInfo){
	if(hasChatEntryInitialized) return;
	hasChatEntryInitialized = true;
	// 获取关联信息（targetChannel）
	apiHelper.getRelevanceList().then(function(relevanceList){
		var targetItem;
		var appKey = commonConfig.getConfig().appKey;
		var splited = appKey.split("#");
		var orgName = splited[0];
		var appName = splited[1];
		var toUser = commonConfig.getConfig().toUser || commonConfig.getConfig().to;

		// toUser 转为字符串， todo: move it to handle config
		typeof toUser === "number" && (toUser = toUser.toString());

		if(appKey && toUser){
			// appKey，imServiceNumber 都指定了
			targetItem = _.where(relevanceList, {
				orgName: orgName,
				appName: appName,
				imServiceNumber: toUser
			})[0];
		}

		// 未指定appKey, toUser时，或未找到符合条件的关联时，默认使用关联列表中的第一项
		if(!targetItem){
			targetItem = targetItem || relevanceList[0];
			console.log("mismatched channel, use default.");
		}

		// 获取企业头像和名称
		// todo: rename to tenantName
		profile.tenantAvatar = utils.getAvatarsFullPath(targetItem.tenantAvatar, commonConfig.getConfig().domain);
		profile.defaultAgentName = targetItem.tenantName;
		commonConfig.setConfig({
			logo: commonConfig.getConfig().logo || { enabled: !!targetItem.tenantLogo, url: targetItem.tenantLogo },
			toUser: targetItem.imServiceNumber,
			orgName: targetItem.orgName,
			appName: targetItem.appName,
			channelId: targetItem.channelId,
			appKey: targetItem.orgName + "#" + targetItem.appName,
			restServer: commonConfig.getConfig().restServer || targetItem.restDomain,
			xmppServer: commonConfig.getConfig().xmppServer || targetItem.xmppServer,
		});

		if(targetUserInfo){

			// 访客回呼模式使用后端返回的关联信息
			commonConfig.setConfig({
				toUser: targetUserInfo.agentImName,
				appName: targetUserInfo.appName,
				orgName: targetUserInfo.orgName,
				appKey: targetUserInfo.orgName + "#" + targetUserInfo.appName
			});

			// 游客
			if(targetUserInfo.userName){
				commonConfig.setConfig({
					user: _.extend({}, commonConfig.getConfig().user, {
						username: targetUserInfo.userName,
						password: targetUserInfo.userPassword
					})
				});

				chat.init();
				chat.show();
				transfer.send({ event: _const.EVENTS.SHOW });
				transfer.send({
					event: _const.EVENTS.CACHEUSER,
					data: {
						username: targetUserInfo.userName,
						// todo: check if need emgroup
						group: commonConfig.getConfig().user.emgroup
					}
				});
			}
			// 访客带token，sina patch
			else if(commonConfig.getConfig().user.token){
				// 发送空的ext消息，延迟发送
				profile.commandMessageToBeSendList.push({ ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } });
				chat.init();
				chat.show();
				transfer.send({ event: _const.EVENTS.SHOW });
			}
			else{
				apiHelper.getPassword().then(function(password){
					commonConfig.setConfig({
						user: _.extend({}, commonConfig.getConfig().user, {
							password: password
						})
					});

					chat.init();
					chat.show();
					transfer.send({ event: _const.EVENTS.SHOW });
				}, function(err){
					console.error("username is not exist.");
					throw err;
				});
			}
			// 发送指定坐席的ext消息，延迟发送
			extendMessageSender.push({ weichat: { agentUsername: targetUserInfo.agentUserName } });
		}
		else if(commonConfig.getConfig().user.username && (commonConfig.getConfig().user.password || commonConfig.getConfig().user.token)){
			if(commonConfig.getConfig().user.token){
				// todo: move imToken to an independent key
				profile.imToken = commonConfig.getConfig().user.token;
			}
			else{
				profile.imPassword = commonConfig.getConfig().user.password;
			}
			chat.init();
		}
		// 检测微信网页授权
		else if(commonConfig.getConfig().wechatAuth){
			doWechatAuth(function(entity){
				commonConfig.setConfig({
					user: _.extend({}, commonConfig.getConfig().user, {
						username: entity.userId,
						password: entity.userPassword
					})
				});
				chat.init();
			}, function(){
				_downgrade();
			});
		}
		else if(commonConfig.getConfig().user.username){
			apiHelper.getPassword().then(function(password){
				commonConfig.setConfig({
					user: _.extend({}, commonConfig.getConfig().user, {
						password: password
					})
				});
				chat.init();
			}, function(){
				if(profile.grayList.autoCreateAppointedVisitor){
					_createAppointedVisitor();
				}
				else{
					_downgrade();
				}

			});
		}
		else{
			_downgrade();
		}
	}, function(err){
		if(err.statusCode === 503){
			uikit.createDialog({
				contentDom: utils.createElementFromHTML([
					"<div class=\"wrapper\">",
					"<span class=\"icon-waiting\"></span>",
					"<p class=\"tip-word\">" +  __("common.session_over_limit") + "</p>",
					"</div>"
				].join("")),
				className: "session-over-limit"
			}).show();
		}
		else{
		// chat.show()针对移动端，在pc端不是必要的逻辑
			chat.show();
			uikit.prompt(err);
			throw err;
		}
	});
}
function _createAppointedVisitor(){
	_createVisitor(commonConfig.getConfig().user.username);
}
function _createVisitor(username){
	apiHelper.createVisitor(username).then(function(entity){
		var cacheKeyName = (commonConfig.getConfig().configId || (commonConfig.getConfig().to + commonConfig.getConfig().tenantId + commonConfig.getConfig().emgroup));
		commonConfig.setConfig({
			user: _.extend({}, commonConfig.getConfig().user, {
				username: entity.userId,
				password: entity.userPassword
			})
		});

		if(entity.userPassword === ""){
			profile.imRestDown = true;
		}
		if(utils.isTop){
			utils.set("root" + (commonConfig.getConfig().configId || (commonConfig.getConfig().tenantId + commonConfig.getConfig().emgroup)), commonConfig.getConfig().user.username);
		}
		else{
			transfer.send({
				event: _const.EVENTS.CACHEUSER,
				data: {
					key: cacheKeyName,
					value: commonConfig.getConfig().user.username,
				}
			});
		}
		chat.init();
	});
}
function _downgrade(){
	_createVisitor();
}

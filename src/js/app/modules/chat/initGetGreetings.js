var _const = require("../../../common/const");
var profile = require("../tools/profile");
var utils = require("src/js/common/utils");
var eventListener = require("../tools/eventListener");
var apiHelper = require("../apiHelper");
var messageBuilder = require("src/js/app/sdk/messageBuilder");

module.exports = function(){
	eventListener.add([
		_const.SYSTEM_EVENT.SESSION_RESTORED,
		_const.SYSTEM_EVENT.SESSION_NOT_CREATED,
	], _getGreetings);
};

function _getGreetings(officialAccount){
	if(officialAccount !== profile.systemOfficialAccount) return;
	if(officialAccount.isSessionOpen) return;
	Promise.all([
		apiHelper.getSystemGreeting(),
		apiHelper.getRobertGreeting(),
		apiHelper.getSkillgroupMenu()
	]).then(function(result){
		var systemGreetingText = result[0];
		var robotGreetingObj = result[1];
		var groupMenuObject = result[2];
		var greetingTextType = robotGreetingObj.greetingTextType;
		var greetingText = robotGreetingObj.greetingText;
		var parsed;

		// 系统欢迎语
		systemGreetingText && eventListener.trigger(
			_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
			messageBuilder.transformFromKefu2Im({ body: messageBuilder.textMessage(systemGreetingText) }),
			{ noPrompt: true, type: "txt", isReceived: true }
		);

		// 机器人欢迎语
		switch(greetingTextType){
		case 0:
			// 文本消息
			eventListener.trigger(
				_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
				messageBuilder.transformFromKefu2Im({ body: messageBuilder.textMessage(greetingText) }),
				{ noPrompt: true, type: "txt", isReceived: true }
			);
			break;
		case 1:
			// 菜单消息
			parsed = utils.safeJsonParse(greetingText.replace(/&amp;quot;|&amp;amp;quot;/g, "\""));

			parsed && parsed.ext && eventListener.trigger(
				_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
				messageBuilder.transformFromKefu2Im({ body: messageBuilder.textMessage(null, parsed.ext) }),
				{ noPrompt: true, type: "txt", isReceived: true }
			);
			break;
		case 2:
			// 图片消息
			// todo: fix this: discard channel.handleMessage
			parsed = utils.safeJsonParse(greetingText.replace(/&amp;quot;|&amp;amp;quot;/g, "\""));
			if(!parsed){
				console.error("failed to parse robot message:", greetingText);
				return;
			}
			eventListener.trigger(
				_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
				messageBuilder.transformFromKefu2Im({
					body: messageBuilder.mediaFileMessage({
						type: "img",
						url: location.protocol + profile.config.domain + parsed.urlPath,
						// 图片消息可能带有转人工按钮扩展
						ext: parsed.ext,
					}),
				}),
				{ noPrompt: true, type: "img", isReceived: true }
			);
			break;
		case undefined:
			// 未设置机器人欢迎语
			break;
		default:
			console.error("unknown robot greeting type.");
			break;
		}

		// 技能组列表
		// 此处的 groupMenu 类型为 object
		// todo: 增加 menu 类型的 messageBuilder
		groupMenuObject && eventListener.trigger(
			_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
			messageBuilder.transformFromKefu2Im({ body: messageBuilder.textMessage(groupMenuObject) }),
			{ noPrompt: true, type: "skillgroupMenu", isReceived: true }
		);
	});
}

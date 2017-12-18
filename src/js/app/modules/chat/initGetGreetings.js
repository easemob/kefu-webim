var _const = require("../../../common/const");
var profile = require("../tools/profile");
var eventListener = require("../tools/eventListener");
var apiHelper = require("../apiHelper");
var channel = require("../channel");

module.exports = function(){
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _getGreetings);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _getGreetings);
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
		var groupMenus = result[2];
		var greetingTextType = robotGreetingObj.greetingTextType;
		var greetingText = robotGreetingObj.greetingText;
		var greetingObj = {};

		// 系统欢迎语
		systemGreetingText && channel.handleMessage({
			data: systemGreetingText,
		}, { type: "txt", noPrompt: true });

		// 机器人欢迎语
		switch(greetingTextType){
		case 0:
			// 文本消息
			channel.handleMessage({
				data: greetingText,
			}, { type: "txt", noPrompt: true });
			break;
		case 1:
			// 菜单消息
			// 适配后端有转义两次／三次的情况
			greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));

			greetingObj.ext && channel.handleMessage({
				ext: greetingObj.ext,
			}, { type: "txt", noPrompt: true });
			break;
		case 2:
			// 图片消息
			// 适配后端有转义两次／三次的情况
			greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
			greetingObj.url = profile.config.domain + greetingObj.urlPath;

			channel.handleMessage(greetingObj, { type: "img", noPrompt: true});
			break;
		case undefined:
			// 未设置机器人欢迎语
			break;
		default:
			console.error("unknown robot greeting type.");
			break;
		}

		// 技能组列表
		groupMenus && channel.handleMessage({
			data: groupMenus,
		}, { type: "skillgroupMenu", noPrompt: true });
	});
}

var Const =			require("@/common/cfg/const");
var profile =		require("@/common/cfg/profile");
var kefuPath =		require("@/common/cfg/kefuPath");
var apiHelper =		require("@/common/kit/apiHelper");
var eventListener =	require("@/common/disp/eventListener");
var channel =		require("@/app/modules/chat/channel");


module.exports = function(){
	eventListener.add(Const.SYSTEM_EVENT.SESSION_RESTORED, _getGreetings);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_NOT_CREATED, _getGreetings);
};

function _getGreetings(officialAccount){
	if(officialAccount !== profile.systemOfficialAccount) return;
	if(officialAccount.isSessionOpen) return;
	Promise.all([
		apiHelper.getSystemGreeting(),
		apiHelper.getRobertGreeting(),
		apiHelper.getSkillgroupMenu()
	]).then(function(result){
		var systemGreetingText = result[0] + "";
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
			greetingObj.url = kefuPath.getToBackend(greetingObj.urlPath);
			channel.handleMessage(greetingObj, { type: "img", noPrompt: true });
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

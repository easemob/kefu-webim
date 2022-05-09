var _const = require("@/common/const");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var apiHelper = require("../apis");
var channel = require("../channel");
var commonConfig = require("@/common/config");
var answersGroupTimeout;
var answerIndex = 0;
var answerLoop = 1;
var greetingData;
var waitTimeout;
var AnswersGroupShowFlag = true;
var greetingRotate = false;
module.exports = function(){
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _getGreetings);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _getGreetings);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_ALREADY_CREATED, _getGreetingsData);
	eventListener.add(_const.SYSTEM_EVENT.CLEAR_TIMEOUT, clearAnswersGroupTimeout);
	eventListener.add(_const.SYSTEM_EVENT.STOP_TIMEOUT, stopAnswerTimeout);
};
function htmlDecodeByRegExp(str){
	var temp = "";
	if(str.length == 0) return "";
	temp = str.replace(/&amp;/g, "&");
	temp = temp.replace(/&lt;/g, "<");
	temp = temp.replace(/&gt;/g, ">");
	temp = temp.replace(/&nbsp;/g, " ");
	temp = temp.replace(/&#39;/g, "'");
	temp = temp.replace(/&quot;/g, "\"");
	temp = translate(translate(translate(temp)));  //处理后端多次转义
	return temp;
}
function htmlDecodeByRegExp2(str){
	var temp = "";
	if(str.length == 0) return "";
	temp = str.replace(/&amp;amp;amp;/g, "&");
	temp = temp.replace(/&amp;amp;lt;/g, "<");
	temp = temp.replace(/&amp;amp;gt;/g, ">");
	temp = temp.replace(/&amp;amp;amp;#39;|&amp;amp;#39;|＆amp;#39;/g, "'");
	temp = temp.replace(/&amp;amp;quot;|&amp;quot;/g, "\"");

	temp = translate(translate(translate(temp))); //处理后端多次转义
	return temp;
}
function translate(val) {
	return $("<div>"+ val +"</div>").text()
}
function _getGreetings(officialAccount){
	if(officialAccount !== profile.systemOfficialAccount) return;
	if(officialAccount.isSessionOpen) return;
	Promise.all([
		apiHelper.getSystemGreeting(),
		apiHelper.getRobertGreeting(),
		apiHelper.getSkillgroupMenu(),
	]).then(function(result){
		var systemGreetingText = result[0];
		var robotGreetingObj = result[1];
		var groupMenus = result[2];

		var greetingTextType = robotGreetingObj.greetingTextType;
		var greetingText = robotGreetingObj.greetingText;
		var laiye = robotGreetingObj.laiye;
		greetingRotate = robotGreetingObj.rotate;
		var greetingObj = {};

		// 系统欢迎语
		systemGreetingText && channel.handleMessage({
			data: systemGreetingText,
		}, {
			type: "txt",
			noPrompt: true
		});

		// 机器人欢迎语
		
		switch(greetingTextType){
		case 0:
			// 文本消息
			greetingText = htmlDecodeByRegExp2(greetingText);
			channel.handleMessage({
				data: greetingText,
			}, {
				type: "txt",
				noPrompt: true,
				laiye: laiye
			});
			break;
		case 1:
			// 菜单消息
			// 适配后端有转义两次／三次的情况
			greetingText = htmlDecodeByRegExp2(greetingText);
			greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
			
			greetingObj.ext && channel.handleMessage({
				ext: greetingObj.ext,
			}, {
				type: "txt",
				noPrompt: true,
				answerSource: "WELCOME",
				laiye: laiye
			});
			break;
		case 2:
			// 图片消息
			// 适配后端有转义两次／三次的情况
			greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
			greetingObj.url = commonConfig.getConfig().domain + greetingObj.urlPath;
			channel.handleMessage(greetingObj, { type: "img", noPrompt: true, laiye: laiye });
			break;
		case 4:
				// 图文消息
			greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
			greetingObj.url = commonConfig.getConfig().domain + greetingObj.urlPath;
			greetingObj.ext = {};
			greetingObj.ext.msgtype = greetingObj.news;
			channel.handleMessage(greetingObj, { type: "article", noPrompt: true, laiye: laiye });
			break;
		case 5:
			// 答案组
			greetingText = JSON.parse(htmlDecodeByRegExp2(greetingText));
			greetingData = greetingText;
			answersGroupHandleMessage();
			break;
		case undefined:
			// 未设置机器人欢迎语
			break;
		default:
			console.error("unknown robot greeting type.");
			break;
		}

		// 技能组列表（机器人菜单）
		if(groupMenus){
			groupMenus.menuName = htmlDecodeByRegExp(groupMenus.menuName);
			if(groupMenus.children && groupMenus.children.length){
				var childs = groupMenus.children;
				_.map(childs, function(item){
					item.menuName = htmlDecodeByRegExp(item.menuName);
					return childs;
				});
			}
			channel.handleMessage({
				data: groupMenus,
			}, {
				type: "skillgroupMenu",
				noPrompt: true
			});
		}

		// 询前引导
		if(!greetingTextType && !greetingText && profile.grayList.transfermanualmenuguide && profile.isManualMenuGuide){
			apiHelper.getTransferManualMenu().then(function(result){
				channel.handleMessage({
					data: result,
				}, {
					type: "transferManualMenu",
					noPrompt: true
				});
			});
		}

	});
}

function _getGreetingsData(){
	Promise.all([
		apiHelper.getSystemGreeting(),
		apiHelper.getRobertGreeting(),
		apiHelper.getSkillgroupMenu(),
	]).then(function(result){
		var robotGreetingObj = result[1];
		var greetingText = robotGreetingObj.greetingText;
		var greetingTextType = robotGreetingObj.greetingTextType;
		greetingRotate = robotGreetingObj.rotate;

		if(greetingTextType){
			// 答案组
			greetingText = JSON.parse(htmlDecodeByRegExp2(greetingText));
			greetingData = greetingText;
			clearAnswersGroupTimeout();
		}
	});
}

function answersGroupHandleMessage(){
	var answersLength = greetingData.length;
	var randomTime;
	var greetingTextType;
	var laiye;
	var greetingText;
	var greetingObj = {};
	if(answerIndex < answersLength){
		if(answerIndex == 0){
			randomTime = 0;
		}
		else{
			// randomTime = 1000;
			randomTime = Math.floor((parseInt(Math.random() * 10) + 25) * 1000);
		}

		greetingTextType = greetingData[answerIndex].greetingTextType;
		laiye = greetingData[answerIndex].laiye;
		greetingText = greetingData[answerIndex].greetingText;

		answersGroupTimeout = setTimeout(function(){
			switch(greetingTextType){
			case 0:
					// 文本消息
				greetingText = htmlDecodeByRegExp2(greetingText);
				channel.handleMessage({
					data: greetingText,
				}, {
					type: "txt",
					noPrompt: true,
					laiye: laiye
				});
				break;
			case 1:
					// 菜单消息
					// 适配后端有转义两次／三次的情况
				greetingText = htmlDecodeByRegExp2(greetingText);
				greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
					
				greetingObj.ext && channel.handleMessage({
					ext: greetingObj.ext,
				}, {
					type: "txt",
					noPrompt: true,
					answerSource: "WELCOME",
					laiye: laiye
				});
				break;
			case 2:
					// 图片消息
					// 适配后端有转义两次／三次的情况
				greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
				greetingObj.url = commonConfig.getConfig().domain + greetingObj.urlPath;
				channel.handleMessage(greetingObj, { type: "img", noPrompt: true, laiye: laiye });
				break;
			case 4:
					// 图文消息
				greetingObj = JSON.parse(greetingText.replace(/&amp;amp;quot;|&amp;quot;/g, "\""));
				greetingObj.url = commonConfig.getConfig().domain + greetingObj.urlPath;
				greetingObj.ext = {};
				greetingObj.ext.msgtype = greetingObj.news;
				channel.handleMessage(greetingObj, { type: "article", noPrompt: true, laiye: laiye });
				break;
			case undefined:
					// 未设置机器人欢迎语
				break;
			default:
				console.error("unknown robot greeting type.");
				break;
			}
			answerIndex++;
			answersGroupHandleMessage();
		}, randomTime);
	}
	else{
		answerLoop++;
		answerIndex = 0;
		clearAnswersGroupTimeout();
	}
}

function clearAnswersGroupTimeout(){
	var time;
	clearTimeout(waitTimeout);
	if(AnswersGroupShowFlag && greetingRotate){
		if(answerLoop <= 5){
			time = 60 * 1000 * answerLoop;
			clearTimeout(answersGroupTimeout);
			waitTimeout = setTimeout(function(){
				answersGroupHandleMessage();
			}, time);
		}
	}
}

function stopAnswerTimeout(){
	AnswersGroupShowFlag = false;
	clearTimeout(answersGroupTimeout);
	clearTimeout(waitTimeout);
}

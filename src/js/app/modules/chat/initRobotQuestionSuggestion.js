var _const = require('../../../common/const');
var utils = require('../../../common/utils');
var profile = require('../tools/profile');
var apiHelper = require('../apiHelper');
var channel = require("../channel");

var wrapperView;
var tagContainer;
var latest = onlyExcuteLatestCallback();

module.exports = function(opt){
	var closeButton;
	var options;
	var throttledGetSuggestion;

	if (
		// 中通的网页插件版本过低，还不支持新版的灰度策略，默认打开
		// !profile.grayList.robotQuestionSuggestion
		// ||
		utils.isMobile
	) return;

	options = opt || {};
	textareaDom = opt.textareaDom;
	wrapperView = document.querySelector(".question-suggestion-wrapper");
	closeButton = wrapperView.querySelector(".close-button");
	tagContainer = wrapperView.querySelector(".tag-container");
	throttledGetSuggestion = _.throttle(_getRobotSuggestion, 1000);

	utils.on(closeButton, "click", _hideSuggestion);

	utils.live("li.item", "click", function(e){
		var text = this.innerText;
		textareaDom.value = "";
		channel.sendText(text);
	}, tagContainer);

	utils.on(textareaDom, "change input", function(){
		throttledGetSuggestion(textareaDom.value);
	});
};

function _hideSuggestion(){
	utils.addClass(wrapperView, "hide");
	tagContainer.innerHTML = "";
}

function _getRobotSuggestion(text){
	var currentOfficialAccount = profile.currentOfficialAccount;
	var sessionId = currentOfficialAccount.sessionId;
	var agentId = currentOfficialAccount.agentId;
	var robotId = profile.robotId;
	var agentType = currentOfficialAccount.agentType;
	var question = text || "";

	if(
		// sessionId 不存在
		!sessionId
		// 文字为空
		|| question.trim() === ""
		// 坐席类型不为机器人
		|| agentType !== _const.AGENT_ROLE.ROBOT
		// robotId 和 agentUserId 同时为空
		|| (!agentId && !robotId)
	){
		_hideSuggestion();
		return;
	}

	apiHelper.getRobotQuestionSuggestion(sessionId, {
		question: question,
		robotId: robotId,
		userId: agentId,
	})
	.then(latest(function(suggestionList){
		// 没有结果时隐藏建议
		if(_.isEmpty(suggestionList)){
			_hideSuggestion();
			return;
		}
		tagContainer.innerHTML = suggestionList.map(function(itemText){
			return "<li class=\"item bg-color bg-hover-color-dark\">" + _.escape(itemText) + "</li>";
		}).join("");
		utils.removeClass(wrapperView, "hide");
	}));
}

// $.get("http://").done(latest(function(dat){}));
// 异步并发时，只执行最后一次异步的回调
// 1、没有时间参数，不异步启动。
// 2、按发起异步时的顺序，而不是回调时的顺序。
function onlyExcuteLatestCallback(){
	var callback;
	return function(cb){
		callback = cb;
		return function(){
			cb === callback && cb.apply(null, arguments);
		};
	};
}


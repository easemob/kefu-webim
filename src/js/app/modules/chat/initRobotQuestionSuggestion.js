var _const = require("../../../common/const");
var utils = require("../../../common/utils");
var profile = require("../tools/profile");
var apiHelper = require("../apiHelper");
var channel = require("../channel");

var wrapperView;
var tagContainer;
var latest = onlyExcuteLatestCallback();
var userDisabled = false;
var suggestionTimer = 0;
var curSelectionIdx = -1;
var curSelection = "";

module.exports = function(opt){
	var closeButton;
	var textareaDom;

	if(
		// 中通的网页插件版本过低，还不支持新版的灰度策略，默认打开
		// !profile.grayList.robotQuestionSuggestion
		// ||
		utils.isMobile
	) return;

	// 艹！把编辑器 dom 传到这来了。什么傻逼实现方式？
	textareaDom = opt.textareaDom;
	wrapperView = document.querySelector(".question-suggestion-wrapper");
	closeButton = wrapperView.querySelector(".close-button");
	tagContainer = wrapperView.querySelector(".tag-container");

	// 关闭
	utils.on(closeButton, "click", function(){
		clearInterval(suggestionTimer);
		userDisabled = true;
		_hideSuggestion();
	});

	// 点击发送
	utils.live("li.item", "click", function(e){
		var text = this.innerText;
		channel.sendText(text);
		_hideSuggestion();
		textareaDom.value = "";
	}, tagContainer);

	// blur 会触发 change，使得首次点击发送失效
	// keypress 不支持退格
	suggestionTimer = setInterval(function(){
		var curQuestion = textareaDom.value;
		if(curQuestion){
			_getRobotSuggestion(curQuestion, getEditContent);
		}
	}, 500);

	// 键盘选中
	utils.on(textareaDom, "keydown", function(e){
		var result = true;
		var keyCode = e.keyCode;

		// 有内容，就是 open
		var tagItems = tagContainer.querySelectorAll("li");
		var isOpen = tagItems.length;

		if(!isOpen) return false;

		switch(keyCode){
		case 13:
			sendSelection();
			textareaDom.value = "";		// dom 不外露，放在这里面把
			e.preventDefault();			// 防止多余的换行
			result = false;
			break;

		case 38:
			goUp(tagItems);
			e.preventDefault();			// 防止光标移动
			result = false;
			break;

		case 40:
			goDown(tagItems);
			e.preventDefault();
			result = false;
			break;

		default:
			break;
		}

		return result;
	});

	function getEditContent(){
		return textareaDom.value;
	}
};









function renderSelection(idx, tagItems){
	var maxIdx = tagItems.length - 1;
	var minIdx = 0;
	var selected;
	idx = idx > maxIdx ? maxIdx : idx;
	idx = idx < minIdx ? minIdx : idx;
	selected = tagItems[idx];
	utils.removeClass(tagItems, "bg-active-color-light");
	utils.addClass(selected, "bg-active-color-light");
	curSelectionIdx = idx;
	curSelection = selected.innerText;
	utils.sendDisabled = true;
}

function goUp(tagItems){
	var gotoIdx;
	if(curSelectionIdx >= 0){
		gotoIdx = curSelectionIdx - 1;
	}
	else if(tagItems.length){
		gotoIdx = tagItems.length - 1;
	}
	// 合法
	if(gotoIdx >= 0){
		renderSelection(gotoIdx, tagItems);
	}
}

function goDown(tagItems){
	var gotoIdx;
	if(curSelectionIdx >= 0){
		gotoIdx = curSelectionIdx + 1;
	}
	if(gotoIdx >= 0){
		renderSelection(gotoIdx, tagItems);
	}
}

function sendSelection(){
	curSelection && channel.sendText(curSelection);
	_hideSuggestion();
}





function _hideSuggestion(){
	utils.addClass(wrapperView, "hide");
	tagContainer.innerHTML = "";

	// clear selection
	curSelectionIdx = -1;
	curSelection = "";
	utils.sendDisabled = false;
}

function _getRobotSuggestion(text, getEditContent){
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
		// 再次检查编辑器没内容则抛弃，不要继续
		if(_.isEmpty(suggestionList) || !getEditContent()){
			_hideSuggestion();
			return;
		}

		// open suggestion
		tagContainer.innerHTML = suggestionList.map(function(itemText, idx){
			// 恢复选中
			if(idx === curSelectionIdx){
				return "<li class=\"item bg-active-color-light regular-color bg-hover-color-dark\">" + _.escape(itemText) + "</li>";
			}
			return "<li class=\"item regular-color bg-hover-color-dark\">" + _.escape(itemText) + "</li>";
		}).join("");

		// 用户没有禁止，才能打开
		!userDisabled && utils.removeClass(wrapperView, "hide");
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

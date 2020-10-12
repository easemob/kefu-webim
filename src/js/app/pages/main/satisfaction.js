var utils = require("@/common/utils");
var _const = require("@/common/const");
var uikit = require("./uikit");
var apiHelper = require("./apis");
var channel = require("./channel");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var loading = require("./uikit/loading");
var getToHost = require("@/app/common/transfer");
var commonConfig = require("@/common/config");

var dom;
var starsUl;
var resolvedBtn;
var commentDom;
var tagContainer;
var dialog;

var starList;

var session;
var invite;
var score;
var evaluationDegreeId;
var isSingleTag;
var resolvedDom;
var resolveTip;
var resolvedId = 1;
var _initOnce = _.once(_init);
var evaluateType; // 评价方式
var sessionResolved;// 问题解决评价
var fiveStarState;//默认五星评价
var defaultScore;

module.exports = {
	init: init,
	show: show,
};

function _init(){
	// 自定义主题色
	var config = commonConfig.getConfig();
	var themeName = config.ui.themeName;
	if(themeName && themeName.indexOf("theme_custom") > -1){
		var arr = themeName.split("theme_custom");
		var color = arr[1];
	} 

	loading.show("satisfaction");
	//默认五星评价的开关
	apiHelper.getDefaultFiveStarEnable()
	.then(function(resp){
		fiveStarState = resp;
	});
	apiHelper.getSatisfactionTipWord().then(function(tipWord){
		dom = sessionResolved ? utils.createElementFromHTML([
			"<div class=\"wrapper\">",
			"<div class=\"resolveCon\"><span class=\"title\">" + resolveTip + "</span>",
			"<div><span class=\"resolve-btn selected bg-color resolved\" data-num = \"1\"><i class=\"icon-resolved\"></i><span>" + __("evaluation.resolved") + "</span></span>",
			"<span class=\"resolve-btn unresolved\" data-num = \"2\"><i class=\"icon-unresolved\"></i><span>" + __("evaluation.unsolved") + "</span></span></div></div>",
			"<span class=\"title\">" + tipWord + "</span>",
			"<ul></ul>",
			"<div class=\"tag-container\"></div>",
			"<textarea spellcheck=\"false\" placeholder=\"" + __("evaluation.review") + "\"></textarea>",
			"</div>"
		].join(""))
			:
			utils.createElementFromHTML([
				"<div class=\"wrapper\">",
				"<span class=\"title\">" + tipWord + "</span>",
				"<ul></ul>",
				"<div class=\"tag-container\"></div>",
				"<textarea spellcheck=\"false\" placeholder=\"" + __("evaluation.review") + "\"></textarea>",
				"</div>"
			].join(""));
		starsUl = dom.querySelector("ul");
		commentDom = dom.querySelector("textarea");
		tagContainer = dom.querySelector(".tag-container");
		resolvedBtn = dom.querySelectorAll(".resolve-btn");
		resolvedDom = dom.querySelector(".resolved");

		utils.live(".resolve-btn", "click", function(){
			utils.removeClass(resolvedBtn, "selected bg-color");
			utils.addClass(this, "selected bg-color");
			if(color){
				$(".resolve-btn").css("cssText","background-color: #fff !important"); 
				$(".theme_custom").find(".bg-color").css("cssText","background-color: " + color + " !important");
			}
			resolvedId = this.dataset.num;
			if(fiveStarState){
				if(resolvedId == 1){
					utils.addClass(starList, "sel");
					score = defaultScore;
				}
				else{
					utils.removeClass(starList, "sel");
					score = false;
				}
			}
		});

		utils.live("li", "click", function(){
			var level = +this.getAttribute("data-level");

			evaluationDegreeId = this.getAttribute("data-evaluate-id");
			score = this.getAttribute("data-score");
			isSingleTag = this.getAttribute("data-isSingleTag");
			level && _.each(starList, function(elem, i){
				utils.toggleClass(elem, "sel", i < level);
			});

			evaluationDegreeId && _createLabel(evaluationDegreeId);
		}, starsUl);

		utils.live("span.tag", "click", function(){
			var selectedTagNodeList = tagContainer.querySelectorAll(".selected");
			if(isSingleTag == "true"){
				utils.removeClass(selectedTagNodeList, "selected");
				utils.toggleClass(this, "selected");
			}
			else{
				utils.toggleClass(this, "selected");
			}

		}, tagContainer);

		dialog = uikit.createDialog({
			contentDom: dom,
			className: "satisfaction"
		}).addButton({
			confirmText: __("common.submit"),
			confirm: _confirm,
		});
		loading.hide("satisfaction");
		dialog.show();

		// 火狐浏览器 _setSatisfaction时找不到starsUl，所以必须先执行完init
		_setSatisfaction();

		// 自定义主题色
		color && $(".theme_custom").find(".bg-color").css("cssText","background-color: " + color + " !important"); 
	});
}

function _clear(){
	commentDom.blur();
	commentDom.value = "";
	score = null;
	// clear stars
	utils.removeClass(starList, "sel");
	// clear label
	tagContainer.innerHTML = "";
	// clear resolvedBtn
	utils.removeClass(resolvedBtn, "selected bg-color");
	utils.addClass(resolvedDom, "selected bg-color");
	resolvedBtn.css("cssText","background-color: #fff !important"); 

	resolvedId = 1;

}

function _sendSatisfaction(score, content, session, invite, appraiseTags, resolutionParam, evaluationDegreeId){
	var data = {
		ext: {
			weichat: {
				ctrlType: "enquiry",
				ctrlArgs: {
					// 后端类型要求，inviteId必须传数字
					inviteId: invite || 0,
					serviceSessionId: session || profile.currentOfficialAccount.sessionId || "",
					detail: content,
					summary: score,
					appraiseTags: appraiseTags,
					resolutionParam: resolutionParam,
					evaluationDegreeId: evaluationDegreeId,
					// 评价方式，由前端传入：visitor - 访客主动评价; agent - 坐席邀请; system - 强制邀请,访客点击关闭窗口或会话结束
					evaluateWay: evaluateType
				}
			}
		}
	};
	if(!sessionResolved){
		delete data.ext.weichat.ctrlArgs.resolutionParam;
	}
	channel.sendText("", data);
}

function _setSatisfaction(){
	apiHelper.getEvaluationDegrees().then(function(entities){
		var labelID;
		var lastScore;
		starsUl.innerHTML = _.chain(entities)
		.sortBy("level")
		.map(function(elem, index){
			// stat level 1-based
			var level = index + 1;
			var name = elem.name;
			var id = elem.id;
			var score = elem.score;
			var isSingleTag = elem.isSingleTag;
			labelID = id;
			lastScore = score;
			 
			return "<li data-level=\"" + level
				+ "\" title=\"" + name
				+ "\" data-evaluate-id=\"" + id
				+ "\" data-score=\"" + score
				+ "\" data-isSingleTag=\"" + isSingleTag
				+ "\">H</li>";
		})
		.value()
		.join("");

		starList = starsUl.querySelectorAll("li");
		defaultScore = lastScore
		if(fiveStarState){
			if(resolvedId == 1){
				utils.addClass(starList, "sel");
				//创建评价标签
				_createLabel(labelID);
				score = defaultScore;
			}
			else{
				utils.removeClass(starList, "sel");
				score = false;
			}
		}
		
	});
}

function _createLabel(evaluateId){
	apiHelper.getAppraiseTags(evaluateId).then(function(entities){
		tagContainer.innerHTML = _.map(entities, function(elem){
			var name = elem.name;
			var id = elem.id;

			return "<span data-label-id = \"" + id + "\"  class=\"tag\">" + name + "</span>";
		}).join("");
		utils.removeClass(tagContainer, "hide");
	});
}

function _confirm(){
	var selectedTagNodeList = tagContainer.querySelectorAll(".selected");
	var tagNodeList = tagContainer.querySelectorAll(".tag");
	var content = commentDom.value;
	var appraiseTags = _.map(selectedTagNodeList, function(elem){
		return {
			id: elem.getAttribute("data-label-id"),
			name: elem.innerText
		};
	});
	var resolutionParam = [{
		id: resolvedId,
		name: resolvedId == 1 ? "已解决" : "未解决",
		score: resolvedId,
		resolutionParamTags: []
	}];

	// 必须选择星级
	if(!score){
		uikit.tip(__("evaluation.select_level_please"));
		// 防止对话框关闭
		return false;
	}
	// 若有标签则至少选择一个
	else if(tagNodeList.length > 0 && selectedTagNodeList.length === 0){
		uikit.tip(__("evaluation.select_tag_please"));
		// 防止对话框关闭
		return false;
	}

	_sendSatisfaction(score, content, session, invite, appraiseTags, resolutionParam, evaluationDegreeId);
	uikit.showSuccess(__("evaluation.submit_success"));
	getToHost.send({ event: _const.EVENTS.EVALUATIONSUBMIT });
	// 强制评价点击确定关闭会话框
	setTimeout(function(){
		// 关闭会话
		if(evaluateType === "system"){
			// 取消轮询接口
			eventListener.trigger(_const.SYSTEM_EVENT.CHAT_CLOSED);
			profile.currentOfficialAccount.sessionId && apiHelper.closeChatDialog({ serviceSessionId: profile.currentOfficialAccount.sessionId });
			getToHost.send({ event: _const.EVENTS.CLOSE });
		}
	}, 2000);
	_clear();
}

function show(inviteId, serviceSessionId, evaluateWay){

	apiHelper.getEvaluteSolveWord().then(function(tip){
		resolveTip = tip;
	});
	apiHelper.getServiceSessionResolved()
	.then(function(resp){
		sessionResolved = resp;
		_initOnce();
	});
	
	session = serviceSessionId;
	invite = inviteId;
	evaluateType = evaluateWay;
	_setDefaultScore();
	dialog && dialog.show();
}

function _setDefaultScore(){ 
	if(!starsUl){
		return false;
	} 
	_setSatisfaction();
}


function init(){
	eventListener.add(
		_const.SYSTEM_EVENT.SATISFACTION_EVALUATION_MESSAGE_RECEIVED,
		function(officialAccount, inviteId, serviceSessionId){
			if(officialAccount !== profile.currentOfficialAccount) return;
			show(inviteId, serviceSessionId, "system");
		}
	);
}

var utils = require("@/common/utils");
var _const = require("@/common/const");
var uikit = require("./uikit");
var apiHelper = require("./apis");
var channel = require("./channel");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var loading = require("./uikit/loading");
var getToHost = require("@/app/common/transfer");

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

module.exports = {
	init: init,
	show: show,
};

function _init(){
	loading.show("satisfaction");
	apiHelper.getEvaluteSolveWord().then(function(tip){
		resolveTip = tip;
	});
	apiHelper.getSatisfactionTipWord().then(function(tipWord){
		dom = utils.createElementFromHTML([
			"<div class=\"wrapper\">",
			"<div class=\"resolveCon\"><span class=\"title\">" + resolveTip + "</span>",
			"<div><span class=\"resolve-btn selected resolved\" data-num = \"1\"><i class=\"icon-resolved\"></i>已解决</span>",
			"<span class=\"resolve-btn unresolved\" data-num = \"2\"><i class=\"icon-unresolved\"></i>未解决</span></div></div>",
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
			utils.removeClass(resolvedBtn, "selected");
			utils.addClass(this, "selected");
			resolvedId = this.dataset.num;
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
	utils.removeClass(resolvedBtn, "selected");
	utils.addClass(resolvedDom, "selected");
	resolvedId = 1;

}

function _sendSatisfaction(score, content, session, invite, appraiseTags, resolutionParam, evaluationDegreeId){
	channel.sendText("", {
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
	});
}

function _setSatisfaction(){
	apiHelper.getEvaluationDegrees().then(function(entities){
		starsUl.innerHTML = _.chain(entities)
		.sortBy("level")
		.map(function(elem, index){
			// stat level 1-based
			var level = index + 1;
			var name = elem.name;
			var id = elem.id;
			var score = elem.score;
			var isSingleTag = elem.isSingleTag;

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
	// 强制评价点击确定关闭会话框
	setTimeout(function(){
		evaluateType === "system" && getToHost.send({ event: _const.EVENTS.CLOSE });
	}, 2000);
	_clear();
}

function show(inviteId, serviceSessionId, evaluateWay){
	_initOnce();
	session = serviceSessionId;
	invite = inviteId;
	evaluateType = evaluateWay;
	_setSatisfaction();
	dialog && dialog.show();
}

function init(){
	eventListener.add(
		_const.SYSTEM_EVENT.SATISFACTION_EVALUATION_MESSAGE_RECEIVED,
		function(officialAccount, inviteId, serviceSessionId){
			if(officialAccount !== profile.currentOfficialAccount) return;
			show(inviteId, serviceSessionId);
		}
	);
}

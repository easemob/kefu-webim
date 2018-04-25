var Const =			require("@/common/cfg/const");
var profile =		require("@/common/cfg/profile");
var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var apiHelper =		require("@/common/kit/apiHelper");
var Dialog =		require("@/common/uikit/dialog");
var tips =			require("@/common/uikit/tips");
var congrets =		require("@/common/uikit/congrets");
var loading =		require("@/common/uikit/loading");
var eventListener =	require("@/common/disp/eventListener");

var channel =		require("@/app/modules/chat/channel");

var dom;
var starsUl;
var commentDom;
var tagContainer;
var dialog;

var starList;

var session;
var invite;
var score;
var evaluationDegreeId;
var _initOnce = _.once(_init);

module.exports = {
	init: init,
	show: show,
};

function _init(){
	loading.show("satisfaction");
	apiHelper.getSatisfactionTipWord().then(function(tipWord){
		dom = domUtils.createElementFromHTML([
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

		utils.live("li", "click", function(){
			var level = +this.getAttribute("data-level");

			evaluationDegreeId = this.getAttribute("data-evaluate-id");
			score = this.getAttribute("data-score");

			level && _.each(starList, function(elem, i){
				domUtils.toggleClass(elem, "sel", i < level);
			});

			evaluationDegreeId && _createLabel(evaluationDegreeId);
		}, starsUl);

		utils.live("span.tag", "click", function(){
			domUtils.toggleClass(this, "selected");
		}, tagContainer);

		dialog = new Dialog({
			contentDom: dom,
			className: "satisfaction"
		})
		.addButton({
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
	domUtils.removeClass(starList, "sel");
	// clear label
	tagContainer.innerHTML = "";
}

function _sendSatisfaction(score, content, session, invite, appraiseTags, evaluationDegreeId){
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
					evaluationDegreeId: evaluationDegreeId,
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

			return "<li data-level=\"" + level
				+ "\" title=\"" + name
				+ "\" data-evaluate-id=\"" + id
				+ "\" data-score=\"" + score
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

			return "<span data-label-id = \"" + id + "\" class=\"tag\">" + name + "</span>";
		}).join("");
		domUtils.removeClass(tagContainer, "hide");
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

	// 必须选择星级
	if(!score){
		tips.tip(__("evaluation.select_level_please"));
		// 防止对话框关闭
		return false;
	}
	// 若有标签则至少选择一个
	else if(tagNodeList.length > 0 && selectedTagNodeList.length === 0){
		tips.tip(__("evaluation.select_tag_please"));
		// 防止对话框关闭
		return false;
	}

	_sendSatisfaction(score, content, session, invite, appraiseTags, evaluationDegreeId);
	congrets.show(__("evaluation.submit_success"));
	_clear();
}

function show(inviteId, serviceSessionId){
	_initOnce();
	session = serviceSessionId;
	invite = inviteId;
	_setSatisfaction();
	dialog && dialog.show();
}

function init(){
	eventListener.add(
		Const.SYSTEM_EVENT.SATISFACTION_EVALUATION_MESSAGE_RECEIVED,
		function(officialAccount, inviteId, serviceSessionId){
			if(officialAccount !== profile.currentOfficialAccount) return;
			show(inviteId, serviceSessionId);
		}
	);
}

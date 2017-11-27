var utils = require("../../common/utils");
var _const = require("../../common/const");
var uikit = require("./uikit");
var apiHelper = require("./apiHelper");
var channel = require("./channel");
var profile = require("./tools/profile");
var eventListener = require("./tools/eventListener");
var loading = require("./uikit/loading");

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
		dom = utils.createElementFromHTML([
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
				utils.toggleClass(elem, "sel", i < level);
			});

			evaluationDegreeId && _createLabel(evaluationDegreeId);
		}, starsUl);

		utils.live("span.tag", "click", function(){
			utils.toggleClass(this, "selected");
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

	_sendSatisfaction(score, content, session, invite, appraiseTags, evaluationDegreeId);
	uikit.showSuccess(__("evaluation.submit_success"));
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
		_const.SYSTEM_EVENT.SATISFACTION_EVALUATION_MESSAGE_RECEIVED,
		function(officialAccount, inviteId, serviceSessionId){
			if(officialAccount !== profile.currentOfficialAccount) return;
			show(inviteId, serviceSessionId);
		}
	);
}

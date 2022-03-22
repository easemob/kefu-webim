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
var gradeLiList;

var session;
var invite;
var score;
var scoreName;
var grade;
var gradeCon;
var resolveCon;
var resolvedGuanwei; // 官微的是否解决
var satisfactionId; // 已经评价过后的 id
var evaluationDegreeId;
var isSingleTag;
var resolvedDom;
var resolveTip;
var resolvedId = 1;
var _initOnce = _.once(_init);
var evaluateType; // 评价方式
var sessionResolved;// 问题解决评价

module.exports = {
	init: init,
	show: show,
};

function _init(){
	loading.show("satisfaction");
	apiHelper.getEvaluteSolveWord().then(function(tip){
		resolveTip = tip;
	});
	apiHelper.getServiceSessionResolved()
	.then(function(resp){
		sessionResolved = resp;
	});
	apiHelper.getSatisfactionTipWord().then(function(tipWord){
		// 判断是否为官微租户，Y 的话分三步实现
		if (_const.isGuanwei == 'Y') {
			var title1 = '您对本次客服人员的服务是否满意'
			var title2 = '您向朋友推荐大都会人寿的可能性有多大'
			var title3 = '“10”分代表愿意推荐，请在10到0之间选择'
			var title4 = '请问本次服务是否解决您的问题'
			dom = utils.createElementFromHTML([
				"<div class=\"wrapper\">",
				"<span class=\"title guan-wei\">" + title1 + "</span>",
				"<ul class=\"satisfactionUl\"></ul>",
				"<div class=\"tag-container\"></div>",
				"<div class=\"gradeCon hide\"><p class=\"title guan-wei\">" + title2 + "</p>",
				"<p class=\"title guan-wei no-top\">" + title3 + "</p>",
				"<ul class=\"gradeUl guan-wei\"></ul></div>",
				"<div class=\"resolveCon mbot-20 hide\"><span class=\"title guan-wei\">" + title4 + "</span>",
				"<div><span class=\"resolve-btn resolved\" data-num = \"1\"><span>" + __("evaluation.resolved") + "</span></span>",
				"<span class=\"resolve-btn unresolved\" data-num = \"2\"><span>" + __("evaluation.unsolved") + "</span></span></div></div>",
				"</div>"
			].join(""));

			// 满意度点击js
			starsUl = dom.querySelector(".satisfactionUl");
			gradeCon = dom.querySelector(".gradeCon");
			utils.live("li", "click", function(){
				var level = +this.getAttribute("data-level");
				evaluationDegreeId = this.getAttribute("data-evaluate-id");
				score = this.getAttribute("data-score");
				scoreName = this.getAttribute("title");
				isSingleTag = this.getAttribute("data-isSingleTag");
				level && _.each(starList, function(elem, i){
					utils.toggleClass(elem, "sel", i + 1 == level);
				});
				evaluationDegreeId && _createLabel(evaluationDegreeId);
				utils.removeClass(gradeCon, 'hide')
			}, starsUl);

			// 渲染评分ul
			var gradeUl = dom.querySelector(".gradeUl");
			resolveCon = dom.querySelector(".resolveCon");
			var gradeArr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
			gradeUl.innerHTML = gradeArr.map(function(elem) {
				return "<li class=\"guan-wei\" data-grade=\"" + elem + "\">" + elem + "</li>";
			}).join("");

			// 评分点击js
			gradeLiList = gradeUl.querySelectorAll("li")
			utils.live("li", "click", function(){
				grade = this.getAttribute("data-grade");
				utils.removeClass(gradeLiList, "sel");
				utils.addClass(this, "sel");
				utils.removeClass(resolveCon, 'hide')
			}, gradeUl);

			// 是否已解决点击js
			resolvedBtn = dom.querySelectorAll(".resolve-btn");
			utils.live(".resolve-btn", "click", function(){
				utils.removeClass(resolvedBtn, "selected-guan-wei");
				utils.addClass(this, "selected-guan-wei");
				resolvedGuanwei = this.dataset.num;
			});
			tagContainer = dom.querySelector(".tag-container");
		} else {
			dom = sessionResolved ? utils.createElementFromHTML([
				"<div class=\"wrapper\">",
				"<div class=\"resolveCon\"><span class=\"title\">" + resolveTip + "</span>",
				"<div><span class=\"resolve-btn selected resolved\" data-num = \"1\"><i class=\"icon-resolved\"></i><span>" + __("evaluation.resolved") + "</span></span>",
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
				// 去掉其他租户的 已解决未解决tag
				// evaluationDegreeId && _createLabel(evaluationDegreeId);
			}, starsUl);
		}

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

function _setSatisfaction() {
	apiHelper.getEvaluationDegrees().then(function(entities) {
		// 官微租户
		if (_const.isGuanwei == 'Y') {
			// 更改排序，按照 downLevel 的升序排
			var newEntities = entities.map(function(item) {
				item.downLevel = -item.level
				return item
			})
			starsUl.innerHTML = _.chain(newEntities).sortBy("downLevel").map(function(elem, index) {
				var level = index + 1;
				var name = elem.name;
				var id = elem.id;
				var score = elem.score;
				var isSingleTag = elem.isSingleTag;
				return "<li class=\"guan-wei\" data-level=\"" + level
					+ "\" title=\"" + name
					+ "\" data-evaluate-id=\"" + id
					+ "\" data-score=\"" + score
					+ "\" data-isSingleTag=\"" + isSingleTag
					+ "\">" + name + "</li>";
			}).value().join("");
		} else {
			starsUl.innerHTML = _.chain(entities).sortBy("level").map(function(elem, index) {
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
			}).value().join("");
		}
		starList = starsUl.querySelectorAll("li");
	});
}

function _confirm(){
	var selectedTagNodeList = tagContainer.querySelectorAll(".selected");
	var tagNodeList = tagContainer.querySelectorAll(".tag");
	// console.log('selectedTagNodeList', selectedTagNodeList)
	// console.log('tagNodeList', tagNodeList)
	// 判断是否为官微租户，Y 的话 content 就是 score 对应的中文
	var content;
	if (_const.isGuanwei == 'Y') {
		content = scoreName
	} else {
		content = commentDom.value;
	}
	var appraiseTags = _.map(selectedTagNodeList, function(elem){
		return {
			id: elem.getAttribute("data-label-id"),
			name: elem.innerText
		};
	});
	// console.log('appraiseTags', appraiseTags)
	var resolutionParam = [{
		id: resolvedId,
		name: resolvedId == 1 ? "已解决" : "未解决",
		score: resolvedId,
		resolutionParamTags: []
	}];

	// console.log('resolutionParam', resolutionParam)
	// 必须选择星级（非官微租户）
	if(!score && _const.isGuanwei != 'Y'){
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

	// 官微租户的 保存/修改
	if (_const.isGuanwei == 'Y') {
		var datas = {
			visitorUserId: _const.visitorUserId,
			agentUserId: _const.agentUserId,
			inviteId: score ? score : '',
			score: grade ? grade : '',
			resolve: resolvedGuanwei ? resolvedGuanwei : ''
		}
		// satisfactionId 有值说明评价过走修改接口
		if (satisfactionId) {
			// 官微租户满意度评价 - 修改
			apiHelper.satisfactionEdit(_const.tenantId, session || profile.currentOfficialAccount.sessionId || '', datas, satisfactionId).then(function(res) {
			});
		} else {
			// 官微租户满意度评价 - 保存
			apiHelper.satisfactionSave(_const.tenantId, session || profile.currentOfficialAccount.sessionId || '', datas).then(function(res) {
			});
		}
		// 为了获取禁用【立即评价】按钮的状态，需要刷新页面
		location.reload();
	}

	_sendSatisfaction(score, content, session, invite, appraiseTags, resolutionParam, evaluationDegreeId);
	uikit.showSuccess(__("evaluation.submit_success"));
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
	// 非官微租户
	if (_const.isGuanwei != 'Y') {
		_clear();
	}
}

function show(inviteId, serviceSessionId, evaluateWay){
	// 官微租户满意度评价 - 查询
	if (_const.isGuanwei == 'Y') {
		apiHelper.satisfactionQuery(_const.tenantId, session || profile.currentOfficialAccount.sessionId || '').then(function(res) {
			if (res.entity) {
				satisfactionId = res.entity.id
			}
		})
	}
	// 初始化（解决已经选择了满意度等数据，但是点击取消按钮，等再进入评价页面时，数据残留问题）
	score = null;
	resolvedId = 1
	if (dom) {
		tagContainer.innerHTML = ""
		// 官微租户
		if (_const.isGuanwei == 'Y') {
			utils.addClass(gradeCon, 'hide')
			utils.addClass(resolveCon, 'hide')
			scoreName = null;
			grade = null;
			resolvedGuanwei = null;
			satisfactionId = null;
			utils.removeClass(gradeLiList, "sel");
			utils.removeClass(resolvedBtn, "selected-guan-wei");
		} else {
			commentDom.value = ""
		}
	}

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
			show(inviteId, serviceSessionId, "system");
		}
	);
}

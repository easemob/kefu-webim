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
var defaultEvaluationDegreeId;
var color;
var bgColor;
var tipNameArr;

module.exports = {
	init: init,
	show: show,
};

function _init(){
	// 自定义主题色
	var config = commonConfig.getConfig();
	var themeName = config.ui.themeName;
	var themeClassName;
	if(themeName && themeName.indexOf("theme_custom") > -1){
		var arr = themeName.split("theme_custom");
		color = arr[1];
	}
	else{
		themeClassName = _const.themeMap[config.themeName];
	}
	color = !color? $("body." + themeClassName + " .border-color").css("borderColor") : color;
	bgColor = color;
	color = utils.changeToRgb(color);
	loading.show("satisfaction");
	//默认五星评价的开关
	apiHelper.getDefaultFiveStarEnable()
	.then(function(resp){
		fiveStarState = resp;
	});
	apiHelper.getSatisfactionTipWord().then(function(tipWord){
		dom = sessionResolved ? utils.createElementFromHTML([
			"<div class=\"wrapper\">",
			"<div class=\"wrapper-title\">" + __("evaluation.title") + "<i class=\"icon-close\"></i></div>",
			"<div class=\"resolveCon\"><span class=\"title\">" + resolveTip + "</span>",
			"<div><span class=\"resolve-btn selected bg-color resolved\" data-num = \"1\"><i class=\"icon-resolved\"></i><span>" + __("evaluation.resolved") + "</span></span>",
			"<span class=\"resolve-btn unresolved\" data-num = \"2\"><i class=\"icon-unresolved\"></i><span>" + __("evaluation.unsolved") + "</span></span></div></div>",
			"<span class=\"title\">" + tipWord + "</span>",
			"<ul></ul>",
			"<div class=\"tip hide\"></div>",
			"<div class=\"tag-container\"></div>",
			"<textarea spellcheck=\"false\" placeholder=\"" + __("evaluation.review") + "\"></textarea>",
			"<div class=\"cancel hidden\">" + __("evaluation.no_evaluation") + "</div>",
			"<div class=\"confirm bg-color\">"+  __("evaluation.submit_evaluation")  +"</div>",
			"</div>"
		].join(""))
			:
			utils.createElementFromHTML([
				"<div class=\"wrapper\">",
				"<div class=\"wrapper-title\">" + __("evaluation.title") + "<i class=\"icon-close\"></i></div>",
				"<span class=\"title\">" + tipWord + "</span>",
				"<ul></ul>",
				"<div class=\"tip hide\"></div>",
				"<div class=\"tag-container\"></div>",
				"<textarea spellcheck=\"false\" placeholder=\"" + __("evaluation.review") + "\"></textarea>",
				"<div class=\"cancel hidden\">" + __("evaluation.no_evaluation") + "</div>",
				"<div class=\"confirm bg-color\">"+  __("evaluation.submit_evaluation")  +"</div>",
				"</div>"
			].join(""));
		if(utils.isMobile || ($("body").hasClass("window-demo") && $("#em-kefu-webim-self").hasClass("hide"))){
			dom = sessionResolved ? utils.createElementFromHTML([
				"<div id=\"satisfaction-mobile\" class=\"wrapper\">",
				"<div class=\"wrapper-title bg-color\">" + __("evaluation.title") + " <i class=\"icon-back-new\"></i></div>",
				"<div class=\"resolveCon\"><span class=\"title\">" + resolveTip + "</span>",
				"<div><span class=\"resolve-btn selected bg-color resolved\" data-num = \"1\"><i class=\"icon-resolved\"></i><span>" + __("evaluation.resolved") + "</span></span>",
				"<span class=\"resolve-btn unresolved\" data-num = \"2\"><i class=\"icon-unresolved\"></i><span>" + __("evaluation.unsolved") + "</span></span></div></div>",
				"<span class=\"title\">" + tipWord + "</span>",
				"<ul></ul>",
				"<div class=\"tip hide\"></div>",
				"<div class=\"tag-container\"></div>",
				"<textarea spellcheck=\"false\" placeholder=\"" + __("evaluation.review") + "\"></textarea>",
				"<div class=\"cancel hidden\">" + __("evaluation.no_evaluation") + "</div>",
				"<div class=\"confirm bg-color\">"+  __("evaluation.submit_evaluation")  +"</div>",
				"</div>"
			].join(""))
				:
				utils.createElementFromHTML([
					"<div id=\"satisfaction-mobile\" class=\"wrapper\">",
					"<div class=\"wrapper-title bg-color\">" + __("evaluation.title") + " <i class=\"icon-back-new\"></i></div>",
					"<span class=\"title\">" + tipWord + "</span>",
					"<ul></ul>",
					"<div class=\"tip hide\"></div>",
					"<div class=\"tag-container\"></div>",
					"<textarea spellcheck=\"false\" placeholder=\"" + __("evaluation.review") + "\"></textarea>",
					"<div class=\"cancel hidden\">" + __("evaluation.no_evaluation") + "</div>",
					"<div class=\"confirm bg-color\">"+  __("evaluation.submit_evaluation")  +"</div>",
					"</div>"
				].join(""));
		}
		starsUl = dom.querySelector("ul");
		commentDom = dom.querySelector("textarea");
		tagContainer = dom.querySelector(".tag-container");
		resolvedBtn = dom.querySelectorAll(".resolve-btn");
		resolvedDom = dom.querySelector(".resolved");

		utils.live(".resolve-btn", "click", function(){
			utils.removeClass(resolvedBtn, "selected bg-color");
			$(".resolve-btn").css("cssText","background-color:#f7f7f7 !important");
			$(".resolve-btn i").css("cssText","color:##595959 !important"); 
			$(".resolve-btn span").css("cssText","color:##595959 !important");  
			utils.addClass(this, "selected bg-color");
			if(color){
				$(".resolveCon .selected").css("cssText","background-color:"+  color +"!important"); 
				$(".resolveCon .selected i").css("cssText","color:"+  bgColor +"!important"); 
				$(".resolveCon .selected span").css("cssText","color:"+  bgColor +"!important"); 
			}
			resolvedId = this.dataset.num;
			if(fiveStarState){
				if(resolvedId == 1){
					utils.addClass(starList, "sel");
					score = defaultScore;
					evaluationDegreeId = defaultEvaluationDegreeId;
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
			var tipBox = $(".satisfaction .tip")
			// var tipText = [__("evaluation.level1"),__("evaluation.level2"),__("evaluation.level3"),__("evaluation.level4"),__("evaluation.level5")]
			var tipText = tipNameArr || [];
			tipBox.removeClass("hide");
			tipBox.text(tipText[level - 1]);

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
		utils.live(".confirm","click",_confirm);
		utils.live(".cancel","click",function(){
			// dialog && dialog.hide();
			dialog && dialog.el.remove();
		});
		utils.live(".icon-back-new","click",function(){
			// dialog && dialog.hide();
			dialog && dialog.el.remove();
		});
		utils.live(".wrapper-title .icon-close","click",function(){
			// dialog && dialog.hide();
			dialog && dialog.el.remove();
		});

		if(utils.isMobile || ($("body").hasClass("window-demo") && $("#em-kefu-webim-self").hasClass("hide"))){
			dialog = uikit.createDialog({
				isFullSreen: true,
				contentDom: dom,
				className: "satisfaction"
			});
		}
		else{
			dialog = uikit.createDialog({
				isFullSreen: false,
				contentDom: dom,
				className: "satisfaction"
			});
		}
		// dialog = uikit.createDialog({
		// 	contentDom: dom,
		// 	className: "satisfaction"
		// }).addButton({
		// 	confirmText: __("common.submit"),
		// 	confirm: _confirm,
		// });
		loading.hide("satisfaction");
		dialog.show();

		if(!$(document.querySelector(".em-self-wrapper")).hasClass("hide")){
			dialog.el.style.cssText='left:10px;top:10px;';
			if(!utils.isMobile && $("body").hasClass("window-demo")){
				dom.querySelector(".icon-close").style.cssText='margin-right:20px;';
			}
		}
		else{
			dialog.el.style.cssText='left:0;top:0;';
		}
		// 火狐浏览器 _setSatisfaction时找不到starsUl，所以必须先执行完init
		_setSatisfaction();

		// 自定义主题色
		// color && $(".theme_custom").find(".bg-color").css("cssText","background-color: " + color + " !important");
		bgColor && $(".theme_custom").find(".bg-color").css("cssText","background-color: " + bgColor + " !important");
		if($("body").hasClass("window-demo")){
			// $(".wrapper > .cancel").addClass("hidden");
		}
		else{
			// $(".wrapper > .cancel").removeClass("hidden");
			if(!utils.isMobile){
				$(".satisfaction >.wrapper").addClass("wrapperTpo");
			}
		}
		if(color){
			$(".resolveCon .selected").css("cssText","background-color:"+  color +"!important"); 
			$(".resolveCon .selected i").css("cssText","color:"+  bgColor +"!important"); 
			$(".resolveCon .selected span").css("cssText","color:"+  bgColor +"!important"); 
		}
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
	tipNameArr = [];
	apiHelper.getEvaluationDegrees().then(function(entities){
		var labelID;
		var lastScore;
		var lastEvaluationDegreeId;
		for(var i=0;i<entities.length;i++){
			tipNameArr.push(entities[i].name);
		}
		tipNameArr = tipNameArr.reverse();
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
			lastEvaluationDegreeId = id;
			 
			return "<li  data-level=\"" + level
				+ "\" title=\"" + name
				+ "\" data-evaluate-id=\"" + id
				+ "\" data-score=\"" + score
				+ "\" data-isSingleTag=\"" + isSingleTag
				+ "\" class=\"" + "icon-start"
				+ "\"></li>";
		})
		.value()
		.join("");

		starList = starsUl.querySelectorAll("li");
		defaultScore = lastScore;
		defaultEvaluationDegreeId = lastEvaluationDegreeId;
		if(fiveStarState){
			if(resolvedId == 1){
				utils.addClass(starList, "sel");
				//创建评价标签
				_createLabel(labelID);
				score = defaultScore;
				evaluationDegreeId = defaultEvaluationDegreeId;
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
	// 判断评价是否超时
	apiHelper.getEvaluateVerify(session || profile.currentOfficialAccount.sessionId || "")
	.then(function(resp){
		if(resp.status == "OK"){
			_sendSatisfaction(score, content, session, invite, appraiseTags, resolutionParam, evaluationDegreeId);
			uikit.showSuccess(__("evaluation.submit_success"));
			getToHost.send({ event: _const.EVENTS.EVALUATIONSUBMIT });
			// 强制评价点击确定关闭会话框
			setTimeout(function(){
				// 关闭会话
				if(evaluateType === "system" && profile.grayList.visitorLeave){
					// 取消轮询接口
					eventListener.trigger(_const.SYSTEM_EVENT.CHAT_CLOSED);
					if(session){
						apiHelper.closeChatDialog({ serviceSessionId: session });
					}
					else{
						profile.currentOfficialAccount.sessionId && apiHelper.closeChatDialog({ serviceSessionId: profile.currentOfficialAccount.sessionId });
					}
					getToHost.send({ event: _const.EVENTS.CLOSE });
				}
			}, 2000);
			_clear();
			// dialog && dialog.hide();
			dialog && dialog.el.remove();
		}
		else{	
			if(resp.errorCode == "WEBIM_338"){
				uikit.tip(__("evaluation.WEBIM_338"));
			}else{
				uikit.tip(__("evaluation.WEBIM_OTHER"));
			}
			// dialog && dialog.hide();
			dialog && dialog.el.remove();
		}
	});

	
}

function show(inviteId, serviceSessionId, evaluateWay){

	$(".resolve-btn i").css("cssText","color:#595959!important"); 
	$(".resolve-btn span").css("cssText","color:#595959!important");  
	if(color){
		$(".resolveCon .selected").css("cssText","background-color:"+  color +"!important"); 
		$(".resolveCon .selected i").css("cssText","color:"+  bgColor +"!important"); 
		$(".resolveCon .selected span").css("cssText","color:"+  bgColor +"!important"); 
	}
	$(".satisfaction .tip").addClass("hide");
	apiHelper.getEvaluteSolveWord().then(function(tip){
		resolveTip = tip;
	});
	apiHelper.getServiceSessionResolved()
	.then(function(resp){
		sessionResolved = resp;
		_init();
		// _initOnce();
	});
	
	session = serviceSessionId;
	invite = inviteId;
	evaluateType = evaluateWay;
	_setDefaultScore();
	var mask = utils.createElementFromHTML([
		"<div class=\"mask\"></div>"
	].join(""))
	$(".em-widget-content-box").append(mask)
	if(evaluateType === "system"){
		$(".cancel").removeClass("hidden");
	}
	else{
		$(".cancel").addClass("hidden");
	}
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

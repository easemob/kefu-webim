require("underscore");
require("es6-promise").polyfill();
require("@/common/polyfill");
require("jquery");

var utils = require("@/common/utils");
var commonConfig = require("@/common/config");
var uikit = require("../pages/main/uikit");
var api = require("./api");
var Selector = require("../pages/main/uikit/selector");

var isSending = false;

var dom = utils.createElementFromHTML([
	"<div class=\"em-dialog ticket satisfaction \">",
	"<div class=\"wrapper\">",
	"<div class=\"wrapper-title\">" + __("ticket.note_title") + " <i class=\"icon-close\"></i></div>",
	"<h3>" + __("ticket.title") + "</h3>",
	"<input type=\"text\" class=\"name\" placeholder=\"" + __("ticket.name") + "\"> <span class=\"font-red\">*</span>",
	"<input type=\"text\" class=\"phone\" placeholder=\"" + __("ticket.phone_number") + "\"> <span class=\"font-red\">*</span>",
	"<input type=\"text\" class=\"mail\" placeholder=\"" + __("ticket.email") + "\">",
	"<div class=\"note-category hide\"></div>",
	"<textarea spellcheck=\"false\" placeholder=\"" + __("ticket.content_placeholder") + "\"></textarea><span class=\"font-red-text\">*</span>",
	"<div class=\"line\"></div>",
	"<div class=\"cancel\">" + __("common.cancel") + "</div>",
	"<div class=\"confirm bg-color\">"+ __("common.ticket") +"</div>",
	"</div>",
	"</div>"
].join(""));

if(utils.isMobile  || ($("body",parent.document).hasClass("window-demo") && $("#em-kefu-webim-self",parent.document).hasClass("hide"))){
	var dom = utils.createElementFromHTML([
		"<div  class=\"em-dialog note\">",
		"<div class=\"wrapper\">",
		"<div class=\"wrapper-title bg-color\">" + __("ticket.note_title") + " <i class=\"icon-back-new\"></i></div>",
		"<h3>" + __("ticket.title") + "</h3>",
		"<input type=\"text\" class=\"name\" placeholder=\"" + __("ticket.name") + "\"> <span class=\"font-red\">*</span>",
		"<input type=\"text\" class=\"phone\" placeholder=\"" + __("ticket.phone_number") + "\"> <span class=\"font-red\">*</span>",
		"<input type=\"text\" class=\"mail\" placeholder=\"" + __("ticket.email") + "\">",
		"<div class=\"note-category hide\"></div>",
		"<textarea spellcheck=\"false\" placeholder=\"" + __("ticket.content_placeholder") + "\"></textarea><span class=\"font-red-text\">*</span>",
		"<div class=\"line\"></div>",
		"<div class=\"cancel\">" + __("common.cancel") + "</div>",
		"<div class=\"confirm bg-color\">"+ __("common.ticket") +"</div>",
		"</div>",
		"</div>"
	].join(""));
}
else if($("body",parent.document).hasClass("window-demo") && !$("#em-kefu-webim-self",parent.document).hasClass("hide")){
	var dom = utils.createElementFromHTML([
		"<div id=\"demo-wrapper\" class=\"em-dialog ticket satisfaction \">",
		"<div class=\"wrapper\">",
		"<div class=\"wrapper-title\">" + __("ticket.note_title") + " <i class=\"icon-close\"></i></div>",
		"<h3>" + __("ticket.title") + "</h3>",
		"<input type=\"text\" class=\"name\" placeholder=\"" + __("ticket.name") + "\"> <span class=\"font-red\">*</span>",
		"<input type=\"text\" class=\"phone\" placeholder=\"" + __("ticket.phone_number") + "\"> <span class=\"font-red\">*</span>",
		"<input type=\"text\" class=\"mail\" placeholder=\"" + __("ticket.email") + "\">",
		"<div class=\"note-category hide\"></div>",
		"<textarea spellcheck=\"false\" placeholder=\"" + __("ticket.content_placeholder") + "\"></textarea><span class=\"font-red-text\">*</span>",
		"<div class=\"line\"></div>",
		"<div class=\"cancel\">" + __("common.cancel") + "</div>",
		"<div class=\"confirm bg-color\">"+ __("common.ticket") +"</div>",
		"</div>",
		"</div>"
	].join(""));
}
document.body.appendChild(dom);

var content = document.querySelector("textarea");
var name = document.querySelector(".name");
var phone = document.querySelector(".phone");
var mail = document.querySelector(".mail");
var noteCategory = document.querySelector(".note-category");
var noteCategoryList = new Selector({
	list: [],
	container: noteCategory,
});
// var cancelBtn = document.querySelector(".cancel-btn");
// var confirmBtn = document.querySelector(".confirm-btn");
var cancelBtn = document.querySelector(".cancel");
var confirmBtn = document.querySelector(".confirm");
// url 传递的参数
var config = getNoteConfig().config || {};
console.log(config,"offDutyType++" )
api.update(config);
utils.addClass(document.body, config.themeClassName || "theme-1");
// 根据配置隐藏取消按钮
config.hideCloseBtn && utils.addClass(cancelBtn, "hide");

var themeCustomColor = config.themeCustomColor;
if(themeCustomColor){
	// color = config.themeColor;
	$(".theme_custom").find(".bg-color").css("cssText","background-color: " + themeCustomColor + " !important");
}
var color = config.themeColor;
if(color){
	$(".theme_custom").find(".bg-color").css("cssText","background-color: " + color + " !important");
}

var _getCategories = _.once(function(){
	api.getNoteCategories().then(function(list){
		var optionList = _.map(list, function(item){
			return {
				sign: item.id,
				desc: item.name
			};
		});

		if(!_.isEmpty(optionList)){
			utils.removeClass(noteCategory, "hide");
			noteCategoryList.updateList({ list: optionList });
		}
	});
});

function getNoteConfig(){
	var i;
	var len;
	var tmp = [];
	var obj = {};
	// 需要测兼容性
	var src = document.location.search;
	var arr = src.slice(1).split("&");
	for(i = 0, len = arr.length; i < len; i++){
		tmp = arr[i].split("=");
		tmp[1] = window.atob
			? window.atob(tmp[1])
			: tmp[1];
		obj[tmp[0]] = tmp.length > 1
			? JSON.parse(decodeURIComponent(tmp[1]))
			: "";
	}
	return obj;
}

function _createTicket(){
	Promise.all([
		api.getToken(),
		api.getProjectId()
	]).then(function(result){
		var token = result[0];
		var projectId = result[1];
		var sessionId = config.sessionId || "";

		api.createTicket({
			token: token,
			projectId: projectId,
			name: name.value,
			phone: phone.value,
			mail: mail.value,
			content: content.value,
			category_id: noteCategoryList.getSelectedValue(),
			session_id: sessionId,
		}).then(function(){
			if(config.offDutyType == ""){
				return;
			}
			isSending = false;
			uikit.showSuccess(__("ticket.send_success"));

			_clearInput();
		}, function(err){
			isSending = false;
			uikit.tip(__("ticket.send_failed_retry"));
			console.error(err);
		});
	})
	["catch"](function(err){
		uikit.tip(__("ticket.send_failed_invalid_token"));
		console.error(err);
	});
}

function _clearInput(){
	name.value = "";
	phone.value = "";
	mail.value = "";
	content.value = "";
}

function _writePreDate(preData){
	name.value = preData.name || "";
	phone.value = preData.phone || "";
	mail.value = preData.mail || "";
}

config.grayNoteCategory && _getCategories();
config.preData && _writePreDate(config.preData);


// 海外用户，不验证手机号格式 新增敦煌用户不校验格式2020-05-06
function overseasTest(){
	if(config.tenantId == "76141"){
		return !phone.value;
	}
	if(config.tenantId == "78882"){
		return !phone.value;
	}
	if(config.tenantId == "6437"){
        return !phone.value;
    }
	return !phone.value || !(/^1[3456789]\d{9}$/.test(phone.value));
}
// 添加邮箱的校验
function checkEmail(){
	var check = /^[0-9a-z]([_.0-9a-z-]{0,30}[0-9a-z])?@([0-9a-z][0-9a-z-]{0,30}[.]){1,3}[a-z]{2,4}$/i;
	if(mail.value){
		if(check.test(mail.value)){
			return true
		}else{
			return false
		}
	}
	else{
		return true
	}
}

// 留言
utils.on(confirmBtn, "click", function(){
	if(isSending){
		uikit.tip(__("ticket.is_sending"));
	}
	else if(!name.value || name.value.length > 140){
		uikit.tip(__("ticket.invalid_name"));
	}
	else if(overseasTest()){
		uikit.tip(__("ticket.invalid_phone"));
	}
	else if(!checkEmail()){
		uikit.tip(__("ticket.invalid_email"));
	}
	else if(!content.value || content.value.length > 1500){
		uikit.tip(__("ticket.invalid_content"));
	}
	else{
		isSending = true;
		setTimeout(function(){ isSending = false; }, 10000);
		_createTicket();
	}
});

// 取消
utils.on(cancelBtn, "click", function(){
	if(config.offDutyType == ""){
		
	}
	else{
		window.parent.postMessage({ closeNote: true }, "*");
	}
});
utils.live(".wrapper-title .icon-close","click",function(){
	// window.parent.postMessage({ closeNote: true }, "*");
	if(config.offDutyType == ""){
		
	}
	else{
		window.parent.postMessage({ closeNote: true }, "*");
	}
});
utils.live(".wrapper-title .icon-back-new","click",function(){
	// window.parent.postMessage({ closeNote: true }, "*");
	if(config.offDutyType == ""){
		
	}
	else{
		window.parent.postMessage({ closeNote: true }, "*");
	}
});

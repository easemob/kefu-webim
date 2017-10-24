var utils = require("../../common/utils");
var uikit = require("./uikit");
var profile = require("./tools/profile");
var apiHelper = require("./apiHelper");
var Selector = require("./uikit/selector");

var isSending = false;

var dom = utils.createElementFromHTML([
	"<div class=\"wrapper\">",
	"<h3>" + __("ticket.title") + "</h3>",
	"<input type=\"text\" class=\"name\" placeholder=\"" + __("ticket.name") + "\">",
	"<input type=\"text\" class=\"phone\" placeholder=\"" + __("ticket.phone_number") + "\">",
	"<input type=\"text\" class=\"mail\" placeholder=\"" + __("ticket.email") + "\">",
	"<div class=\"note-category hide\"></div>",
	"<textarea spellcheck=\"false\" placeholder=\"" + __("ticket.content_placeholder") + "\"></textarea>",
	"</div>",
].join(""));
var content = dom.querySelector("textarea");
var name = dom.querySelector(".name");
var phone = dom.querySelector(".phone");
var mail = dom.querySelector(".mail");
var noteCategory = dom.querySelector(".note-category");
var noteCategoryList = new Selector({
	list: [],
	container: noteCategory,
});

// todo: lazy load dialog
var dialog = uikit.createDialog({
	contentDom: dom,
	className: "ticket"
}).addButton({
	confirmText: __("common.ticket"),
	confirm: function(){
		if(isSending){
			uikit.tip(__("ticket.is_sending"));
		}
		else if(!name.value || name.value.length > 140){
			uikit.tip(__("ticket.invalid_name"));
		}
		else if(!phone.value || phone.value.length > 24){
			uikit.tip(__("ticket.invalid_phone"));
		}
		else if(!mail.value || mail.value.length > 127){
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
		// 阻止对话框关闭
		return false;
	}
});
var cancelBtn = dialog.el.querySelector(".cancel-btn");

var _getCategories = _.once(function(){
	apiHelper.getNoteCategories().then(function(list){
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

function _createTicket(){
	Promise.all([
		apiHelper.getToken(),
		apiHelper.getProjectId()
	]).then(function(result){
		var token = result[0];
		var projectId = result[1];
		var sessionId = profile.currentOfficialAccount.sessionId || "";

		apiHelper.createTicket({
			token: token,
			projectId: projectId,
			name: name.value,
			phone: phone.value,
			mail: mail.value,
			content: content.value,
			category_id: noteCategoryList.getSelectedValue(),
			session_id: sessionId,
		}).then(function(){
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

module.exports = function(opt){
	opt = opt || {};
	profile.grayList.noteCategory && _getCategories();
	opt.preData && _writePreDate(opt.preData);
	opt.hideCloseBtn && utils.addClass(cancelBtn, "hide");
	dialog.show();
};

var utils = require("../../common/utils");
var uikit = require("./uikit");
var profile = require("./tools/profile");
var apiHelper = require("./apiHelper");
var createSelect = require("./uikit/createSelect");

var isSending = false;

var dom = utils.createElementFromHTML([
	"<div class=\"wrapper\">",
	"<h3>请填写以下内容以方便我们及时联系您</h3>",
	"<input type=\"text\" class=\"name\" placeholder=\"姓名\">",
	"<input type=\"text\" class=\"phone\" placeholder=\"电话\">",
	"<input type=\"text\" class=\"mail\" placeholder=\"邮箱\">",
	"<div class=\"note-category hide\"></div>",
	"<textarea spellcheck=\"false\" placeholder=\"请输入留言\"></textarea>",
	"</div>",
].join(""));
var content = dom.querySelector("textarea");
var name = dom.querySelector(".name");
var phone = dom.querySelector(".phone");
var mail = dom.querySelector(".mail");
var noteCategory = dom.querySelector(".note-category");
// todo: lazy load dialog
var dialog = uikit.createDialog({
	contentDom: dom,
	className: "ticket"
}).addButton({
	confirmText: "留言",
	confirm: function(){
		if(isSending){
			uikit.tip("留言提交中...");
		}
		else if(!name.value || name.value.length > 140){
			uikit.tip("姓名输入不正确");
		}
		else if(!phone.value || phone.value.length > 24){
			uikit.tip("电话输入不正确");
		}
		else if(!mail.value || mail.value.length > 127){
			uikit.tip("邮箱输入不正确");
		}
		else if(!content.value || content.value.length > 1500){
			uikit.tip("留言内容不能为空，长度小于1500字");
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

function _createCategories(){
	if(!profile.grayList.noteCategory) return;

	apiHelper.getNoteCategories().then(function(list){

		if(!_.isEmpty(list)){
			utils.removeClass(noteCategory, "hide");
			var optionList = _.map(list, function(item){
				return {
					sign: item.id,
					desc: item.name
				};
			});
			createSelect({
				list: optionList,
				container: noteCategory
			});
		}
	});

}

function _createTicket(){
	Promise.all([
		apiHelper.getToken(),
		apiHelper.getProjectId()
	]).then(function(result){
		var token = result[0];
		var projectId = result[1];

		apiHelper.createTicket({
			token: token,
			projectId: projectId,
			name: name.value,
			phone: phone.value,
			mail: mail.value,
			content: content.value,
			category_id: noteCategory.selectValue
		}).then(function(){
			isSending = false;
			uikit.showSuccess("留言发送成功");

			_clearInput();
		}, function(err){
			isSending = false;
			uikit.tip("留言失败，请稍后重试");
			console.error(err);
		});
	})
	["catch"](function(err){
		uikit.tip("留言失败，token无效");
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
	content.value = preData.content || "";
	name.value = preData.name || "";
	phone.value = preData.phone || "";
	mail.value = preData.mail || "";
}

module.exports = function(opt){
	opt = opt || {};
	_createCategories();
	opt.preData && _writePreDate(opt.preData);
	opt.hideCloseBtn && utils.addClass(cancelBtn, "hide");
	dialog.show();
};

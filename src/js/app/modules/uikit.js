// prompt 不会消失
// tip 2秒后自动消失
var utils = require("../../common/utils");

var EMPTY_FUNCTION = function(){};
var promptDom = document.querySelector(".em-widget-error-prompt");
var promptTextSpanDom = promptDom.querySelector("span");

function _showPrompt(msg){
	promptTextSpanDom.innerText = msg;
	utils.removeClass(promptDom, "hide");
}

function _hidePrompt(){
	utils.addClass(promptDom, "hide");
}

function tip(msg){
	_showPrompt(msg);
	setTimeout(_hidePrompt, 2000);
}

function _createDialog(opt){
	opt = opt || {};
	var className = opt.className;
	var contentDom = opt.contentDom || "";
	var el = utils.createElementFromHTML("<div class=\"em-dialog hide\"></div>");
	var cancelBtn;
	var confirmBtn;
	var cancel;
	var confirm;

	className && utils.addClass(el, className);
	if(typeof contentDom === "string"){
		contentDom = utils.createElementFromHTML(contentDom);
	}

	contentDom && el.appendChild(contentDom);
	document.body.appendChild(el);

	function _hide(){
		utils.addClass(el, "hide");
	}
	function _show(){
		utils.removeClass(el, "hide");
	}
	function _toggle(){
		utils.toggle(el, "hide");
	}
	function _cancelCb(){
		cancel();
		_hide();
	}
	function _confirmCb(){
		confirm() !== false && _hide();
	}

	return {
		addButton: function(opt){
			opt = opt || {};
			var hideCancel = opt.hideCancel;
			var confirmText = opt.confirmText || "确定";
			cancel = opt.cancel || EMPTY_FUNCTION;
			confirm = opt.confirm || EMPTY_FUNCTION;
			var footer = utils.createElementFromHTML([
				"<div class=\"footer\">",
				"<button class=\"cancel-btn\">取消</button>",
				"<button class=\"confirm-btn bg-color\"></button>",
				"</div>"
			].join(""));

			cancelBtn = footer.querySelector(".cancel-btn");
			confirmBtn = footer.querySelector(".confirm-btn");
			confirmBtn.innerText = confirmText;
			hideCancel && utils.addClass(cancelBtn, "hide");
			el.appendChild(footer);
			utils.on(cancelBtn, "click", _cancelCb);
			utils.on(confirmBtn, "click", _confirmCb);
			return this;
		},
		show: function(){
			_show();
			return this;
		},
		hide: function(){
			_hide();
			return this;
		},
		toggle: function(){
			_toggle();
			return this;
		},
		destroy: function(){
			utils.off(cancelBtn, "click", _cancelCb);
			utils.off(confirmBtn, "click", _confirmCb);
			utils.removeDom(el);
		},
		el: el
	};
}

function showSuccess(msg){
	var contentDom = utils.createElementFromHTML([
		"<div>",
		"<i class=\"icon-circle\"><i class=\"icon-good\"></i></i>",
		"<p></p>",
		"</div>"
	].join(""));
	contentDom.querySelector("p").innerText = msg;
	var dialog = _createDialog({
		contentDom: contentDom,
		className: "mini em-success-prompt"
	}).show();

	setTimeout(dialog.destroy, 2000);
}

module.exports = {
	prompt: _showPrompt,
	tip: tip,
	createDialog: _createDialog,
	showSuccess: showSuccess
};

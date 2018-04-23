// prompt 不会消失
// tip 2秒后自动消失

// todo: 拆分这个文件，把 dialog 拆出去
var utils =		require("@/common/kit/utils");
var domUtils =	require("@/common/kit/domUtils");

var EMPTY_FUNCTION = function(){};
var promptDom;
var promptTextSpanDom;

var _initPrompt = _.once(function(){
	promptDom = document.querySelector(".em-widget-error-prompt");
	promptTextSpanDom = promptDom.querySelector("span");
});

module.exports = {
	prompt: _showPrompt,
	tip: tip,
	createDialog: _createDialog,
	showSuccess: showSuccess
};

function _showPrompt(msg){
	_initPrompt();
	promptTextSpanDom.innerText = msg;
	domUtils.removeClass(promptDom, "hide");
}

function _hidePrompt(){
	domUtils.addClass(promptDom, "hide");
}

function tip(msg){
	_initPrompt();
	_showPrompt(msg);
	setTimeout(_hidePrompt, 2000);
}

function _createDialog(options){
	var opt = options || {};
	var className = opt.className;
	var contentDom = opt.contentDom;
	var el = domUtils.createElementFromHTML("<div class=\"em-dialog hide\"></div>");
	var cancelBtn;
	var confirmBtn;
	var cancel;
	var confirm;

	className && domUtils.addClass(el, className);
	if(typeof contentDom === "string"){
		contentDom = domUtils.createElementFromHTML(contentDom);
	}

	contentDom && el.appendChild(contentDom);
	document.body.appendChild(el);

	function _hide(){
		domUtils.addClass(el, "hide");
	}
	function _show(){
		domUtils.removeClass(el, "hide");
	}
	function _toggle(){
		domUtils.toggle(el, "hide");
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
			var confirmText = opt.confirmText || __("common.confirm");
			cancel = opt.cancel || EMPTY_FUNCTION;
			confirm = opt.confirm || EMPTY_FUNCTION;
			var footer = domUtils.createElementFromHTML([
				"<div class=\"footer\">",
				"<button class=\"cancel-btn\">" + __("common.cancel") + "</button>",
				"<button class=\"confirm-btn bg-color\"></button>",
				"</div>"
			].join(""));

			cancelBtn = footer.querySelector(".cancel-btn");
			confirmBtn = footer.querySelector(".confirm-btn");
			confirmBtn.innerText = confirmText;
			hideCancel && domUtils.addClass(cancelBtn, "hide");
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
			domUtils.removeDom(el);
		},
		el: el
	};
}

function showSuccess(msg){
	var contentDom = domUtils.createElementFromHTML([
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

var utils = require("../../../common/utils");

var EMPTY_FUNCTION = function(){};
var promptDom;
var closeBtn;
var replyBtn;
var relpyCallback;
var closeCallback;
var callbackMessage;

module.exports = function(options){
	var opt = options || {};
	var newPromptDom = _render(opt);
	relpyCallback = opt.replyCallback || EMPTY_FUNCTION;
	closeCallback = opt.closeCallback || EMPTY_FUNCTION;
	callbackMessage = opt.callbackMessage || null;

	if(promptDom){
		_unbindEvents();
		document.body.replaceChild(newPromptDom, promptDom);
	}
	else{
		document.body.appendChild(newPromptDom);
	}

	promptDom = newPromptDom;
	_bindEvents();

	return {
		hide: _hide
	};
};

function _unbindEvents(){
	utils.off(closeBtn, "click", _closeCallback);
	utils.off(replyBtn, "click", _replyCallback);
}

function _bindEvents(){
	closeBtn = promptDom.querySelector(".btn-close");
	replyBtn = promptDom.querySelector(".btn-reply");
	utils.on(closeBtn, "click", _closeCallback);
	utils.on(replyBtn, "click", _replyCallback);
}

function _hide(){
	utils.addClass(promptDom, "hide");
}

function _replyCallback(){
	_hide();
	relpyCallback(callbackMessage);
}

function _closeCallback(){
	_hide();
	closeCallback(callbackMessage);
}

function _render(options){
	var opt = options || {};
	var avatar = opt.avatar || "";
	var title = opt.title || "";
	var content = opt.content || "";
	var className = opt.className || "";

	return utils.createElementFromHTML([
		"<div class=\"em-dialog " + className + "\">",
		"<span class=\"indicator bg-border-bottom-color\"></span>",
		"<div class=\"bg-color header\">",
		"<img class=\"avatar\" src=\"" + avatar + "\">",
		"<span class=\"title\">" + title + "</span>",
		"<span class=\"btn-close icon-close\"></span>",
		"</div>",
		"<div class=\"body\">",
		"<p class=\"content\">" + content + "</p>",
		"</div>",
		"<div class=\"footer\">",
		"<button class=\"btn-reply bg-color icon-message\">回复</button>",
		"</div>",
		"</div>"
	].join(""));
}

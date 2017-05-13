// prompt 不会消失
// tip 2秒后自动消失
easemobim.uikit = (function(utils){
	var promptDom = document.querySelector('.em-widget-error-prompt');
	var promptTextSpanDom = promptDom.querySelector('span');

	function _showPrompt(msg){
		promptTextSpanDom.innerText = msg;
		utils.removeClass(promptDom, 'hide');
	}

	function _hidePrompt(){
		utils.addClass(promptDom, 'hide');
	}

	function tip(msg){
		_showPrompt(msg);
		setTimeout(_hidePrompt, 2000);
	}

	return {
		prompt: _showPrompt,
		tip: tip
	}
}(easemobim.utils));

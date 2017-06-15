app.promptCtaDialog = (function(_const, utils, Dict, uikit, profile){
	var EMPTY_FUNCTION = function(){};
	var promptDom;
	var closeBtn;
	var replyBtn;
	var relpyCallback;
	var callbackMessage;

	return function (options){
		var opt = options || {};
		var newPromptDom = _render(opt);
		relpyCallback = opt.replyCallback || EMPTY_FUNCTION;
		callbackMessage = opt.callbackMessage || null;

		if (promptDom){
			_unbindEvents();
			document.body.replaceChild(newPromptDom, promptDom);
		}
		else {
			document.body.appendChild(newPromptDom);
		}

		promptDom = newPromptDom;
		_bindEvents();

		return {
			hide: _hide
		};
	};

	function _unbindEvents(){
		utils.off(closeBtn, 'click', _hide);
		utils.off(replyBtn, 'click', _replyCallback);
	}

	function _bindEvents(){
		closeBtn = promptDom.querySelector('.btn-close');
		replyBtn = promptDom.querySelector('.btn-reply');
		utils.on(closeBtn, 'click', _hide);
		utils.on(replyBtn, 'click', _replyCallback);
	}

	function _hide(){
		utils.addClass(promptDom, 'hide');
	}

	function _replyCallback(){
		_hide();
		relpyCallback(callbackMessage);
	}

	function _render(options){
		var opt = options || {};
		var avatar = opt.avatar || '';
		var title = opt.title || '';
		var content = opt.content || '';

		return utils.createElementFromHTML([
			'<div class="em-dialog cta-prompt">',
				'<span class="indicator bg-border-bottom-color"></span>',
				'<div class="bg-color header">',
					'<img class="avatar" src="' + avatar + '">',
					'<span class="title">' + title + '</span>',
					'<span class="btn-close icon-close"></span>',
				'</div>',
				'<div class="body">',
					'<p class="content">' + content + '</p>',
				'</div>',
				'<div class="footer">',
					'<button class="btn-reply bg-color icon-message">回复</button>',
				'</div>',
			'</div>'
		].join(''));
	}
}(easemobim._const, easemobim.utils, app.Dict, app.uikit, app.profile));

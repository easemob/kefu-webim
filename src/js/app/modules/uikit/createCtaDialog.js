app.createCtaDialog = (function(_const, utils, Dict, uikit, profile){
	var EMPTY_FUNCTION = function(){};
	var dialog;

	return function (opt){
		dialog = utils.createElementFromHTML([
			'<div class="em-model"></div>',
			'<div class="em-dialog off-duty-prompt">',
			'<div class="bg-color header">提示</div>',
			'<div class="body">',
			'<p class="content">' + config.offDutyWord + '</p>',
			'</div>',
			'</div>'
		].join(''));

		return {
			update: _update
		};
	};

	function _update(options){
	}
}(easemobim._const, easemobim.utils, app.Dict, app.uikit, app.profile));

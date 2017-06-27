easemobim.loading = (function(_const, utils){
	var loadingDom = utils.appendHTMLToBody([
		'<div class="easemobim-prompt-wrapper">',
		'<div class="loading">',
		_const.loadingSvg,
		'</div>',
		'</div>'
	].join(''));

	return {
		show: function(){
			loadingDom.style.display = 'block';
		},
		hide: function(){
			loadingDom.style.display = 'none';
		}
	};
}(easemobim._const, easemobim.utils));

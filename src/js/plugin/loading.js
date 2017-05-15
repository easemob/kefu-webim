easemobim.loading = (function(_const, utils){
	var loadingDom = utils.appendHTMLToBody([
		'<div class="easemobim-prompr-wrapper">',
		'<div class="loading">',
		_const.loadingSvg,
		'</div>',
		'<span>正在加载，请稍候...</span>',
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
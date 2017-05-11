easemobim.loading = (function(_const){
	var loadingDom;
	var loadingHtml = [
		'<div class="easemobim-prompr-wrapper">',
		'<div class="loading">',
		_const.loadingSvg,
		'</div>',
		'<span>正在加载，请稍候...</span>',
		'</div>'
	].join('');
	var tmpDom = document.createElement('div');

	tmpDom.innerHTML = loadingHtml;
	loadingDom = tmpDom.childNodes[0];
	document.body.appendChild(loadingDom);

	return {
		show: function(){
			loadingDom.style.display = 'block';
		},
		hide: function(){
			loadingDom.style.display = 'none';
		}
	};
}(easemobim._const));
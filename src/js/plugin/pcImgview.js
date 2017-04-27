/**
 * pc端图片端全屏幕显示
 */
easemobim.pcImgView = (function(){
	var utils = easemobim.utils;
	var imgWrapper = document.createElement('div');
	var shadow = document.createElement('div');
	var img = document.createElement('img');

	// IE8 透明度有问题，需加一层shadow解决
	imgWrapper.appendChild(shadow);
	imgWrapper.appendChild(img);
	document.body.appendChild(imgWrapper);

	// IE8 必须上屏后再写样式，否则不生效
	imgWrapper.style.cssText = [
		'display:none',
		'position:fixed',
		'top:0',
		'left:0',
		'width:100%',
		'height:100%',
		'z-index:16777270'
	].join(';');

	shadow.style.cssText = [
		'position:fixed',
		'top:0',
		'left:0',
		'width:100%',
		'height:100%',
		'background-color:#000',
		'background-color:rgba(0, 0, 0, .7)',
		'filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=70)'
	].join(';');

	img.style.cssText = [
		'max-width:100%',
		'max-height:100%',
		'position:absolute',
		'margin:auto',
		'top:0',
		'right:0',
		'bottom:0',
		'left:0'
	].join(';');

	utils.on(imgWrapper, 'click', function () {
		this.style.display = 'none';
	}, false);

	return function(imgData){
		var imgSrc = imgData.imgSrc;
		var imgFile = imgData.imgFile;
		if(imgFile){
			imgSrc = window.URL.createObjectURL(imgFile);
		}
		img.setAttribute('src', imgSrc);
		imgWrapper.style.display = '';
	};
})();
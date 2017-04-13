/**
 * pc端图片端全屏幕显示
 */
easemobim.pcImgView = function (imgSrc) {
	var utils = easemobim.utils;
	var imgWrapper = document.createElement('div');
	document.body.appendChild(imgWrapper);
	var img = document.createElement('img');
	imgWrapper.appendChild(img);
	imgWrapper.style.display = 'block';
	imgWrapper.style.position = "absolute";
	// imgWrapper.style.background = "rgba(0, 0, 0, .7)";
	imgWrapper.style.top = "0";
	imgWrapper.style.left = "0";
	imgWrapper.style.width = '100%';
	imgWrapper.style.height = '100%';
	imgWrapper.style.zIndex = '16777270';
	img.style.maxWidth = '100%';
	img.style.maxHeight = '100%';
	try{
		imgWrapper.style.background = "rgba(0, 0, 0, .7)";//非ie8模式
	}
	catch(err){//ie8模式
		imgWrapper.style.filter = 'progid:DXImageTransform.Microsoft.Gradient(startColorstr=#b3000000,endColorstr=#88000000)';
	}
	utils.on(imgWrapper, 'click', function () {
		this.style.display = 'none';
	}, false);
	img.setAttribute('src', imgSrc);
	
	
};
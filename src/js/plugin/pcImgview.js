'use strict';
var utils = require('../common/utils');

var imgWrapper = utils.appendHTMLToBody([
	'<div class="easemobim-pc-img-view">',
	// IE8 透明度有问题，需加一层shadow解决
	'<div class="shadow"></div>',
	'<img>',
	'</div>'
].join(''));
var imgDom = imgWrapper.querySelector('img');

utils.on(imgWrapper, 'click', function () {
	imgWrapper.style.display = 'none';
}, false);

module.exports = function(imgData){
	var imgSrc;
	var imgFile = imgData.imgFile;

	if(imgFile){
		imgSrc = window.URL.createObjectURL(imgFile);
	}
	else {
		imgSrc = imgData.imgSrc;
	}
	imgDom.src = imgSrc;
	imgWrapper.style.display = 'block';
};

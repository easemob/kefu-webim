var utils = require("../common/utils");
var isInitialized = false;
var imgWrapper;
var imgDom;

function _init(){
	imgWrapper = utils.appendHTMLToBody([
		"<div class=\"easemobim-pc-img-view\">",
		// IE8 透明度有问题，需加一层shadow解决
		"<div class=\"shadow\"></div>",
		"<img>",
		"</div>"
	].join(""));
	imgDom = imgWrapper.querySelector("img");

	utils.on(imgWrapper, "click", function(){
		imgWrapper.style.display = "none";
	}, false);
}

module.exports = function(imgData){
	console.log('imgData', imgData)
	// var imgFile = imgData.imgFile;
	var imgFile = imgData.imgSrc;

	if(!isInitialized){
		_init();
		isInitialized = true;
	}

	if(imgFile){
		// imgDom.src = window.URL.createObjectURL(imgFile);
		imgDom.src = imgFile
	}
	else{
		imgDom.src = imgData.imgSrc;
	}
	console.log('imgDom.src：', imgDom.src)
	imgWrapper.style.display = "block";
};

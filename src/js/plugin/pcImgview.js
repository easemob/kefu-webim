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

function formatImg(file) {
	var reader = new FileReader(); //实例化文件读取对象
	reader.readAsDataURL(file); //将文件读取为 DataURL,也就是base64编码
	reader.onload = function(ev) { //文件读取成功完成时触发
		var dataURL = ev.target.result; //获得文件读取成功后的DataURL,也就是base64编码
		console.log('dataURL', dataURL);
		return dataURL
	}
	console.log('file', file);
}

module.exports = function(imgData){
	console.log('imgData', imgData)
	var imgFile = imgData.imgFile;

	if(!isInitialized){
		_init();
		isInitialized = true;
	}

	if(imgFile){
		// imgDom.src = window.URL.createObjectURL(imgFile);
		imgDom.src = formatImg(imgFile)
	}
	else{
		imgDom.src = imgData.imgSrc;
	}
	console.log('imgDom.src：', imgDom.src)
	imgWrapper.style.display = "block";
};

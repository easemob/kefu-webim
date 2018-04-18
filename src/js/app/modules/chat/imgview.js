var utils = require("../../common/utils");
var _const = require("../../common/const");
var profile = require("./tools/profile");

var img;
var imgWrapper;
var iosLoadTip;
var androidLoadTip;
var imgSrc;
var _init = _.once(function(){
	imgWrapper = document.querySelector("div.img-view");
	img = imgWrapper.querySelector("img");
	iosLoadTip = imgWrapper.querySelector("span.ios-load");
	androidLoadTip = imgWrapper.querySelector("a.android-load");
	utils.isAndroid && utils.removeClass(androidLoadTip, "hide");
	utils.isIOS && utils.removeClass(iosLoadTip, "hide");
	utils.on(imgWrapper, "click", function(){
		utils.addClass(imgWrapper, "hide");
	}, false);
	!("download" in document.createElement("a")) && utils.on(androidLoadTip, "click", function(){
		window.location = imgSrc;
		return false;
	});

});

module.exports = {
	show: function(url){
		imgSrc = url;
		_init();
		if(utils.isTop || utils.isMobile){
			img.src = url;
			androidLoadTip.href = url;
			utils.removeClass(imgWrapper, "hide");
		}
		else{
			transfer.send({
				event: _const.EVENTS.SHOW_IMG,
				data: {
					imgSrc: url,
					imgFile: profile.imgFileList.get(url)
				}
			});
		}
	}
};

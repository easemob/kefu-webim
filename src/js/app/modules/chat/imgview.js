var Const =		require("@/common/cfg/const");
var profile =	require("@/common/cfg/profile");
var utils =		require("@/common/kit/utils");
var domUtils =	require("@/common/kit/domUtils");
var getToHost =	require("@/app/misc/appTransfer");

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
	utils.isAndroid && domUtils.removeClass(androidLoadTip, "hide");
	utils.isIOS && domUtils.removeClass(iosLoadTip, "hide");
	utils.on(imgWrapper, "click", function(){
		domUtils.addClass(imgWrapper, "hide");
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
			domUtils.removeClass(imgWrapper, "hide");
		}
		else{
			getToHost().send({
				event: Const.EVENTS.SHOW_IMG,
				data: {
					imgSrc: url,
					imgFile: profile.imgFileList.get(url)
				}
			});
		}
	}
};

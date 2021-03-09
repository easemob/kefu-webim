var utils = require("@/common/utils");
var _const = require("@/common/const");
var profile = require("@/app/tools/profile");
var getToHost = require("@/app/common/transfer");
require("@/app/tools/transform");
var AlloyFinger = 	require("alloyfinger");

var img;
var imgWrapper;
var iosLoadTip;
var androidLoadTip;
var imgSrc;
var af;
var initScale = 1;
var _init = _.once(function(){
	imgWrapper = document.querySelector("div.img-view");
	var coverHtml = "<div class=\"cover-floor\"></div>"
	$(".img-view").append(coverHtml)
	img = imgWrapper.querySelector("img");
	iosLoadTip = imgWrapper.querySelector("span.ios-load");
	androidLoadTip = imgWrapper.querySelector("a.android-load");
	utils.isAndroid && utils.removeClass(androidLoadTip, "hide");
	utils.isIOS && utils.removeClass(iosLoadTip, "hide");
	
	startAf();

	utils.on(imgWrapper, "click", function(){
		utils.addClass(imgWrapper, "hide");
	}, false);

	// 解决ios端打开图片还能滑动屏幕的bug
	utils.on(imgWrapper, "touchmove", function(event){
		event.preventDefault();
	});
	utils.off(imgWrapper, "touchmove", function(event){
		event.preventDefault();
	});
	("download" in document.createElement("a")) && utils.on(androidLoadTip, "click", function(){
		window.location = imgSrc; 
		return false;
	});
	function preventDefaultFn(event){
		event.preventDefault();
	}

});

function startAf(){
	if(utils.isMobile){
		var el = img;
		Transform(el);
        af = new AlloyFinger(el, {
			pinch: function (evt) {
                el.scaleX = el.scaleY = initScale * evt.zoom;
			},
			pressMove: function (evt) {
                el.translateX += evt.deltaX;
                el.translateY += evt.deltaY;
                evt.preventDefault();
			},

		})
	}
}

module.exports = {
	show: function(url){
		if(url.indexOf("blob:") == 0){
			url = url
		}
		else{
			url = url + '?origin-file=true';
		}
		imgSrc = url;
		_init();
		if(utils.isTop || utils.isMobile){
			img.src = url;
			// 恢复
			initScale = 1;
			img.scaleX = 1;
			img.scaleY = 1;
			img.translateX = 0;
			img.translateY = 0;

			// androidLoadTip.href = url;
			utils.removeClass(imgWrapper, "hide");
		}
		else{
			getToHost.send({
				event: _const.EVENTS.SHOW_IMG,
				data: {
					imgSrc: url,
					imgFile: profile.imgFileList.get(url)
				}
			});
		}
	}
};

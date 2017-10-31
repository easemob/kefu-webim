var utils = require("../../common/utils");
var _const = require("../../common/const");
var profile = require("./tools/profile");

var img;
var imgWrapper;
var imgLoadTip;
var imgSrc;
var _init = _.once(function(){
	imgWrapper = document.querySelector("div.img-view");
	img = imgWrapper.querySelector("img");
	imgLoadTip = imgWrapper.querySelector("span.img-load-tip");
	utils.on(imgWrapper, "click", function(){
		utils.addClass(imgWrapper, "hide");
	}, false);
	!("download" in document.createElement("a")) && utils.live(".android-load", "click", function(){
		window.location = imgSrc;
	}, imgLoadTip);

});

module.exports = {
	show: function(url){
		imgSrc = url;
		_init();
		if(utils.isTop || utils.isMobile){
			img.setAttribute("src", url);
			if(utils.isAndroid) imgLoadTip.innerHTML = "<a href=" + url + " class=\"android-load\" download><span class=\"icon-download\"></span></a>";
			if(utils.isIOS) imgLoadTip.innerHTML = "<span class=\"ios-load \">" + __("common.press_save_img") + "</span>";
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

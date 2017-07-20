var utils = require("../../common/utils");
var _const = require("../../common/const");
var profile = require("./tools/profile");

var img;
var imgWrapper;
var _init = _.once(function(){
	imgWrapper = document.querySelector("div.img-view");
	img = imgWrapper.querySelector("img");

	utils.on(imgWrapper, "click", function(){
		utils.addClass(imgWrapper, "hide");
	}, false);
});

module.exports = {
	show: function(url){
		_init();
		if(utils.isTop || utils.isMobile){
			img.setAttribute("src", url);
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

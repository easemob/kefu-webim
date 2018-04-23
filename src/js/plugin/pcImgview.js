var classUtils =	require("@/common/kit/classUtils");
var domUtils =		require("@/common/kit/domUtils");
var tpl =			require("./template/pcImgTpl.html");

var ins;
var ImgView = classUtils.createView({
	imgDom: null,
	events: {
		"click ":	"onClick",
	},

	init: function(){
		this.$el = domUtils.appendHTMLToBody(_.template(tpl));
		this.imgDom = this.$el.querySelector("img");
	},

	onClick: function(){
		this.$el.style.display = "none";
	},

	setSrc: function(url){
		this.imgDom.src = url;
	},

	show: function(){
		ins.$el.style.display = "block";
	},
});

module.exports = function(imgData){
	var imgFile = imgData.imgFile;
	ins = ins || new ImgView();
	imgFile
		? ins.setSrc(window.URL.createObjectURL(imgFile))
		: ins.setSrc(imgData.imgSrc);
	ins.show();
};

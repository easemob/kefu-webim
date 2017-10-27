var utils = require("../../../common/utils");

var nopFunction = function(){};
var template = [
	"<div class=\"mini-video-window\">",
	"<p class=\"nickname\"></p>",
	"<video muted autoplay></video>",
	"</div>",
].join("");

var MiniVideoWin = function(option){
	var opt = option || {};
	var stream = opt.stream;
	var me = this;

	this.parentContainer = opt.parentContainer;
	this.clickCallback = opt.clickCallback || nopFunction;
	this.eventHandler = function(){
		me.clickCallback({
			nickname: me.nickname,
			srcObject: me.srcObject,
			mediaStream: me.mediaStream,
			stream: me.stream,
		});
	};

	this.dom = utils.createElementFromHTML(template);
	this.nicknameDom = this.dom.querySelector(".nickname");
	this.videoDom = this.dom.querySelector("video");
	this.parentContainer.appendChild(this.dom);
	this.update(stream);

	utils.on(this.dom, "click", this.eventHandler);
};

MiniVideoWin.prototype.destroy = function(){
	utils.off(this.dom, "click", this.eventHandler);
	this.dom.remove();
};

MiniVideoWin.prototype.getStream = function(){
	return this.stream;
};

MiniVideoWin.prototype.update = function(stream){
	var mediaStream;

	this.stream = stream;
	this.mediaStream = mediaStream = stream.getMediaStream();

	this.nickname = stream.located()
		? __("video.me")
		: utils.getDataByPath(stream, "owner.ext.nickname");
	this.srcObject = mediaStream ? URL.createObjectURL(mediaStream) : "";
	this.videoDom.src = this.srcObject;
	this.nicknameDom.innerText = this.nickname;
};

module.exports = MiniVideoWin;

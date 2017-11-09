var utils = require("../../../common/utils");
var _const = require("../../../common/const");

var template = [
	"<div class=\"mini-video-window\">",
	"<p class=\"nickname\"></p>",
	"<video muted autoplay class=\"main-video\"></video>",
	"<video muted autoplay class=\"no-audio-video hide\"></video>",
	"</div>",
].join("");

var MiniVideoWin;

module.exports = MiniVideoWin = function(option){
	var opt = option || {};
	var stream = opt.stream;
	var me = this;

	this.parentContainer = opt.parentContainer;
	this.dispatcher = opt.dispatcher;
	this.eventHandler = function(){
		me.dispatcher.trigger("switchToMiniVideoWindow", {
			ownerName: me.ownerName,
			streams: _.compact([me.stream, me.noAudioStream]),
		});
	};

	this.dom = utils.createElementFromHTML(template);
	this.nicknameDom = this.dom.querySelector(".nickname");
	this.videoDom = this.dom.querySelector(".main-video");
	this.noAudioVideoDom = this.dom.querySelector(".no-audio-video");
	this.parentContainer.appendChild(this.dom);

	this.stream = null;
	this.noAudioStream = null;
	this.ownerName = "";
	this.updateStream(stream);

	utils.on(this.dom, "click", this.eventHandler);
};

MiniVideoWin.prototype.destroy = function(){
	utils.off(this.dom, "click", this.eventHandler);
	this.dom.remove();
};

MiniVideoWin.prototype.getStream = function(){
	return this.stream;
};

MiniVideoWin.prototype.isEmpty = function(){
	return !this.stream;
};

MiniVideoWin.prototype.removeStream = function(stream){
	switch(stream.type){
	case _const.STREAM_TYPE.NORMAL:
		this.stream = null;
		this.videoDom.src = "";
		this.nicknameDom.innerText = "";
		break;
	case _const.STREAM_TYPE.NO_AUDIO:
		this.noAudioStream = null;
		this.noAudioVideoDom.src = "";
		utils.removeClass(this.videoDom, "hide");
		utils.addClass(this.noAudioVideoDom, "hide");
		break;
	default:
		throw new Error("unexpected stream type.");
	}
};

MiniVideoWin.prototype.updateStream = function(stream){
	var mediaStream = stream.getMediaStream();

	this.ownerName = utils.getDataByPath(stream, "owner.name");

	switch(stream.type){
	case _const.STREAM_TYPE.NORMAL:
		this.stream = stream;
		this.videoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
		this.nicknameDom.innerText = stream.located()
			? __("video.me")
			: utils.getDataByPath(stream, "owner.ext.nickname");
		break;
	case _const.STREAM_TYPE.NO_AUDIO:
		this.noAudioStream = stream;
		this.noAudioVideoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
		utils.addClass(this.videoDom, "hide");
		utils.removeClass(this.noAudioVideoDom, "hide");
		break;
	default:
		throw new Error("unexpected stream type.");
	}
};


var utils = require("../../../common/utils");
var _const = require("../../../common/const");

var template = _.template([
	"<div class=\"mini-video-window\">",
	"<p class=\"nickname\"></p>",
	"<video <%= muted %> autoplay playsinline webkit-playsinline class=\"main-video\"></video>",
	"<video muted autoplay playsinline webkit-playsinline class=\"no-audio-video hide\"></video>",
	"<span class=\"play-button hide\"><i class=\"button-icon icon-star\"></i></span>",
	"</div>",
].join(""));

var MiniVideoWin;

module.exports = MiniVideoWin = function(option){
	var opt = option || {};
	var stream = opt.stream;
	var me = this;
	var isLocalStream = stream.located();

	this.parentContainer = opt.parentContainer;
	this.dispatcher = opt.dispatcher;
	this.eventHandler = function(){
		me.dispatcher.trigger("switchToMiniVideoWindow", {
			ownerName: me.ownerName,
			streams: _.compact([me.stream, me.noAudioStream]),
		});
	};
	this.eventHandler2 = function(e){
		me.videoDom && me.videoDom.play();
		me.noAudioVideoDom && me.noAudioVideoDom.play();
		utils.addClass(me.playButtonDom, "hide");
		e.stopPropagation();
	};

	// 本地视频需要 muted
	this.dom = utils.createElementFromHTML(template({
		muted: isLocalStream ? "muted" : ""
	}));
	this.nicknameDom = this.dom.querySelector(".nickname");
	this.videoDom = this.dom.querySelector(".main-video");
	this.playButtonDom = this.dom.querySelector(".play-button");
	this.noAudioVideoDom = this.dom.querySelector(".no-audio-video");
	this.parentContainer.appendChild(this.dom);

	this.stream = null;
	this.noAudioStream = null;
	this.ownerName = "";
	this.updateStream(stream);

	utils.on(this.dom, "click", this.eventHandler);
	utils.on(this.playButtonDom, "click", this.eventHandler2);
};

MiniVideoWin.prototype.destroy = function(){
	utils.off(this.dom, "click", this.eventHandler);
	utils.off(this.playButtonDom, "click", this.eventHandler2);
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
	var isLocalStream = stream.located();

	this.ownerName = utils.getDataByPath(stream, "owner.name");

	switch(stream.type){
	case _const.STREAM_TYPE.NORMAL:
		this.stream = stream;
		this.videoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
		this.nicknameDom.innerText = isLocalStream
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

	// Safari 浏览器不会自动播放视频，要显示播放按钮
	if(utils.isSafari && (
		// 自己的视频、正在播放的视频不显示播放按钮
		(this.stream && !this.stream.located() && this.stream.paused)
		// 别人的共享桌面也要显示按钮
		|| (this.noAudioStream && this.noAudioStream.paused)
	)){
		utils.removeClass(this.playButtonDom, "hide");
	}
};


var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var Const =			require("@/common/cfg/const");
var tpl =			require("@/app/modules/video/template/minVideoTpl.html");

module.exports = classUtils.createView({

	dispatcher: null,
	stream: null,
	noAudioStream: null,
	ownerName: "",

	nicknameDom: null,
	videoDom: null,
	playButtonDom: null,
	noAudioVideoDom: null,
	parentContainer: null,

	events: {
		"click ": "eventHandler",
		"click .play-button": "eventHandler2",
	},

	init: function(option){
		var opt = option || {};
		var stream = opt.stream;
		var isLocalStream = stream.located();

		this.parentContainer = opt.parentContainer;
		this.dispatcher = opt.dispatcher;

		// 本地视频需要 muted
		this.$el = domUtils.createElementFromHTML(_.template(tpl)({
			muted: isLocalStream ? "muted" : ""
		}));
		this.nicknameDom = this.$el.querySelector(".nickname");
		this.videoDom = this.$el.querySelector(".main-video");
		this.playButtonDom = this.$el.querySelector(".play-button");
		this.noAudioVideoDom = this.$el.querySelector(".no-audio-video");
		this.parentContainer.appendChild(this.$el);

		this.updateStream(stream);
	},

	eventHandler: function(){
		this.dispatcher.trigger("switchToMiniVideoWindow", {
			ownerName: this.ownerName,
			streams: _.compact([this.stream, this.noAudioStream]),	// 去除不存在的
		});
	},

	eventHandler2: function(e){
		this.videoDom && this.videoDom.play();
		this.noAudioVideoDom && this.noAudioVideoDom.play();
		domUtils.addClass(this.playButtonDom, "hide");
		e.stopPropagation();
	},

	getStream: function(){
		return this.stream;
	},

	isEmpty: function(){
		return !this.stream;
	},

	removeStream: function(stream){
		switch(stream.type){
		case Const.STREAM_TYPE.NORMAL:
			this.stream = null;
			this.videoDom.src = "";
			this.nicknameDom.innerText = "";
			break;
		case Const.STREAM_TYPE.NO_AUDIO:
			this.noAudioStream = null;
			this.noAudioVideoDom.src = "";
			domUtils.removeClass(this.videoDom, "hide");
			domUtils.addClass(this.noAudioVideoDom, "hide");
			break;
		default:
			throw new Error("unexpected stream type.");
		}
	},

	updateStream: function(stream){
		var mediaStream = stream.getMediaStream();
		var isLocalStream = stream.located();
		this.ownerName = utils.getDataByPath(stream, "owner.name");

		switch(stream.type){
		case Const.STREAM_TYPE.NORMAL:
			this.stream = stream;
			this.videoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
			this.nicknameDom.innerText = isLocalStream
				? __("video.me")
				: utils.getDataByPath(stream, "owner.ext.nickname");
			break;
		case Const.STREAM_TYPE.NO_AUDIO:
			this.noAudioStream = stream;
			this.noAudioVideoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
			domUtils.addClass(this.videoDom, "hide");
			domUtils.removeClass(this.noAudioVideoDom, "hide");
			break;
		default:
			throw new Error("unexpected stream type.");
		}

		// Safari 浏览器不会自动播放视频，要显示播放按钮
		if(utils.isSafari){
			if(
				// 自己的视频、正在播放的视频不显示播放按钮
				(this.stream && !this.stream.located() && this.stream.paused)
				// 别人的共享桌面也要显示按钮
				|| (this.noAudioStream && this.noAudioStream.paused)
			){
				domUtils.removeClass(this.playButtonDom, "hide");
			}
		}
	},

});

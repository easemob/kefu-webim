var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");

var VideoViewer =	require("@/app/modules/video/videoViewer");
var MiniVideoWin =	require("@/app/modules/video/miniVideoWin");
var tpl =			require("@/app/modules/video/template/videoPanelTpl.html");

module.exports = classUtils.createView({

	videoViewer: null,
	dispatcher: null,
	multiVideoContainer: null,
	videoWindowList: null,

	init: function(option){
		var me = this;
		var opt = option || {};
		this.dispatcher = opt.dispatcher;

		this.$el = domUtils.createElementFromHTML(tpl);
		this.multiVideoContainer = this.$el.querySelector(".multi-video-container");
		this.videoViewer = new VideoViewer({
			dispatcher: this.dispatcher,
			service: opt.service,
		});
		this.$el.appendChild(this.videoViewer.$el);

		this.dispatcher.addEventListener("switchToMiniVideoWindow", function(info){
			domUtils.addClass(me.multiVideoContainer, "hide");
			me.videoViewer.show(info);
		});
		this.dispatcher.addEventListener("returnToMultiVideoWindow", function(){
			domUtils.removeClass(me.multiVideoContainer, "hide");
			me.videoViewer.hide();
		});

		this.reset();
	},

	show: function(){
		domUtils.removeClass(this.$el, "hide");
	},

	hide: function(){
		domUtils.addClass(this.$el, "hide");
		this.reset();
	},

	reset: function(){
		this.videoWindowList = {};
		this.videoViewer.hide();
		this.multiVideoContainer.innerHTML = "";
		domUtils.removeClass(this.multiVideoContainer, "hide");
	},

	addOrUpdateStream: function(stream){
		var streamOwnerName = utils.getDataByPath(stream, "owner.name");
		var targetMiniVideoWindow = this.videoWindowList[streamOwnerName];
		if(targetMiniVideoWindow){
			targetMiniVideoWindow.updateStream(stream);
		}
		else{
			this.videoWindowList[streamOwnerName] = new MiniVideoWin({
				parentContainer: this.multiVideoContainer,
				stream: stream,
				dispatcher: this.dispatcher,
			});
		}
		this.dispatcher.trigger("addOrUpdateStream", stream);
	},

	removeStream: function(stream){
		var streamOwnerName = utils.getDataByPath(stream, "owner.name");
		var targetMiniVideoWindow = this.videoWindowList[streamOwnerName];
		if(!targetMiniVideoWindow) throw new Error("no such object.");
		targetMiniVideoWindow.removeStream(stream);
		if(targetMiniVideoWindow.isEmpty()){
			targetMiniVideoWindow.remove();
			delete this.videoWindowList[streamOwnerName];
		}
		this.dispatcher.trigger("removeStream", stream);
	},

});

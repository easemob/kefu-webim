var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var Dict =			require("@/common/kit/dict");
var videoViewer =	require("@/app/modules/video/videoViewer");
var MiniVideoWin =	require("@/app/modules/video/miniVideoWin");

var wrapperDom;
var multiVideoContainer;
var singleVideoContainer;

var videoWindowList;
var dispatcher;

module.exports = {
	init: init,
	show: show,
	hide: hide,
	addOrUpdateStream: addOrUpdateStream,
	removeStream: removeStream,
};

function init(option){
	var opt = option || {};
	wrapperDom = opt.wrapperDom;
	dispatcher = opt.dispatcher;
	multiVideoContainer = wrapperDom.querySelector(".multi-video-container");
	singleVideoContainer = wrapperDom.querySelector(".single-video-container");
	videoViewer.init({
		wrapperDom: singleVideoContainer,
		service: opt.service,
		dispatcher: dispatcher,
	});

	dispatcher.addEventListener("switchToMiniVideoWindow", function(info){
		domUtils.addClass(multiVideoContainer, "hide");
		videoViewer.show(info);
	});

	dispatcher.addEventListener("returnToMultiVideoWindow", function(){
		domUtils.removeClass(multiVideoContainer, "hide");
		videoViewer.hide();
	});

	_reset();
}

function show(){
	domUtils.removeClass(wrapperDom, "hide");
}

function hide(){
	domUtils.addClass(wrapperDom, "hide");
	_reset();
}

function _reset(){
	videoWindowList = new Dict();
	videoViewer.hide();
	multiVideoContainer.innerHTML = "";
	domUtils.removeClass(multiVideoContainer, "hide");
}

function addOrUpdateStream(stream){
	var streamOwnerName = utils.getDataByPath(stream, "owner.name");
	var targetMiniVideoWindow = videoWindowList.get(streamOwnerName);

	if(targetMiniVideoWindow){
		targetMiniVideoWindow.updateStream(stream);
	}
	else{
		videoWindowList.set(streamOwnerName, new MiniVideoWin({
			parentContainer: multiVideoContainer,
			stream: stream,
			dispatcher: dispatcher,
		}));
	}

	dispatcher.trigger("addOrUpdateStream", stream);
}

function removeStream(stream){
	var streamOwnerName = utils.getDataByPath(stream, "owner.name");
	var targetMiniVideoWindow = videoWindowList.get(streamOwnerName);

	if(!targetMiniVideoWindow) throw new Error("no such object.");

	targetMiniVideoWindow.removeStream(stream);
	if(targetMiniVideoWindow.isEmpty()){
		targetMiniVideoWindow.destroy();
		videoWindowList.remove(streamOwnerName);
	}

	dispatcher.trigger("removeStream", stream);
}

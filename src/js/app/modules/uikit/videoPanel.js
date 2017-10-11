var utils = require("../../../common/utils");
var videoViewer = require("./videoViewer");
var MiniVideoWin = require("./MiniVideoWin");

var wrapperDom;
var multiVideoContainer;
var singleVideoContainer;

var videoWindowList;

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
	multiVideoContainer = wrapperDom.querySelector(".multi-video-container");
	singleVideoContainer = wrapperDom.querySelector(".single-video-container");
	videoViewer.init({
		wrapperDom: singleVideoContainer,
		onReturnButtonClickCallback: _switchToVideoList,
		service: opt.service,
	});

	_reset();
}

function show(){
	utils.removeClass(wrapperDom, "hide");
}

function hide(){
	utils.addClass(wrapperDom, "hide");
	_reset();
}

function _reset(){
	videoWindowList = [];
	videoViewer.hide();
	multiVideoContainer.innerHTML = "";
	utils.removeClass(multiVideoContainer, "hide");
}

function addOrUpdateStream(stream){
	// todo: update video viewer & independent window
	var streamId = stream.id;
	var targetMiniVideoWindow = _.find(videoWindowList, function(videoWindow){
		return videoWindow.getStream().id === streamId;
	});

	if(targetMiniVideoWindow){
		targetMiniVideoWindow.update(stream);
	}
	else{
		videoWindowList.push(new MiniVideoWin({
			parentContainer: multiVideoContainer,
			stream: stream,
			clickCallback: _switchToVideoViewer,
		}));
	}
}

function removeStream(stream){
	var streamId = stream.id;
	var index = _.findIndex(videoWindowList, function(videoWindow){
		return videoWindow.getStream().id === streamId;
	});
	var targetMiniVideoWindow = videoWindowList[index];

	if(!targetMiniVideoWindow) throw new Error("no such object.");

	targetMiniVideoWindow.destroy();
	videoWindowList.splice(index, 1);
}

function _switchToVideoList(){
	utils.removeClass(multiVideoContainer, "hide");
	videoViewer.hide();
}

function _switchToVideoViewer(stream){
	utils.addClass(multiVideoContainer, "hide");
	videoViewer.show();
	videoViewer.update(stream);
}

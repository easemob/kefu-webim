var utils = require("../../../common/utils");
var videoViewer = require("./videoViewer");
var MiniVideoWin = require("./MiniVideoWin");
var Dict = require("../tools/Dict");

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
		utils.addClass(multiVideoContainer, "hide");
		videoViewer.show(info);
	});

	dispatcher.addEventListener("returnToMultiVideoWindow", function(){
		utils.removeClass(multiVideoContainer, "hide");
		videoViewer.hide();
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
	videoWindowList = new Dict();
	videoViewer.hide();
	multiVideoContainer.innerHTML = "";
	utils.removeClass(multiVideoContainer, "hide");
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

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

	onHasRemoteControl: onHasRemoteControl,
	onRemoteFreeControl: onRemoteFreeControl
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

function onHasRemoteControl(stream, controler, controlRequest){
	var streamOwnerName = utils.getDataByPath(stream, "owner.name");
	var targetMiniVideoWindow = videoWindowList.get(streamOwnerName);

	var rtn = confirm("同意 来自<" + controler.memName + ">对流:" + stream.id + "控制申请吗？");
	if(rtn){
		var mainVideo = targetMiniVideoWindow.videoDom;
		//被控端 实现
		var KeyboardTrack = emedia.pannel.KeyboardTrack.extend({
			onKeyDown: function (btn) {
				console.info("CTRL Down ", btn);
			},

			onKeyUp: function (btn) {
				console.info("CTRL Up ", btn);
			}
		});

		var DrawMouseTrack = emedia.pannel.MouseTrack.extend({
			
			onMouseTrack: function (position, lastPosition, lastTrigger) {
				console.log("CTRL Mouse move", position);
			},
			onMouseTrigger: function (trigger, _lastTrigger) {
				console.log("CTRL OK?", trigger);
			},
			onReleaseTrigger: function (_lastTrigger) {
				console.log('CTRL releaseTrigger');
			}
		});
		controlRequest.accept(mainVideo, new DrawMouseTrack({ // 被控端同意 控制申请
			_target: mainVideo,
			_video: mainVideo
		}), new KeyboardTrack());
	}else{
		controlRequest.reject(); // 被控端 控制申请拒绝
	}
}
	
function onRemoteFreeControl(stream, controler, cId) { // 被控端 收到 主控端释放远程控制
	videoPanel.onRemoteFreeControl(stream, controler, cId);
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

var utils = require("../../../common/utils");
var videoViewer = require("./videoViewer");
var MiniVideoWin = require("./MiniVideoWin");
var Dict = require("../tools/Dict");
var uikit = require("../uikit");

var wrapperDom;
var multiVideoContainer;
var singleVideoContainer;

var videoWindowList;
var dispatcher;
var service;
var curLocalStream;

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
	service = opt.service;
	multiVideoContainer = wrapperDom.querySelector(".multi-video-container");
	// singleVideoContainer = wrapperDom.querySelector(".single-video-container");
	// videoViewer.init({
	// 	wrapperDom: singleVideoContainer,
	// 	service: opt.service,
	// 	dispatcher: dispatcher,
	// });

	utils.addClass(multiVideoContainer, "hide");

	dispatcher.addEventListener("switchToMiniVideoWindow", function(info){
		// utils.addClass(multiVideoContainer, "hide");
		// videoViewer.show(info);
	});

	dispatcher.addEventListener("returnToMultiVideoWindow", function(){
		// utils.removeClass(multiVideoContainer, "hide");
		// videoViewer.hide();
	});
	// <span id="selfMuted">静音</span>
	// <span id="closeCamera">关闭摄像头</span>
	// <span id="changeCamera">切换摄像头</span>

	document.querySelector("#changeCamera").addEventListener("click", function(){
		console.log(service);
		service.chanageCamera(
			curLocalStream.id,
			function(err){
				console.error(err, "切换失败");
				alert("该设备不支持切换摄像头");
			}, function(mediaStream){
				alert("切换成功");
				console.log("切换成功", mediaStream);
			}
		);
	});

	document.querySelector("#selfMuted").addEventListener("click", function(){

		// 关掉推送的流
		service.aoff(curLocalStream, !curLocalStream.aoff);

		// 关掉openMedia的stream流
		service._localMediaStream.getTracks().forEach(function(track){
			if(track.kind == "audio"){
				track.enabled = !track.enabled;
				if(track.enabled){
				}
				else{
				}
			}
		});
	});

	document.querySelector("#closeCamera").addEventListener("click", function(){
		service.voff(curLocalStream, !curLocalStream.voff);

		service._localMediaStream.getTracks().forEach(function(track){
			if(track.kind == "video"){
				track.enabled = !track.enabled;
				if(track.enabled){
				}
				else{
				}
			}
		});
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
	// videoViewer.hide();
	multiVideoContainer.innerHTML = "";
	utils.addClass(multiVideoContainer, "hide");
}

function addOrUpdateStream(stream){
	
	var streamOwnerName = utils.getDataByPath(stream, "owner.name");
	var targetMiniVideoWindow = videoWindowList.get(streamOwnerName);
	console.log("addstream", stream);
	if(stream.located()){
		curLocalStream = stream;
		document.querySelector(".stream-local video").srcObject = stream.getMediaStream();
		return;
	}
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

	// dispatcher.trigger("addOrUpdateStream", stream);
}

function removeStream(stream){
	var streamOwnerName = utils.getDataByPath(stream, "owner.name");
	var targetMiniVideoWindow = videoWindowList.get(streamOwnerName);
	if(stream.located()){
		return;
	}
	if(!targetMiniVideoWindow) throw new Error("no such object.");

	targetMiniVideoWindow.removeStream(stream);
	if(targetMiniVideoWindow.isEmpty()){
		targetMiniVideoWindow.destroy();
		videoWindowList.remove(streamOwnerName);
	}

	// dispatcher.trigger("removeStream", stream);
}

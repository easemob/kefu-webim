var utils = require("../../../common/utils");
var TimerLabel = require("./TimerLabel");

var wrapperDom;
var timerBarDom;
var statusTextDom;
var acceptButtonDom;
var endButtonDom;
var collapseToggleButton;

var timerLabel;
var timerLabelVideo;
var showClosingTimerHandler;

var acceptCallback;
var endCallback;

var nopFunction = function(){};

module.exports = {
	init: init,
	startTimer: startTimer,
	show: show,
	hide: hide,
	toggleCollapse: toggleCollapse,
	showClosing: showClosing,
	reset: reset,
	hideAcceptButton: hideAcceptButton,
	setStatusText: setStatusText,
};

function init(option){
	var opt = option || {};

	if(wrapperDom) throw new Error("statusBar has been already initialized.");

	wrapperDom = opt.wrapperDom;
	acceptCallback = opt.acceptCallback || nopFunction;
	endCallback = opt.endCallback || nopFunction;

	timerBarDom = wrapperDom.querySelector(".time-escape");
	statusTextDom = wrapperDom.querySelector(".status-text");
	acceptButtonDom = wrapperDom.querySelector(".accept-button");
	endButtonDom = wrapperDom.querySelector(".end-button");
	collapseToggleButton = wrapperDom.querySelector(".collapse-toggle-button");
	
	timerLabel = new TimerLabel(timerBarDom);
	// 音视频通话 计时器
	timerVideoBarDom = document.querySelector("#video-close .time-escape");
	timerLabelVideo = new TimerLabel(timerVideoBarDom);

	utils.on(acceptButtonDom, "click", acceptCallback);
	utils.on(endButtonDom, "click", endCallback);

	// 坐席 接受音视频通话，访客 点击同意或挂断按钮 事件
	utils.on(acceptButtonDom, "video-accept", acceptCallback);
	utils.on(endButtonDom, "video-close", endCallback);

	utils.on(collapseToggleButton, "click", function(){
		toggleCollapse();
	});
}

function setStatusText(text){
	statusTextDom.innerText = text;
}

function toggleCollapse(state){
	utils.toggleClass(wrapperDom, "collapsed", state);
}

function startTimer(){
	timerLabel.start();
	timerLabelVideo.start();
}

function show(){
	utils.removeClass(wrapperDom, "hide");
	startTimer();
}

function hide(){
	utils.addClass(wrapperDom, "hide");
}

function showClosing(){
	toggleCollapse(true);
	utils.addClass(wrapperDom, "terminated");
	setStatusText(__("video.video_ended"));

	timerLabel.stop();
	timerLabelVideo.stop();

	clearTimeout(showClosingTimerHandler);
	showClosingTimerHandler = setTimeout(function(){
		hide();
		reset();
	}, 3000);

	var closeBtn = document.querySelector("#em-kefu-webim-chat-video .em-widget-decline");
	utils.trigger(closeBtn, "click");
}

function reset(){
	toggleCollapse(false);
	utils.removeClass(wrapperDom, "terminated");
	utils.removeClass(acceptButtonDom, "hide");
	showClosingTimerHandler = clearTimeout(showClosingTimerHandler);
	timerLabel.stop();
	timerLabelVideo.stop();
	setStatusText(__("video.waiting"));
}

function hideAcceptButton(){
	utils.addClass(acceptButtonDom, "hide");
}

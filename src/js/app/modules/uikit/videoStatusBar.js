var utils = require("../../../common/utils");
var TimerLabel = require("./TimerLabel");

var wrapperDom;
var timerBarDom;
var statusTextDom;
var acceptButtonDom;
var endButtonDom;
var collapseToggleButton;

var timerLabel;
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

	utils.on(acceptButtonDom, "click", acceptCallback);
	utils.on(endButtonDom, "click", endCallback);
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

	clearTimeout(showClosingTimerHandler);
	showClosingTimerHandler = setTimeout(function(){
		hide();
		reset();
	}, 3000);
}

function reset(){
	toggleCollapse(false);
	utils.removeClass(wrapperDom, "terminated");
	utils.removeClass(acceptButtonDom, "hide");
	showClosingTimerHandler = clearTimeout(showClosingTimerHandler);
	timerLabel.stop();
	setStatusText(__("video.waiting"));
}

function hideAcceptButton(){
	utils.addClass(acceptButtonDom, "hide");
}

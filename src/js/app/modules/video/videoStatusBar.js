var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var TimerLabel =	require("@/common/uikit/timerLabel");
var tpl =			require("@/app/modules/video/template/statusBarTpl.html");
var showClosingTimerHandler = 0;

module.exports = classUtils.createView({

	statusTextDom: null,
	acceptButtonDom: null,
	endButtonDom: null,
	collapseToggleButton: null,
	timerLabel: null,

	acceptCallback: utils.noop,
	endCallback: utils.noop,

	events: {
		"click .accept-button": "onAccept",
		"click .end-button": "endCallback",
		"click .collapse-toggle-button": "toggleCollapse",
	},

	init: function(option){
		var opt = option || {};
		this.acceptCallback = opt.acceptCallback || this.acceptCallback;
		this.endCallback = opt.endCallback || this.endCallback;

		this.$el = utils.createElementFromHTML(tpl);
		this.statusTextDom = this.$el.querySelector(".status-text");
		this.acceptButtonDom = this.$el.querySelector(".accept-button");
		this.endButtonDom = this.$el.querySelector(".end-button");
		this.collapseToggleButton = this.$el.querySelector(".collapse-toggle-button");

		this.timerLabel = new TimerLabel(this.$el.querySelector(".time-escape"));
	},

	onAccept: function(){
		domUtils.addClass(this.acceptButtonDom, "hide");
		this.timerLabel.start();
		this.setStatusText(__("video.connecting"));
		this.acceptCallback();
	},

	setStatusText: function(text){
		this.statusTextDom.innerText = text;
	},

	toggleCollapse: function(state){
		domUtils.toggleClass(this.$el, "collapsed", state);
	},

	show: function(){
		domUtils.removeClass(this.$el, "hide");
		this.timerLabel.start();
	},

	hide: function(){
		domUtils.addClass(this.$el, "hide");
	},

	showClosing: function(){
		this.toggleCollapse(true);
		domUtils.addClass(this.$el, "terminated");
		this.setStatusText(__("video.video_ended"));

		this.timerLabel.stop();
		clearTimeout(showClosingTimerHandler);
		showClosingTimerHandler = setTimeout(this.closing.bind(this), 3000);
	},

	closing: function(){
		this.hide();
		this.reset();
	},

	reset: function(){
		this.toggleCollapse(false);
		domUtils.removeClass(this.$el, "terminated");
		domUtils.removeClass(this.acceptButtonDom, "hide");
		clearTimeout(showClosingTimerHandler);
		this.timerLabel.stop();
		this.setStatusText(__("video.waiting"));
	},

});

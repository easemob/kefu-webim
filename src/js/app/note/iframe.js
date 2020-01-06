var utils = require("../../common/utils");

var IM_HTML_PATH = __("config.language") === "zh-CN" ? "/note.html" : "/en-US/note.html";

function Iframe(config){
	var me = this;
	var id = "easemob-iframe-note";
	var className = "easemobim-note-panel hide";
	var iframe = document.createElement("iframe");
	this.config = config;
	
	iframe.frameBorder = 0;
	iframe.allowTransparency = "true";
	iframe.id = id;
	iframe.className = className;
	iframe.allow = "microphone; camera";
	document.getElementById("em-kefu-webim-chat").appendChild(iframe);

	me.iframe = iframe;
	me.show = false;
	Iframe.iframe = me;

	return me;
}


Iframe.prototype.open = function(config){
	var me = this;
	var base64;
	if(this.show) return this;
	this.show = true;

	utils.on(this.iframe, "load", function(){
		utils.removeClass(me.iframe, "hide");
	});
	
	config = _.extend({}, this.config, config);
	base64 = window.btoa
		? window.btoa(encodeURIComponent(JSON.stringify(config)))
		: encodeURIComponent(JSON.stringify(config));
	this.iframe.src = config.noteSrc
		? config.noteSrc + "?config=" + base64
		: config.domain + "__WEBIM_SLASH_KEY_PATH__/webim" + IM_HTML_PATH + "?config=" + base64;

	return this;
};

Iframe.prototype.close = function(){
	if(this.show === false) return this;
	this.show = false;

	utils.addClass(this.iframe, "hide");

	return this;
};



module.exports = Iframe;

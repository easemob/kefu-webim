var utils = require("../../common/utils");

var IM_HTML_PATH = __("config.language") === "zh-CN" ? "/note.html" : "/en-US/note.html";

function Iframe(config){
	var me = this;
	var id = "easemob-iframe-note";
	var className = "easemobim-note-panel";
	var iframe = document.createElement("iframe");
	this.config = config;
	
	iframe.frameBorder = 0;
	iframe.allowTransparency = "true";
	iframe.id = id;
	iframe.className = className;
	iframe.allow = "microphone; camera";
	document.querySelector(".em-kefu-webim-note").appendChild(iframe);

	me.iframe = iframe;
	me.show = false;
	Iframe.iframe = me;

	return me;
}


Iframe.prototype.open = function(config){
	var noteWrapper = document.querySelector(".em-kefu-webim-note");
	var me = this;
	var base64;
	var iframeSrc = "";
	if(this.show) return this;
	this.show = true;
	config = _.extend({}, this.config, config);
	if(config.hideCloseBtn || !config.noteSrc){
		me.iframe.style.height = "100%";
		utils.addClass(noteWrapper.querySelector(".note-top"), "hide");
	}
	
	utils.on(this.iframe, "load", function(){
		utils.removeClass(noteWrapper, "hide");
	});
	
	base64 = window.btoa
		? window.btoa(encodeURIComponent(JSON.stringify(config)))
		: encodeURIComponent(JSON.stringify(config));
	
	if(config.noteSrc){
		if(config.noteSrc.indexOf("?") > -1){
			iframeSrc = config.noteSrc + "&config=" + base64;
		}
		else{
			iframeSrc = config.noteSrc + "?config=" + base64;
		}
	}
	else{
		iframeSrc = config.domain + "__WEBIM_SLASH_KEY_PATH__/webim" + IM_HTML_PATH + "?config=" + base64;
	}
	this.iframe.src = iframeSrc;

	return this;
};

Iframe.prototype.close = function(){
	var noteWrapper = document.querySelector(".em-kefu-webim-note");
	if(this.show === false) return this;
	this.show = false;

	utils.addClass(noteWrapper, "hide");

	return this;
};



module.exports = Iframe;

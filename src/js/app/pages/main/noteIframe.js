var utils = require("@/common/utils");
var _const = require("@/common/const");
var profile = require("@/app/tools/profile");
var commonConfig = require("@/common/config");

var NOTE_HTML_PATH = __("config.language") === "zh-CN" ? "/note.html" : "/en-US/note.html";

function Iframe(config){
	// 自定义主题色
	var color = "";
	var themeClassName;
	var config = commonConfig.getConfig();
	var themeName = config.ui.themeName;
	if(themeName && themeName.indexOf("theme_custom") > -1){
		var arr = themeName.split("theme_custom");
		color = arr[1];
		themeClassName = "theme_custom";
	}
	else{
		themeClassName = _const.themeMap[config.themeName];
	}

	var id = "easemob-iframe-note";
	var className = "easemobim-note-panel";
	var iframe = document.createElement("iframe");
	this.globalConfig = config;

	// 留言页面需要用到的数据，不能全部传过去，url 有长度限制
	this.noteConfig = {
		tenantId: config.tenantId,
		configId: config.configId,
		configName: config.configName,
		restServer: config.restServer,
		orgName: config.orgName,
		appName: config.appName,
		user: config.user,
		toUser: config.toUser,
		appKey: config.appKey,
		grayNoteCategory: false,
		sessionId: "",
		hideCloseBtn: false,
		themeClassName: themeClassName,
		themeColor: color
	};
	
	iframe.frameBorder = 0;
	iframe.allowTransparency = "true";
	iframe.id = id;
	iframe.className = className;
	iframe.allow = "microphone; camera";
	this.noteWrapper = document.querySelector(".em-kefu-webim-note");
	this.noteWrapper.appendChild(iframe);

	this.iframe = iframe;

	this.show = false;
	Iframe.iframe = this;

	return this;
}


Iframe.prototype.open = function(config){
	var me = this;
	var base64;
	var iframeSrc = "";
	if(this.show) return this;
	this.show = true;
	this.noteConfig = _.extend({}, this.noteConfig, {
		grayNoteCategory: utils.getDataByPath(profile, "grayList.noteCategory"),
		sessionId: utils.getDataByPath(profile, "currentOfficialAccount.sessionId")
	});
	config = _.extend({}, this.noteConfig, config);
	if(config.hideCloseBtn || !this.globalConfig.noteSrc){
		me.iframe.style.height = "100%";
		utils.addClass(this.noteWrapper.querySelector(".note-top"), "hide");
	}
	
	utils.on(this.iframe, "load", function(){
		utils.removeClass(me.noteWrapper, "hide");
	});
	base64 = encodeURIComponent(JSON.stringify(config));
	base64 = window.btoa
		? window.btoa(base64)
		: base64;
	
	if(this.globalConfig.noteSrc){
		if(this.globalConfig.noteSrc.indexOf("?") > -1){
			iframeSrc = this.globalConfig.noteSrc + "&config=" + base64;
		}
		else{
			iframeSrc = this.globalConfig.noteSrc + "?config=" + base64;
		}
	}
	else{
		iframeSrc = this.globalConfig.domain + "__WEBIM_SLASH_KEY_PATH__/webim" + NOTE_HTML_PATH + "?config=" + base64;
	}
	this.iframe.src = iframeSrc;
	return this;
};

Iframe.prototype.close = function(){
	if(this.show === false) return this;
	this.show = false;

	utils.addClass(this.noteWrapper, "hide");

	return this;
};



module.exports = Iframe;

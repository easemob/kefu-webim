var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var config = {};

function h5_mode_init(){
	config = {};
	config.menutype = utils.query("menutype");
	config.queueName = utils.query("queueName");
	config.queueId = utils.query("queueId");
	config.channelName = utils.query("channelName");
	config.tsrNumber = utils.query("tsrNumber");
	config.csrNumber = utils.query("csrNumber");
	config.pageCode = utils.query("pageCode");
	config.customerId = utils.query("customerId");
	config.isVipTsr = utils.query("isVipTsr");
	// // 新加参数 --- 开始
	// config.visitorName = utils.query("visitorName");
	// config.cardNumber = utils.query("cardNumber");
	// config.phoneNumber = utils.query("phoneNumber");
	// // 新加参数 --- 结束
	config.tenantId = utils.query("tenantId");
	config.configId = utils.query("configId");
	config.offDutyType = utils.query("offDutyType");
	config.openNote = utils.query("openNote");
	config.grUserId = utils.query("grUserId");
	config.domain = utils.query("domain") ? "//" + utils.query("domain") : "";

	// H5 方式集成时不支持eventCollector配置
	config.to = utils.convertFalse(utils.query("to"));
	config.xmppServer = utils.convertFalse(utils.query("xmppServer"));
	config.restServer = utils.convertFalse(utils.query("restServer"));
	config.agentName = utils.convertFalse(utils.query("agentName"));
	config.resources = utils.convertFalse(utils.query("resources"));
	config.hideStatus = utils.convertFalse(utils.query("hideStatus"));
	config.satisfaction = utils.convertFalse(utils.query("sat"));
	config.wechatAuth = utils.convertFalse(utils.query("wechatAuth"));
	config.hideKeyboard = utils.convertFalse(utils.query("hideKeyboard"));

	config.appKey = utils.convertFalse(decodeURIComponent(utils.query("appKey")));
	config.domain = config.domain || "//" + location.host;
	config.offDutyWord = decodeURIComponent(utils.query("offDutyWord"));
	config.ticket = utils.query("ticket") === "" ? true : utils.convertFalse(utils.query("ticket")); // true default
	config.emgroup = decodeURIComponent(utils.query("emgroup"));

	config.user = {};
	var usernameFromUrl = utils.query("user");

	var usernameFromCookie = utils.get("root" + (config.configId || (config.tenantId + config.emgroup)));

	if(usernameFromUrl){
		config.user.username = usernameFromUrl;
	}
	else if(usernameFromCookie){
		config.user.username = usernameFromCookie;
		config.isUsernameFromCookie = true;
	}
	else{}

	// fake transfer
	window.transfer = {
		send: function(){}
	};
}


function handleConfig(configJson){
	config.tenantId = configJson.tenantId;
	// todo: 把配置转换为新的
	// 用于config标记是否是来自于坐席端网页配置
	config.isWebChannelConfig = true;

	config.configName = configJson.configName;
	config.channel = configJson.channel;
	config.ui = configJson.ui;
	config.toolbar = configJson.toolbar;
	config.chat = configJson.chat;

	config.appKey = configJson.channel.appKey;
	config.to = configJson.channel.to;
	// config.agentName = configJson.channel.agentName;
	config.emgroup = configJson.channel.emgroup;

	// config.buttonText = configJson.ui.buttonText;
	// config.dialogHeight = configJson.ui.dialogHeight;
	// config.dialogWidth = configJson.ui.dialogWidth;
	// config.dialogPosition = configJson.ui.dialogPosition;
	config.dragenable = configJson.ui.dragenable;
	config.hide = configJson.ui.hide;
	config.logo = configJson.ui.logo;
	config.notice = configJson.ui.notice;
	config.themeName = configJson.ui.themeName;

	config.autoConnect = configJson.toolbar.autoConnect;
	// config.hideKeyboard = configJson.toolbar.hideKeyboard;
	config.minimum = configJson.toolbar.minimum;
	config.offDutyWord = configJson.toolbar.offDutyWord;
	config.offDutyType = configJson.toolbar.offDutyType;
	config.openNote = configJson.toolbar.openNote;
	config.popupOnInitialized = configJson.toolbar.popupOnInitialized;
	config.satisfaction = configJson.toolbar.satisfaction;
	config.soundReminder = configJson.toolbar.soundReminder;
	config.ticket = configJson.toolbar.ticket;

	config.resources = configJson.chat.resources;
	config.hideStatus = configJson.chat.hideStatus;
	config.timeScheduleId = configJson.chat.timeScheduleId || 0;

}

function setConfig(extendConfig){
	config = _.extend({}, config, extendConfig);
}

function getConfig(){
	return JSON.parse(JSON.stringify(config));
}

module.exports = {
	getConfig: getConfig,
	h5_mode_init: h5_mode_init,
	handleConfig: handleConfig,
	setConfig: setConfig,
};

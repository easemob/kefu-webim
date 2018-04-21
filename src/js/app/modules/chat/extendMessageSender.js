var Const =			require("@/common/cfg/const");
var profile =		require("@/common/cfg/profile");
var utils =			require("@/common/kit/utils");
var eventListener =	require("@/common/disp/eventListener");
var channel =		require("@/app/modules/chat/channel");

var messageChannelReadyPromise;
var sessionOpenPromise;
var initOnce = _.once(_init);

module.exports = {
	init: initOnce,
	push: push,
};

/*
	暂时没有考虑会话打开后又关闭的情形
	所以会话打开后 crm 消息就会无阻碍发送
	即使后来会话又被关闭
*/

function push(extendMessage){
	var isCrmExtendMessage = !!utils.getDataByPath(extendMessage, "cmd.updateVisitorInfoSrc");
	initOnce();
	if(isCrmExtendMessage){
		// crm 对接消息必须等会话打开后才能发
		// todo: discard ext
		sessionOpenPromise.then(function(){ channel.sendText("", { ext: extendMessage }); });
	}
	else{
		// 其他消息只要 channelReady 就可以发
		messageChannelReadyPromise.then(function(){ channel.sendText("", { ext: extendMessage }); });
	}
}

function _init(){
	sessionOpenPromise = new Promise(function(resolve){
		eventListener.add([
			Const.SYSTEM_EVENT.SESSION_OPENED,
			Const.SYSTEM_EVENT.SESSION_RESTORED,
		], function(){
			profile.systemOfficialAccount.isSessionOpen && resolve();
		});
	});

	messageChannelReadyPromise = new Promise(function(resolve){
		eventListener.add(Const.SYSTEM_EVENT.MESSAGE_CHANNEL_READY, resolve);
	});
}

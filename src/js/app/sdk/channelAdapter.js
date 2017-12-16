var _const = require("../../common/const");
var eventListener = require("../modules/tools/eventListener");
var apiHelper = require("src/js/app/modules/apiHelper");
var imAdapter = require("./imAdapter");
var messageBuilder = require("./messageBuilder");

module.exports = {
	sendText: sendText,
	sendMediaFile: sendMediaFile,
};

function sendText(messageBody){
	// 触发相应事件，用于消息上屏
	eventListener.trigger(
		_const.SYSTEM_EVENT.MESSAGE_SENT,
		messageBuilder.transformFromKefu2Im({ body: messageBody }),
		{ isReceived: false }
	);
	return imAdapter.send(messageBody);
}

function sendMediaFile(file, type){
	var blobUrl = window.URL.createObjectURL(file);
	var filename = file.name || "";
	var size = file.size;
	var messageBodyForRender = messageBuilder.mediaFileMessage({ url: blobUrl, filename: filename, type: type, size: size });
	var id = messageBuilder.getMessageId(messageBodyForRender);

	// 发送图片后需要立即上屏
	eventListener.trigger(
		_const.SYSTEM_EVENT.MESSAGE_SENT,
		messageBuilder.transformFromKefu2Im({ body: messageBodyForRender }),
		{ isReceived: false }
	);

	apiHelper.kefuUploadFile(file)
	// todo: 此时若上传失败增加重试
	.then(function(resp){
		var url = resp.url;
		var filename = resp.fileName;
		var messageBodyForSend = messageBuilder.mediaFileMessage({ url: url, filename: filename, type: type });
		// 保证发送的消息和上屏的消息id一致
		messageBuilder.setMessageId(messageBodyForSend, id);
		return imAdapter.send(messageBodyForSend);
	});
}

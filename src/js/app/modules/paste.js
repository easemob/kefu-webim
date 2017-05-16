/**
 * ctrl+v发送截图功能:当前仅支持chrome/firefox/edge
 */
easemobim.initPasteImage = (function(utils, uikit){
	var chat;
	var blob;
	var dataURL;

	var imgDom = document.createElement('img');
	var dialog = uikit.createDialog({
		contentDom: imgDom,
		className: 'mini paste-image'
	}).addButton({
		confirmText: '发送',
		confirm: function(){
			chat.channel.sendImg({ data: blob, url: dataURL });
		}
	});

	function _handler(ev) {
		if (/^image\/\w+$/.test(utils.getDataByPath(ev, 'clipboardData.items.0.type'))) {
			blob = ev.clipboardData.items[0].getAsFile();
			dataURL = window.URL.createObjectURL(blob);
			imgDom.src = dataURL;
			dialog.show();
		}
	}
	return function (currentChat){
		chat = currentChat;
		utils.on(document.querySelector('.em-widget-send-wrapper .em-widget-textarea'), 'paste', _handler);
	}
}(easemobim.utils, easemobim.uikit));

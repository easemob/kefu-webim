/**
 * ctrl+v发送截图功能:当前仅支持chrome/firefox/edge
 */
easemobim.paste = function (chat) {
	var utils = easemobim.utils;
	var blob;
	var dataURL;

	var dom = document.querySelector('.em-widget-paste-wrapper');
	var cancelBtn = dom.querySelector('.em-widget-cancel');
	var sendImgBtn = dom.querySelector('.em-widget-confirm');
	var img = dom.querySelector('img');

	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'hide');
	});
	utils.on(sendImgBtn, 'click', function () {
		chat.sendImgMsg({data: blob, url: dataURL});
		utils.addClass(dom, 'hide');
	});

	function _handler(ev){
		if (/^image\/\w+$/.test(utils.getDataByPath(ev, 'clipboardData.items.0.type'))){
			blob = ev.clipboardData.items[0].getAsFile();
			dataURL = window.URL.createObjectURL(blob);
			img.src = dataURL;
			utils.removeClass(dom, 'hide');
		}
	}
	return {
		init: function () {
			utils.on(easemobim.textarea, 'paste', _handler);
		}
	};
};

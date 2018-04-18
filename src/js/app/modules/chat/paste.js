var utils = require("../../common/utils");
var uikit = require("./uikit");
var channel = require("./channel");

var blob;
var dataURL;
var imgDom;
var dialog;

function _init(){
	imgDom = document.createElement("img");
	dialog = uikit.createDialog({
		contentDom: imgDom,
		className: "mini paste-image"
	}).addButton({
		confirmText: __("chat.paste_image_submit"),
		confirm: function(){
			channel.sendImg({ data: blob, url: dataURL });
		}
	});

	// bind events
	utils.on(
		document.querySelector(".em-widget-send-wrapper .em-widget-textarea"),
		"paste",
		_handler
	);
}

function _handler(ev){
	if(/^image\/\w+$/.test(utils.getDataByPath(ev, "clipboardData.items.0.type"))){
		blob = ev.clipboardData.items[0].getAsFile();
		dataURL = window.URL.createObjectURL(blob);
		imgDom.src = dataURL;
		dialog.show();
	}
}
module.exports = _init;

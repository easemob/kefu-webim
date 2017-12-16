var utils = require("../../common/utils");
var uikit = require("./uikit");
var channelAdapter = require("../sdk/channelAdapter");

var file;
var imgDom;
var dialog;

module.exports = { init: init };

function init(){
	var textAreaDom = document.querySelector(".em-widget-send-wrapper .em-widget-textarea");
	imgDom = document.createElement("img");
	dialog = uikit.createDialog({
		contentDom: imgDom,
		className: "mini paste-image"
	}).addButton({
		confirmText: __("chat.paste_image_submit"),
		confirm: function(){
			channelAdapter.sendMediaFile(file, "img");
		}
	});

	// bind events
	utils.on(textAreaDom, "paste", function(ev){
		var contentType = utils.getDataByPath(ev, "clipboardData.items.0.type");
		if(/^image\/\w+$/.test(contentType)){
			file = ev.clipboardData.items[0].getAsFile();
			imgDom.src = window.URL.createObjectURL(file);
			dialog.show();
		}
	});
}

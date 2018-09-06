var utils = require("../../common/utils");
var uikit = require("./uikit");
var channel = require("./channel");

var blob;
var dataURL;

var imgDom = document.createElement("img");
var dialog = uikit.createDialog({
	contentDom: imgDom,
	className: "mini paste-image"
}).addButton({
	confirmText: "发送",
	confirm: function(){
		channel.sendImg({ data: blob, url: dataURL });
	}
});

function _handler(ev){
	if(/^image\/\w+$/.test(utils.getDataByPath(ev, "clipboardData.items.0.type"))){
		blob = ev.clipboardData.items[0].getAsFile();
		dataURL = window.URL.createObjectURL(blob);
		imgDom.src = dataURL;
		dialog.show();
	}
}
module.exports = function(){
	utils.on(document.querySelector(".em-widget-send-wrapper .em-widget-textarea"), "paste", _handler);
};

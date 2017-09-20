var template = require("raw-loader!../../../../template/emojiPanel.html");
var utils = require("../../../common/utils");
var HEIGHT_OF_TOP_NAVIGATOR = 43;
var dom;
var emojiContainer;

module.exports = {
	init: init,
	move: move,
};

function init(option){
	var isEmojiLoaded = false;
	var params = option || {};
	var container = params.container;
	var toggleButton = params.toggleButton;
	var textInput = params.textInput;

	if(dom) throw new Error("emoji panel has already initialized.");

	dom = utils.createElementFromHTML(template);
	emojiContainer = dom.querySelector(".em-bar-emoji-container");

	container.appendChild(dom);

	utils.on(toggleButton, utils.click, function(){
		textInput.blur();
		utils.toggleClass(dom, "hide");

		// 懒加载，打开表情面板时才初始化图标
		if(!isEmojiLoaded){
			isEmojiLoaded = true;
			emojiContainer.innerHTML = _genHtml();
		}
	});

	// 表情的选中
	utils.live("img.emoji", utils.click, function(ev){
		var event = window.event || ev;
		var target = event.srcElement || event.target;

		!utils.isMobile && textInput.focus();
		textInput.value += target.getAttribute("data-value");
		utils.trigger(textInput, "change");
	}, dom);

	// todo: kill .e-face to make it more elegant
	// ie8 does not support stopPropagation -_-||
	// 点击别处时隐藏表情面板
	utils.on(document, utils.click, function(ev){
		var e = window.event || ev;
		var target = e.srcElement || e.target;

		if(!utils.hasClass(target, "e-face")){
			utils.addClass(dom, "hide");
		}
	});

}

// 输入框位置发生变化时表情面板要随之移动
function move(inputBoxPosition, offset){
	var offsetHeight = offset || 0;

	switch(inputBoxPosition){
	case "up":
		dom.style.top = HEIGHT_OF_TOP_NAVIGATOR + offsetHeight + "px";
		dom.style.bottom = "auto";
		break;
	case "down":
		dom.style.top = "auto";
		dom.style.bottom = offsetHeight + "px";
		break;
	default:
		throw new Error("unexpect direction.");
	}
}

function _genHtml(){
	var path = WebIM.Emoji.path;
	var EMOJI_COUNT_PER_LINE = 7;

	return _.chain(WebIM.Emoji.map)
	// 生成图标html
	.map(function(value, key){
		return "<div class=\"em-bar-emoji-bg e-face\">"
				+ "<img class=\"e-face emoji\" src=\""
				+ path + value
				+ "\" data-value=" + key + " />"
				+ "</div>";
	})
	// 按照下标分组
	.groupBy(function(elem, index){
		return Math.floor(index / EMOJI_COUNT_PER_LINE);
	})
	// 增加wrapper
	.map(function(elem){
		return "<li class=\"e-face\">" + elem.join("") + "</li>";
	})
	// 结束链式调用
	.value()
	// 把数组拼接成字符串
	.join("");
}

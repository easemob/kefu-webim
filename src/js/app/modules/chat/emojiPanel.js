var _const =	require("@/common/cfg/const");
var profile =	require("@/common/cfg/profile");
var kefuPath =	require("@/common/cfg/kefuPath");
var utils =		require("@/common/kit/utils");
var domUtils =	require("@/common/kit/domUtils");
var apiHelper = require("@/common/kit/apiHelper");
var List =		require("@/common/kit/list");

var channel =	require("@/app/modules/chat/channel");
var template =	require("@/../template/emojiPanel.html");

var HEIGHT_OF_TOP_NAVIGATOR = 43;
var MAGIC_EMOJI_COUNT_PER_LINE = 6;
var EMOJI_COUNT_PER_LINE = 10;

var dom;
var emojiPageContainer;
var systemEmojiContainer;
var emojiContainerList;
var loadedEmojiPageIndexList = new List();
var customEmojiPackageHtmlList;

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

	dom = domUtils.createElementFromHTML(template);
	systemEmojiContainer = dom.querySelector(".emoji-container.system");

	container.appendChild(dom);

	utils.on(toggleButton, domUtils.CLICK, function(){
		textInput.blur();
		domUtils.toggleClass(dom, "hide");

		// 懒加载，打开表情面板时才初始化图标
		if(!isEmojiLoaded){
			isEmojiLoaded = true;
			_loadSystemEmojiPackage();
			_initCustomMagicEmoji();
		}
	});

	// 表情的选中
	utils.live("img.emoji", domUtils.CLICK, function(ev){
		var event = window.event || ev;
		var target = event.srcElement || event.target;
		var type = target.getAttribute("data-type");
		var imageUrl;

		if(type === "custom"){
			imageUrl = target.getAttribute("data-origin-url");
			channel.sendText("", {
				ext: {
					msgtype: {
						customMagicEmoji: {
							url: imageUrl,
						},
					},
				},
			});
		}
		else{
			!utils.isMobile && textInput.focus();
			textInput.value += target.getAttribute("data-value");
			domUtils.trigger(textInput, "change");
		}
	}, dom);

	// todo: kill .e-face to make it more elegant
	// ie8 does not support stopPropagation -_-||
	// 点击别处时隐藏表情面板
	utils.on(document, domUtils.CLICK, function(ev){
		var e = window.event || ev;
		var target = e.srcElement || e.target;

		if(!domUtils.hasClass(target, "e-face")){
			domUtils.addClass(dom, "hide");
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

function _initCustomMagicEmoji(){
	if(!profile.grayList.customMagicEmoji) return;
	if(emojiPageContainer) throw new Error("custom magic emoji has already initialized.");

	emojiPageContainer = dom.querySelector(".page-container");

	Promise.all([
		apiHelper.getCustomEmojiPackages(),
		apiHelper.getCustomEmojiFiles(),
	]).then(function(result){
		var packageList = result[0];
		var fileList = result[1];

		if(_.isEmpty(packageList)) return;

		customEmojiPackageHtmlList = _genEmojiPackageHtmlList(packageList, fileList);

		// 自定义表情仅创建空的 container，懒加载
		_.each(customEmojiPackageHtmlList, function(){
			var tmpHtml = "<div class=\"emoji-container magic hide\"></div>";
			var tmpDom = domUtils.createElementFromHTML(tmpHtml);

			emojiPageContainer.appendChild(tmpDom);
		});

		emojiContainerList = _.toArray(emojiPageContainer.querySelectorAll(".emoji-container"));

		_initNavigator(packageList);
	});
}

function _genEmojiPackageHtmlList(packageList, fileList){
	return _.chain(packageList)
	.pluck("id")
	.map(function(packageId){
		var filesInCurrentPackage = _.where(fileList, { packageId: packageId });
		var currentPageHtml =  _.chain(filesInCurrentPackage)
		// 生成图标html
		.map(function(item){
			var thumbnailUrl = kefuPath.getToBackend(item.thumbnailUrl);
			var originUrl = item.originUrl;
			return "<div class=\"emoji-bg e-face\">"
					+ "<img class=\"e-face emoji\" src=\""
					+ thumbnailUrl
					+ "\" data-origin-url=" + originUrl + " data-type=\"custom\"/>"
					+ "</div>";
		})
		// 按照下标分组
		.groupBy(function(elem, index){
			return Math.floor(index / MAGIC_EMOJI_COUNT_PER_LINE);
		})
		// 增加wrapper
		.map(function(elem){
			var currentLineHtml = elem.join("");

			return "<li class=\"line-container e-face\">" + currentLineHtml + "</li>";
		})
		// 结束链式调用
		.value()
		// 把数组拼接成字符串
		.join("");

		return currentPageHtml;
	})
	.value();
}

function _initNavigator(packageList){
	var packageNameList = _.pluck(packageList, "packageName");
	var navigatorWrapper = dom.querySelector(".navigator-wrapper");
	var navigatorContainer = navigatorWrapper.querySelector(".navigator-container");
	var navigatorItemList;

	// 增加系统默认图标导航
	packageNameList.unshift(__("chat.default_emoji"));

	navigatorContainer.innerHTML = _.map(packageNameList, function(name, index){
		// todo: xss defence
		return "<li class=\"navigator-item e-face\" data-page-index=\"" + index + "\">" + name + "</li>";
	}).join("");

	navigatorItemList = _.toArray(navigatorContainer.querySelectorAll(".navigator-item"));

	utils.live(".navigator-item", domUtils.CLICK, function(ev){
		var event = window.event || ev;
		var target = event.srcElement || event.target;
		var targetIndex = +target.getAttribute("data-page-index");

		domUtils.addClass(target, "selected");
		_.each(emojiContainerList, function(elem, index){
			var emojiContainer = elem;
			var navigatorItem = navigatorItemList[index];
			var isTargetElement = targetIndex === index;

			domUtils.toggleClass(emojiContainer, "hide", !isTargetElement);
			domUtils.toggleClass(navigatorItem, "selected", isTargetElement);

			// 自定义表情面板懒加载
			if(
				isTargetElement
				&& index !== 0
				&& !loadedEmojiPageIndexList.has(index)
			){
				emojiContainerList[index].innerHTML = customEmojiPackageHtmlList[index - 1];
				loadedEmojiPageIndexList.add(index);
			}
		});
	}, navigatorContainer);

	// init scroll
	setTimeout(function(){
		_initScroll({
			navigatorWrapper: navigatorWrapper,
			navigatorContainer: navigatorContainer,
			navigatorItemList: navigatorItemList,
		});
	}, 0);

	// 选取第一个item
	domUtils.addClass(navigatorContainer.querySelector(".navigator-item"), "selected");

	// 显示导航栏
	domUtils.removeClass(navigatorWrapper, "hide");
}

function _initScroll(domList){
	var SCROLL_BUTTON_WIDTH = 30;
	var navigatorWrapper = domList.navigatorWrapper;
	var navigatorContainer = domList.navigatorContainer;
	var navigatorItemList = domList.navigatorItemList;
	var scrollLeftButton = navigatorWrapper.querySelector(".scroll-left");
	var scrollRightButton = navigatorWrapper.querySelector(".scroll-right");
	var containerWidth = _getElementWidth(navigatorContainer) - (SCROLL_BUTTON_WIDTH * 2);
	var sumOfAllContentWidth = _.chain(navigatorItemList)
	.map(function(elem){
		return _getElementWidth(elem);
	})
	.reduce(function(a, b){
		return a + b;
	}, 0)
	.value();

	if(sumOfAllContentWidth > containerWidth){
		_updateScrollButtonStatus();

		utils.on(scrollLeftButton, domUtils.CLICK, _handleScrollButton);
		utils.on(scrollRightButton, domUtils.CLICK, _handleScrollButton);
	}

	function _handleScrollButton(ev){
		var event = window.event || ev;
		var target = event.srcElement || event.target;
		var isDisabled = domUtils.hasClass(target, "disabled");
		var isLeftButton = domUtils.hasClass(target, "scroll-left");
		var isRightButton = domUtils.hasClass(target, "scroll-right");

		if(isDisabled) return;

		if(isLeftButton){
			_setContentOffset(+containerWidth);
		}
		else if(isRightButton){
			_setContentOffset(-containerWidth);
		}
		else{
			throw new Error("unexpected button triggered");
		}

		_updateScrollButtonStatus();
	}
	function _setContentOffset(offset){
		var currentLeftOffset = navigatorContainer.getBoundingClientRect().left
			- navigatorWrapper.getBoundingClientRect().left;
		var targetOffset = currentLeftOffset + offset;
		var maxOffset = 0;
		var minOffset = -(sumOfAllContentWidth - containerWidth);

		if(targetOffset > maxOffset){
			targetOffset = maxOffset;

		}
		else if(targetOffset < minOffset){
			targetOffset = minOffset;
		}
		if(targetOffset !== currentLeftOffset){
			navigatorContainer.style.left = targetOffset + "px";
		}
	}
	function _updateScrollButtonStatus(){
		var currentLeftOffset = navigatorContainer.getBoundingClientRect().left
			- navigatorWrapper.getBoundingClientRect().left;

		domUtils.toggleClass(scrollLeftButton, "disabled", currentLeftOffset === 0);
		domUtils.toggleClass(scrollRightButton, "disabled", (-currentLeftOffset + containerWidth) >= sumOfAllContentWidth);
	}
	function _getElementWidth(elem){
		var domRect = elem.getBoundingClientRect();

		// IE8 doesn't support width / height property
		return domRect.width || (domRect.right - domRect.left);
	}
}

function _loadSystemEmojiPackage(){
	var path = _const.EMOJI_PATH;

	systemEmojiContainer.innerHTML = _.chain(_const.EMOJI_MAP)
	// 生成图标html
	.map(function(value, key){
		// 基于 html 页面地址加载
		return "<div class=\"emoji-bg e-face\">"
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
		// todo: discard line-container
		return "<li class=\"line-container e-face\">" + elem.join("") + "</li>";
	})
	// 结束链式调用
	.value()
	// 把数组拼接成字符串
	.join("");
}

var _const = require("@/common/const");

var EMOJI_PATH = _const.EMOJI_PATH;
var EMOJI_MAP = _const.EMOJI_MAP;

var protocol = /(((ftp|https?):)?\/\/)/;
var auth = /([-._0-9a-zA-Z]+(:[-._0-9a-zA-Z]+)?@)?/;
var host = /((\d+\.\d+\.\d+\.\d+)|(([-_0-9a-zA-Z_]+\.)+[a-zA-Z]+))/;
var port = /(:\d+)?/;
var path = /(\/[^ ?<">\n]*)*/;
var query = /(\?([-+._%0-9a-zA-Z]+=[^ &#'"\n]*&)*([-+._%0-9a-zA-Z]+=[^ &#'"\n]*))?/;
var hash = /(#[-+._%0-9a-zA-Z/]*)?/;
var commonConfig = require("@/common/config");
var profile = require("@/app/tools/profile");

var URL_RE = new RegExp(
	[protocol, auth, host, port, path, query, hash]
	.map(function(regExp){
		return regExp.source;
	})
	.join(""), "i");
// var URL_RE = /(https?:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/i;

module.exports = {
	parse: parse,
	unescape: _unescape,
	getTextMessageBrief: getTextMessageBrief,
};

// 从消息通道来的消息需要 _unescape
function _unescape(str){
	if(typeof str !== "string") return "";

	return str
	.replace(/&#39;/g, "'")
	.replace(/&quot;/g, "\"")
	.replace(/&lt;/g, "<")
	.replace(/&gt;/g, ">")
	// &amp; 要最后处理
	.replace(/&amp;/g, "&");
}

function getTextMessageBrief(text,isReceived){
	var textMap = parse(text,null,isReceived);
	return _.map(textMap, function(fragment){
		var value = fragment.value;
		var type = fragment.type;

		switch(type){
		case "ENCODED_TEXT":
			return value
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/\n/mg, " ");
		case "LINK":
		case "CUSTOM_LINK":
			return __("message_brief.link");
		case "EMOJI":
			return __("message_brief.emoji");
		default:
			console.error("unexpect fragment type: " + type);
			return "";
		}
	}).join("");
}

function parse(text,opt,isReceived){
	opt = opt || {};
	var isNoLink = profile.isNoLink;
	if(typeof text !== "string") return "";
	var list;
	// 开了不解析访客端链接的开关情况
	if(!!isNoLink && typeof(isReceived) != "undefined" && !isReceived){
		list = [
			_emojiParser,
			_encodeParser
		]
	}
	else{
		list = [
			_emojiParser,
			_customLinkParser,
			_linkParser,
			_encodeParser
		]
		if(opt.default){
			list = [
				_emojiParser,
				_linkParser,
				_encodeParser
			]
		}
	}

	return _.reduce(list, function(result, parser){
		return _parseMap(result, parser);
	}, [{
		type: "UNPARSED",
		value: text,
		baseIndex: 0,
	}]);
}

function _encodeParser(text){
	var newStr = text
	// 此处 & 要先处理
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;");

	return {
		type: "ENCODED_TEXT",
		index: 0,
		oldStr: text,
		newStr: newStr,
	};
}

function _linkParser(text){
	var result = text.match(URL_RE);
	var targetLink;
	var hasProtocol;
	var taggedLink;
	var index;

	if(!result) return null;

	targetLink = result[0];
	index = result.index;
	hasProtocol = /^https?/i.test(targetLink);
	var color = "";
	var themeClassName;
	var config = commonConfig.getConfig();
	var themeName = config.ui.themeName;
	if(themeName && themeName.indexOf("theme_custom") > -1){
		var arr = themeName.split("theme_custom");
		color = arr[1];
		themeClassName = "theme_custom";
	}
	else{
		themeClassName = _const.themeMap[config.themeName];
	}
	var hoverColor = $("body." + themeClassName + " .border-color").css("borderColor");
	if(!color){
		color = hoverColor || '#fff !important';
	}
	taggedLink = "<a  style=\"color:" +color+ ";\" href=\""
		+ (hasProtocol ? targetLink : "//" + targetLink)
		+ "\" target=\"_blank\">"
		+ targetLink
		+ "</a>";

	return {
		index: index,
		oldStr: targetLink,
		newStr: taggedLink,
		type: "LINK",
	};
}

function _customLinkParser(text){
	var re = /<a[^>]+>[^<>]+<\/a>/i;
	var matchResult = text.match(re);
	var divDom;
	var matchedText;
	var index;
	var aDom;
	var href;
	var cloneADom;

	if(!matchResult) return null;

	matchedText = matchResult[0];
	index = matchResult.index;

	divDom = document.createElement("div");
	divDom.innerHTML = matchedText;
	aDom = divDom.childNodes[0];

	if(
		aDom
		&& aDom.tagName === "A"
		&& URL_RE.test(href = aDom.href)
	){
		cloneADom = document.createElement("a");
		cloneADom.href = href;
		cloneADom.target = "_blank";
		cloneADom.innerText = aDom.innerText;

		return {
			index: index,
			oldStr: matchedText,
			newStr: cloneADom.outerHTML,
			type: "CUSTOM_LINK",
		};
	}

	return null;
}

function _emojiParser(text){
	var key;
	var value;
	var index;

	for(key in EMOJI_MAP){
		if(Object.prototype.hasOwnProperty.call(EMOJI_MAP, key)){
			value = EMOJI_MAP[key];
			index = text.indexOf(key);
			if(~index){
				return {
					index: index,
					oldStr: key,
					newStr: "<img class=\"emoji\" src=\"" + EMOJI_PATH + value + "\">",
					type: "EMOJI",
				};
			}
		}
	}

	return null;
}

function _parseMap(map, parser){
	return _.chain(map)
	.each(function(fragment, fragmentIndex, array){
		var baseIndex = fragment.baseIndex;
		var text = fragment.value;
		var wholeLength = text.length;
		var result = [];
		var parsed;
		var oldStr;
		var newStr;
		var beginIndex;
		var endIndex;
		var type;

		if(fragment.type !== "UNPARSED") return;

		parsed = parser(text);

		if(parsed === null) return;

		newStr = parsed.newStr;
		oldStr = parsed.oldStr;
		type = parsed.type;
		beginIndex = parsed.index;
		endIndex = beginIndex + oldStr.length;


		// 将前边的内容加入结果集
		if(beginIndex !== 0){
			result.push({
				baseIndex: baseIndex,
				type: "UNPARSED",
				value: text.substring(0, beginIndex),
			});
		}

		result.push({
			baseIndex: baseIndex + beginIndex,
			type: type,
			value: newStr,
		});

		// 将匹配内容后面的加入结果集
		if(endIndex !== wholeLength){
			result.push({
				baseIndex: baseIndex + endIndex,
				type: "UNPARSED",
				value: text.substring(endIndex, wholeLength),
			});
		}

		_parseMap(result, parser);

		array.splice(fragmentIndex, 1, result);
	})
	.flatten()
	.sortBy("baseIndex")
	.value();
}

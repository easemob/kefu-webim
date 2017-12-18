var _const = require("../../../common/const");

var EMOJI_PATH = _const.EMOJI_PATH;
var EMOJI_MAP = _const.EMOJI_MAP;
var URL_RE = /(https?:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/i;

module.exports = {
	parse: parse,
	getTextMessageBrief: getTextMessageBrief,
};

// 从消息通道来的消息需要 _unescape
function _unescape(str){
	if(typeof str !== "string") return "";

	return str
	.replace(/&amp;/g, "&")
	.replace(/&#39;/g, "'")
	.replace(/&quot;/g, "\"")
	.replace(/&lt;/g, "<")
	.replace(/&gt;/g, ">");
}

function getTextMessageBrief(text){
	var textMap = parse(text);
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

function parse(text){
	if(typeof text !== "string") return "";

	return _.reduce([
		_emojiParser,
		_customLinkParser,
		_linkParser,
		_encodeParser,
	], function(result, parser){
		return _parseMap(result, parser);
	}, [{
		type: "UNPARSED",
		value: _unescape(text),
		baseIndex: 0,
	}]);
}

function _encodeParser(text){
	var newStr = text
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
	taggedLink = "<a href=\""
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

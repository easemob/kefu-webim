var utils = require("@/common/utils");
var _const = require("@/common/const");
var commonConfig = require("@/common/config");
var profile = require("./profile");
var textParser = require("./textParser");
var moment = require("moment");
var apiHelper = require("../pages/main/apis");

var LOADING = Modernizr.inlinesvg ? _const.loadingSvg : "<img src=\"//kefu.easemob.com__WEBIM_SLASH_KEY_PATH__/webim/static/img/loading.gif\" width=\"20\" style=\"margin-top:10px;\"/>";

// channel.js 放着消息列表的构建，是不对的
function genMsgContent(msg){
	// console.log(msg)
	var type = msg.type;
	var value = msg.data;
	var laiye = msg.laiye;
	var rulai = msg.rulai;
	var relatedRules;
	var html = "";
	var msgContent;
	var ruleId;
	var answerId;
	var relatedRuleIds;

	switch(type){
	case "txt":
		if(profile.grayList.rulaiRobotRichText && rulai){
			html = "<span class=\"text\">";
			html += value;
			html += "</span>";
			break;
		}
		else if(laiye){
			var tmpDiv = document.createElement("div");
			tmpDiv.innerHTML = value;
			utils.addClass(tmpDiv.getElementsByTagName("img"), "em-widget-imgview");
			value = tmpDiv.innerHTML;
			html = "<span class=\"text\">" + value + "</span>";
			break;
		}
		else{
			value = textParser.parse(value);
			// 历史消息以及收到的实时消息
			html = "<span class=\"text\">" + _.map(value, function(fragment){
				return fragment.value;
			}).join("") + "</span>";
			break;
		}

	case "txtLink":
		html = value;
		break;
	case "img":
		// todo: remove a
		html = "<a href=\"javascript:;\"><img class=\"em-widget-imgview\" src=\""
			+ msg.url + "\"/></a>";
		break;
	case "customMagicEmoji":
		// 给图片消息或附件消息的url拼上hostname
		if(msg.url && !/^https?/.test(msg.url)){
			msg.url = location.protocol + commonConfig.getConfig().domain + msg.url;
		}
		// todo: remove a
		html = "<a href=\"javascript:;\"><img class=\"em-widget-imgview\" src=\""
			+ msg.url + "\"/></a>";
		break;
	// 这个消息类型包含了很多子类型
	case "list":
		if(profile.grayList.rulaiRobotRichText && rulai){
			html = "<span class=\"text\">";
			html += value;
			html += "</span>";
			html += msg.list;
			break;
		}
		else if(laiye){
			html = "<p>" + value + "</p>" + msg.list;
			break;
		}
		else{
			value = textParser.parse(value);
			value = _.map(value, function(fragment){ return fragment.value; }).join("");
			html = "<p>" + value + "</p>" + msg.list;
			break;
		}


	case "file":
		// 历史会话中 filesize = 0
		// 访客端发文件消息 filesize = undefined
		// 需要过滤这两种情况，暂时只显示坐席发过来的文件大小
		html = "<i class=\"icon-attachment container-icon-attachment\"></i>"
			+ "<span class=\"file-info\">"
			+ "<p class=\"filename\">" + msg.filename + "</p>"
			+ "<p class=\"filesize\">" + utils.filesizeFormat(msg.fileLength) + "</p>"
			+ "</span>"
			+ "<a target=\"_blank\" href=\"" + msg.url
			+ "\" class=\"icon-download container-icon-download\" title=\""
			+ msg.filename + "\" download=\"" + msg.filename + "\"></a>";
		break;
		// 小视频类型
	case "video":
		// html = "<video class=\"video-btn\"  controls src=\"" + msg.url + " \">"
		// 		+ "<source  src=\"" + msg.url + " \" type=\"video/mp4\"></source>"
		// 		+ "<source  src=\"" + msg.url + " \" type=\"video/webm\"></source>"
		// 		+ "<source  src=\"" + msg.url + " \" type=\"video/ogg\"></source>"
		// 	   + "</video>";
		// break;
		//
		html = "<video poster=\"" + msg.thumb + "\" class=\"video-btn\"  controls src=\"" + msg.url + " \">"
				+ "<source  src=\"" + msg.url + " \" type=\"video/mp4\"></source>"
				+ "<source  src=\"" + msg.url + " \" type=\"video/webm\"></source>"
				+ "<source  src=\"" + msg.url + " \" type=\"video/ogg\"></source>"
			   + "</video>";
		break;
	case "html-form":
		msgContent = msg.ext.msgtype.html;
		html = "<a class=\"form-url\" target=\"_blank\" href=" + msgContent.url + "></a>"
			+ "<div class=\"form-content\">"
			+ "<span class=\"title\">" + msgContent.topic + "</span>"
			+ "<span class=\"desc\">" + msgContent.desc + "</span>"
			+ "</div>"
			+ "<div class=\"form-aside\">"
			+ "<i class=\"icon-form\"></i>"
			+ "</div>";
		break;
	case "track":
	case "order":
		msgContent = msg.ext.msgtype.track || msg.ext.msgtype.order;
		html = [
			msgContent.title ? "<h1>" + msgContent.title + "</h1>" : "",
			msgContent.order_title ? "<h2>" + msgContent.order_title + "</h2>" : "",
			msgContent.img_url ? "<div><img src='" + msgContent.img_url + "'/></div>" : "",
			msgContent.desc ? "<p>" + msgContent.desc + "</p>" : "",
			msgContent.price ? "<span>" + msgContent.price + "</span>" : "",
			msgContent.item_url ? "<a target='_blank' href='" + msgContent.item_url + "'></a>" : "",
		].join("");
		break;
	default:
		throw new Error("unexpected value type.");
	}

	if(msg.ext &&  msg.ext.relatedRules){
		relatedRules = msg.ext.relatedRules;
		ruleId = relatedRules.ruleId;
		answerId = relatedRules.answerId;
		relatedRuleIds = relatedRules.relatedRuleIds;
		html += "<div class=\"em-btn-list\">" + _.map(msg.ext.relatedRules.questions, function(question, index){ return "<button class=\"js_robotRelateListbtn bg-hover-color\" data-ruleId=" + ruleId + " data-answerId=" + answerId + " data-relatedRuleId=" + relatedRuleIds[index] + ">" + question + "</button>";}).join("") || "";
	}

	return html;
}

function _getAvatar(msg){
	var officialAccountType = utils.getDataByPath(msg, "ext.weichat.official_account.type");
	var avatarFromOfficialAccountExt = utils.getDataByPath(msg, "ext.weichat.official_account.img");
	var avatarFromMessageExt = utils.getDataByPath(msg, "fromUser.img");
	var avatarFromCurrentAgent = profile.systemAgentAvatar;
	var avatar;

	if(officialAccountType === "CUSTOM"){
		avatar = avatarFromOfficialAccountExt;
	}
	else if(profile.isAgentNicknameEnable){
		avatar = avatarFromMessageExt || avatarFromCurrentAgent;
	}
	else{
		avatar = profile.tenantAvatar || profile.defaultAvatar;
	}

	return avatar || profile.tenantAvatar || profile.defaultAvatar;
}
// "For <strong><em>account </em></strong>related issues, choose one of these topics, or briefly describe what you need."
function _getRulaiHtml(content){

}

function genDomFromMsg(msg, isReceived, isHistory){
	// console.log(msg)
	var id = msg.id;
	var type = msg.type;
	var html = "";
	var dom = document.createElement("div");
	var direction = isReceived ? "left" : "right";
	var articleDom;

	if(type === "article"){
		var msgArticles = utils.getDataByPath(msg, "ext.msgtype.articles");
		var articleNode;
		var showDirectly = msgArticles.some(function(item){
			return item.show_directly === true;
		});
		if(showDirectly){
			if(msgArticles.length === 1){
				articleDom = apiHelper.getArticleHtml(msgArticles[1].url);
				articleNode = "" +
					"<div class=\"article-msg-outer article-item only-one-article\">" +
					articleDom +
					"</div>";
			}
			else{
				articleNode = ""
					+ _.map(msgArticles, function(item, index){
						var str = "";
						if(item.show_directly){
							articleDom = apiHelper.getArticleHtml(msgArticles[1].url);
							
							str =  "<div class=\"article-msg-outer more-articles specialArticle\" style=\"margin-bottom:6px;\">" + "<div>" + articleDom.responseText + "</div></div>";
						}
						else{

							str =  "<div class=\"article-msg-outer more-articles\" style=\"margin-bottom:6px;\">" + "<div class=\"article-item rest-item\">" +
							"<div class=\"title-wrapper\"><p class=\"title\">" + item.title + "</p></div>";
							str += "<img class=\"cover-img\" src=\"" + item.picurl + "\"/>" +
							"<div class=\"article-link\" style=\"cursor: pointer\"><span>" + item.url + "</span></div>" +
							"</div></div>";
						}
						
						return str;
					}).join("") || "";
			}
		}
		else if(msgArticles.length === 1){
			var date = msgArticles[0].createdTime ? moment(msgArticles[0].createdTime).format(__("config.article_timestamp_format"))
						: moment(msgArticles[0].date).format(__("config.article_timestamp_format"));
			articleNode = "" +
						"<div class=\"article-msg-outer article-item only-one-article\">" +
							"<div class=\"body\">" +
								"<h3 class=\"title\">" + msgArticles[0].title + "</h3>" +
								"<p class=\"create-time\">" + date + "</p>" +
								"<img class=\"cover\" src=\"" + msgArticles[0].picurl + "\"/>" +
								"<div class=\"desc\"><p>" + msgArticles[0].description + "</p></div>" +
							"</div>" +
							"<div class=\"footer\"><span class=\"look-article\">" + __("chat.read_full_version") + "</span><i class=\"icon-arrow-right\"></i></div>" +
							// "<a class=\"article-link\" target=\"_blank\" href=\"" + msgArticles[0].url + "\"></a>" +
							"<div class=\"article-link\" data-status=\"" + msgArticles[0].sendCustomer + "\"><span>" + msgArticles[0].url + "</span></div>" +
						"</div>";
		}
		else{
			articleNode = "<div class=\"article-msg-outer more-articles\">"
						+ _.map(msgArticles, function(item, index){
							var str = "";
							if(index === 0){
								str = "<div class=\"article-item first-item\">" +
								"<h3 class=\"title\">" + item.title + "</h3>";
							}
							else{
								str = "<div class=\"article-item rest-item\">" +
								"<div class=\"title-wrapper\"><p class=\"title\">" + item.title + "</p></div>";
							}
							str += "<img class=\"cover-img\" src=\"" + item.picurl + "\"/>" +
								// "<a class=\"article-link\" target=\"_blank\" href=\"" + item.url + "\"></a>" +
								"<div class=\"article-link\"><span>" + item.url + "</span></div>" +
								"</div>";
							return str;
						}).join("") || ""
						+ "</div>";
		}
		dom.className = "article-message-wrapper";
		dom.innerHTML = articleNode;
		return dom;
	}

	// 设置消息气泡显示在左侧还是右侧
	// .em-widget-right, .em-widget-left used here
	dom.className = "em-widget-" + direction;

	// 给消息追加id，用于失败重发消息或撤回消息
	if(id){
		dom.id = id;
	}

	// 坐席消息头像
	if(direction === "left"){
		html += "<img class=\"avatar\" src=\"" + _getAvatar(msg) + "\">";
	}

	// wrapper 开始
	html += "<div class=\"em-widget-msg-wrapper msgtype-" + (msg.subtype || type) + "\">";

	// 设置消息气泡的突起位置
	// .icon-corner-right, .icon-corner-left used here
	html += "<i class=\"icon-corner-" + direction + "\"></i>";

	// 发出的消息增加状态显示
	if(!isReceived && !isHistory && id){
		// todo: 只拼一遍 id
		// todo: 去掉 type
		html += "<div id=\"" + id
			+ "_failed\" data-type=\"" + type + "\" class=\"em-widget-msg-status hide\">"
			+ "<span>" + __("common.send_failed") + "</span><i class=\"icon-circle\"><i class=\"icon-exclamation\"></i></i></div>"
			+ "<div id=\"" + id
			+ "_loading\" class=\"em-widget-msg-loading\">" + LOADING + "</div>";
	}

	// todo: simplify the class name em-widget-msg
	// container 开始
	// .em-widget-msg-* used here
	html += "<div class=\"em-widget-msg-container em-widget-msg-" + type + "\">";
	// 消息内容


	var data = msg.data;
	var laiye = msg.laiye;
	var laiyeType;
	// 如来机器人，支持富文本展示
	if(profile.grayList.rulaiRobotRichText && isJsonString(data)){
		data = JSON.parse(data);
		data.forEach(function(item){
			if(item.type == "richText"){
				msg.data = item.content;
				msg.rulai = true;
				html += genMsgContent(msg);
			}
		});
	}
	else if(laiye && isJsonString(data) && (msg.type == "txt" || msg.type == "list")){
		data = JSON.parse(data);
		laiyeType = msg.type;
		data.forEach(function(item){
			msg.data = item.content;
			if(item.type == "text"){
				msg.type = "txt";
			}
			else if(item.type == "image"){
				msg.type = "img";
				msg.url = item.content;
			}
			else if(item.type == "richtext"){
				var articleDom = apiHelper.getlaiyeHtml(item.content);
				msg.data = articleDom.response;
				msg.type = "txt";
			}
			else{
				msg.type = item.type;
			}
			msg.laiye = laiye;
			html += genMsgContent(msg);

		});
		if(laiyeType == "list" || (msg.multipleMsgOneByOne && msg.list)){
			html += msg.list;
		}
	}
	else{
		html += genMsgContent(msg);
		if(msg.multipleMsgOneByOne && msg.list){
			html += msg.list;
		}
	}


	// container 结束
	html += "</div>";

	// 单独的转人工按钮（txt、）
	if(!utils.getDataByPath(msg, "ext.msgtype.choice") && utils.getDataByPath(msg, "ext.weichat.ctrlType") === "TransferToKfHint"){
		var ctrlArgs = msg.ext.weichat.ctrlArgs;
		var transferToHumanButtonInfo = msg.ext.weichat.transferToHumanButtonInfo;
		var disabledClass = profile.shouldMsgActivated(ctrlArgs.serviceSessionId) ? "" : "disabled";
		// // 判断英文状态开关是否打开状态，打开改变label的字段
		// var resRoobot;
		// try{
		// 	resRoobot = JSON.parse(apiHelper.getRobotNotReachableENEnable().response);
		// }
		// catch(e){
		// 	console.log(e)
		// }
		// if(resRoobot.status == "OK" ){
		// 	if(resRoobot.entities.length != 0 && resRoobot.entities[0].optionValue){
		// 		ctrlArgs.label = "Chat with agent"
		// 	}else{
		// 		ctrlArgs.label
		// 	}
		// }else{
		// 	console.log("unexpected response value.");
		// }

		if(transferToHumanButtonInfo && transferToHumanButtonInfo.suggestionTransferToHumanLabel != null){
			html += "<div class=\"em-btn-list\">"
			+ "<button "
				+ "class=\"white bg-color border-color bg-hover-color-dark js_robotTransferBtn " + disabledClass + "\" "
				+ "data-sessionid=\"" + ctrlArgs.serviceSessionId + "\" "
				+ "data-id=\"" + ctrlArgs.id + "\" "
				+ "data-transferToHumanId=\"" + transferToHumanButtonInfo.transferToHumanId + "\" "
			+ ">" + transferToHumanButtonInfo.suggestionTransferToHumanLabel + "</button>"
		+ "</div>";
		}
		// 英文状态开关可能会有问题，这里用语言状态来判断
		else{
			ctrlArgs.label = __("config.language") === "zh-CN" ? ctrlArgs.label : "Chat with agent";
			html += "<div class=\"em-btn-list\">"
				+ "<button "
					+ "class=\"white bg-color border-color bg-hover-color-dark js_robotTransferBtn " + disabledClass + "\" "
					+ "data-sessionid=\"" + ctrlArgs.serviceSessionId + "\" "
					+ "data-id=\"" + ctrlArgs.id + "\" "
				+ ">" + ctrlArgs.label + "</button>"
			+ "</div>";
		}
	}

	// wrapper 结尾
	html += "</div>";

	dom.innerHTML = html;
	return dom;
}

function isJsonString(str){
	try{
		if(typeof JSON.parse(str) == "object"){
			return true;
		}
	}
	catch(e){
	}
	return false;
}

module.exports = genDomFromMsg;

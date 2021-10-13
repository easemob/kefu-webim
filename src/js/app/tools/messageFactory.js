var utils = require("@/common/utils");
var _const = require("@/common/const");
var commonConfig = require("@/common/config");
var profile = require("./profile");
var textParser = require("./textParser");
var moment = require("moment");
var apiHelper = require("../pages/main/apis");

var LOADING = Modernizr.inlinesvg ? _const.loadingSvg : "<img src=\"//kefu.easemob.com__WEBIM_SLASH_KEY_PATH__/webim/static/img/loading.gif\" width=\"20\" style=\"margin-top:10px;\"/>";

// channel.js 放着消息列表的构建，是不对的
function genMsgContent(msg, opt){
	var notFromSystem = false;
	// 历史消息里的
	if(msg.fromUser && msg.type !== "customMagicEmoji"){
		var fromType = utils.getDataByPath(msg, "fromUser.user_type");
		if(fromType !== "Scheduler" && fromType !== "Robot"){
			notFromSystem = true;
		}
	}
	// 实时消息里的
	if(opt.notFromSystem && msg.type !== "customMagicEmoji"){
		var fromType = utils.getDataByPath(msg, "ext.weichat.agent.userType");
		if(msg.ext.weichat.agent && fromType == "Agent"){
			notFromSystem = true;
		}
		else if(msg.ext.weichat.agent && fromType == "Robot"){
			notFromSystem = false;
		}
		else if(msg.ext.weichat.agent && !fromType){
			notFromSystem = false;
		}
		else{
			notFromSystem = opt.notFromSystem;
		}
	}

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
			value =  notFromSystem ? textParser.parse(value, { "default": true }) : textParser.parse(value);
			
			// 历史消息以及收到的实时消息
			if(utils.isMobile && value[0].type == "ENCODED_TEXT"){
				html = "<span class=\"text\">";
				html += _.map(value, function(fragment){
					// 识别号码
					return validatePhoneInTxt(fragment.value);
				}).join("");
				html += "</span>";
								// 历史消息以及收到的实时消息
								// html = "<span class=\"text\">" + _.map(value, function(fragment){
								// 	return fragment.value;
								// }).join("") + "</span>";
			}
			else{
				// 历史消息以及收到的实时消息
				html = "<span class=\"text\">" + _.map(value, function(fragment){
					return fragment.value;
				}).join("") + "</span>";
			}
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
		if(msg.url && !/^http?/.test(msg.url)){
			// commonConfig.getConfig().domain 有时有http?有时没有？
			if(/^http?/.test(commonConfig.getConfig().domain)){
				msg.url = commonConfig.getConfig().domain + msg.url;
			}
			else{
				msg.url = location.protocol + commonConfig.getConfig().domain + msg.url;
			}
		}
		// todo: remove a
		html = "<a href=\"javascript:;\"><img class=\"em-widget-imgview\" src=\""
			+ msg.url + "\"/></a>";
		break;
	// 这个消息类型包含了很多子类型
	case "list":
		if(profile.grayList.rulaiRobotRichText && rulai){
			var newValue;
			if(value.indexOf("<img") > -1){
				var reg = new RegExp("<img", "g");
				newValue = value.replace(reg, "<img class='em-widget-imgview' ");
			}
			else{
				newValue = value;
			}
			html = "<span class=\"text\">";
			html += newValue;
			html += "</span>";
			html += msg.list;
			break;
		}
		else if(laiye){
			html = "<div class='list-title'>" + value + "</div>" + msg.list;
			break;
		}
		else{
			value = textParser.parse(value);
			value = _.map(value, function(fragment){ return fragment.value; }).join("");
			html = "<div class='list-title'>" + value + "</div>" + msg.list;
			break;
		}
	case "file":
		// 历史会话中 filesize = 0
		// 访客端发文件消息 filesize = undefined
		// 需要过滤这两种情况，暂时只显示坐席发过来的文件大小
		var newUrl;
		if(msg.url.indexOf("blob:") == 0){
			newUrl = msg.url;
		}
		else{
			newUrl = msg.url.replace("http:", "https:");
		}
		html = "<i class=\"icon-attachment container-icon-attachment\"></i>"
			+ "<span class=\"file-info\">"
			+ "<p class=\"filename\">" + msg.filename + "</p>"
			+ "<p class=\"filesize\">" + utils.filesizeFormat(msg.fileLength) + "</p>"
			+ "</span>"
			+ "<a target=\"_blank\" href=\"" + newUrl
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
		if(utils.isMobile){
			// 取第一帧，安卓黑屏
			var newUrl = msg.url + "#t=1";

			html = "<video preload='metadata'  poster=\"" + msg.thumb + "\" data-url=\"" + msg.url + " \" class=\"video-btn video-btn-android\" x5-video-player-type='h5' src=\"" + newUrl + " \">"
			+ "<source  src=\"" + msg.url + " \" type=\"video/mp4\"></source>"
			+ "<source  src=\"" + msg.url + " \" type=\"video/webm\"></source>"
			+ "<source  src=\"" + msg.url + " \" type=\"video/ogg\"></source>"
			+ "</video>"
			+ "<div class='icon-play-box'><i class='icon-play'></i></div>";
		}
		else{
			html = "<video controls height='300'  class=\"video-btn\" src=\"" + msg.url + " \">"
			+ "<source  src=\"" + msg.url + " \" type=\"video/mp4\"></source>"
			+ "<source  src=\"" + msg.url + " \" type=\"video/webm\"></source>"
			+ "<source  src=\"" + msg.url + " \" type=\"video/ogg\"></source>"
			+ "</video>";
		}
		
		
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
	case "article":
		var msgArticles = utils.getDataByPath(msg, "ext.msgtype.articles");
		var articleNode = "";
		var showDirectly = utils.getDataByPath(msg, "ext.msgtype.showDirectly");
		var cardViewOption = utils.getDataByPath(msg, "ext.msgtype.cardViewOption");
		if(showDirectly){
			if(cardViewOption == "SLIDE"){
				html = "<div class=\"article-msg-outer more-articles specialArticle directly-article-drawer\" style=\"margin-bottom:6px;\">"
				+ _.map(msgArticles, function(item, index){
					var str = "";
					articleDom = apiHelper.getArticleHtml(msgArticles[index].url);
					// var uuid = utils.uuid();
					articleTextDom = utils.createElementArticleFromHTML(articleDom.responseText);
					// msgArticles[index].url = msgArticles[index].url.replace("http:", "https:");
					// str =  "<div><iframe id=" + uuid + " src=" + msgArticles[index].url + " height=\"500px%\" width=\"100%\" frameborder=\"0\"></iframe></div>";
					utils.addClass(articleTextDom.getElementsByTagName("img"), "em-widget-imgview");
					str =  "<div>" + articleTextDom.getElementsByTagName("div")[0].innerHTML + "</div>";
					
					return str;
				}).join("") || ""
				+ "<div></div></div>";
			}
			else{
				html = _.map(msgArticles, function(item, index){
					var str = "";
					articleDom = apiHelper.getArticleHtml(msgArticles[index].url);
					articleTextDom = utils.createElementArticleFromHTML(articleDom.responseText);
					utils.addClass(articleTextDom.getElementsByTagName("img"), "em-widget-imgview");
						// var uuid = utils.uuid();
						// item.url = item.url.replace("http:", "https:");
					str =  "<div class=\"article-msg-outer more-articles specialArticle\">" + articleTextDom.getElementsByTagName("div")[0].innerHTML;
					return str;
				}).join("") || ""
				+ "</div>";
			}
			
		}
		else if(cardViewOption == "SLIDE"){

			html = "<div class=\"article-msg-outer more-articles  article-drawer\" style=\"margin-bottom:10px;\">"
								+ _.map(msgArticles, function(item, index){
									var date = msgArticles[index].createdTime ? moment(msgArticles[index].createdTime).format(__("config.article_timestamp_format"))
									: moment(msgArticles[index].date).format(__("config.article_timestamp_format"));
									var str = "";
									str = "" +
										"<div class=\"article-msg-outer article-item only-one-article\">" +
											"<div class=\"body\">" +
												"<h3 class=\"title\">" + msgArticles[index].title + "</h3>" +
												"<p class=\"create-time\">" + date + "</p>" +
												"<img class=\"cover\" src=\"" + msgArticles[index].picurl + "\"/>" +
												"<div class=\"desc\"><p>" + msgArticles[index].description + "</p></div>" +
											"</div>" +
											"<div class=\"footer\"><span class=\"look-article\">" + __("chat.read_full_version") + "</span><i class=\"icon-arrow-right\"></i></div>" +
											// "<a class=\"article-link\" target=\"_blank\" href=\"" + msgArticles[0].url + "\"></a>" +
											"<div class=\"article-link\" data-status=\"" + msgArticles[index].sendCustomer + "\"><span>" + msgArticles[index].url + "</span></div>" +
										"</div>";
									return str;

								}).join("") || ""
								+ "</div>";
		}
		else if(msgArticles.length === 1){
			var date = msgArticles[0].createdTime ? moment(msgArticles[0].createdTime).format(__("config.article_timestamp_format"))
								: moment(msgArticles[0].date).format(__("config.article_timestamp_format"));
			html = "" +
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
			html = "<div class=\"article-msg-outer more-articles\">"
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
		
		// dom.className = "article-message-wrapper";

		// 单独的转人工按钮（txt、）
		if(!utils.getDataByPath(msg, "ext.msgtype.choice") && utils.getDataByPath(msg, "ext.weichat.ctrlType") === "TransferToKfHint"){
			var articleTransferNode;
			var ctrlArgs = msg.ext.weichat.ctrlArgs;
			var transferToHumanButtonInfo = msg.ext.weichat.transferToHumanButtonInfo;
			var disabledClass = profile.shouldMsgActivated(ctrlArgs.serviceSessionId) ? "" : "disabled";

			if(transferToHumanButtonInfo && transferToHumanButtonInfo.suggestionTransferToHumanLabel != null){
				html += "<div class=\"em-btn-list\" style=\"max-width: 360px;margin: 0 auto;\">"
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
				html += "<div class=\"em-btn-list\" style=\"max-width: 360px;margin: 0 auto;\">"
					+ "<button "
						+ "class=\"white bg-color border-color bg-hover-color-dark js_robotTransferBtn " + disabledClass + "\" "
						+ "data-sessionid=\"" + ctrlArgs.serviceSessionId + "\" "
						+ "data-id=\"" + ctrlArgs.id + "\" "
					+ ">" + ctrlArgs.label + "</button>"
				+ "</div>";
			}
		}

		// dom.innerHTML = articleNode;
		
		// return dom;
		break;
	default:
		throw new Error("unexpected value type.");
	}

	if(msg.ext &&  msg.ext.relatedRules && msg.ext.relatedRules.questions.length > 0){
		relatedRules = msg.ext.relatedRules;
		ruleId = relatedRules.ruleId;
		answerId = relatedRules.answerId;
		relatedRuleIds = relatedRules.relatedRuleIds;
		html += "<div style='border-top: 1px solid #e5e5e5;margin: 10px -10px 4px;' ></div><div class=\"em-btn-list\">"  + _.map(msg.ext.relatedRules.questions, function(question, index){ return "<li><button class=\"js_robotRelateListbtn fg-color\" data-ruleId=" + ruleId + " data-answerId=" + answerId + " data-relatedRuleId=" + relatedRuleIds[index] + ">" + question + "</button><i class='icon-arrow-right'></i></li>";}).join("") || "";
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

function genDomFromMsg(msg, isReceived, isHistory, opt){
	opt = opt || {};
	// console.log(msg)
	var id = msg.id;
	var type = msg.type;
	var html = "";
	var dom = document.createElement("div");
	var direction = isReceived ? "left" : "right";
	var articleDom;
	var articleTextDom;
	var satisfactionCommentInfo;
	var agentId;
	var satisfactionCommentInvitation;
	
	// 设置消息气泡显示在左侧还是右侧
	// .em-widget-right, .em-widget-left used here
	dom.className = "em-widget-" + direction;

	// 给消息追加id，用于失败重发消息或撤回消息
	if(id){
		dom.id = id;
	}

	// 坐席消息头像
	if(direction === "left"){
		if(utils.isMobile){
			html += "<img class=\"avatar\" src=\"" + _getAvatar(msg) + "\">";
		}
		else if(msg.ext && msg.ext.weichat){
			var name = msg.ext.weichat.agent.userNickname || msg.ext.weichat.official_account.name;
			html += "<span class=\"userNickname\">" + name + "</span>";
		}
	}

	// wrapper 开始
	if(direction === "left"){
		if(type === "customMagicEmoji" || type === "video"){
			html += "<div class=\"em-widget-msg-wrapper no-bg msgtype-" + (msg.subtype || type) + "\">";
		}
		else{
			html += "<div class=\"em-widget-msg-wrapper msgtype-" + (msg.subtype || type) + "\">";
		}
		
		// html += "<i class=\"icon-corner-" + direction + "\"></i>";
	}
	else{
		var myconfig = commonConfig.getConfig();
		var themeName = myconfig.ui.themeName;
		if(themeName && themeName.indexOf("theme_custom") > -1){
			var arr = themeName.split("theme_custom");
			var color = arr[1];
		}
		// 无背景
		if(type === "customMagicEmoji" || type === "img" || type === "video"){
			html += "<div class=\"em-widget-msg-wrapper no-bg msgtype-" + (msg.subtype || type) + "\">";
		}
		// 原背景
		else if(type === "file" || type === "order" || type === "track"){
			html += "<div class=\"em-widget-msg-wrapper msgtype-" + (msg.subtype || type) + "\">";
		}
		else if(color){
			html += "<div class=\"em-widget-msg-wrapper msgtype-" + (msg.subtype || type) + "\" style=\"color:#fff; background: " + color + " \">";
		}
		else{
			html += "<div class=\"em-widget-msg-wrapper bg-color msgtype-" + (msg.subtype || type) + "\">";
		}
		// html += "<i class=\"fg-color icon-corner-" + direction + "\"></i>";
	}

	// 设置消息气泡的突起位置
	// .icon-corner-right, .icon-corner-left used here
	
	

	// 发出的消息增加状态显示
	if(!isReceived && !isHistory && id){
		// todo: 只拼一遍 id
		// todo: 去掉 type
		if(type == "img"){
			html += "<div id=\"" + id
			+ "_failed\" data-type=\"" + type + "\" class=\"em-widget-msg-status hide\">"
			+ "<span>" + __("common.send_failed") + "</span><i class=\"icon-circle\"><i class=\"icon-exclamation\"></i></i></div>"
			+ "<div id=\"" + id
			+ "_loading\" class=\"em-widget-msg-loading\">" + LOADING + "</div>";
		}
		else{
			html += "<div id=\"" + id
			+ "_failed\" data-type=\"" + type + "\" class=\"em-widget-msg-status hide\">"
			+ "<span>" + __("common.send_failed") + "</span><i class=\"icon-circle\"><i class=\"icon-exclamation\"></i></i></div>";
		}
			
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
				var newContent = "";
				if(item.content.indexOf("<img") > -1){
					var reg = new RegExp("<img", "g");
					newContent = item.content.replace(reg, "<img class='em-widget-imgview' ");
				}
				else{
					newContent = item.content;
				}

				msg.data = newContent;
				msg.rulai = true;
				html += genMsgContent(msg, opt);
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
			html += genMsgContent(msg, opt);

		});
		if(laiyeType == "list" || (msg.multipleMsgOneByOne && msg.list)){
			html += msg.list;
		}
	}
	else{
		html += genMsgContent(msg, opt);
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
			html += "<div class=\"em-btn-list\" style=\"padding:0\">"
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
			html += "<div class=\"em-btn-list\" style=\"padding:0\">"
				+ "<button "
					+ "class=\"white bg-color border-color bg-hover-color-dark js_robotTransferBtn " + disabledClass + "\" "
					+ "data-sessionid=\"" + ctrlArgs.serviceSessionId + "\" "
					+ "data-id=\"" + ctrlArgs.id + "\" "
				+ ">" + ctrlArgs.label + "</button>"
			+ "</div>";
		}
	}

	satisfactionCommentInfo = utils.getDataByPath(msg, "ext.weichat.extRobot.satisfactionCommentInfo");
	satisfactionCommentInvitation = utils.getDataByPath(msg, "ext.weichat.extRobot.satisfactionCommentInvitation");
	agentId = utils.getDataByPath(msg, "ext.weichat.agent.userId");

	if(msg.ext &&  satisfactionCommentInvitation){
		html +=  "<div class='statisfy'><span class='statisfyYes' data-satisfactionCommentInfo='" + satisfactionCommentInfo + "' data-agentId='" + agentId + "'><i class=\"icon-resolved\"></i><span>" + __("evaluation.resolved") + "</span></span><span class='statisfyNo' data-satisfactionCommentInfo='" + satisfactionCommentInfo + "' data-agentId='" + agentId + "'><i class=\"icon-unresolved\"></i><span>" + __("evaluation.unsolved") + "</span></span></div>";
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

function validatePhoneInTxt(val){
	var txt = val;
	var phoneList = [];
	// 判断是否有链接，如果有则直接返回链接
	var reg = /(((https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/ig;
	if(reg.test(val)){
		return val;
	}
	var arr = val.split(/[^0-9/?-]/);
	_.map(arr, function(item){
		if(isPhone(item)){
			phoneList.push(item);
		}
	});
	if(phoneList.length){
		_.map(phoneList, function(item){
			var reg = new RegExp(item, "g");
			var newStr = txt.replace(reg, "<a href='tel:" + item + "'>" + item + "</a>");
			txt = newStr;
		});
	}
	return txt;
}

function isPhone(num){
	var varisPhone = /^((0\d{2,3})-)?(\d{5,8})(-(\d{3,}))?$/.test(num);
	var varisMobile = /^1[3456789]\d{9}$/.test(num);
	return (varisPhone || varisMobile);
}

module.exports = genDomFromMsg;

var utils = require("../../../common/utils");
var _const = require("../../../common/const");
var profile = require("../tools/profile");
var textParser = require("../tools/textParser");
var moment = require("moment");

var LOADING = Modernizr.inlinesvg ? _const.loadingSvg : "<img src=\"//kefu.easemob.com__WEBIM_SLASH_KEY_PATH__/webim/static/img/loading.gif\" width=\"20\" style=\"margin-top:10px;\"/>";

function genMsgContent(msg){
	var type = msg.type;
	var value = msg.data;
	var html = "";
	var msgContent;

	switch(type){
	case "txt":
		
		if(isJsonString(value)){
			value = JSON.parse(value);
		}
		else{
			value = textParser.parse(value);
		}
		// 紫金处理 调用地图和保单详情两种情况，operateType:query(详情)，operateType:help(调用地图)

		
		// value = JSON.parse("{\"operateType\":\"help\",\"context\":{\"policyBasePart\":{\"daolujiuyuanFlag\":\"不享有免费道路救援\",\"endDate\":\"2019-07-03\",\"endDateCI\":\"2019-07-03\",\"policyNo\":\"20501913000018000215\",\"policyNoCI\":\"20590913000018000231\",\"riskCode\":\"0501\",\"riskCodeCI\":\"0590\",\"startDate\":\"2018-07-04\",\"startDateCI\":\"2018-07-04\",\"sumPremium\":\"3956\",\"sumPremiumCI\":\"950\",\"underWriteFlag\":\"1\",\"underWriteFlagCI\":\"1\"},\"itemKindDataList\":[{\"amount\":\"122000\",\"kindName\":\"机动车交通事故责任强制保险\",\"premium\":\"950\"},{\"amount\":\"51875.2\",\"kindName\":\"车辆损失保险\",\"premium\":\"2305.25\"},{\"amount\":\"300000\",\"kindName\":\"第三者责任保险\",\"premium\":\"1134.75\"},{\"amount\":\"0\",\"kindName\":\"车损不计免赔\",\"premium\":\"345.79\"},{\"amount\":\"0\",\"kindName\":\"三者不计免赔\",\"premium\":\"170.21\"}]}}");
		
		if(value.operateType && value.operateType === "query"){
		// 紫金处理 调用地图和保单详情两种情况，operateType:query(详情)，operateType:help(调用地图)
			var context = value.context;
			html = "<p style='margin-bottom: 10px;'>尊敬的紫金客户：</p><div style='font-size: 15px;'><span>以下是您的保单信息</span><br/><span style='font-weight: bold'>" + context.policyBasePart.riskNameCI + "</span><br/><span>保单号：" + context.policyBasePart.policyNoCI + "</span><br/><span>保险期限：" + showTime(context.policyBasePart.startDateCI) + "~" + showTime(context.policyBasePart.endDateCI) + "</span><br/><span>保险费：￥" + dealNumber(context.policyBasePart.sumPremiumCI) + "</span><br/><span>保险状态：" + underWriteFlag(context.policyBasePart.underWriteFlagCI) + "</span><br/></div>";
			
			if(context.policyBasePart.riskName){
				html += "<div style='font-size: 15px;margin-top: 10px;'><span>以下是您的保单信息</span><br/><span style='font-weight: bold'>" + context.policyBasePart.riskName + "</span><br/><span>保单号：" + context.policyBasePart.policyNo + "</span><br/><span>保险期限：" + showTime(context.policyBasePart.startDate) + "~" + showTime(context.policyBasePart.endDate) + "</span><br/><span>保险费：￥" + dealNumber(context.policyBasePart.sumPremium) + "</span><br/><span>保险状态：" + underWriteFlag(context.policyBasePart.underWriteFlag) + "</span><br/></div>";
			}

			html += "<div class='itemKindData' style='border-top: 1px solid #d0d0d0;margin: 0 -10px;height: 28px;line-height: 28px;font-size:15px;padding: 6px 10px 0 10px;margin-top: 10px;cursor: pointer;'><span>查看详情</span><span style='float: right;'>&gt</span></div>";
		
			var policyListHtml = "";
			var allNum = 0;
			context.itemKindDataList.forEach(function(item){
				policyListHtml = policyListHtml + "<div style='border-bottom: 1px solid #e5e5e5;padding:10px'><p>" + item.kindName + "</p><span>保额：" + dealNumber(item.amount) + "</span><span style='float: right;'>保费：" + dealNumber(item.premium) + "</span></div>";
				allNum += Number(item.premium);
			});

			var policyHtml = "<div class=''><div style='border-bottom: 1px solid #e5e5e5;height: 40px;line-height: 40px;padding: 0 10px;'>查看保单明细 <span class='icon-close closeItemKindData' style='float: right'></span></div>" + policyListHtml + "</div><div style='height: 40px;line-height: 40px;padding: 0 10px;'><span style='float: right;'>保费合计：" + dealNumber(allNum) + "元</span></div>";
			var itemKindData = document.getElementById("itemKindData");
			
			itemKindData.innerHTML = policyHtml;
		}
		else if(value.operateType && value.operateType === "help"){
			html = "<span class='map' style='color:#009eec;cursor: pointer'>  <i class='icon-location'></i> 选择位置</span><span  class=\"text\"></span>";
		}
		else{
			// 历史消息以及收到的实时消息
			html = "<span  class=\"text\">" + _.map(value, function(fragment){ return fragment.value; }).join("") + "</span>";
		}
		break;
	case "img":
		// todo: remove a
		html = "<a href=\"javascript:;\"><img class=\"em-widget-imgview\" src=\""
			+ msg.url + "\"/></a>";
		break;
	case "customMagicEmoji":
		// 给图片消息或附件消息的url拼上hostname
		if(msg.url && !/^https?/.test(msg.url)){
			msg.url = location.protocol + profile.config.domain + msg.url;
		}
		// todo: remove a
		html = "<a href=\"javascript:;\"><img class=\"em-widget-imgview\" src=\""
			+ msg.url + "\"/></a>";
		break;
	case "txtLink":
		// 历史消息表情未经过im sdk 解析，所以类型为txt
		// fake:  todo: remove this
		html = value;
		break;

	case "list":
		value = textParser.parse(value);
		value = _.map(value, function(fragment){ return fragment.value; }).join("");
		html = "<p>" + value + "</p>" + msg.list;
		break;
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
		html = "<video class=\"video-btn\"  controls src=\"" + msg.url + " \">"
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
	default:
		throw new Error("unexpected value type.");
	}

	return html;
}

function underWriteFlag(flag){
	if(flag == "1"){
		return "保单已生效";
	}
	else if(flag == "4"){
		return "审核通过代缴费";
	}
	else if(flag == "9"){
		return "待核保";
	}
}

function showTime(date){
	var timeDate = new Date(date);
	date = timeDate.getFullYear() + "年" + (timeDate.getMonth() + 1) + "月" + timeDate.getDate() + "日";
	return date;
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

function genDomFromMsg(msg, isReceived, isHistory, satisfactionOption){
	var id = msg.id;
	var type = msg.type;
	var html = "";
	var dom = document.createElement("div");
	var direction = isReceived ? "left" : "right";

	if(type === "article"){
		var msgArticles = utils.getDataByPath(msg, "ext.msgtype.articles");
		var articleNode;
		if(msgArticles.length === 1){
			var date = moment(msgArticles[0].createdTime).format(__("config.article_timestamp_format"));
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
						str += "<img class=\"cover-img\" src=\"" + item.thumbUrl + "\"/>" +
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

	// wrapper开始
	html += "<div class=\"em-widget-msg-wrapper\">";

	// 设置消息气泡的突起位置
	// .icon-corner-right, .icon-corner-left used here
	html += "<i class=\"icon-corner-" + direction + "\"></i>";

	// 发出的消息增加状态显示
	if(!isReceived && !isHistory && id){
		// todo: 只拼一遍id
		// todo: 去掉type
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
	html += genMsgContent(msg);

	// container 结束
	html += "</div>";

	if(!utils.getDataByPath(msg, "ext.msgtype.choice") && utils.getDataByPath(msg, "ext.weichat.ctrlType") === "TransferToKfHint"){
		var ctrlArgs = msg.ext.weichat.ctrlArgs;
		html += "<div class=\"em-btn-list\">"
			+ "<button class=\"white bg-color border-color bg-hover-color-dark js_robotTransferBtn\" "
			+ "data-sessionid=\"" + ctrlArgs.serviceSessionId + "\" "
			+ "data-id=\"" + ctrlArgs.id + "\">" + ctrlArgs.label + "</button>"
		+ "</div>";
	}

	if(satisfactionOption.satisfactionCommentInvitation && !isHistory){
		html += "<div class=\"satisfactionItem\"><span class='statisfyYes iconfont' data-satisfactionCommentInfo='" + satisfactionOption.satisfactionCommentInfo + "' data-agentId='" + satisfactionOption.agentId + "'>&#xe600;</span><span class='statisfyNo iconfont' data-satisfactionCommentInfo='" + satisfactionOption.satisfactionCommentInfo + "' data-agentId='" + satisfactionOption.agentId + "'>&#xe606;</span></div>";
	}

	// wrapper结尾
	html += "</div>";
	
	

	dom.innerHTML = html;
	return dom;
}

function dealNumber(money){
	if(money && money != null){
		money = String(money);
		var left = money.split(".")[0], right = money.split(".")[1];
		right = right ? (right.length >= 2 ? "." + right.substr(0, 2) : "." + right + "0") : ".00";
		var temp = left.split("").reverse().join("").match(/(\d{1,3})/g);
		return (Number(money) < 0 ? "-" : "") + temp.join(",").split("").reverse().join("") + right;
	}
	else if(money === 0){   // 注意===在这里的使用，如果传入的money为0,if中会将其判定为boolean类型，故而要另外做===判断
		return "0.00";
	}
	return "";
    
}

module.exports = genDomFromMsg;

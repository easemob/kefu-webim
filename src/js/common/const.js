var XIAHANG_FACE_MAP = {}

var _xiahang_imgs = [
	{'id': 1, 'phrase': '[微笑]', 'url': '1.gif', 'expressCode': '/::)'},
	{'id': 2, 'phrase': '[撇嘴]', 'url': '2.gif', 'expressCode': '/::~'},
	{'id': 3, 'phrase': '[色]', 'url': '3.gif', 'expressCode': '/::B'},
	{'id': 4, 'phrase': '[发呆]', 'url': '4.gif', 'expressCode': '/::|'},
	{'id': 5, 'phrase': '[得意]', 'url': '5.gif', 'expressCode': '/:8-)'},
	{'id': 6, 'phrase': '[流泪]', 'url': '6.gif', 'expressCode': '/::<'},
	{'id': 7, 'phrase': '[害羞]', 'url': '7.gif', 'expressCode': '/::$'},
	{'id': 8, 'phrase': '[闭嘴]', 'url': '8.gif', 'expressCode': '/::X'},
	{'id': 9, 'phrase': '[睡]', 'url': '9.gif', 'expressCode': '/::Z'},
	{'id': 10, 'phrase': '[大哭]', 'url': '10.gif', 'expressCode': '/::\'('},
	{'id': 11, 'phrase': '[尴尬]', 'url': '11.gif', 'expressCode': '/::-|'},
	{'id': 12, 'phrase': '[发怒]', 'url': '12.gif', 'expressCode': '/::@'},
	{'id': 13, 'phrase': '[调皮]', 'url': '13.gif', 'expressCode': '/::P'},
	{'id': 14, 'phrase': '[龇牙]', 'url': '14.gif', 'expressCode': '/::D'},
	{'id': 15, 'phrase': '[惊讶]', 'url': '15.gif', 'expressCode': '/::O'},
	{'id': 16, 'phrase': '[难过]', 'url': '16.gif', 'expressCode': '/::('},
	{'id': 17, 'phrase': '[酷]', 'url': '17.gif', 'expressCode': '/::+'},
	{'id': 18, 'phrase': '[冷汗]', 'url': '18.gif', 'expressCode': '/:--b'},
	{'id': 19, 'phrase': '[抓狂]', 'url': '19.gif', 'expressCode': '/::Q'},
	{'id': 20, 'phrase': '[吐]', 'url': '20.gif', 'expressCode': '/::T'},
	{'id': 21, 'phrase': '[偷笑]', 'url': '21.gif', 'expressCode': '/:,@P'},
	{'id': 22, 'phrase': '[愉快]', 'url': '22.gif', 'expressCode': '/:,@-D'},
	{'id': 23, 'phrase': '[白眼]', 'url': '23.gif', 'expressCode': '/::d'},
	{'id': 24, 'phrase': '[傲慢]', 'url': '24.gif', 'expressCode': '/:,@o'},
	{'id': 25, 'phrase': '[饥饿]', 'url': '25.gif', 'expressCode': '/::g'},
	{'id': 26, 'phrase': '[困]', 'url': '26.gif', 'expressCode': '/:|-)'},
	{'id': 27, 'phrase': '[惊恐]', 'url': '27.gif', 'expressCode': '/::!'},
	{'id': 28, 'phrase': '[流汗]', 'url': '28.gif', 'expressCode': '/::L'},
	{'id': 29, 'phrase': '[憨笑]', 'url': '29.gif', 'expressCode': '/::>'},
	{'id': 30, 'phrase': '[悠闲]', 'url': '30.gif', 'expressCode': '/::,@'},
	{'id': 31, 'phrase': '[奋斗]', 'url': '31.gif', 'expressCode': '/:,@f'},
	{'id': 32, 'phrase': '[咒骂]', 'url': '32.gif', 'expressCode': '/::-S'},
	{'id': 33, 'phrase': '[疑问]', 'url': '33.gif', 'expressCode': '/:?'},
	{'id': 34, 'phrase': '[嘘]', 'url': '34.gif', 'expressCode': '/:,@x'},
	{'id': 35, 'phrase': '[晕]', 'url': '35.gif', 'expressCode': '/:,@@'},
	{'id': 36, 'phrase': '[疯了]', 'url': '36.gif', 'expressCode': '/::8'},
	{'id': 37, 'phrase': '[衰]', 'url': '37.gif', 'expressCode': '/:,@!'},
	{'id': 38, 'phrase': '[骷髅]', 'url': '38.gif', 'expressCode': '/:!!!'},
	{'id': 39, 'phrase': '[敲打]', 'url': '39.gif', 'expressCode': '/:xx'},
	{'id': 40, 'phrase': '[再见]', 'url': '40.gif', 'expressCode': '/:bye'},
	{'id': 41, 'phrase': '[擦汗]', 'url': '41.gif', 'expressCode': '/:wipe'},
	{'id': 42, 'phrase': '[抠鼻]', 'url': '42.gif', 'expressCode': '/:dig'},
	{'id': 43, 'phrase': '[鼓掌]', 'url': '43.gif', 'expressCode': '/:handclap'},
	{'id': 44, 'phrase': '[糗大了]', 'url': '44.gif', 'expressCode': '/:&-('},
	{'id': 45, 'phrase': '[坏笑]', 'url': '45.gif', 'expressCode': '/:B-)'},
	{'id': 46, 'phrase': '[左哼哼]', 'url': '46.gif', 'expressCode': '/:<@'},
	{'id': 47, 'phrase': '[右哼哼]', 'url': '47.gif', 'expressCode': '/:@>'},
	{'id': 48, 'phrase': '[哈欠]', 'url': '48.gif', 'expressCode': '/::-O'},
	{'id': 49, 'phrase': '[鄙视]', 'url': '49.gif', 'expressCode': '/:>-|'},
	{'id': 50, 'phrase': '[委屈]', 'url': '50.gif', 'expressCode': '/:P-('},
	{'id': 51, 'phrase': '[快哭了]', 'url': '51.gif', 'expressCode': '/::\'|'},
	{'id': 52, 'phrase': '[阴脸]', 'url': '52.gif', 'expressCode': '/:X-)'},
	{'id': 53, 'phrase': '[亲亲]', 'url': '53.gif', 'expressCode': '/::*'},
	{'id': 54, 'phrase': '[吓]', 'url': '54.gif', 'expressCode': '/:@x'},
	{'id': 55, 'phrase': '[可怜]', 'url': '55.gif', 'expressCode': '/:8*'},
	{'id': 56, 'phrase': '[菜刀]', 'url': '56.gif', 'expressCode': '/:pd'},
	{'id': 57, 'phrase': '[西瓜]', 'url': '57.gif', 'expressCode': '/:<W>'},
	{'id': 58, 'phrase': '[啤酒]', 'url': '58.gif', 'expressCode': '/:beer'},
	{'id': 59, 'phrase': '[篮球]', 'url': '59.gif', 'expressCode': '/:basketb'},
	{'id': 60, 'phrase': '[乒乓]', 'url': '60.gif', 'expressCode': '/:oo'},
	{'id': 61, 'phrase': '[咖啡]', 'url': '61.gif', 'expressCode': '/:coffee'},
	{'id': 62, 'phrase': '[饭]', 'url': '62.gif', 'expressCode': '/:eat'},
	{'id': 63, 'phrase': '[猪头 ]', 'url': '63.gif', 'expressCode': '/:pig'},
	{'id': 64, 'phrase': '[玫瑰]', 'url': '64.gif', 'expressCode': '/:rose'},
	{'id': 65, 'phrase': '[凋谢]', 'url': '65.gif', 'expressCode': '/:fade'},
	{'id': 66, 'phrase': '[嘴唇]', 'url': '66.gif', 'expressCode': '/:showlove'},
	{'id': 67, 'phrase': '[爱心]', 'url': '67.gif', 'expressCode': '/:heart'},
	{'id': 68, 'phrase': '[心碎]', 'url': '68.gif', 'expressCode': '/:break'},
	{'id': 69, 'phrase': '[蛋糕]', 'url': '69.gif', 'expressCode': '/:cake'},
	{'id': 70, 'phrase': '[闪电]', 'url': '70.gif', 'expressCode': '/:li'},
	{'id': 71, 'phrase': '[炸弹]', 'url': '71.gif', 'expressCode': '/:bome'},
	{'id': 72, 'phrase': '[刀]', 'url': '72.gif', 'expressCode': '/:kn'},
	{'id': 73, 'phrase': '[足球]', 'url': '73.gif', 'expressCode': '/:footb'},
	{'id': 74, 'phrase': '[瓢虫]', 'url': '74.gif', 'expressCode': '/:ladybug'},
	{'id': 75, 'phrase': '[便便]', 'url': '75.gif', 'expressCode': '/:shit'},
	{'id': 76, 'phrase': '[月亮]', 'url': '76.gif', 'expressCode': '/:moon'},
	{'id': 77, 'phrase': '[太阳]', 'url': '77.gif', 'expressCode': '/:sun'},
	{'id': 78, 'phrase': '[礼物]', 'url': '78.gif', 'expressCode': '/:gift'},
	{'id': 79, 'phrase': '[拥抱]', 'url': '79.gif', 'expressCode': '/:hug'},
	{'id': 80, 'phrase': '[强]', 'url': '80.gif', 'expressCode': '/:strong'},
	{'id': 81, 'phrase': '[弱]', 'url': '81.gif', 'expressCode': '/:weak'},
	{'id': 82, 'phrase': '[握手]', 'url': '82.gif', 'expressCode': '/:share'},
	{'id': 83, 'phrase': '[胜利]', 'url': '83.gif', 'expressCode': '/:v'},
	{'id': 84, 'phrase': '[抱拳]', 'url': '84.gif', 'expressCode': '/:@)'},
	{'id': 85, 'phrase': '[勾引]', 'url': '85.gif', 'expressCode': '/:jj'},
	{'id': 86, 'phrase': '[拳头]', 'url': '86.gif', 'expressCode': '/:@@'},
	{'id': 87, 'phrase': '[差劲]', 'url': '87.gif', 'expressCode': '/:bad'},
	{'id': 88, 'phrase': '[爱你]', 'url': '88.gif', 'expressCode': '/:lvu'},
	{'id': 89, 'phrase': '[NO]', 'url': '89.gif', 'expressCode': '/:no'},
	{'id': 90, 'phrase': '[OK]', 'url': '90.gif', 'expressCode': '/:ok'},
	{'id': 91, 'phrase': '[爱情]', 'url': '91.gif', 'expressCode': '/:love'},
	{'id': 92, 'phrase': '[飞吻]', 'url': '92.gif', 'expressCode': '/:<L>'},
	{'id': 93, 'phrase': '[跳跳]', 'url': '93.gif', 'expressCode': '/:jump'},
	{'id': 94, 'phrase': '[发抖]', 'url': '94.gif', 'expressCode': '/:shake'},
	{'id': 95, 'phrase': '[怄火]', 'url': '95.gif', 'expressCode': '/:<O>'},
	{'id': 96, 'phrase': '[转圈]', 'url': '96.gif', 'expressCode': '/:circle'},
	{'id': 97, 'phrase': '[磕头]', 'url': '97.gif', 'expressCode': '/:kotow'},
	{'id': 98, 'phrase': '[回头]', 'url': '98.gif', 'expressCode': '/:turn'},
	{'id': 99, 'phrase': '[跳绳]', 'url': '99.gif', 'expressCode': '/:skip'},
	{'id': 100, 'phrase': '[投降]', 'url': '100.gif', 'expressCode': '/:oY'},
	{'id': 101, 'phrase': '[激动]', 'url': '101.gif', 'expressCode': '/:#-0'},
	{'id': 102, 'phrase': '[献吻]', 'url': '102.gif', 'expressCode': '/:kiss'},
	{'id': 103, 'phrase': '[左太极]', 'url': '103.gif', 'expressCode': '/:<&'},
	{'id': 104, 'phrase': '[右太极]', 'url': '104.gif', 'expressCode': '/:&>'},
	{'id': 105, 'phrase': '[emoji1]', 'url': '105.png', 'expressCode': '\\ue415'},
	{'id': 106, 'phrase': '[emoji2]', 'url': '106.png', 'expressCode': '\\ue40c'},
	{'id': 107, 'phrase': '[emoji3]', 'url': '107.png', 'expressCode': '\\ue412'},
	{'id': 108, 'phrase': '[emoji4]', 'url': '108.png', 'expressCode': '\\ue409'},
	{'id': 109, 'phrase': '[emoji5]', 'url': '109.png', 'expressCode': '\\ue40d'},
	{'id': 110, 'phrase': '[emoji6]', 'url': '110.png', 'expressCode': '\\ue107'},
	{'id': 111, 'phrase': '[emoji7]', 'url': '111.png', 'expressCode': '\\ue403'},
	{'id': 112, 'phrase': '[emoji8]', 'url': '112.png', 'expressCode': '\\ue40e'},
	{'id': 113, 'phrase': '[emoji9]', 'url': '113.png', 'expressCode': '\\ue11b'},
	{'id': 114, 'phrase': '[emoji10]', 'url': '114.png', 'expressCode': '\\ue41d'},
	{'id': 115, 'phrase': '[emoji11]', 'url': '115.png', 'expressCode': '\\ue14c'},
	{'id': 116, 'phrase': '[emoji12]', 'url': '116.png', 'expressCode': '\\ue312'},
	{'id': 117, 'phrase': '[emoji13]', 'url': '117.png', 'expressCode': '\\ue112'},
	{'id': 118, 'phrase': '[emoji14]', 'url': '118.png', 'expressCode': '\\ue056'},
	{'id': 119, 'phrase': '[emoji15]', 'url': '119.png', 'expressCode': '\\ue057'},
	{'id': 120, 'phrase': '[emoji16]', 'url': '120.png', 'expressCode': '\\ue414'},
	{'id': 121, 'phrase': '[emoji17]', 'url': '121.png', 'expressCode': '\\ue405'},
	{'id': 122, 'phrase': '[emoji18]', 'url': '122.png', 'expressCode': '\\ue106'},
	{'id': 123, 'phrase': '[emoji19]', 'url': '123.png', 'expressCode': '\\ue418'},
	{'id': 124, 'phrase': '[emoji20]', 'url': '124.png', 'expressCode': '\\ue417'},
	{'id': 125, 'phrase': '[emoji21]', 'url': '125.png', 'expressCode': '\\ue404'},
	{'id': 126, 'phrase': '[emoji22]', 'url': '126.png', 'expressCode': '\\ue40a'},
	{'id': 127, 'phrase': '[emoji23]', 'url': '127.png', 'expressCode': '\\ue105'},
	{'id': 128, 'phrase': '[emoji24]', 'url': '128.png', 'expressCode': '\\ue402'},
	{'id': 129, 'phrase': '[emoji25]', 'url': '129.png', 'expressCode': '\\ue108'},
	{'id': 130, 'phrase': '[emoji26]', 'url': '130.png', 'expressCode': '\\ue058'},
	{'id': 131, 'phrase': '[emoji27]', 'url': '131.png', 'expressCode': '\\ue407'},
	{'id': 132, 'phrase': '[emoji28]', 'url': '132.png', 'expressCode': '\\ue401'},
	{'id': 133, 'phrase': '[emoji29]', 'url': '133.png', 'expressCode': '\\ue40f'},
	{'id': 134, 'phrase': '[emoji30]', 'url': '134.png', 'expressCode': '\\ue40b'},
	{'id': 135, 'phrase': '[emoji31]', 'url': '135.png', 'expressCode': '\\ue406'},
	{'id': 136, 'phrase': '[emoji32]', 'url': '136.png', 'expressCode': '\\ue413'},
	{'id': 137, 'phrase': '[emoji33]', 'url': '137.png', 'expressCode': '\\ue411'},
	{'id': 138, 'phrase': '[emoji34]', 'url': '138.png', 'expressCode': '\\ue410'},
	{'id': 139, 'phrase': '[emoji35]', 'url': '139.png', 'expressCode': '\\ue059'},
	{'id': 140, 'phrase': '[emoji36]', 'url': '140.png', 'expressCode': '\\ue416'},
	{'id': 141, 'phrase': '[emoji37]', 'url': '141.png', 'expressCode': '\\ue408'},
	{'id': 142, 'phrase': '[emoji38]', 'url': '142.png', 'expressCode': '\\ue11a'},
	{'id': 143, 'phrase': '[emoji39]', 'url': '143.png', 'expressCode': '\\ue10c'},
	{'id': 144, 'phrase': '[emoji40]', 'url': '144.png', 'expressCode': '\\ue022'},
	{'id': 145, 'phrase': '[emoji41]', 'url': '145.png', 'expressCode': '\\ue023'}
];

for (var i = 0; i < _xiahang_imgs.length; i++) {
	var item = _xiahang_imgs[i];
	// 从后台发送过来的坐席端的表情就是 url，所以这里直接用url，
	// 如果用 expressCode，会有html显示问题
	XIAHANG_FACE_MAP[item.url] = item;
}

module.exports = {
	loadingSvg: [
		"<div class=\"em-widget-loading\">",
		"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 70 70\">",
		"<circle opacity=\".3\" fill=\"none\" stroke=\"#000\" stroke-width=\"4\" stroke-miterlimit=\"10\" cx=\"35\" cy=\"35\" r=\"11\"/>",
		"<path fill=\"none\" stroke=\"#E5E5E5\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-miterlimit=\"10\" d=\"M24 35c0-6.1 4.9-11 11-11 2.8 0 5.3 1 7.3 2.8\"/>",
		"</svg>",
		"</div>"
	].join(""),

	agentStatusText: {
		Online: __("agent_status.online"),
		Busy: __("agent_status.busy"),
		Leave: __("agent_status.leave"),
		Hidden: __("agent_status.hidden"),
		Idle: __("agent_status.offline"),
		Offline: __("agent_status.offline"),
		Logout: __("agent_status.offline"),
		Other: "",
	},

	eventMessageText: {
		NOTE: __("event_message.no_agent_online"),
	},

	SYSTEM_EVENT_MSG_TEXT: {
		ServiceSessionCreatedEvent: __("event_message.session_created"),
		ServiceSessionOpenedEvent: __("event_message.session_opened"),
		ServiceSessionTransferedToAgentQueueEvent: __("event_message.sessing_transfering"),
		ServiceSessionTransferedEvent: __("event_message.session_transfered"),
		ServiceSessionClosedEvent: __("event_message.sessing_closed"),
	},

	SYSTEM_EVENT: {
		SESSION_CREATED: "ServiceSessionCreatedEvent",
		SESSION_OPENED: "ServiceSessionOpenedEvent",
		SESSION_CLOSED: "ServiceSessionClosedEvent",
		SESSION_TRANSFERED: "ServiceSessionTransferedEvent",
		SESSION_TRANSFERING: "ServiceSessionTransferedToAgentQueueEvent",

		SESSION_RESTORED: "session.restored",
		SESSION_NOT_CREATED: "session.not.created",

		AGENT_INFO_UPDATE: "agent.info.update",
		OFFICIAL_ACCOUNT_SWITCHED: "official.account.switched",
		NEW_OFFICIAL_ACCOUNT_FOUND: "new.official.account.found",
		SYSTEM_OFFICIAL_ACCOUNT_UPDATED: "system.official.account.updated",
		OFFICIAL_ACCOUNT_LIST_GOT: "official.account.list.got",

		MARKETING_MESSAGE_RECEIVED: "marketing.message.received",
		SATISFACTION_EVALUATION_MESSAGE_RECEIVED: "satisfaction.evaluation.message.received",
		MESSAGE_PROMPT: "message.prompt",

		CHAT_WINDOW_OPENED: "chat.window.opened",
		CHAT_WINDOW_CLOSED: "chat.window.closed",

		IM_CONNECTION_OPENED: "im.connection.opened",

		MESSAGE_SENT: "message.sent",
		MESSAGE_APPENDED: "message.appended",

		VIDEO_TICKET_RECEIVED: "video.ticket.received",
		MESSAGE_CHANNEL_READY: "message.channel.ready",
	},

	themeMap: {
		theme_sky: "theme-1",
		theme_tree: "theme-2",
		theme_house: "theme-3",
		theme_orange: "theme-4",
		theme_grass: "theme-5",
		theme_sea: "theme-6",
		theme_mountion: "theme-7",
		theme_moon: "theme-8",
		theme_lake: "theme-9",
		theme_business: "theme-10",
		天空之城: "theme-1",
		丛林物语: "theme-2",
		红瓦洋房: "theme-3",
		鲜美橙汁: "theme-4",
		青草田间: "theme-5",
		湖光山色: "theme-6",
		冷峻山峰: "theme-7",
		月色池塘: "theme-8",
		天籁湖光: "theme-9",
		商务风格: "theme-10",
		Sky: "theme-1",
		Tree: "theme-2",
		House: "theme-3",
		Orange: "theme-4",
		Grass: "theme-5",
		Sea: "theme-6",
		Mountain: "theme-7",
		Moon: "theme-8",
		Lake: "theme-9",
		Business: "theme-10"
	},

	IM: {
		WEBIM_CONNCTION_OPEN_ERROR: 1,
		WEBIM_CONNCTION_AUTH_ERROR: 2,
		WEBIM_CONNCTION_AJAX_ERROR: 17,
		WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31
	},

	// todo: 分离这部分代码
	EVENTS: {
		NOTIFY: "notify",
		RECOVERY: "recoveryTitle",
		SHOW: "showChat",
		CLOSE: "closeChat",
		CACHEUSER: "setUser",
		DRAGREADY: "dragReady",
		DRAGEND: "dragEnd",
		SLIDE: "titleSlide",
		ONMESSAGE: "onMessage",
		ONSESSIONCLOSED: "onSessionClosed",
		EXT: "ext",
		TEXTMSG: "textmsg",
		ONREADY: "onready",
		ON_OFFDUTY: "onOffDuty",
		SET_ITEM: "setItem",
		UPDATE_URL: "updateURL",
		REQUIRE_URL: "requireURL",
		INIT_CONFIG: "initConfig",
		SHOW_IMG: "showIMG",
		RESIZE_IFRAME: "resizeIframe",
		ADD_PROMPT: "add.prompt",
		REMOVE_PROMPT: "remove.prompt",
		SCROLL_TO_BOTTOM: "scroll.to.bottom",
	},

	ERROR_MSG: {
		VISITOR_DOES_NOT_EXIST: "visitor does not exist.",
		SESSION_DOES_NOT_EXIST: "session does not exist.",
	},

	SESSION_STATE: {
		WAIT: "Wait",
		PROCESSING: "Processing",
		TERMINAL: "Terminal",
		ABORT: "Abort",
		RESOLVED: "Resolved",
		PREPARE: "Prepare"
	},

	AGENT_ROLE: {
		AGENT: 1,
		ROBOT: 6,
	},

	STREAM_TYPE: {
		NORMAL: 0,
		NO_AUDIO: 1,
	},

	// 上传文件大小限制
	UPLOAD_FILESIZE_LIMIT: 1024 * 1024 * 10,

	// 超时未收到 kefu-ack 启用第二通道发消息
	FIRST_CHANNEL_MESSAGE_TIMEOUT: 10000,

	// 发送图片时 超时未收到 kefu-ack 启用第二通道发消息
	FIRST_CHANNEL_IMG_MESSAGE_TIMEOUT: 15000,

	// 发送消息第二通道失败后，最多再试1次
	SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT: 1,

	// 如果im连接超时后启用第二通道
	FIRST_CHANNEL_CONNECTION_TIMEOUT: 20000,

	// IM心跳时间间隔
	HEART_BEAT_INTERVAL: 60000,

	// 第二通道收消息轮询时间间隔
	SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL: 60000,

	// 消息预知功能截断长度
	MESSAGE_PREDICT_MAX_LENGTH: 100,

	// 最大文本消息长度
	MAX_TEXT_MESSAGE_LENGTH: 1500,

	// 每次拉取历史消息条数
	GET_HISTORY_MESSAGE_COUNT_EACH_TIME: 10,

	// 轮询坐席输入状态间隔
	AGENT_INPUT_STATE_INTERVAL: 1000,

	// 消息时间戳最小间隔
	MESSAGE_TIME_SPAN_INTERVAL: 60000,

	E_MEDIA_SDK_ERROR_CODE_MAP: {
		0: "Normal exit.",
		1: "No response.",
		2: "The other side refused.",
		3: "The other side is busy.",
		4: "Server refused.",
		5: "Unsupported.",
		10: "Log in on other devices.",
		11: "The conference is closed.",
	},

	EMOJI_PATH: __("config.language") === "zh-CN" ? "static/img/faces_xiahang/" : "../static/img/faces_xiahang/",

	EMOJI_MAP: XIAHANG_FACE_MAP,

};

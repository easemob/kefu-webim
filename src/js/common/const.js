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
	},

	themeMap: {
		天空之城: "theme-1",
		丛林物语: "theme-2",
		红瓦洋房: "theme-3",
		鲜美橙汁: "theme-4",
		青草田间: "theme-5",
		湖光山色: "theme-6",
		冷峻山峰: "theme-7",
		月色池塘: "theme-8",
		天籁湖光: "theme-9",
		商务风格: "theme-10"
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

	EMOJI_PATH: __("config.language") === "zh-CN" ? "static/img/faces/" : "../static/img/faces/",

	EMOJI_MAP: {
		"[):]": "ee_1.png",
		"[:D]": "ee_2.png",
		"[;)]": "ee_3.png",
		"[:-o]": "ee_4.png",
		"[:p]": "ee_5.png",
		"[(H)]": "ee_6.png",
		"[:@]": "ee_7.png",
		"[:s]": "ee_8.png",
		"[:$]": "ee_9.png",
		"[:(]": "ee_10.png",
		"[:'(]": "ee_11.png",
		"[:|]": "ee_12.png",
		"[(a)]": "ee_13.png",
		"[8o|]": "ee_14.png",
		"[8-|]": "ee_15.png",
		"[+o(]": "ee_16.png",
		"[<o)]": "ee_17.png",
		"[|-)]": "ee_18.png",
		"[*-)]": "ee_19.png",
		"[:-#]": "ee_20.png",
		"[:-*]": "ee_21.png",
		"[^o)]": "ee_22.png",
		"[8-)]": "ee_23.png",
		"[(|)]": "ee_24.png",
		"[(u)]": "ee_25.png",
		"[(S)]": "ee_26.png",
		"[(*)]": "ee_27.png",
		"[(#)]": "ee_28.png",
		"[(R)]": "ee_29.png",
		"[({)]": "ee_30.png",
		"[(})]": "ee_31.png",
		"[(k)]": "ee_32.png",
		"[(F)]": "ee_33.png",
		"[(W)]": "ee_34.png",
		"[(D)]": "ee_35.png",
	},

};


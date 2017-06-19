easemobim._const = (function () {
	return {
		loadingSvg: [
			'<div class="em-widget-loading">',
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">',
			'<circle opacity=".3" fill="none" stroke="#000" stroke-width="4" stroke-miterlimit="10" cx="35" cy="35" r="11"/>',
			'<path fill="none" stroke="#E5E5E5" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10" d="M24 35c0-6.1 4.9-11 11-11 2.8 0 5.3 1 7.3 2.8"/>',
			'</svg>',
			'</div>'
		].join(''),
		agentStatusText: {
			Idle: '(离线)',
			Online: '(空闲)',
			Busy: '(忙碌)',
			Leave: '(离开)',
			Hidden: '(隐身)',
			Offline: '(离线)',
			Logout: '(离线)',
			Other: ''
		},

		eventMessageText: {
			NOTE: '当前暂无客服在线，请您留下联系方式，稍后我们将主动联系您'
		},

		SYSTEM_EVENT_MSG_TEXT: {
			ServiceSessionCreatedEvent: '会话创建成功',
			ServiceSessionClosedEvent: '会话已结束',
			ServiceSessionTransferedEvent: '会话已被转接至其他客服',
			ServiceSessionTransferedToAgentQueueEvent: '会话转接中，请稍候',
			ServiceSessionOpenedEvent: '会话已被客服接起'
		},

		SYSTEM_EVENT: {
			SESSION_CREATED: 'ServiceSessionCreatedEvent',
			SESSION_OPENED: 'ServiceSessionOpenedEvent',
			SESSION_CLOSED: 'ServiceSessionClosedEvent',
			SESSION_TRANSFERED: 'ServiceSessionTransferedEvent',
			SESSION_TRANSFERING: 'ServiceSessionTransferedToAgentQueueEvent',
			SESSION_RESTORED: 'session.restored',
			SESSION_NOT_CREATED: 'session.not.created',

			AGENT_NICKNAME_CHANGED: 'agent.nickname.changed',
			OFFICIAL_ACCOUNT_SWITCHED: 'official.account.switched',
			NEW_OFFICIAL_ACCOUNT_FOUND: 'new.official.account.found',
			SYSTEM_OFFICIAL_ACCOUNT_UPDATED: 'system.official.account.updated',
			OFFICIAL_ACCOUNT_LIST_GOT: 'official.account.list.got',
			MARKETING_MESSAGE_RECEIVED: 'marketing.message.received',
			CHAT_WINDOW_OPENED: 'chat.window.opened',
			CHAT_WINDOW_CLOSED: 'chat.window.closed',
			MESSAGE_SENT: 'message.sent',
			block: null
		},

		themeMap: {
			'天空之城': 'theme-1',
			'丛林物语': 'theme-2',
			'红瓦洋房': 'theme-3',
			'鲜美橙汁': 'theme-4',
			'青草田间': 'theme-5',
			'湖光山色': 'theme-6',
			'冷峻山峰': 'theme-7',
			'月色池塘': 'theme-8',
			'天籁湖光': 'theme-9',
			'商务风格': 'theme-10'
		},

		IM: {
			WEBIM_CONNCTION_OPEN_ERROR: 1,
			WEBIM_CONNCTION_AUTH_ERROR: 2,
			WEBIM_CONNCTION_AJAX_ERROR: 17,
			WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31
		},

		EVENTS: {
			NOTIFY: 'notify',
			RECOVERY: 'recoveryTitle',
			SHOW: 'showChat',
			CLOSE: 'closeChat',
			CACHEUSER: 'setUser',
			DRAGREADY: 'dragReady',
			DRAGEND: 'dragEnd',
			SLIDE: 'titleSlide',
			ONMESSAGE: 'onMessage',
			ONSESSIONCLOSED: 'onSessionClosed',
			EXT: 'ext',
			TEXTMSG: 'textmsg',
			ONREADY: 'onready',
			SET_ITEM: 'setItem',
			UPDATE_URL: 'updateURL',
			REQUIRE_URL: 'requireURL',
			INIT_CONFIG: 'initConfig',
			SHOW_IMG: 'showIMG',
			RESIZE_IFRAME: 'resizeIframe'
		},

		GRAY_LIST_KEYS: [
			'audioVideo',
			'msgPredictEnable',
			'waitListNumberEnable',
			'agentInputStateEnable'
		],

		ERROR_MSG: {
			VISITOR_DOES_NOT_EXIST: 'visitor does not exist.',
			SESSION_DOES_NOT_EXIST: 'session does not exist.',
			block: null
		},

		SESSION_STATE: {
			WAIT: 'Wait',
			PROCESSING: 'Processing',
			TERMINAL: 'Terminal',
			ABORT: 'Abort',
			RESOLVED: 'Resolved',
			PREPARE: 'Prepare'
		},

		AGENT_ROLE: {
			AGENT: 1,
			ROBOT: 6
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

		for_block_only: null
	};
}());

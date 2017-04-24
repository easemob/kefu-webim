(function () {
	easemobim._const = {
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

		// todo: change the class name to icon-*
		// 坐席状态，dom上的className值
		agentStatusClassName: {
			Idle: 'online',
			Online: 'online',
			Busy: 'busy',
			Leave: 'leave',
			Hidden: 'hidden',
			Offline: 'offline',
			Logout: 'offline',
			Other: 'hide'
		},

		// todo: simplify this part
		eventMessageText: {
			TRANSFERING: '会话转接中，请稍候',
			TRANSFER: '会话已被转接至其他客服',
			LINKED: '会话已被客服接起',
			CLOSED: '会话已结束',
			NOTE: '当前暂无客服在线，请您留下联系方式，稍后我们将主动联系您',
			CREATE: '会话创建成功'
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
			SHOW_IMG: 'showIMG'
		},

		//上传文件大小限制
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

		//轮询坐席输入状态间隔
		AGENT_INPUT_STATE_INTERVAL:1000,

		for_block_only: null
	};
}());

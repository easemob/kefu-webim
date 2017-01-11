(function(){
	var _const = {
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

		//上传文件大小限制
		UPLOAD_FILESIZE_LIMIT : 1024 * 1024 * 10,
		UPLOAD_IMG_TYPE :['gif','jpg','jpeg','png','bmp'],
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
			WEBIM_CONNCTION_AUTH_ERROR: 2,
			WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31
		}
	};

	window.easemobim = window.easemobim || {};
	easemobim._const = _const;

	//每页历史记录条数
	easemobim.LISTSPAN = 10;


	//支持的图片格式
	easemobim.PICTYPE = {
		jpg: true,
		gif: true,
		png: true,
		bmp: true
	};

	//自定义支持的文件格式
	easemobim.FILETYPE = {
		zip: true,
		doc: true,
		docx: true,
		txt: true,
		gif: true
	};

	//loading element
	easemobim.LOADING = !easemobim.utils.isQQBrowserInAndroid && easemobim.utils.getIEVersion > 9
		? ["<div class='em-widget-loading'><svg version='1.1' id='图层_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'",
		" viewBox='0 0 70 70' enable-background='new 0 0 70 70' xml:space='preserve'>",
		"<circle opacity='0.3' fill='none' stroke='#000000' stroke-width='4' stroke-miterlimit='10' cx='35' cy='35' r='11'/>",
		"<path fill='none' stroke='#E5E5E5' stroke-width='4' stroke-linecap='round' stroke-miterlimit='10' d='M24,35c0-6.1,4.9-11,11-11",
		"c2.8,0,5.3,1,7.3,2.8'/><image src='//kefu.easemob.com/webim/static/img/loading.gif' width='20' style='margin-top:10px;' /></svg></div>"].join('')
		: "<img src='//kefu.easemob.com/webim/static/img/loading.gif' width='20' style='margin-top:10px;'/>";

	//表情包
	Easemob.im.EMOTIONS = {
		path: 'static/img/faces/'
		, map: {
			'[):]': 'ee_1.png',
			'[:D]': 'ee_2.png',
			'[;)]': 'ee_3.png',
			'[:-o]': 'ee_4.png',
			'[:p]': 'ee_5.png',
			'[(H)]': 'ee_6.png',
			'[:@]': 'ee_7.png',
			'[:s]': 'ee_8.png',
			'[:$]': 'ee_9.png',
			'[:(]': 'ee_10.png',
			'[:\'(]': 'ee_11.png',
			'[:|]': 'ee_12.png',
			'[(a)]': 'ee_13.png',
			'[8o|]': 'ee_14.png',
			'[8-|]': 'ee_15.png',
			'[+o(]': 'ee_16.png',
			'[<o)]': 'ee_17.png',
			'[|-)]': 'ee_18.png',
			'[*-)]': 'ee_19.png',
			'[:-#]': 'ee_20.png',
			'[:-*]': 'ee_21.png',
			'[^o)]': 'ee_22.png',
			'[8-)]': 'ee_23.png',
			'[(|)]': 'ee_24.png',
			'[(u)]': 'ee_25.png',
			'[(S)]': 'ee_26.png',
			'[(*)]': 'ee_27.png',
			'[(#)]': 'ee_28.png',
			'[(R)]': 'ee_29.png',
			'[({)]': 'ee_30.png',
			'[(})]': 'ee_31.png',
			'[(k)]': 'ee_32.png',
			'[(F)]': 'ee_33.png',
			'[(W)]': 'ee_34.png',
			'[(D)]': 'ee_35.png'
		}
	};
}());
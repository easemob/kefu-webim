window.easemobim = window.easemobim || {};

easemobim.config = {
	tenantId: '',										//租户id
	to: '',												//指定关联对应的im号
	appKey: '',											//关联的appkey,				appKey: 'orgName#appName'
	domain: '',											//环信移动客服域,			domain: '//kefu.easemob.com', 
	path: '',											//im.html的本机服务器路径,	path: '//XXX/webim'
	staticPath: '',										//访客插件static的路径,		staticPath: '//XXX/webim/static'
	xmppServer: '',										//环信IM服务器,				xmppServer: 'im-api.easemob.com'
	restServer: '',										//环信REST服务器,			restServer: 'a1.easemob.com'
	visitor: '',										//访客信息
	agentName: '',										//指定坐席

	autoConnect: false,									//自动连接
	buttonText: '联系客服',								//设置小按钮的文案
	hide: true,											//是否隐藏小的悬浮按钮
	resources: false,									//是否启用收消息同步
	dragenable: true,									//是否允许拖拽, H5不支持
	hideKeyboard: false,								//是否隐藏H5右上角的键盘图标
	dialogWidth: '400px',								//聊天窗口宽度, H5不支持
	dialogHeight: '500px',								//聊天窗口高度, H5不支持
	minimum: true,										//是否允许窗口最小化, H5不支持
	satisfaction: true,									//是否允许访客主动发起满意度评价
	soundReminder: true,								//是否启用声音提醒(低版本浏览器和H5不支持)
	dialogPosition: { x: '10px', y: '10px' },			//聊天窗口初始位置，坐标以视口右边距和下边距为基准, H5不支持
	onmessage: function ( message ) { },				//收消息回调, 只对当前打开的聊天窗口有效
	onready: function () { },							//聊天窗口加载成功回调

	/*
	 * 可集成自己的用户，如不集成，则使用上面配置的appkey创建随机访客
	 * 如果上面没有配置appkey，那么将使用配置的tenantId获取体验关联，使用体验关联的相关信息
	 * 验证的方式二选一，必填，另一项为空即可
	 */
	user: {
		username: '',										//集成时必填
		password: '',										//password验证方式
		token: ''											//token验证方式
	}
};

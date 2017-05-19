(function () {
	easemobim.chat = function (config) {
		var utils = easemobim.utils;
		var uikit = easemobim.uikit;
		var _const = easemobim._const;
		var api = easemobim.api;
		var apiHelper = easemobim.apiHelper;
		var satisfaction = easemobim.satisfaction;

		var recentMsg = [];
		var msgTimeSpanBegin = new Date(2099, 0).getTime();
		var msgTimeSpanEnd = new Date(1970, 0).getTime();
		var isChatWindowOpen;

		// DOM init
		var topBar = document.querySelector('.em-widget-header');
		var editorView = document.querySelector('.em-widget-send-wrapper');
		easemobim.imBtn = document.getElementById('em-widgetPopBar');

		// todo: 把dom都移到里边
		var doms = {
			imChat: document.getElementById('em-kefu-webim-chat'),
			//待接入排队人数显示
			agentWaitNumber: document.querySelector('.queuing-number-status'),
			agentStatusSymbol: topBar.querySelector('.agent-status'),
			agentStatusText: topBar.querySelector('.em-header-status-text'),
			avatar: topBar.querySelector('.em-widget-header-portrait'),
			nickname: topBar.querySelector('.em-widget-header-nickname'),
			dragBar: topBar.querySelector('.drag-bar'),
			minifyBtn: topBar.querySelector('.btn-min'),
			audioBtn: topBar.querySelector('.btn-audio'),
			switchKeyboardBtn: topBar.querySelector('.btn-keyboard'),
			inputState: topBar.querySelector('.em-agent-input-state'),

			emojiBtn: editorView.querySelector('.em-bar-emoji'),
			sendImgBtn: editorView.querySelector('.em-widget-img'),
			sendFileBtn: editorView.querySelector('.em-widget-file'),
			sendBtn: editorView.querySelector('.em-widget-send'),
			satisfaction: editorView.querySelector('.em-widget-satisfaction'),
			textInput: editorView.querySelector('.em-widget-textarea'),
			noteBtn: editorView.querySelector('.em-widget-note'),

			imgInput: document.querySelector('.upload-img-container'),
			fileInput: document.querySelector('.upload-file-container'),
			emojiContainer: document.querySelector('.em-bar-emoji-container'),
			chatContainer: document.querySelector('.chat-container'),
			emojiWrapper: document.querySelector('.em-bar-emoji-wrapper'),
			chatWrapper: document.querySelector('.chat-wrapper'),

			topBar: topBar,
			editorView: editorView,
			block: null
		};

		//cache current agent
		config.agentUserId = null;

		//chat window object
		return {
			init: function () {
				var me = this;

				this.channel = easemobim.channel.call(this, config);

				this.conn = this.channel.getConnection();
				//chat window status
				isChatWindowOpen = true;
				//init sound reminder
				this.soundReminder();

				this.initUI();

				this.initEmoji();
				//bind events on dom
				this.bindEvents();

				Promise.all([
					apiHelper.getDutyStatus(),
					apiHelper.getGrayList()
				]).then(function(result){
					var dutyStatus = result[0];
					var grayList = result[1];

					// 灰度列表
					config.grayList = grayList;

					// 当配置为下班进会话时执行与上班相同的逻辑
					config.isInOfficehours = dutyStatus || config.offDutyType === 'chat';

					// 设置企业信息
					me.setEnterpriseInfo();

					// 显示广告条
					config.logo && me.setLogo();

					// 移动端输入框自动增长
					utils.isMobile && me.initAutoGrow();

					if (config.isInOfficehours) {
						// 添加sdk回调
						me.channel.listen();

						// 连接xmpp server
						me.open();

						// 设置信息栏
						me.setNotice();

						// get service serssion info
						me.getSession();

						// 获取坐席昵称设置
						me.getNickNameOption();

						// 拉取历史消息
						!config.isNewUser && !me.hasGotHistoryMsg && me.getHistory(function () {
							me.scrollBottom();
							me.hasGotHistoryMsg = true;
						});

						// 初始化历史消息拉取
						!config.isNewUser && me.initHistoryPuller();

						// 待接入排队人数显示
						me.waitListNumber.start();

						//轮询坐席的输入状态
						me.agentInputState.start();

						// 第二通道收消息初始化
						me.channel.initSecondChannle();
					}
					else {
						// 设置下班时间展示的页面
						me.setOffline();
					}
				}, function (err) {
					throw err;
				});
			},
			handleReady: function (info) {
				var me = this;

				if (me.readyHandled) return;

				me.readyHandled = true;
				doms.sendBtn.innerHTML = '发送';
				utils.trigger(doms.textInput, 'change');

				// bug fix:
				// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
				if (config.minimum === false || config.eventCollector === true) {
					transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
				}
				if (info) {
					config.user.token = config.user.token || info.accessToken;
				}

				// 发送用于回呼访客的命令消息
				if (this.cachedCommandMessage) {
					me.channel.sendText('', this.cachedCommandMessage);
					this.cachedCommandMessage = null;
				}

				if (!utils.isTop) {
					transfer.send({ event: _const.EVENTS.ONREADY }, window.transfer.to);
				}

				if (config.extMsg) {
					me.channel.sendText('', { ext: config.extMsg });
				}
			},
			setExt: function (msg) {
				msg.body.ext = msg.body.ext || {};
				msg.body.ext.weichat = msg.body.ext.weichat || {};

				//bind skill group
				if (config.emgroup) {
					msg.body.ext.weichat.queueName = decodeURIComponent(config.emgroup);
				}

				//bind visitor
				if (!_.isEmpty(config.visitor)) {
					msg.body.ext.weichat.visitor = config.visitor;
				}

				//bind agent
				if (config.agentName) {
					msg.body.ext.weichat.agentUsername = config.agentName;
				}

				//set language
				if (config.language) {
					msg.body.ext.weichat.language = config.language;
				}

				//set growingio id
				if (config.grUserId) {
					msg.body.ext.weichat.visitor = msg.body.ext.weichat.visitor || {};
					msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
				}
			},

			initAutoGrow: function () {
				var me = this;
				var originHeight = doms.textInput.clientHeight;

				if (me.isAutoGrowInitialized) return;
				me.isAutoGrowInitialized = true;

				utils.on(doms.textInput, 'input change', update);

				function update() {
					var height = this.value ? this.scrollHeight : originHeight;
					this.style.height = height + 'px';
					this.scrollTop = 9999;
					callback();
				}

				function callback() {
					var height = doms.editorView.getBoundingClientRect().height;
					if (me.direction === 'up') {
						doms.emojiWrapper.style.top = 43 + height + 'px';
					}
					else {
						doms.chatWrapper.style.bottom = height + 'px';
						doms.emojiWrapper.style.bottom = height + 'px';
					}
					me.scrollBottom();
				}
			},
			initHistoryPuller: function () {
				var me = this;
				//pc 和 wap 的上滑加载历史记录的方法
				(function () {
					var st;
					var _startY;
					var _y;
					var touch;

					//wap
					utils.live('div.em-widget-date', 'touchstart', function (ev) {
						var touch = ev.touches;

						if (ev.touches && ev.touches.length > 0) {
							_startY = touch[0].pageY;
						}
					});
					utils.live('div.em-widget-date', 'touchmove', function (ev) {
						var touch = ev.touches;

						if (ev.touches && ev.touches.length > 0) {
							_y = touch[0].pageY;
							if (_y - _startY > 8 && this.getBoundingClientRect().top >= 0) {
								clearTimeout(st);
								st = setTimeout(function () {
									me.getHistory();
								}, 100);
							}
						}
					});

					// pc端
					utils.on(doms.chatContainer, 'mousewheel DOMMouseScroll', function (ev) {
						var that = this;

						if (ev.wheelDelta / 120 > 0 || ev.detail < 0) {
							clearTimeout(st);
							st = setTimeout(function () {
								if (that.getBoundingClientRect().top >= 0) {
									me.getHistory();
								}
							}, 400);
						}
					});
				}());
			},
			getHistory: function (callback) {
				var me = this;
				var groupid = me.groupId;
				var currHistoryMsgSeqId = me.currHistoryMsgSeqId || 0;

				if (me.hasHistoryMessage === false) return;
				if (groupid) {
					api('getHistory', {
						fromSeqId: currHistoryMsgSeqId,
						size: _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME,
						chatGroupId: groupid,
						tenantId: config.tenantId
					}, function (msg) {
						var historyMsg = msg.data || [];
						var earliestMsg = historyMsg[historyMsg.length - 1] || {};
						var nextMsgSeq = earliestMsg.chatGroupSeqId - 1;

						me.currHistoryMsgSeqId = nextMsgSeq;
						me.hasHistoryMessage = nextMsgSeq > 0;
						_.each(historyMsg, me.channel.handleHistoryMsg);
						typeof callback === 'function' && callback();
					});
				}
				else {
					api('getGroupNew', {
						id: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						imServiceNumber: config.toUser,
						tenantId: config.tenantId
					}, function (msg) {
						if (msg.data) {
							me.groupId = msg.data;
							me.getHistory(callback);
						}
					});
				}
			},
			getGreeting: function () {
				var me = this;

				Promise.all([
					apiHelper.getSystemGreeting(),
					apiHelper.getRobertGreeting()
				]).then(function(result){
					var systemGreetingText = result[0];
					var robotGreetingObj = result[1];
					var greetingTextType = robotGreetingObj.greetingTextType;
					var greetingText = robotGreetingObj.greetingText;
					var greetingObj = {};

					// 系统欢迎语
					systemGreetingText && me.channel.handleReceive({
						data: systemGreetingText,
						noprompt: true
					}, 'txt');

					// 机器人欢迎语
					switch (greetingTextType) {
					case 0:
						// 文本消息
						me.channel.handleReceive({
							data: greetingText,
							noprompt: true
						}, 'txt');
						break;
					case 1:
						// 菜单消息
						greetingObj = JSON.parse(greetingText.replace(/&amp;quot;/g, '"'));

						greetingObj.ext && me.channel.handleReceive({
							ext: greetingObj.ext,
							noprompt: true
						});
						break;
					case undefined:
						// 未设置机器人欢迎语
						break;
					default:
						console.error('unknown robot greeting type.');
						break;
					}
				});
			},
			getNickNameOption: function () {
				api('getNickNameOption', {
					tenantId: config.tenantId
				}, function (msg) {
					config.nickNameOption = utils.getDataByPath(msg, 'data.0.optionValue') === 'true';
				});
			},
			getSession: function () {
				var me = this;

				api('getExSession', {
					id: config.user.username,
					orgName: config.orgName,
					appName: config.appName,
					imServiceNumber: config.toUser,
					tenantId: config.tenantId
				}, function (msg) {
					var data = msg.data || {};
					var serviceSession = data.serviceSession;

					me.hasHumanAgentOnline = data.onlineHumanAgentCount > 0;
					me.hasAgentOnline = data.onlineHumanAgentCount + data.onlineRobotAgentCount > 0;

					if (serviceSession) {
						config.agentUserId = serviceSession.agentUserId;
						// 确保正在进行中的会话，刷新后还会继续轮询坐席状态
						me.startToGetAgentStatus();
						me.sendAttribute(msg);
					}
					else {
						// 仅当会话不存在时获取欢迎语
						me.getGreeting();
					}
				});
			},
			sendAttribute: function (msg) {
				var visitorUserId = utils.getDataByPath(msg, 'data.serviceSession.visitorUser.userId');
				if (!this.hasSentAttribute && visitorUserId) {
					this.hasSentAttribute = true;
					// 缓存 visitorUserId
					config.visitorUserId = visitorUserId;
					api('sendVisitorInfo', {
						tenantId: config.tenantId,
						visitorId: visitorUserId,
						referer: document.referrer
					});
				}
			},
			setEnterpriseInfo: function () {
				this.setAgentProfile({
					tenantName: config.defaultAgentName,
					avatar: config.tenantAvatar
				});
			},
			startToGetAgentStatus: function () {
				var me = this;

				if (config.agentStatusTimer) return;

				// start to poll
				config.agentStatusTimer = setInterval(function () {
					me.updateAgentStatus();
				}, 5000);
			},
			stopGettingAgentStatus: function () {
				config.agentStatusTimer = clearInterval(config.agentStatusTimer);
			},
			clearAgentStatus: function () {
				doms.agentStatusSymbol.className = 'hide';
				doms.agentStatusText.innerText = '';
			},
			updateAgentStatus: function () {
				var me = this;

				if (!config.agentUserId || !config.nickNameOption || !config.user.token) {
					me.stopGettingAgentStatus();
					return;
				}

				api('getAgentStatus', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					agentUserId: config.agentUserId,
					userName: config.user.username,
					token: config.user.token,
					imServiceNumber: config.toUser
				}, function (msg) {
					var state = utils.getDataByPath(msg, 'data.state');

					if (state) {
						doms.agentStatusText.innerText = _const.agentStatusText[state];
						doms.agentStatusSymbol.className = 'em-widget-agent-status ' + _const.agentStatusClassName[state];
					}
				});
			},

			agentInputState: (function () {
				var isStarted = false;
				var timer;
				var prevTimestamp = 0;

				function _start() {
					// 没有灰度的时候  不做查询
					if (!config.grayList.agentInputStateEnable) return;
					isStarted = true;
					// 保证当前最多只有1个timer
					clearInterval(timer);
					api('getCurrentServiceSession', {
						id: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						imServiceNumber: config.toUser,
						tenantId: config.tenantId
					}, function (msg) {
						var data = msg.data || {};
						var sessionId = data.serviceSessionId;

						if (sessionId && isStarted) {
							timer = setInterval(function () {
								getAgentInputState(sessionId);
							}, _const.AGENT_INPUT_STATE_INTERVAL);
						}
					});
				}

				function getAgentInputState(sessionId) {
					if (!config.user.token) {
						console.warn('undefined token');
						return;
					}
					// 当聊天窗口或者浏览器最小化时 不去发轮询请求
					if(!isChatWindowOpen || utils.isMin()){
						return;
					}

					api('getAgentInputState', {
						username: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						tenantId: config.tenantId,
						serviceSessionId: sessionId,
						token: config.user.token,
					}, function (resp) {
						var nowData = resp.data.entity;
						//当返回的时间戳小于当前时间戳时  不做任何处理
						if(prevTimestamp > nowData.timestamp){
							return;
						}
						//当返回的时间戳大于当前时间戳时  处理以下逻辑
						prevTimestamp = nowData.timestamp;
						if (!nowData.input_state_tips) {
							utils.addClass(doms.inputState, 'hide');
						}
						else {
							utils.removeClass(doms.inputState, 'hide');
						}
					});
				}

				function _stop() {
					clearInterval(timer);
					utils.addClass(doms.inputState, 'hide');
					isStarted = false;
				}
				return {
					start: _start,
					stop: _stop
				};
			})(),
			waitListNumber: (function () {

				var isStarted = false;
				var timer = null;
				var prevTime = 0;

				function _start() {
					if (!config.grayList.waitListNumberEnable) return;

					isStarted = true;
					// 保证当前最多只有1个timer
					// 每次调用start都必须重新获取queueId
					clearInterval(timer);
					api('getSessionQueueId', {
						tenantId: config.tenantId,
						visitorUsername: config.user.username,
						techChannelInfo: config.orgName + '%23' + config.appName + '%23' + config.toUser
					}, function (resp) {
						var nowData = resp.data.entity;
						var queueId;
						var sessionId;

						if (nowData && nowData.state === 'Wait') {
							queueId = nowData.queueId;
							sessionId = nowData.serviceSessionId;
							// 避免请求在 轮询停止以后回来 而导致误开始
							// todo: use promise to optimize it
							if (isStarted) {
								timer = setInterval(function () {
									getWaitNumber(queueId, sessionId);
								}, 1000);
							}
						}
					});
				}

				function getWaitNumber(queueId, sessionId) {
					api('getWaitListNumber', {
						tenantId: config.tenantId,
						queueId: queueId,
						serviceSessionId: sessionId
					}, function (resp) {
						var nowData = resp.data.entity;
						if (nowData.visitorUserWaitingNumber === 'no') {
							utils.addClass(doms.agentWaitNumber, 'hide');
						}
						else if (nowData.visitorUserWaitingTimestamp > prevTime) {
							prevTime = nowData.visitorUserWaitingTimestamp;
							utils.removeClass(doms.agentWaitNumber, 'hide');
							doms.agentWaitNumber.querySelector('label').innerHTML = nowData.visitorUserWaitingNumber;
						}
						else {}
					});
				}

				function _stop() {
					clearInterval(timer);
					prevTime = 0;
					isStarted = false;
					utils.addClass(doms.agentWaitNumber, 'hide');
				}
				return {
					start: _start,
					stop: _stop
				};
			}()),
			setAgentProfile: function (info) {
				var avatarImg = info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.tenantAvatar ||
					config.defaultAvatar;

				if (info.tenantName) {
					// 更新企业头像和名称
					doms.nickname.innerText = info.tenantName;
					doms.avatar.src = avatarImg;
				}
				else if (
					info.userNickname
					// 昵称启用
					&& config.nickNameOption
					// fake: 默认不显示调度员昵称
					&& '调度员' !== info.userNickname
				) {
					//更新坐席昵称
					doms.nickname.innerText = info.userNickname;
					if (avatarImg) {
						doms.avatar.src = avatarImg;
					}
				}

				// 缓存头像地址
				this.currentAvatar = avatarImg;
			},
			setLogo: function () {
				var logoImgWapper = document.querySelector('.em-widget-tenant-logo');
				var logoImg = logoImgWapper.querySelector('img');
				
				config.logo.enabled && config.logo.url && utils.removeClass(logoImgWapper, 'hide');
				logoImg.src = config.logo.url;
			
			},
			setNotice: function () {
				var me = this;
				var noticeContent = document.querySelector('.em-widget-tip .content');
				var noticeCloseBtn = document.querySelector('.em-widget-tip .tip-close');

				apiHelper.getNotice().then(function(notice){
					if(!notice.enabled) return;
					var slogan = notice.content;
					if (slogan) {
						// 设置信息栏内容
						noticeContent.innerHTML = WebIM.utils.parseLink(slogan);
						// 显示信息栏
						utils.addClass(doms.imChat, 'has-tip');

						// 隐藏信息栏按钮
						utils.on(
							noticeCloseBtn,
							utils.click,
							function () {
								// 隐藏信息栏
								utils.removeClass(doms.imChat, 'has-tip');
							}
						);
					}
				});
			},
			initEmoji: function () {
				var me = this;

				utils.on(doms.emojiBtn, utils.click, function () {
					doms.textInput.blur();
					utils.toggleClass(doms.emojiWrapper, 'hide');

					// 懒加载，打开表情面板时才初始化图标
					if (!me.isEmojiInitilized) {
						me.isEmojiInitilized = true;
						doms.emojiContainer.innerHTML = genHtml();
					}
				});

				// 表情的选中
				utils.live('img.emoji', utils.click, function (e) {
					!utils.isMobile && doms.textInput.focus();
					doms.textInput.value += this.getAttribute('data-value');
					utils.trigger(doms.textInput, 'change');
				}, doms.emojiWrapper);

				// todo: kill .e-face to make it more elegant
				// ie8 does not support stopPropagation -_-||
				// 点击别处时隐藏表情面板
				utils.on(document, utils.click, function (ev) {
					var e = window.event || ev;
					var target = e.srcElement || e.target;

					if (!utils.hasClass(target, 'e-face')) {
						utils.addClass(doms.emojiWrapper, 'hide');
					}
				});

				function genHtml() {
					var path = WebIM.Emoji.path;
					var EMOJI_COUNT_PER_LINE = 7;

					return _.chain(WebIM.Emoji.map)
						// 生成图标html
						.map(function (value, key) {
							return '<div class="em-bar-emoji-bg e-face">'
								+ '<img class="e-face emoji" src="'
								+ path + value
								+ '" data-value=' + key + ' />'
								+ '</div>';
						})
						// 按照下标分组
						.groupBy(function (elem, index) {
							return Math.floor(index / EMOJI_COUNT_PER_LINE);
						})
						// 增加wrapper
						.map(function (elem) {
							return '<li class="e-face">' + elem.join('') + '</li>';
						})
						// 结束链式调用
						.value()
						// 把数组拼接成字符串
						.join('');
				}
			},
			setOffline: function () {
				switch (config.offDutyType) {
				case 'none':
					// 下班禁止留言、禁止接入会话
					var word = config.offDutyWord || '现在是下班时间。';

					// todo: move this code to fronter place
					try {
						word = decodeURIComponent(word);
					}
					catch (e) {}

					uikit.createDialog({
						contentDom: '<p>' + word + '</p>',
						className: 'off-duty-prompt'
					}).show();
					break;
				default:
					// 只允许留言此时无法关闭留言页面
					easemobim.leaveMessage({hideCloseBtn: true});
					break;
				}
			},
			//close chat window
			close: function () {
				isChatWindowOpen = false;

				if (!config.hide) {
					utils.addClass(doms.imChat, 'hide');
					utils.removeClass(easemobim.imBtn, 'hide');
				}
			},
			//show chat window
			show: function () {
				var me = this;

				isChatWindowOpen = true;
				me.scrollBottom();
				utils.addClass(easemobim.imBtn, 'hide');
				utils.removeClass(doms.imChat, 'hide');
				if (
					config.isInOfficehours
					// IE 8 will throw an error when focus an invisible element
					&& doms.textInput.offsetHeight > 0
				) {
					doms.textInput.focus();
				}
				!utils.isTop && transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
			},
			open: function () {
				var me = this;

				var op = {
					user: config.user.username,
					appKey: config.appKey,
					apiUrl: location.protocol + '//' + config.restServer
				};

				if (config.user.token) {
					op.accessToken = config.user.token;
				}
				else {
					op.pwd = config.user.password;
				}

				me.conn.open(op);

				Modernizr.peerconnection
					&& config.grayList.audioVideo
					&& easemobim.videoChat.init(me.conn, me.channel.sendText, config);
			},
			soundReminder: function () {
				if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
					return;
				}

				var me = this;
				var audioDom = document.createElement('audio');
				var slienceSwitch = document.querySelector('.em-widget-header .btn-audio');
				var isSlienceEnable = false;
				var play = _.throttle(function () {
					audioDom.play();
				}, 3000, { trailing: false });

				audioDom.src = config.staticPath + '/mp3/msg.m4a';

				//音频按钮静音
				utils.on(slienceSwitch, 'click', function () {
					isSlienceEnable = !isSlienceEnable;
					utils.toggleClass(slienceSwitch, 'icon-slience', isSlienceEnable);
					utils.toggleClass(slienceSwitch, 'icon-bell', !isSlienceEnable);
				});

				me.soundReminder = function () {
					if (!isSlienceEnable && (utils.isMin() || !isChatWindowOpen)) {
						play();
					}
				};
			},
			bindEvents: function () {
				var me = this;

				if (!utils.isTop) {
					// 最小化按钮
					utils.on(document.querySelector('.em-widget-header .btn-min'), 'click', function () {
						transfer.send({ event: _const.EVENTS.CLOSE }, window.transfer.to);
					});

					utils.on(easemobim.imBtn, utils.click, function () {
						transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
					});

					utils.on(document, 'mouseover', function () {
						transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
					});
				}

				utils.on(doms.chatWrapper, 'click', function () {
					doms.textInput.blur();
				});

				utils.live('img.em-widget-imgview', 'click', function () {
					var imgSrc = this.getAttribute('src');
					easemobim.imgView.show(imgSrc);
				});

				if (config.dragenable && !utils.isTop && !utils.isMobile) {

					doms.dragBar.style.cursor = 'move';

					utils.on(doms.dragBar, 'mousedown', function (ev) {
						var e = window.event || ev;
						doms.textInput.blur(); //ie a  ie...
						transfer.send({
							event: _const.EVENTS.DRAGREADY,
							data: {
								x: e.clientX,
								y: e.clientY
							}
						}, window.transfer.to);
						return false;
					}, false);
				}

				//resend
				utils.live('div.em-widget-msg-status', utils.click, function () {
					var id = this.getAttribute('id').slice(0, -'_failed'.length);

					utils.addClass(this, 'hide');
					utils.removeClass(document.getElementById(id + '_loading'), 'hide');
					if (this.getAttribute('data-type') === 'txt') {
						me.channel.reSend('txt', id);
					}
					else {
						me.conn.send(id);
					}
				});

				utils.live('button.js_robotTransferBtn', utils.click, function () {
					var id = this.getAttribute('data-id');
					var ssid = this.getAttribute('data-sessionid');

					// 只能评价1次
					if (!this.clicked) {
						this.clicked = true;
						me.channel.sendTransferToKf(id, ssid);
					}
				});

				utils.live('button.js-transfer-to-ticket', utils.click, function () {
					Promise.all([
						apiHelper.getSessionQueueId(),
						apiHelper.getCurrentServiceSession()
					]).then(function(result){
						var ssid = utils.getDataByPath(result[0], 'entity.serviceSessionId')
							|| utils.getDataByPath(result[1], 'serviceSessionId');
						ssid && api('closeServiceSession', {
							tenantId: config.tenantId,
							orgName: config.orgName,
							appName: config.appName,
							userName: config.user.username,
							token: config.user.token,
							serviceSessionId: ssid
						});
					});

					easemobim.leaveMessage({
						preData: {
							name: config.visitor.trueName,
							phone: config.visitor.phone,
							mail: config.visitor.email,
							// 	取最近10条消息，最大1000字
							content: utils.getBrief('\n' + me.getRecentMsg(10), 1000)
						}
					});
				});

				// 机器人列表
				utils.live('button.js_robotbtn', utils.click, function () {
					me.channel.sendText(this.innerText, {
						ext: {
							msgtype: {
								choice: {
									menuid: this.getAttribute('data-id')
								}
							}
						}
					});
				});

				// 满意度评价
				utils.live('button.js_satisfybtn', 'click', function () {
					var serviceSessionId = this.getAttribute('data-servicesessionid');
					var inviteId = this.getAttribute('data-inviteid');
					satisfaction.show(inviteId, serviceSessionId);
				});

				var messagePredict = _.throttle(function (msg) {
					config.agentUserId
						&& config.visitorUserId
						&& api('messagePredict', {
							tenantId: config.tenantId,
							visitor_user_id: config.visitorUserId,
							agentId: config.agentUserId,
							content: utils.getBrief(msg, _const.MESSAGE_PREDICT_MAX_LENGTH),
							timestamp: _.now(),
						});
				}, 1000);

				function handleSendBtn() {
					var isEmpty = !doms.textInput.value.trim();

					utils.toggleClass(
						doms.sendBtn,
						'disabled', !me.readyHandled || isEmpty
					);
					config.grayList.msgPredictEnable
						&& !isEmpty
						&& messagePredict(doms.textInput.value);
				}

				if (Modernizr.oninput) {
					utils.on(doms.textInput, 'input change', handleSendBtn);
				}
				else {
					utils.on(doms.textInput, 'keyup change', handleSendBtn);
				}

				if (utils.isMobile) {
					utils.on(doms.textInput, 'focus touchstart', function () {
						doms.textInput.style.overflowY = 'auto';
						me.scrollBottom();
					});

					// 键盘上下切换按钮
					utils.on(
						document.querySelector('.em-widget-header .btn-keyboard'),
						'click',
						function () {
							var status = utils.hasClass(this, 'icon-keyboard-down');
							var height = doms.editorView.getBoundingClientRect().height;
							me.direction = status ? 'down' : 'up';

							utils.toggleClass(this, 'icon-keyboard-up', status);
							utils.toggleClass(this, 'icon-keyboard-down', !status);

							switch (me.direction) {
							case 'up':
								doms.editorView.style.bottom = 'auto';
								doms.editorView.style.zIndex = '3';
								doms.editorView.style.top = '43px';
								doms.chatWrapper.style.bottom = '0';
								doms.emojiWrapper.style.bottom = 'auto';
								doms.emojiWrapper.style.top = 43 + height + 'px';
								break;
							case 'down':
								doms.editorView.style.bottom = '0';
								doms.editorView.style.zIndex = '3';
								doms.editorView.style.top = 'auto';
								doms.chatWrapper.style.bottom = height + 'px';
								doms.emojiWrapper.style.bottom = height + 'px';
								doms.emojiWrapper.style.top = 'auto';
								me.scrollBottom();
								break;
							}
						}
					);
				}

				// 发送文件
				utils.on(doms.fileInput, 'change', function () {
					var fileInput = doms.fileInput;
					var filesize = utils.getDataByPath(fileInput, 'files.0.size');

					if (!fileInput.value) {
						// 未选择文件
					}
					else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
						uikit.tip('文件大小不能超过10MB');
					}
					else {
						me.channel.sendFile(WebIM.utils.getFileUrl(fileInput), fileInput);
					}
				});

				// 发送图片
				utils.on(doms.imgInput, 'change', function () {
					var fileInput = doms.imgInput;
					// ie8-9 do not support multifiles, so you can not get files
					var filesize = utils.getDataByPath(fileInput, 'files.0.size');

					if (!fileInput.value) {
						// 未选择文件
					}
					// 某些浏览器不能获取到正确的文件名，所以放弃文件类型检测
					// else if (!/\.(png|jpg|jpeg|gif)$/i.test(fileInput.value)) {
						// uikit.tip('不支持的图片格式');
					// }
					// 某些浏览器无法获取文件大小, 忽略
					else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
						uikit.tip('文件大小不能超过10MB');
						fileInput.value = '';
					}
					else {
						me.channel.sendImg(WebIM.utils.getFileUrl(fileInput), fileInput);
					}
				});

				//弹出文件选择框
				utils.on(doms.sendFileBtn, 'click', function () {
					// 发送文件是后来加的功能，无需考虑IE兼容
					if (!me.readyHandled) {
						uikit.tip('正在连接中...');
					}
					else {
						doms.fileInput.click();
					}
				});

				utils.on(doms.sendImgBtn, 'click', function () {
					if (!me.readyHandled) {
						uikit.tip('正在连接中...');
					}
					else {
						doms.imgInput.click();
					}
				});

				// 显示留言页面
				utils.on(doms.noteBtn, 'click', function () {
					easemobim.leaveMessage();
				});

				// 满意度评价
				utils.on(doms.satisfaction, 'click', function () {
					doms.textInput.blur();
					satisfaction.show();
				});

				// 回车发送消息
				utils.on(doms.textInput, 'keydown', function (evt) {
					if (
						evt.keyCode === 13
						&& !utils.isMobile
						&& !evt.ctrlKey
						&& !evt.shiftKey
					) {
						// ie8 does not support preventDefault & stopPropagation
						if (evt.preventDefault) {
							evt.preventDefault();
						}
						utils.trigger(doms.sendBtn, 'click');
					}
				});

				utils.on(doms.sendBtn, 'click', function () {
					var textMsg = doms.textInput.value;

					if (utils.hasClass(this, 'disabled')) {
						// 禁止发送
					}
					else if (textMsg.length > _const.MAX_TEXT_MESSAGE_LENGTH) {
						uikit.tip('输入字数过多');
					}
					else {
						me.channel.sendText(textMsg);
						doms.textInput.value = '';
						utils.trigger(doms.textInput, 'change');
					}
				});
			},
			scrollBottom: function () {
				var chatWrapper = doms.chatWrapper;

				chatWrapper.scrollTop = chatWrapper.scrollHeight - chatWrapper.offsetHeight + 9999;
			},
			handleEventStatus: function (action, info, robertToHubman) {
				var res = robertToHubman ? this.hasHumanAgentOnline : this.hasAgentOnline;
				if (!res) {
					// 显示无坐席在线
					// 每次激活只显示一次
					if (!this.noteShow) {
						this.noteShow = true;
						this.appendEventMsg(_const.eventMessageText.NOTE);
					}
				}

				if (action === 'reply' && info) {

					if (config.agentUserId) {
						this.startToGetAgentStatus();
					}

					this.setAgentProfile({
						userNickname: info.userNickname,
						avatar: info.avatar
					});
				}
				else if (action === 'create') { //显示会话创建
					this.appendEventMsg(_const.eventMessageText.CREATE);
				}
				else if (action === 'close') { //显示会话关闭
					this.appendEventMsg(_const.eventMessageText.CLOSED);
				}
				else if (action === 'transferd') { //显示转接到客服
					this.appendEventMsg(_const.eventMessageText.TRANSFER);
				}
				else if (action === 'transfering') { //显示转接中
					this.appendEventMsg(_const.eventMessageText.TRANSFERING);
				}
				else if (action === 'linked') { //接入成功
					this.appendEventMsg(_const.eventMessageText.LINKED);
				}

				if (action === 'transferd' || action === 'linked') {
					//坐席发生改变
					this.handleAgentStatusChanged(info);
				}
			},
			//坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
			handleAgentStatusChanged: function (info) {
				if (!info) return;

				config.agentUserId = info.userId;

				this.updateAgentStatus();
				this.startToGetAgentStatus();

				//更新头像和昵称
				this.setAgentProfile({
					userNickname: info.agentUserNiceName,
					avatar: info.avatar
				});
			},
			//转接中排队中等提示上屏
			appendEventMsg: function (msg) {
				//如果设置了hideStatus, 不显示转接中排队中等提示
				if (config.hideStatus) return;

				this.appendDate(new Date().getTime());
				// todo: xss defence
				utils.appendHTMLTo(doms.chatContainer, [
					'<div class="em-widget-event">',
					'<span>' + msg + '</span>',
					'</div>'
				].join(''));
				this.scrollBottom();
			},
			//消息上屏
			appendMsg: function (isReceived, msg, isHistory, date) {
				var me = this;
				var curWrapper = doms.chatContainer;
				var dom = easemobim.genDomFromMsg(msg, isReceived);
				var img = dom.querySelector('.em-widget-imgview');

				date = date || new Date().getTime();

				if (isHistory) {
					curWrapper.insertBefore(dom, curWrapper.firstChild);
					// 历史消息是向前插入，所以时间戳应在消息之后上屏
					this.appendDate(date, isHistory);
				}
				else {
					// 时间戳上屏
					this.appendDate(date, isHistory);

					if (img) {
						// 如果包含图片，则需要等待图片加载后再滚动消息
						curWrapper.appendChild(dom);
						me.scrollBottom();
						utils.one(img, 'load', function () {
							me.scrollBottom();
						});
					}
					else {
						// 非图片消息直接滚到底
						curWrapper.appendChild(dom);
						me.scrollBottom();
					}
				}
				// 缓存上屏的消息
				var msgData = {
					isReceived: isReceived,
					msg: msg,
					date: date
				};
				isHistory ? recentMsg.push(msgData) : recentMsg.unshift(msgData);
			},
			appendDate: function (date, isHistory) {
				var chatContainer = doms.chatContainer;
				var dom = document.createElement('div');
				var MESSAGE_TIME_SPAN_INTERVAL = 60000;

				// todo: xss defence
				dom.innerHTML = '<span>' + utils.formatDate(date) + '</span>';
				dom.className = 'em-widget-date';

				if (!isHistory) {
					date - msgTimeSpanEnd > MESSAGE_TIME_SPAN_INTERVAL
						&& chatContainer.appendChild(dom);
				}
				else {
					msgTimeSpanBegin - date > MESSAGE_TIME_SPAN_INTERVAL
						&& chatContainer.insertBefore(dom, chatContainer.firstChild);
				}

				// 更新时间范围
				date < msgTimeSpanBegin && (msgTimeSpanBegin = date);
				date > msgTimeSpanEnd && (msgTimeSpanEnd = date);
			},
			messagePrompt: function (message) {
				if (utils.isTop) return;

				var me = this;
				var tmpVal;
				var brief;
				switch (message.type) {
				case 'txt':
				case 'list':
					tmpVal = message.value.replace(/\n/mg, '');
					brief = utils.getBrief(tmpVal, 15);
					break;
				case 'img':
					brief = '[图片]';
					break;
				case 'file':
					brief = '[文件]';
					break;
				default:
					brief = '';
				}

				if (isChatWindowOpen) {
					transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
				}

				if (utils.isMin() || !isChatWindowOpen) {
					me.soundReminder();
					transfer.send({ event: _const.EVENTS.SLIDE }, window.transfer.to);
					transfer.send({
						event: _const.EVENTS.NOTIFY,
						data: {
							avatar: this.currentAvatar,
							title: '新消息',
							brief: brief
						}
					}, window.transfer.to);
				}
			},
			getRecentMsg: function(maxCount){
				return _.map(recentMsg.slice(0, maxCount), function(item){
					var type = item.msg.type;
					var date = utils.formatDate(item.date);
					var role = item.isReceived ? '客服坐席' : '访客';
					var value = item.msg.value;

					switch (type){
						case 'txt':
							break;
						case 'img':
							value = '[图片]';
							break;
						case 'file':
							value = '[文件]';
							break;
						case 'list':
							value = '[菜单]';
							break;
						default:
							value = '[未知消息类型]';
							break;
					}

					return '[' + date + '] ' + role + '\n' + value;
				}).join('\n');
			},
			hideLoading: function(msgId){
				utils.addClass(document.getElementById(msgId + '_loading'), 'hide');
			},
			showFailed :function (msgId) {
				this.hideLoading(msgId);
				utils.removeClass(document.getElementById(msgId + '_failed'), 'hide');
			},
			initUI: function(){
				(utils.isTop || !config.minimum) && utils.removeClass(doms.imChat, 'hide');

				// 设置联系客服按钮文字
				document.querySelector('.em-widget-pop-bar').innerText = config.buttonText;

				// 添加移动端样式类
				utils.isMobile && utils.addClass(document.body, 'em-mobile');

				// 留言按钮
				config.ticket && utils.removeClass(doms.noteBtn, 'hide');

				// 最小化按钮
				config.minimum
					&& !utils.isTop
					&& utils.removeClass(doms.minifyBtn, 'hide');

				// 低版本浏览器不支持上传文件/图片
				if (WebIM.utils.isCanUploadFileAsync){
					utils.removeClass(doms.sendImgBtn, 'hide');
					utils.removeClass(doms.sendFileBtn, 'hide');
				}

				// 静音按钮
				window.HTMLAudioElement
					&& !utils.isMobile
					&& config.soundReminder
					&& utils.removeClass(doms.audioBtn, 'hide')

				// 输入框位置开关
				utils.isMobile
					&& !config.hideKeyboard
					&& utils.removeClass(doms.switchKeyboardBtn, 'hide');

				// 满意度评价按钮
				config.satisfaction
					&& utils.removeClass(
						document.querySelector('.em-widget-satisfaction'),
						'hide'
					);
			}
		};
	};
}());

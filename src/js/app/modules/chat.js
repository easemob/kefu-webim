(function () {
	easemobim.chat = function (config) {
		var utils = easemobim.utils;
		var _const = easemobim._const;
		var api = easemobim.api;

		//DOM init
		easemobim.imBtn = document.getElementById('em-widgetPopBar');
		easemobim.imChat = document.getElementById('em-kefu-webim-chat');
		easemobim.imChatBody = document.getElementById('em-widgetBody');
		easemobim.send = document.getElementById('em-widgetSend');
		easemobim.textarea = easemobim.send.querySelector('.em-widget-textarea');
		easemobim.sendBtn = easemobim.send.querySelector('.em-widget-send');
		easemobim.sendImgBtn = easemobim.send.querySelector('.em-widget-img');
		easemobim.sendFileBtn = easemobim.send.querySelector('.em-widget-file');
		easemobim.noteBtn = document.querySelector('.em-widget-note');
		easemobim.dragHeader = document.getElementById('em-widgetDrag');
		easemobim.dragBar = easemobim.dragHeader.querySelector('.drag-bar');
		easemobim.avatar = document.querySelector('.em-widgetHeader-portrait');
		easemobim.swfupload = null; //flash 上传

		// todo: 把dom都移到里边
		var doms = {
			agentStatusText: document.querySelector('.em-header-status-text'),
			//待接入排队人数显示
			agentWaitNumber: document.querySelector('.em-header-status-text-queue-number'),
			agentStatusSymbol: document.getElementById('em-widgetAgentStatus'),
			nickname: document.querySelector('.em-widgetHeader-nickname'),
			imgInput: document.querySelector('.upload-img-container'),
			fileInput: document.querySelector('.upload-file-container'),
			emojiContainer: document.querySelector('.em-bar-emoji-container'),
			chatWrapper: document.querySelector('.em-widget-chat'),
			emojiWrapper: document.querySelector('.em-bar-emoji-wrapper'),
			emojiBtn: easemobim.send.querySelector('.em-bar-emoji'),
			block: null
		};

		easemobim.doms = doms;


		//cache current agent
		config.agentUserId = null;

		//chat window object
		return {
			init: function () {

				this.channel = easemobim.channel.call(this, config);

				//create & init connection
				this.conn = this.channel.getConnection();
				//sroll bottom timeout stamp
				this.scbT = 0;
				//just show date label once in 1 min
				this.msgTimeSpan = {};
				//chat window status
				this.opened = true;
				//init sound reminder
				this.soundReminder();

				this.initEmoji();
				//bind events on dom
				this.bindEvents();
			},
			handleReady: function (info) {
				var me = this;

				if (me.readyHandled) return;

				me.readyHandled = true;
				easemobim.sendBtn.innerHTML = '发送';
				utils.trigger(easemobim.textarea, 'change');

				// bug fix:
				// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
				if (config.minimum === false || config.eventCollector === true) {
					transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
				}
				if (info && config.user) {
					config.user.token = config.user.token || info.accessToken;
				}

				// easemobim.leaveMessage && easemobim.leaveMessage.auth(me.token, config);

				// 发送用于回呼访客的命令消息
				if (this.cachedCommandMessage) {
					me.channel.sendText('', false, this.cachedCommandMessage);
					this.cachedCommandMessage = null;
				}
				if (this.cachedSetSkillgroup) {
					chat.channel.sendText.apply(this,this.cachedSetSkillgroup);
				}
				if (utils.isTop) {
					//get visitor
					var visInfo = config.visitor;
					var prefix = (config.tenantId || '') + (config.emgroup || '');

					if (!visInfo) {
						visInfo = utils.getStore(prefix + 'visitor');
						try {
							config.visitor = JSON.parse(visInfo);
						}
						catch (e) {}
						utils.clearStore(config.tenantId + config.emgroup + 'visitor');
					}

					//get ext
					var ext = utils.getStore(prefix + 'ext');
					var parsed;
					try {
						parsed = JSON.parse(ext);
					}
					catch (e) {}
					if (parsed) {
						me.channel.sendText('', false, { ext: parsed });
						utils.clearStore(config.tenantId + config.emgroup + 'ext');
					}
				}
				else {
					transfer.send({ event: _const.EVENTS.ONREADY }, window.transfer.to);
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
				if (config.visitor) {
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
			ready: function () {
				var me = this;

				// 获取上下班状态
				getDutyStatusPromise = new Promise(function (resolve, reject) {
					api('getDutyStatus_2', {
						channelType: 'easemob',
						originType: 'webim',
						channelId: config.channelId,
						tenantId: config.tenantId,
						queueName: config.emgroup,
						agentUsername: config.agentName
					}, function (msg) {
						config.isInOfficehours = !msg.data.entity || config.offDutyType === 'chat';
						resolve();
					}, function (err) {
						reject(err);
					});
				});

				// 获取灰度开关
				getGrayListPromise = new Promise(function (resolve, reject) {
					api('graylist', {}, function (msg) {
						var grayList = {};
						var data = msg.data || {};
						_.each([
							'audioVideo',
							'msgPredictEnable',
							'waitListNumberEnable'
						], function (key) {
							grayList[key] = _.contains(data[key], +config.tenantId);
						});
						config.grayList = grayList;
						resolve();
					}, function (err) {
						reject(err);
					});
				});

				Promise.all([
					getDutyStatusPromise,
					getGrayListPromise
				]).then(function () {
					init();
				}, function (err) {
					throw err;
				});

				function init() {
					// 设置企业信息
					me.setEnterpriseInfo();

					// 显示广告条
					config.logo && me.setLogo();

					// 移动端输入框自动增长
					utils.isMobile && me.initAutoGrow();

					// 添加sdk回调，下班时不收消息
					me.channel.listen({ receiveMessage: config.isInOfficehours });

					// 连接xmpp server，下班留言需要获取token，同样需要连接xmpp server
					me.open();

					if (config.isInOfficehours) {
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

						// 第二通道收消息初始化
						me.channel.initSecondChannle();
					}
					else {
						// 设置下班时间展示的页面
						me.setOffline();
					}
				}
			},
			initAutoGrow: function () {
				var me = this;
				var originHeight = easemobim.textarea.clientHeight;

				if (me.isAutoGrowInitialized) return;
				me.isAutoGrowInitialized = true;

				utils.on(easemobim.textarea, 'input change', update);

				function update() {
					var height = this.value ? this.scrollHeight : originHeight;
					this.style.height = height + 'px';
					this.scrollTop = 9999;
					callback();
				}

				function callback() {
					var height = easemobim.send.getBoundingClientRect().height;
					if (me.direction === 'up') {
						doms.emojiWrapper.style.top = 43 + height + 'px';
					}
					else {
						easemobim.imChatBody.style.bottom = height + 'px';
						doms.emojiWrapper.style.bottom = height + 'px';
					}
					me.scrollBottom(800);
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
					utils.on(doms.chatWrapper, 'mousewheel DOMMouseScroll', function (ev) {
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
						me.channel.handleHistory(historyMsg);
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

				if (me.greetingGetted) return;

				me.greetingGetted = true;

				//system greeting
				api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function (msg) {
					var systemGreetingText = msg.data;
					systemGreetingText && me.receiveMsg({
						ext: {
							weichat: {
								html_safe_body: {
									msg: systemGreetingText
								}
							}
						},
						type: 'txt',
						noprompt: true
					}, 'txt');

					//robert greeting
					api('getRobertGreeting_2', {
						channelType: 'easemob',
						originType: 'webim',
						channelId: config.channelId,
						tenantId: config.tenantId,
						agentUsername: config.agentName,
						queueName: config.emgroup
					}, function (msg) {
						var greetingTextType = utils.getDataByPath(msg, 'data.entity.greetingTextType');
						var greetingText = utils.getDataByPath(msg, 'data.entity.greetingText');
						var greetingObj = {};
						if (typeof greetingTextType !== 'number') return;

						switch (greetingTextType) {
						case 0:
							// robert text greeting
							me.receiveMsg({
								ext: {
									weichat: {
										html_safe_body: {
											msg: greetingText
										}
									}
								},
								type: 'txt',
								noprompt: true
							}, 'txt');
							break;
						case 1:
							// robert list greeting
							try {
								greetingObj = JSON.parse(greetingText.replace(/&amp;quot;/g, '"'));
							}
							catch (e){
								console.warn('unexpected JSON string.', e);
							}

							if (greetingObj.ext) {
								me.receiveMsg({
									ext: greetingObj.ext,
									noprompt: true
								});
							}
							else {
								console.warn('The menu does not exist.');
							}
							break;
						default:
							console.warn('unknown greeting type.');
							break;
						}
					});
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

				var getExSessionPromise = new Promise(function(resolve, reject) {
					api('getExSession', {
						id: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						imServiceNumber: config.toUser,
						tenantId: config.tenantId
					}, function(msg) {
						var data = msg.data || {};
						var serviceSession = data.serviceSession;

						me.hasHumanAgentOnline = data.onlineHumanAgentCount > 0;
						me.hasAgentOnline = data.onlineHumanAgentCount + data.onlineRobotAgentCount > 0;

						if (serviceSession) {
							config.agentUserId = serviceSession.agentUserId;
							// 确保正在进行中的会话，刷新后还会继续轮询坐席状态
							me.startToGetAgentStatus();
							me.sendAttribute(msg);
							resolve({
								isInSession: true
							});
						} else {
							resolve({
								isInSession: false
							});
						}
					},function (err) {
						reject(err);
					});
				});

				var getSessionQueueIdPromise = new Promise(function(resolve, reject) {
					api('getSessionQueueId', {
						tenantId: config.tenantId,
						visitorUsername: config.user.username,
						techChannelInfo: config.orgName + '%23' + config.appName + '%23' + config.toUser
					}, function(resp) {
						var nowData = resp.data.entity;
						if (nowData && nowData.state === 'Wait') {
							resolve({
								isWaiting: true
							});
						} else {
							resolve({
								isWaiting: false
							});
						}
					},function (err) {
						reject(err);
					});
				});

				Promise.all([
					getExSessionPromise,
					getSessionQueueIdPromise
				]).then(function(result) {
					var isInSession = result[0].isInSession;
					var isWaiting = result[1].isWaiting;
					if (!isInSession && !isWaiting) {
						// 仅当会话不存在时获取欢迎语
						me.getGreeting();
						easemobim.querySkillgroup.show();
					} else {
						easemobim.querySkillgroup.hide();
					}
				}, function(err) {
					throw err;
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
					easemobim.avatar.src = avatarImg;
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
						easemobim.avatar.src = avatarImg;
					}
				}

				// 缓存头像地址
				this.currentAvatar = avatarImg;
			},
			setLogo: function () {
				utils.removeClass(document.querySelector('.em-widget-tenant-logo'), 'hide');
				document.querySelector('.em-widget-tenant-logo img').src = config.logo;
			},
			setNotice: function () {
				var me = this;

				if (me.sloganGot) return;
				me.sloganGot = true;

				api('getSlogan', {
					tenantId: config.tenantId
				}, function (msg) {
					var slogan = utils.getDataByPath(msg, 'data.0.optionValue');
					if (slogan) {
						// 设置信息栏内容
						document.querySelector('.em-widget-tip .content').innerHTML = WebIM.utils.parseLink(slogan);
						// 显示信息栏
						utils.addClass(easemobim.imChat, 'has-tip');

						// 隐藏信息栏按钮
						utils.on(
							document.querySelector('.em-widget-tip .tip-close'),
							utils.click,
							function () {
								// 隐藏信息栏
								utils.removeClass(easemobim.imChat, 'has-tip');
							}
						);
					}
				});
			},
			initEmoji: function () {
				var me = this;

				utils.on(doms.emojiBtn, utils.click, function () {
					easemobim.textarea.blur();
					utils.toggleClass(doms.emojiWrapper, 'hide');

					// 懒加载，打开表情面板时才初始化图标
					if (!me.isEmojiInitilized) {
						me.isEmojiInitilized = true;
						doms.emojiContainer.innerHTML = genHtml();
					}
				});

				// 表情的选中
				utils.live('img.emoji', utils.click, function (e) {
					!utils.isMobile && easemobim.textarea.focus();
					easemobim.textarea.value += this.getAttribute('data-value');
					utils.trigger(easemobim.textarea, 'change');
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
			errorPrompt: function (msg, isAlive) { //暂时所有的提示都用这个方法
				var me = this;

				if (!me.ePrompt) me.ePrompt = document.querySelector('.em-widget-error-prompt');
				if (!me.ePromptContent) me.ePromptContent = me.ePrompt.querySelector('span');

				me.ePromptContent.innerHTML = msg;
				utils.removeClass(me.ePrompt, 'hide');
				isAlive || setTimeout(function () {
					utils.addClass(me.ePrompt, 'hide');
				}, 2000);
			},
			getSafeTextValue: function (msg) {
				return utils.getDataByPath(msg, 'ext.weichat.html_safe_body.msg')
					|| utils.getDataByPath(msg, 'bodies.0.msg')
					|| '';
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

					var msg = new WebIM.message.txt();
					msg.set({ msg: word });
					// 显示下班提示语
					this.appendMsg(config.toUser, config.user.username, msg);
					// 禁用工具栏
					utils.addClass(easemobim.send, 'em-widget-send-disable');
					// 发送按钮去掉连接中字样
					easemobim.sendBtn.innerHTML = '发送';
					break;
				default:
					// 只允许留言此时无法关闭留言页面
					// easemobim.leaveMessage.show(!config.isInOfficehours);
					easemobim.querySkillgroup.hide();
					easemobim.workOrder.show(!config.isInOfficehours);
					break;
				}
			},
			//close chat window
			close: function () {
				this.opened = false;

				if (!config.hide) {
					utils.addClass(easemobim.imChat, 'hide');
					utils.removeClass(easemobim.imBtn, 'hide');
				}
			},
			//show chat window
			show: function () {
				var me = this;

				me.opened = true;
				me.scrollBottom(50);
				utils.addClass(easemobim.imBtn, 'hide');
				utils.removeClass(easemobim.imChat, 'hide');
				if (
					config.isInOfficehours
					// IE 8 will throw an error when focus an invisible element
					&& easemobim.textarea.offsetHeight > 0
				) {
					easemobim.textarea.focus();
				}
				!utils.isTop && transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
			},
			appendDate: function (date, to, isHistory) {
				var chatWrapper = doms.chatWrapper;
				var dom = document.createElement('div');

				dom.innerHTML = utils.formatDate(date);
				utils.addClass(dom, 'em-widget-date');

				if (!isHistory) {
					if (to) {
						if (this.msgTimeSpan[to] && (date - this.msgTimeSpan[to] > 60000)) { //间隔大于1min  show
							chatWrapper.appendChild(dom);
						}
						this.resetSpan(to);
					}
					else {
						chatWrapper.appendChild(dom);
					}
				}
				else {
					chatWrapper.insertBefore(dom, chatWrapper.firstChild);
				}
			},
			resetSpan: function (id) {
				this.msgTimeSpan[id] = new Date().getTime();
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
				var slienceSwitch = document.querySelector('.em-widgetHeader-audio');
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
					if (!isSlienceEnable && (utils.isMin() || !me.opened)) {
						play();
					}
				};
			},
			bindEvents: function () {
				var me = this;

				if (!utils.isTop) {
					// 最小化按钮
					utils.on(document.querySelector('.em-widgetHeader-min'), 'click', function () {
						transfer.send({ event: _const.EVENTS.CLOSE }, window.transfer.to);
					});

					utils.on(easemobim.imBtn, utils.click, function () {
						transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
					});

					utils.on(document, 'mouseover', function () {
						transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
					});
				}

				utils.on(easemobim.imChatBody, 'click', function () {
					easemobim.textarea.blur();
				});

				utils.live('img.em-widget-imgview', 'click', function () {
					easemobim.imgView.show(this.getAttribute('src'));
				});

				if (config.dragenable && !utils.isTop) {

					easemobim.dragBar.style.cursor = 'move';

					utils.on(easemobim.dragBar, 'mousedown', function (ev) {
						var e = window.event || ev;
						easemobim.textarea.blur(); //ie a  ie...
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

				//机器人列表
				utils.live('button.js_robotbtn', utils.click, function () {
					me.channel.sendText(this.innerText, null, {
						ext: {
							msgtype: {
								choice: {
									menuid: this.getAttribute('data-id')
								}
							}
						}
					});
				});

				var messagePredict = _.throttle(function (msg) {
					config.agentUserId
						&& config.visitorUserId
						&& api('messagePredict', {
							tenantId: config.tenantId,
							visitor_user_id: config.visitorUserId,
							agentId: config.agentUserId,
							content: msg.slice(0, _const.MESSAGE_PREDICT_MAX_LENGTH),
							timestamp: _.now(),
						});
				}, 1000);

				function handleSendBtn() {
					var isEmpty = !easemobim.textarea.value.trim();

					utils.toggleClass(
						easemobim.sendBtn,
						'disabled', !me.readyHandled || isEmpty
					);
					config.grayList.msgPredictEnable
						&& !isEmpty
						&& messagePredict(easemobim.textarea.value);
				}

				if (Modernizr.oninput) {
					utils.on(easemobim.textarea, 'input change', handleSendBtn);
				}
				else {
					utils.on(easemobim.textarea, 'keyup change', handleSendBtn);
				}

				if (utils.isMobile) {
					var handleFocus = function () {
						easemobim.textarea.style.overflowY = 'auto';
						me.scrollBottom(800);
						// todo: kill focusText
						clearInterval(me.focusText);
						me.focusText = setInterval(function () {
							document.body.scrollTop = 10000;
						}, 100);
					};
					utils.on(easemobim.textarea, 'focus', handleFocus);
					utils.one(easemobim.textarea, 'touchstart', handleFocus);
					utils.on(easemobim.textarea, 'blur', function () {
						clearInterval(me.focusText);
					});

					// 键盘上下切换按钮
					utils.on(
						document.querySelector('.em-widgetHeader-keyboard'),
						utils.click,
						function () {
							var status = utils.hasClass(this, 'icon-keyboard-down');
							var height = easemobim.send.getBoundingClientRect().height;
							me.direction = status ? 'down' : 'up';

							utils.toggleClass(this, 'icon-keyboard-up', status);
							utils.toggleClass(this, 'icon-keyboard-down', !status);

							switch (me.direction) {
							case 'up':
								easemobim.send.style.bottom = 'auto';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = '43px';
								easemobim.imChatBody.style.bottom = '0';
								doms.emojiWrapper.style.bottom = 'auto';
								doms.emojiWrapper.style.top = 43 + height + 'px';
								break;
							case 'down':
								easemobim.send.style.bottom = '0';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = 'auto';
								easemobim.imChatBody.style.bottom = height + 'px';
								doms.emojiWrapper.style.bottom = height + 'px';
								doms.emojiWrapper.style.top = 'auto';
								me.scrollBottom(50);
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
						me.errorPrompt('文件大小不能超过10MB');
					}
					else {
						me.channel.sendFile(WebIM.utils.getFileUrl(fileInput), false, fileInput);
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
						// me.errorPrompt('不支持的图片格式');
					// }
					// 某些浏览器无法获取文件大小, 忽略
					else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
						me.errorPrompt('文件大小不能超过10MB');
						fileInput.value = '';
					}
					else {
						me.channel.sendImg(WebIM.utils.getFileUrl(fileInput), false, fileInput);
					}
				});

				//弹出文件选择框
				utils.on(easemobim.sendFileBtn, 'click', function () {
					// 发送文件是后来加的功能，无需考虑IE兼容
					if (!me.readyHandled) {
						me.errorPrompt('正在连接中...');
					}
					else {
						doms.fileInput.click();
					}
				});

				utils.on(easemobim.sendImgBtn, 'click', function () {
					if (!me.readyHandled) {
						me.errorPrompt('正在连接中...');
					}
					else {
						doms.imgInput.click();
					}
				});

				//显示留言界面
				utils.on(easemobim.noteBtn, 'click', function () {
					// easemobim.leaveMessage.show();
					easemobim.workOrder.show();
				});

				// 回车发送消息
				utils.on(easemobim.textarea, 'keydown', function (evt) {
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
						utils.trigger(easemobim.sendBtn, 'click');
					}
				});

				utils.on(easemobim.sendBtn, 'click', function () {
					var textMsg = easemobim.textarea.value;

					if (utils.hasClass(this, 'disabled')) {
						// 禁止发送
					}
					else if (textMsg.length > _const.MAX_TEXT_MESSAGE_LENGTH) {
						me.errorPrompt('输入字数过多');
					}
					else {
						me.channel.sendText(textMsg);
						easemobim.textarea.value = '';
						utils.trigger(easemobim.textarea, 'change');
					}
				});
			},
			scrollBottom: function (wait) {
				var ocw = easemobim.imChatBody;

				if (wait) {
					clearTimeout(this.scbT);
					this.scbT = setTimeout(function () {
						ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 9999;
					}, wait);
				}
				else {
					ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 9999;
				}
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
				}
				//坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
				,
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
				}
				//转接中排队中等提示上屏
				,
			appendEventMsg: function (msg) {
					//如果设置了hideStatus, 不显示转接中排队中等提示
					if (config.hideStatus) return;

					var dom = document.createElement('div');

					dom.innerText = msg;
					dom.className = 'em-widget-event';

					this.appendDate(new Date().getTime());
					doms.chatWrapper.appendChild(dom);
					this.scrollBottom(utils.isMobile ? 800 : null);
				}
				//消息上屏
				,
			appendMsg: function (from, to, msg, isHistory) {
				var me = this;
				var isReceived = !(
					from
					&& config.user.username
					&& (from === config.user.username)
				);
				var curWrapper = doms.chatWrapper;
				var dom = easemobim.genDomFromMsg(msg, isReceived);
				var img = dom.querySelector('.em-widget-imgview');

				if (isHistory) {
					curWrapper.insertBefore(dom, curWrapper.firstChild);
				}
				else if (img) {
					// 如果包含图片，则需要等待图片加载后再滚动消息
					curWrapper.appendChild(dom);
					me.scrollBottom(utils.isMobile ? 800 : null);
					utils.one(img, 'load', function () {
						me.scrollBottom();
					});
				}
				else {
					// 非图片消息直接滚到底
					curWrapper.appendChild(dom);
					me.scrollBottom(utils.isMobile ? 800 : null);
				}
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
						brief = tmpVal.length > 15 ? tmpVal.slice(0, 15) + '...' : tmpVal;
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

					if (me.opened) {
						transfer.send({ event: _const.EVENTS.RECOVERY }, window.transfer.to);
					}

					if (utils.isMin() || !me.opened) {
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
				}
				//receive message function
				,
			receiveMsg: function (msg, type, isHistory) {
				this.channel.handleReceive(msg, type, isHistory);
			}
		};
	};
}());

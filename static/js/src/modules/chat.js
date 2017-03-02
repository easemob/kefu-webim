/**
 * webim交互相关
 */
;(function () {

	easemobim.chat = function ( config ) {
		var utils = easemobim.utils;
		var _const = easemobim._const;

		// todo: 把dom都移到里边
		var doms = {
			agentStatusText: document.querySelector('.em-header-status-text'),
			agentStatusSymbol: document.getElementById('em-widgetAgentStatus'),
			nickname: document.querySelector('.em-widgetHeader-nickname'),
			imgInput: document.querySelector('.upload-img-container'),
			fileInput: document.querySelector('.upload-file-container'),
			emojiContainer: document.querySelector('.em-bar-face-container'),
			block: null
		};

		easemobim.doms = doms;

		//DOM init
		easemobim.im = document.getElementById('EasemobKefuWebim');
		easemobim.imBtn = document.getElementById('em-widgetPopBar');
		easemobim.imChat = document.getElementById('em-kefu-webim-chat');
		easemobim.imChatBody = document.getElementById('em-widgetBody');
		easemobim.send = document.getElementById('em-widgetSend');
		easemobim.textarea = easemobim.send.querySelector('.em-widget-textarea');
		easemobim.sendBtn = easemobim.send.querySelector('.em-widget-send');
		easemobim.faceBtn = easemobim.send.querySelector('.em-bar-face');
		easemobim.sendImgBtn = easemobim.send.querySelector('.em-widget-img');
		easemobim.sendFileBtn = easemobim.send.querySelector('.em-widget-file');
		easemobim.noteBtn = document.querySelector('.em-widget-note');
		easemobim.dragHeader = document.getElementById('em-widgetDrag');
		easemobim.dragBar = easemobim.dragHeader.querySelector('.drag-bar');
		easemobim.chatFaceWrapper = document.querySelector('.em-bar-face-wrapper');
		easemobim.avatar = document.querySelector('.em-widgetHeader-portrait');
		easemobim.swfupload = null;//flash 上传


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
				//unread message count
				this.msgCount = 0;
				//just show date label once in 1 min
				this.msgTimeSpan = {};
				//chat window status
				this.opened = true;
				//fill theme
				this.setTheme();
				//init sound reminder
				this.soundReminder();
				//init face
				this.initEmoji();
				//bind events on dom
				this.bindEvents();
			}
			, handleReady: function ( info ) {
				var me = this;

				if (me.readyHandled) return;

				me.readyHandled = true;
				easemobim.sendBtn.innerHTML = '发送';
				utils.trigger(easemobim.textarea, 'change');

				// bug fix:
				// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
				if(config.minimum === false || config.eventCollector === true){
					transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
				}
				if ( info && config.user ) {
					config.user.token = config.user.token || info.accessToken;
				}

				easemobim.leaveMessage && easemobim.leaveMessage.auth(me.token, config);

				// 发送用于回呼访客的命令消息
				if(this.cachedCommandMessage){
					me.sendTextMsg('', false, this.cachedCommandMessage);
					this.cachedCommandMessage = null;
				}
				if ( utils.isTop ) {
					//get visitor
					var visInfo = config.visitor;
					var prefix = (config.tenantId || '') + (config.emgroup || '');

					if ( !visInfo ) {
						visInfo = utils.getStore(prefix + 'visitor');
						try {
							config.visitor = JSON.parse(visInfo);
						} catch ( e ) {}
						utils.clearStore(config.tenantId + config.emgroup + 'visitor');
					}

					//get ext
					var ext = utils.getStore(prefix + 'ext');
					var parsed;
					try {
						parsed = ext && JSON.parse(ext);
					}
					catch (e){}
					if (parsed){
						me.sendTextMsg('', false, {ext: JSON.parse(ext)});
						utils.clearStore(config.tenantId + config.emgroup + 'ext');
					}
				} else {
					transfer.send(easemobim.EVENTS.ONREADY, window.transfer.to);
				}
			}
			, setExt: function ( msg ) {
				msg.body.ext = msg.body.ext || {};
				msg.body.ext.weichat = msg.body.ext.weichat || {};

				//bind skill group
				if ( config.emgroup ) {
					msg.body.ext.weichat.queueName = decodeURIComponent(config.emgroup);
				}

				//bind visitor
				if ( config.visitor ) {
					msg.body.ext.weichat.visitor = config.visitor;
				}

				//bind agent
				if ( config.agentName ) {
					msg.body.ext.weichat.agentUsername = config.agentName;
				}

				//set language
				if ( config.language ) {
					msg.body.ext.weichat.language = config.language;
				}

				//set growingio id
				if ( config.grUserId ) {
					msg.body.ext.weichat.visitor = msg.body.ext.weichat.visitor || {};
					msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
				}
			}
			, ready: function () {
				var me = this;

				// 获取上下班状态
				getDutyStatusPromise = new Promise(function(resolve, reject){
					easemobim.api('getDutyStatus', {
						tenantId: config.tenantId
					}, function(msg) {
						config.isInOfficehours = !msg.data || config.offDutyType === 'chat';
						resolve();
					}, function(err){
						reject(err);
					});
				});

				// 获取灰度开关
				getGrayListPromise = new Promise(function(resolve, reject){
					easemobim.api('graylist', {}, function(msg){
						var grayList = {};
						var data = msg.data || {};
						_.each([
							'audioVideo',
							'msgPredictEnable'
						], function(key){
							grayList[key] = _.contains(data[key], +config.tenantId);
						});
						config.grayList = grayList;
						resolve();
					}, function(err){
						reject(err);
					});
				});

				Promise.all([
					getDutyStatusPromise,
					getGrayListPromise
				]).then(function(){
					init();
				}, function(err){
					throw err;
				});

				function init(){
					//create chat container
					me.handleGroup();

					// 显示广告条
					config.logo && me.setLogo();

					// 移动端输入框自动增长
					utils.isMobile && me.initAutoGrow();

					// 添加sdk回调，下班时不收消息
					me.channel.listen({receiveMessage: config.isInOfficehours});

					// 连接xmpp server，下班留言需要获取token，同样需要连接xmpp server
					me.open();

					if (config.isInOfficehours){
						//add tenant notice
						me.setNotice();

						// get service serssion info
						me.getSession();

						// 获取坐席昵称设置
						me.getNickNameOption();

						// 拉取历史消息
						!me.chatWrapper.getAttribute('data-getted')
						&& !config.isNewUser
						&& me.getHistory();
					}
					else {
						// 设置下班时间展示的页面
						!config.isInOfficehours && me.setOffline();
					}
				}
			}
			, initAutoGrow: function () {
				var me = this;
				var originHeight = easemobim.textarea.clientHeight;

				if (me.isAutoGrowInitialized) return;
				me.isAutoGrowInitialized = true;

				utils.on(easemobim.textarea, 'input', update);
				utils.on(easemobim.textarea, 'change', update);

				function update(){
					var height= this.value ? this.scrollHeight : originHeight;
					this.style.height = height + 'px';
					this.scrollTop = 9999;
					callback();
				}

				function callback(){
					var height = easemobim.send.getBoundingClientRect().height;
					if ( me.direction === 'up' ) {
						easemobim.chatFaceWrapper.style.top = 43 + height + 'px';
					}
					else {
						easemobim.imChatBody.style.bottom = height + 'px';
						easemobim.chatFaceWrapper.style.bottom = height + 'px';
					}
					me.scrollBottom(800);
				}
			}
			, handleChatWrapperByHistory: function ( chatHistory, chatWrapper ) {
				if ( chatHistory.length === easemobim.LISTSPAN ) {//认为可以继续获取下一页历史记录
					var startSeqId = Number(chatHistory[easemobim.LISTSPAN - 1].chatGroupSeqId) - 1;

					if ( startSeqId > 0 ) {
						chatWrapper.setAttribute('data-start', startSeqId);
						chatWrapper.setAttribute('data-history', 0);
					} else {
						chatWrapper.setAttribute('data-history', 1);
					}
				} else {
					chatWrapper.setAttribute('data-history', 1);
				}
			}
			, getHistory: function ( notScroll ) {
				var me = this,
					chatWrapper = me.chatWrapper,
					groupid = chatWrapper.getAttribute('data-groupid');

				if ( groupid ) {
					Number(chatWrapper.getAttribute('data-history')) || easemobim.api('getHistory', {
						fromSeqId: chatWrapper.getAttribute('data-start') || 0
						, size: easemobim.LISTSPAN
						, chatGroupId: groupid
						, tenantId: config.tenantId
					}, function ( msg ) {
						me.handleChatWrapperByHistory(msg.data, chatWrapper);
						if ( msg.data && msg.data.length > 0 ) {
							me.channel.handleHistory(msg.data);
							notScroll || me.scrollBottom();
						}
					});
				} else {
					Number(chatWrapper.getAttribute('data-history')) || easemobim.api('getGroupNew', {
						id: config.user.username
						, orgName: config.orgName
						, appName: config.appName
						, imServiceNumber: config.toUser
						, tenantId: config.tenantId
					}, function ( msg ) {
						if ( msg && msg.data ) {
							chatWrapper.setAttribute('data-groupid', msg.data);
							easemobim.api('getHistory', {
								fromSeqId: chatWrapper.getAttribute('data-start') || 0
								, size: easemobim.LISTSPAN
								, chatGroupId: msg.data
								, tenantId: config.tenantId
							}, function ( msg ) {
								me.handleChatWrapperByHistory(msg.data, chatWrapper);
								if ( msg && msg.data && msg.data.length > 0 ) {
									me.channel.handleHistory(msg.data);
									notScroll || me.scrollBottom();
								}
							});
						}
					});
				}
				chatWrapper.setAttribute('data-getted', 1);
			}
			, getGreeting: function () {
				var me = this;

				if ( me.greetingGetted ) return;

				me.greetingGetted = true;

				//system greeting
				easemobim.api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function ( msg ) {
					msg && msg.data && me.receiveMsg({
						data: msg.data,
						ext: {
							weichat: {
								html_safe_body: {
									msg: msg.data
								}
							}
						},
						type: 'txt',
						noprompt: true
					}, 'txt');

					//robert greeting
					easemobim.api('getRobertGreeting', {
						tenantId: config.tenantId,
						originType: 'webim'
					}, function ( msg ) {
						var rGreeting = msg && msg.data;
						if(!rGreeting) return;
						switch (rGreeting.greetingTextType) {
							case 0:
								//robert text greeting
								me.receiveMsg({
									data: rGreeting.greetingText,
									ext: {
										weichat: {
											html_safe_body: {
												msg: rGreeting.greetingText
											}
										}
									},
									type: 'txt',
									noprompt: true
								}, 'txt');
								break;
							case 1:
								try {
									var greetingObj = JSON.parse(rGreeting.greetingText.replace(/&quot;/g, '"'));
									if ( rGreeting.greetingText === '{}' ) {
										me.receiveMsg({
											data: '该菜单不存在',
											type: 'txt',
											noprompt: true
										}, 'txt');
									} else {
										//robert list greeting
										me.receiveMsg({ 
											ext: greetingObj.ext,
											noprompt: true
										});	
									}
								} catch ( e ) {}
								break;
							default:
								break;
						}
					});
				});
			}
			, getNickNameOption: function () {
				if (this.nicknameGetted) return;
				this.nicknameGetted = true;

				easemobim.api('getNickNameOption', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if (msg && msg.data && msg.data.length) {
						config.nickNameOption = msg.data[0].optionValue === 'true';
					} else {
						config.nickNameOption = null;
					}
				}, function () {
					config.nickNameOption = null;
				});
			}
			, getSession: function () {
				var me = this;

				me.agent = me.agent || {};

				easemobim.api('getExSession', {
					id: config.user.username
					, orgName: config.orgName
					, appName: config.appName
					, imServiceNumber: config.toUser
					, tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg && msg.data ) {
						me.agentCount = msg.data.onlineHumanAgentCount + msg.data.onlineRobotAgentCount;
						config.agentUserId = utils.getDataByPath(msg, 'data.serviceSession.agentUserId');

						if ( me.agentCount === 0 ) {
							me.noteShow = false;
						}

						// 确保正在进行中的会话，刷新后还会继续轮询坐席状态
						if(config.agentUserId){
							me.startToGetAgentStatus();
						}
					} else {
						me.getGreeting();
					}

					if (!msg.data.serviceSession) {
						//get greeting only when service session is not exist
						me.getGreeting();
					} else {
						me.sendAttribute(msg);
					}
				});
			},
			sendAttribute:function(msg){
				var visitorUserId = utils.getDataByPath(msg, 'data.serviceSession.visitorUser.userId');
				if(!this.hasSentAttribute && visitorUserId){
					this.hasSentAttribute = true;
					// 缓存 visitorUserId
					config.visitorUserId = visitorUserId;
					easemobim.api('sendVisitorInfo', {
						tenantId: config.tenantId,
						visitorId: visitorUserId,
						referer:  document.referrer
					});
				}
			}
			, handleGroup: function () {
				this.chatWrapper = easemobim.imChatBody.querySelector('.em-widget-chat');

				this.setAgentProfile({
					tenantName: config.defaultAgentName,
					avatar: config.tenantAvatar
				});
			}
			, getMsgid: function(msg){
				return utils.getDataByPath(msg, 'ext.weichat.msgId')
					|| utils.getDataByPath(msg, 'msgId');
			}
			, startToGetAgentStatus: function () {
				var me = this;

				if ( config.agentStatusTimer ) return;

				// start to poll
				config.agentStatusTimer = setInterval(function() {
					me.updateAgentStatus();
				}, 5000);
			}
			, stopGettingAgentStatus: function () {
				config.agentStatusTimer = clearInterval(config.agentStatusTimer);
			}
			, clearAgentStatus: function () {
				doms.agentStatusSymbol.className = 'hide';
				doms.agentStatusText.innerText = '';
			}
			, updateAgentStatus: function () {
				var me = this;

				if ( !config.agentUserId || !config.nickNameOption ) {
					me.stopGettingAgentStatus();
					return;
				}

				easemobim.api('getAgentStatus', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					agentUserId: config.agentUserId,
					userName: config.user.username,
					token: config.user.token,
					imServiceNumber: config.toUser
				}, function ( msg ) {
					var state = utils.getDataByPath(msg, 'data.state');

					if (state) {
						doms.agentStatusText.innerText = _const.agentStatusText[state];
						doms.agentStatusSymbol.className = 'em-widget-agent-status ' + _const.agentStatusClassName[state];
					}
				});
			}
			, setAgentProfile: function ( info ) {

				var avatarImg = info && info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.tenantAvatar || config.defaultAvatar;

				//更新企业头像和名称
				if ( info.tenantName ) {
					doms.nickname.innerText = info.tenantName;
					easemobim.avatar.setAttribute('src', avatarImg);
				}

				//昵称开关关闭
				if (!config.nickNameOption) return;

				// fake: 默认不显示调度员昵称
				if('调度员' === info.userNickname) return;

				if(!info.userNickname) return;

				//更新坐席昵称
				doms.nickname.innerText = info.userNickname;

				this.currentAvatar = avatarImg;
				var src = easemobim.avatar.getAttribute('src');

				if ( !this.currentAvatar ) { return; }
				easemobim.avatar.setAttribute('src', this.currentAvatar);

				//更新头像显示状态
				//只有头像和昵称更新成客服的了才开启轮训
				//this.updateAgentStatus();
			}
			, setTheme: function () {
				easemobim.api('getTheme', {
					tenantId: config.tenantId
				}, function (msg) {
					var themeName = utils.getDataByPath(msg, 'data.0.optionValue');
					var className = _const.themeMap[themeName];

					className && utils.addClass(document.body, className);
				});
			}
			, setLogo: function () {
				utils.removeClass(document.querySelector('.em-widget-tenant-logo'), 'hide');
				document.querySelector('.em-widget-tenant-logo img').src = config.logo;
			}
			, setNotice: function () {
				var me = this;

				if (me.sloganGot) return;
				me.sloganGot = true;

				easemobim.api('getSlogan', {
					tenantId: config.tenantId
				}, function (msg) {
					var slogan = utils.getDataByPath(msg, 'data.0.optionValue');
					if(slogan){
						// 设置信息栏内容
						document.querySelector('.em-widget-tip .content').innerHTML = WebIM.utils.parseLink(slogan);
						// 显示信息栏
						utils.addClass(easemobim.imChat, 'has-tip');

						// 隐藏信息栏按钮
						utils.on(
							document.querySelector('.em-widget-tip .tip-close'),
							utils.click,
							function(){
								// 隐藏信息栏
								utils.removeClass(easemobim.imChat, 'has-tip');
							}
						);
					}
				});
			}
			, initEmoji: function () {
				// lazy load
				if (doms.emojiContainer.innerHTML) return;

				var faceStr = '';
				var count = 0;
				var me = this;

				utils.on(easemobim.faceBtn, utils.click, function () {
					easemobim.textarea.blur();
					utils.toggleClass(easemobim.chatFaceWrapper, 'hide');

					if ( faceStr ) return false;
					faceStr = '<li class="e-face">';
					_.each(WebIM.Emoji.map, function (v, k) {
						count += 1;
						faceStr += ["<div class='em-bar-face-bg e-face'>",
										"<img class='em-bar-face-img e-face emoji' ",
											"src='" + WebIM.Emoji.path + v + "' ",
											"data-value=" + k + " />",
									"</div>"].join('');
						if ( count % 7 === 0 ) {
							faceStr += '</li><li class="e-face">';
						}
					});
					if ( count % 7 === 0 ) {
						faceStr = faceStr.slice(0, -('<li class="e-face">').length);
					} else {
						faceStr += '</li>';
					}

					doms.emojiContainer.innerHTML = faceStr;
				});

				//表情的选中
				utils.live('img.emoji', utils.click, function ( e ) {
					!utils.isMobile && easemobim.textarea.focus();
					easemobim.textarea.value += this.getAttribute('data-value');
					utils.trigger(easemobim.textarea, 'change');
				}, easemobim.chatFaceWrapper);
			}
			, errorPrompt: function ( msg, isAlive ) {//暂时所有的提示都用这个方法
				var me = this;

				if (!me.ePrompt) me.ePrompt = document.querySelector('.em-widget-error-prompt');
				if (!me.ePromptContent) me.ePromptContent = me.ePrompt.querySelector('span');
				
				me.ePromptContent.innerHTML = msg;
				utils.removeClass(me.ePrompt, 'hide');
				isAlive || setTimeout(function () {
					utils.addClass(me.ePrompt, 'hide');
				}, 2000);
			}
			, getSafeTextValue: function ( msg ) {
				return utils.getDataByPath(msg, 'ext.weichat.html_safe_body.msg')
					|| utils.getDataByPath(msg, 'bodies.0.msg')
					|| '';
			}
			, setOffline: function () {
				switch (config.offDutyType) {
					case 'none':
						// 下班禁止留言、禁止接入会话
						var word = config.offDutyWord || '现在是下班时间。';

						try {
							word = decodeURIComponent(word);
						} catch ( e ) {}

						var msg = new WebIM.message('txt');
						msg.set({msg: word});
						if ( !this.chatWrapper ) {
							this.handleGroup();
						}
						// 显示下班提示语
						this.appendMsg(config.toUser, config.user.username, msg);
						// 禁用工具栏
						utils.addClass(easemobim.send, 'em-widget-send-disable');
						// 发送按钮去掉连接中字样
						easemobim.sendBtn.innerHTML = '发送';
						break;
					default:
						// 只允许留言
						utils.addClass(easemobim.imChatBody, 'hide');
						utils.addClass(easemobim.send, 'hide');
						// 不允许关闭留言
						easemobim.leaveMessage.show(!config.isInOfficehours);
						break;
				}
			}
			//close chat window
			, close: function () {
				this.opened = false;

				if ( !config.hide ) {
					utils.addClass(easemobim.imChat, 'hide');
					setTimeout(function () {
						utils.removeClass(easemobim.imBtn, 'hide');
					}, 60);
				}
			}
			//show chat window
			, show: function () {
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
				!utils.isTop && transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
			}
			, appendDate: function ( date, to, isHistory ) {
				var chatWrapper = this.chatWrapper;
				var dom = document.createElement('div');
				var fmt = 'M月d日 hh:mm';

				if (!chatWrapper) return;

				dom.innerHTML = new Date(date).format(fmt);
				utils.addClass(dom, 'em-widget-date');

				if ( !isHistory ) {
					if ( to ) {
						if ( !this.msgTimeSpan[to] || (date - this.msgTimeSpan[to] > 60000) ) {//间隔大于1min  show
							chatWrapper.appendChild(dom); 
						}
						this.resetSpan(to);
					} else {
						chatWrapper.appendChild(dom); 
					}
				} else {
					utils.insertBefore(chatWrapper, dom, chatWrapper.getElementsByTagName('div')[0]);
				}
			}
			, resetSpan: function ( id ) {
				this.msgTimeSpan[id] = new Date().getTime();
			}
			, open: function () {
				var me = this;

				var op = {
					user: config.user.username
					, appKey: config.appKey
					, apiUrl: location.protocol + '//' + config.restServer
				};

				if ( config.user.token ) {
					op.accessToken = config.user.token;
				} else {
					op.pwd = config.user.password;
				}

				me.conn.open(op);

				Modernizr.peerconnection
				&& config.grayList.audioVideo
				&& easemobim.videoChat.init(me.conn, me.channel.send, config);
			}
			, soundReminder: function () {
				if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
					return;
				}

				var me = this;
				var audioDom = document.createElement('audio');
				var slienceSwitch = document.querySelector('.em-widgetHeader-audio');
				var isSlienceEnable = false;
				var play = _.throttle(function(){
					audioDom.play();
				}, 3000, {trailing: false});

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
			}
			, bindEvents: function () {
				var me = this;

				if(!utils.isTop){
					// 最小化按钮
					utils.on(document.querySelector('.em-widgetHeader-min'), 'click', function () {
						transfer.send(easemobim.EVENTS.CLOSE, window.transfer.to);
					});

					utils.on(easemobim.imBtn, utils.click, function () {
						transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
					});

					utils.on(document, 'mouseover', function () {
						transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
					});
				}

				utils.on(easemobim.imChatBody, 'click', function () {
					easemobim.textarea.blur();
					return false;
				});

				utils.live('img.em-widget-imgview', 'click', function () {
					easemobim.imgView.show(this.getAttribute('src'));
				});

				if (config.dragenable && !utils.isTop) {
					
					easemobim.dragBar.style.cursor = 'move';

					utils.on(easemobim.dragBar, 'mousedown', function ( ev ) {
						var e = window.event || ev;
						easemobim.textarea.blur();//ie a  ie...
						easemobim.EVENTS.DRAGREADY.data = { x: e.clientX, y: e.clientY };
						transfer.send(easemobim.EVENTS.DRAGREADY, window.transfer.to);
						return false;
					}, false);
				}

				//pc 和 wap 的上滑加载历史记录的方法
				(function () {
					var st,
						_startY,
						_y,
						touch;

					//wap
					utils.live('div.em-widget-date', 'touchstart', function ( ev ) {
						var e = ev || window.event,
							touch = e.touches;

						if ( e.touches && e.touches.length > 0 ) {
							_startY = touch[0].pageY;
						}
					});
					utils.live('div.em-widget-date', 'touchmove', function ( ev ) {
						var e = ev || window.event,
							touch = e.touches;

						if ( e.touches && e.touches.length > 0 ) {
							_y = touch[0].pageY;
							if ( _y - _startY > 8 && this.getBoundingClientRect().top >= 0 ) {
								clearTimeout(st);
								st = setTimeout(function () {
									me.getHistory(true);
								}, 100);
							}
						}
					});

					//pc
					var getHis = function ( ev ) {
						var e = ev || window.event,
							that = this;

						if ( e.wheelDelta / 120 > 0 || e.detail < 0 ) {
							clearTimeout(st);
							st = setTimeout(function () {
								if ( that.getBoundingClientRect().top >= 0 ) {
									me.getHistory(true);
								}
							}, 400);
						}
					};
					utils.live('div.em-widget-chat', 'mousewheel', getHis);
					utils.live('div.em-widget-chat', 'DOMMouseScroll', getHis);
				}());

				//resend
				utils.live('div.em-widget-msg-status', utils.click, function () {
					var id = this.getAttribute('id').slice(0, -'_failed'.length);

					utils.addClass(this, 'hide');
					utils.removeClass(document.getElementById(id + '_loading'), 'hide');
					if ( this.getAttribute('data-type') === 'txt' ) {
						me.channel.reSend('txt', id);
					} else {
						me.conn.send(id);
					}
				});

				utils.live('button.js_robotTransferBtn', utils.click,  function () {
					if ( this.clicked ) { return false; }

					this.clicked = true;
					me.transferToKf(this.getAttribute('data-id'), this.getAttribute('data-sessionid'));
					return false;
				});

				//机器人列表
				utils.live('button.js_robotbtn', utils.click, function () {
					me.sendTextMsg(this.innerText, null, {ext:
						{
							msgtype: {
								choice: {
									menuid: this.getAttribute('data-id')
								}
							}
						}
					});
					return false;
				});

				var messagePredict = _.throttle(function(msg){
					config.agentUserId
					&& config.visitorUserId
					&& easemobim.api('messagePredict', {
						tenantId: config.tenantId,
						visitor_user_id: config.visitorUserId,
						agentId: config.agentUserId,
						content: msg.slice(0, _const.MESSAGE_PREDICT_MAX_LENGTH),
						timestamp: _.now(),
					});
				}, 1000);
				function handleSendBtn(){
					var isEmpty = !easemobim.textarea.value.trim();

					utils.toggleClass(
						easemobim.sendBtn,
						'disabled',
						!me.readyHandled || isEmpty
					);
					config.grayList.msgPredictEnable
					&& !isEmpty
					&& messagePredict(easemobim.textarea.value);
				}

				if (Modernizr.oninput){
					utils.on(easemobim.textarea, 'input change', handleSendBtn);
				}
				else {
					utils.on(easemobim.textarea, 'keyup change', handleSendBtn);
				}

				if ( utils.isMobile ) {
					var handleFocus = function () {
						easemobim.textarea.style.overflowY = 'auto';
						me.scrollBottom(800);
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
						function(){
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
									easemobim.chatFaceWrapper.style.bottom = 'auto';
									easemobim.chatFaceWrapper.style.top = 43 + height + 'px';
									break;
								case 'down':
									easemobim.send.style.bottom = '0';
									easemobim.send.style.zIndex = '3';
									easemobim.send.style.top = 'auto';
									easemobim.imChatBody.style.bottom = height + 'px';
									easemobim.chatFaceWrapper.style.bottom = height + 'px';
									easemobim.chatFaceWrapper.style.top = 'auto';
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
					
					if(!fileInput.value){
						// 未选择文件
					}
					else if(filesize < _const.UPLOAD_FILESIZE_LIMIT){
						me.sendFileMsg(WebIM.utils.getFileUrl(fileInput));
					}
					else{
						me.errorPrompt('文件大小不能超过10MB');
					}	
				});

				// 发送图片
				utils.on(doms.imgInput, 'change', function () {
					var fileInput = doms.imgInput;
					// ie8-9 do not support multifiles, so you can not get files
					var filename = utils.getDataByPath(fileInput, 'files.0.name');
					var filesize = utils.getDataByPath(fileInput, 'files.0.size');

					if(!fileInput.value){
						// 未选择文件
					}
					// ie8-9 use value check file type
					else if(!/\.(png|jpg|jpeg|gif)$/i.test(filename || fileInput.value)){
						me.errorPrompt('不支持的图片格式');
					}
					// ie8-9 can not get size, ignore, use flash
					else if(filesize > _const.UPLOAD_FILESIZE_LIMIT){
						me.errorPrompt('文件大小不能超过10MB');
					}
					else{
						me.sendImgMsg(WebIM.utils.getFileUrl(fileInput));
					}
				});

				//hide face wrapper
				utils.on(document, utils.click, function ( ev ) {
					var e = window.event || ev;
					var t = e.srcElement || e.target;

					if ( !utils.hasClass(t, 'e-face') ) {
						utils.addClass(easemobim.chatFaceWrapper, 'hide');
					}
				});

				//弹出文件选择框
				utils.on(easemobim.sendFileBtn, 'click', function () {
					// 发送文件是后来加的功能，无需考虑IE兼容
					if ( !me.readyHandled ) {
						me.errorPrompt('正在连接中...');
					}
					else {
						doms.fileInput.click();
					}
				});
				
				utils.on(easemobim.sendImgBtn, 'click', function () {
					if ( !me.readyHandled ) {
						me.errorPrompt('正在连接中...');
					}
					else if ( !WebIM.utils.isCanUploadFileAsync ) {
						me.errorPrompt('当前浏览器需要安装flash发送文件');
					}
					else {
						doms.imgInput.click();
					}
				});

				//显示留言界面
				utils.on(easemobim.noteBtn, 'click', function () {
					easemobim.leaveMessage.show();
				});

				// 回车发送消息
				utils.on(easemobim.textarea, 'keydown', function ( evt ) {
					if (
						evt.keyCode === 13
						&& !utils.isMobile
						&& !evt.ctrlKey
						&& !evt.shiftKey
					){
						evt.preventDefault();
						utils.trigger(easemobim.sendBtn, 'click');
					}
				});

				utils.on(easemobim.sendBtn, 'click', function () {
					var textMsg = easemobim.textarea.value;

					if (utils.hasClass(this, 'disabled')) {
						// 禁止发送
					}
					else if (textMsg.length > _const.MAX_TEXT_MESSAGE_LENGTH){
						me.errorPrompt('输入字数过多');
					}
					else {
						// todo: 去掉encode
						me.sendTextMsg(utils.encode(textMsg));
						easemobim.textarea.value = '';
						utils.trigger(easemobim.textarea, 'change');
					}
				});
			}
			, scrollBottom: function ( wait ) {
				var ocw = easemobim.imChatBody;

				if (wait){
					clearTimeout(this.scbT);
					this.scbT = setTimeout(function(){
						ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 9999;
					}, wait);
				}
				else {
					ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 9999;
				}
			}
			//send image message function
			, sendImgMsg: function ( file, isHistory ) {
				this.channel.send('img', file, isHistory);
			}
			//send file message function
			, sendFileMsg: function ( file, isHistory ) {
				this.channel.send('file', file, isHistory);
			}
			, handleEventStatus: function ( action, info, robertToHubman ) {

				var res = robertToHubman ? this.onlineHumanAgentCount < 1 : this.agentCount < 1;
				if ( res ) {//显示无坐席在线
					
					//每次激活只显示一次
					if ( !this.noteShow ) {
						this.noteShow = true;
						this.appendEventMsg(_const.eventMessageText.NOTE);
					}
					
				}

				if ( action === 'reply' && info ) {

					if ( config.agentUserId ) {
						this.startToGetAgentStatus();
					}

					this.setAgentProfile({
						userNickname: info.userNickname,
						avatar: info.avatar
					});
				} else if ( action === 'create' ) {//显示会话创建
					this.appendEventMsg(_const.eventMessageText.CREATE);
				} else if ( action === 'close' ) {//显示会话关闭
					this.appendEventMsg(_const.eventMessageText.CLOSED);
				} else if ( action === 'transferd' ) {//显示转接到客服
					this.appendEventMsg(_const.eventMessageText.TRANSFER);
				} else if ( action === 'transfering' ) {//显示转接中
					this.appendEventMsg(_const.eventMessageText.TRANSFERING);
				 } else if ( action === 'linked' ) {//接入成功
					this.appendEventMsg(_const.eventMessageText.LINKED);
				}

				if(action === 'transferd' || action === 'linked'){
					//坐席发生改变
					this.handleAgentStatusChanged(info);
				}
			}
			//坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
			, handleAgentStatusChanged: function ( info ) {
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
			, appendEventMsg: function (msg) {
				//如果设置了hideStatus, 不显示转接中排队中等提示
				if (config.hideStatus) return;

				var dom = document.createElement('div');

				dom.innerText = msg;
				dom.className = 'em-widget-event';

				this.appendDate(new Date().getTime());
				this.chatWrapper.appendChild(dom);
				this.scrollBottom(utils.isMobile ? 800 : null);
			}
			//消息上屏
			, appendMsg: function ( from, to, msg, isHistory ) {
				var me = this;
				var isReceived = !(
					from
					&& config.user.username
					&& (from === config.user.username)
				);
				var curWrapper = me.chatWrapper;
				var div = document.createElement('div');
				var img;

				div.innerHTML = msg.get(isReceived);
				img = div.querySelector('.em-widget-imgview');

				if (isHistory){
					utils.insertBefore(curWrapper, div, curWrapper.childNodes[0]);
				}
				else if (img){
					// 如果是图片，则需要等待图片加载后再滚动消息
					curWrapper.appendChild(div);
					me.scrollBottom(utils.isMobile ? 800 : null);
					utils.one(img, 'load', function(){
						me.scrollBottom();
					});
				}
				else {
					// 非图片消息直接滚到底
					curWrapper.appendChild(div);
					me.scrollBottom(utils.isMobile ? 800 : null);
				}
			}
			//send text message function
			, sendTextMsg: function ( message, isHistory, ext ) {
				this.channel.send('txt', message, isHistory, ext);
			}
			, transferToKf: function ( id, sessionId ) {
				this.channel.send('transferToKf', id, sessionId);
			}
			//send satisfaction evaluation message function
			, sendSatisfaction: function ( level, content, session, invite ) {
				this.channel.send('satisfaction', level, content, session, invite);
			}
			, messagePrompt: function ( message ) {
				if (utils.isTop) return;

				var me = this;
				var tmpVal;
				var brief;
				switch (message.type){
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
					transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
				}

				if ( utils.isMin() || !me.opened ) {
					me.soundReminder();
					transfer.send(easemobim.EVENTS.SLIDE, window.transfer.to);
					transfer.send({
						event: 'notify',
						data: {
							avatar: this.currentAvatar,
							title: '新消息',
							brief: brief
						}
					}, window.transfer.to);
				}
			}
			//receive message function
			, receiveMsg: function ( msg, type, isHistory ) {
				this.channel.handleReceive(msg, type, isHistory);
			}
		};
	};



	/**
	 * 调用指定接口获取数据
	*/
	easemobim.api = function ( apiName, data, success, error ) {
		//cache
		easemobim.api[apiName] = easemobim.api[apiName] || {};

		var ts = new Date().getTime();
		easemobim.api[apiName][ts] = {
			success: success,
			error: error
		};
		easemobim.getData
		.send({
			api: apiName
			, data: data
			, timespan: ts
		})
		.listen(function ( msg ) {
			if ( easemobim.api[msg.call] && easemobim.api[msg.call][msg.timespan] ) {

				var callback = easemobim.api[msg.call][msg.timespan];
				delete easemobim.api[msg.call][msg.timespan];

				if ( msg.status !== 0 ) {
					typeof callback.error === 'function' && callback.error(msg);
				} else {
					typeof callback.success === 'function' && callback.success(msg);
				}
			}
		}, ['api']);
	};
}());

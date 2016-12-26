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
			agentStatusSymbol: utils.$Dom('em-widgetAgentStatus'),
			nickname: document.querySelector('.em-widgetHeader-nickname'),
			imgInput: document.querySelector('.upload-img-container'),
			fileInput: document.querySelector('.upload-file-container')
		};

		easemobim.doms = doms;

		//DOM init
		easemobim.im = utils.$Dom('EasemobKefuWebim');
		easemobim.imBtn = utils.$Dom('em-widgetPopBar');
		easemobim.imChat = utils.$Dom('em-kefu-webim-chat');
		easemobim.imChatBody = utils.$Dom('em-widgetBody');
		easemobim.send = utils.$Dom('em-widgetSend');
		easemobim.textarea = easemobim.send.querySelector('.em-widget-textarea');
		easemobim.sendBtn = utils.$Dom('em-widgetSendBtn');
		easemobim.faceBtn = easemobim.send.querySelector('.em-bar-face');
		easemobim.sendImgBtn = utils.$Dom('em-widgetImg');
		easemobim.sendFileBtn = utils.$Dom('em-widgetFile');
		easemobim.noteBtn = utils.$Dom('em-widgetNote');
		easemobim.dragHeader = utils.$Dom('em-widgetDrag');
		easemobim.dragBar = easemobim.dragHeader.querySelector('.drag-bar');
		easemobim.chatFaceWrapper = utils.$Dom('EasemobKefuWebimFaceWrapper');
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
				this.fillFace();
				//bind events on dom
				this.bindEvents();
			}
			, handleReady: function ( info ) {
				var me = this;
				if ( easemobim.textarea.value ) {
					utils.removeClass(easemobim.sendBtn, 'disabled');
				}
				easemobim.sendBtn.innerHTML = '发送';

				if (me.readyHandled) return;
				me.readyHandled = true;

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
					if ( !visInfo ) {
						visInfo = utils.getStore(config.tenantId + config.emgroup + 'visitor');
						try { config.visitor = Easemob.im.Utils.parseJSON(visInfo); } catch ( e ) {}
						utils.clearStore(config.tenantId + config.emgroup + 'visitor');
					}

					//get ext
					var ext = utils.getStore(config.tenantId + config.emgroup + 'ext');
					try { ext && me.sendTextMsg('', false, {ext: Easemob.im.Utils.parseJSON(ext)}); } catch ( e ) {}
					utils.clearStore(config.tenantId + config.emgroup + 'ext');
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
				//add tenant notice
				this.setNotice();
				//add msg callback
				this.channel.listen();
				//connect to xmpp server
				this.open();
				//create chat container
				this.handleGroup();
				//get service serssion info
				this.getSession();
				//set tenant logo
				this.setLogo();
				//mobile set textarea can growing with inputing
				utils.isMobile && this.initAutoGrow();
				this.chatWrapper.getAttribute('data-getted') || config.newuser || this.getHistory();
			}
			, initAutoGrow: function () {
				var me = this;

				if (me.autoGrowOptions) return;
				me.autoGrowOptions = {};
				me.autoGrowOptions.callback = function () {
					var height = easemobim.send.getBoundingClientRect().height;
					if ( me.direction === 'up' ) {
						easemobim.chatFaceWrapper.style.top = 43 + height + 'px';
					} else {
						easemobim.imChatBody.style.bottom = height + 'px';
						easemobim.chatFaceWrapper.style.bottom = height + 'px';
					}
				};
				me.autoGrowOptions.dom = easemobim.textarea;
				setTimeout(function () {
					easemobim.autogrow(me.autoGrowOptions);
				}, 1000);
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
				if (config.offDuty) return;

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
									var greetingObj = Easemob.im.Utils.parseJSON(rGreeting.greetingText.replace(/&quot;/g, '"'));
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
				if ( config.offDuty ) { return; }

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
				if ( config.offDuty ) { return; }

				var me = this

				me.agent = me.agent || {};

				easemobim.api('getExSession', {
					id: config.user.username
					, orgName: config.orgName
					, appName: config.appName
					, imServiceNumber: config.toUser
					, tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg && msg.data ) {
						me.onlineHumanAgentCount = msg.data.onlineHumanAgentCount;//人工坐席数
						me.onlineRobotAgentCount = msg.data.onlineRobotAgentCount;//机器人坐席数
						me.agentCount = +me.onlineHumanAgentCount + +me.onlineRobotAgentCount;
						config.agentUserId = msg.data.serviceSession ? msg.data.serviceSession.agentUserId : null;//get agentuserid

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

					if ( !msg.data.serviceSession ) {
						//get greeting only when service session is not exist
						me.getGreeting();
					} else {
						me.session = msg.data.serviceSession;
						msg.data.serviceSession.visitorUser 
						&& msg.data.serviceSession.visitorUser.userId 
						&& easemobim.api('sendVisitorInfo', {
							tenantId: config.tenantId,
							visitorId: msg.data.serviceSession.visitorUser.userId,
							referer:  document.referrer
						});
					}


					if ( !me.nicknameGetted ) {
						me.nicknameGetted = true;
						//get the switcher of agent nickname
						me.getNickNameOption();
					}
				});
			}
			, handleGroup: function () {
				this.chatWrapper = easemobim.imChatBody.querySelector('.em-widget-chat');

				this.setAgentProfile({
					tenantName: config.defaultAgentName,
					avatar: config.tenantAvatar
				});
			}
			, getMsgid: function ( msg ) {
				if ( msg ) {
					if ( msg.ext && msg.ext.weichat ) {
						return msg.ext.weichat.msgId;
					}
					return msg.msgId
				}
				return null;
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
				doms.agentStatusSymbol.className = 'em-hide';
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
					var state;

					if ( msg && msg.data && msg.data.state ) {
						state = msg.data.state;
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
				}, function ( msg ) {
					var themeName = msg.data && msg.data.length && msg.data[0].optionValue;
					var className = _const.themeMap[themeName];

					className && utils.addClass(document.body, className);
				});
			}
			, setLogo: function () {
				// 为了保证消息插入位置正确
				if (config.logo) {
					utils.removeClass(document.querySelector('.em-widget-tenant-logo'), 'hide');
					document.querySelector('.em-widget-tenant-logo img').src = config.logo;
				}
			}
			, setNotice: function () {
				var me = this;

				if ( me.hasSetSlogan || config.offDuty ) {
					return;
				}

				easemobim.api('getSlogan', {
					tenantId: config.tenantId
				}, function (msg) {
					me.hasSetSlogan = true;
					var slogan = msg.data && msg.data.length && msg.data[0].optionValue;
					if(slogan){
						// 设置信息栏内容
						document.querySelector('.em-widget-tip .content').innerHTML = Easemob.im.Utils.parseLink(slogan);
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
			//fill emotions async
			, fillFace: function () {
				if ( utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0]) ) {
					return;
				}

				var faceStr = '',
					count = 0,
					me = this;

				utils.on(easemobim.faceBtn, utils.click, function () {
					easemobim.textarea.blur();
					utils.toggleClass(easemobim.chatFaceWrapper, 'em-hide');

					if ( faceStr ) return false;
					faceStr = '<li class="e-face">';
					utils.each(Easemob.im.EMOTIONS.map, function ( k, v ) {
						count += 1;
						faceStr += ["<div class='em-bar-face-bg e-face'>",
										"<img class='em-bar-face-img e-face em-emotion' ",
											"src='" + Easemob.im.EMOTIONS.path + v + "' ",
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

					utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0], faceStr);
				});

				//表情的选中
				utils.live('img.em-emotion', utils.click, function ( e ) {
					!utils.isMobile && easemobim.textarea.focus();
					easemobim.textarea.value = easemobim.textarea.value + this.getAttribute('data-value');
					if ( utils.isMobile ) {
						me.autoGrowOptions.update();//update autogrow
						setTimeout(function () {
							easemobim.textarea.scrollTop = 10000;
						}, 100);
					}
					me.readyHandled && utils.removeClass(easemobim.sendBtn, 'disabled');
				}, easemobim.chatFaceWrapper);
			}
			, errorPrompt: function ( msg, isAlive ) {//暂时所有的提示都用这个方法
				var me = this;

				me.ePrompt = me.ePrompt || document.querySelector('.em-widget-error-prompt');
				me.ePromptContent = me.ePromptContent || me.ePrompt.querySelector('span');
				
				me.ePromptContent.innerHTML = msg;
				utils.removeClass(me.ePrompt, 'hide');
				isAlive || setTimeout(function () {
					utils.addClass(me.ePrompt, 'hide');
				}, 2000);
			}
			, getSafeTextValue: function ( msg ) {
				if ( msg && msg.ext && msg.ext.weichat && msg.ext.weichat.html_safe_body ) {
					return msg.ext.weichat.html_safe_body.msg;
				} else {
					try {
						return msg.bodies[0].msg;
					} catch ( e ) {}
				}
				return '';
			}
			, setOffline: function ( isOffDuty ) {
				if ( !isOffDuty ) { return; }

				switch ( config.offDutyType ) {
					case 'chat':
									
						break;
					case 'none':// disable note & msg

						var word = config.offDutyWord || '现在是下班时间。';

						try {
							word = decodeURIComponent(word);
						} catch ( e ) {}

						var msg = new Easemob.im.EmMessage('txt');
						msg.set({ value: word });
						if ( !this.chatWrapper ) {
							this.handleGroup();
						}
						this.appendMsg(config.toUser, config.user.username, msg);
						utils.addClass(easemobim.send, 'em-widget-send-disable');
						break;
					default:// show note
						this.slogan && utils.addClass(this.slogan, 'em-hide');
						utils.removeClass(easemobim.leaveMessage.dom, 'em-hide');
						utils.addClass(easemobim.imChatBody, 'em-hide');
						utils.addClass(easemobim.send, 'em-hide');
						easemobim.leaveMessage.show(isOffDuty);
						break;
				}
			}
			//close chat window
			, close: function () {
				this.opened = false;

				if ( !config.hide ) {
					utils.addClass(easemobim.imChat, 'em-hide');
					setTimeout(function () {
						utils.removeClass(easemobim.imBtn, 'em-hide');
					}, 60);
				}
			}
			//show chat window
			, show: function () {
				var me = this;

				me.opened = true;
				me.scrollBottom(50);
				utils.addClass(easemobim.imBtn, 'em-hide');
				utils.removeClass(easemobim.imChat, 'em-hide');
				if (!config.offDuty || config.offDutyType !== 'none') {
					try { easemobim.textarea.focus(); } catch ( e ) {}
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

				// init webRTC && 视频功能灰度
				utils.isSupportWebRTC && easemobim.api('graylist', {}, function (msg) {
					if (
						msg.data
						&& msg.data.audioVideo
						&& ~msg.data.audioVideo.indexOf(+config.tenantId)
					){
						easemobim.videoChat.init(me.conn, me.channel.send, config);
					}
				});
			}
			, soundReminder: function () {
				var me = this;
				var ast = 0;

				if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
					return;
				}

				me.reminder = document.querySelector('.em-widgetHeader-audio');

				//音频按钮静音
				utils.on(me.reminder, 'mousedown touchstart', function () {
					me.slience = !me.slience;
					utils.toggleClass(me.reminder, 'icon-slience', me.slience);
					utils.toggleClass(me.reminder, 'icon-bell', !me.slience);

					return false;
				});

				me.audio = document.createElement('audio');
				me.audio.src = config.staticPath + '/mp3/msg.m4a';
				me.soundReminder = function () {
					if ( (utils.isMin() ? false : me.opened) || ast !== 0 || me.slience ) {
						return;
					}
					ast = setTimeout(function() {
						ast = 0;
					}, 3000);
					me.audio.play();
				};
			}
			, bindEvents: function () {
				var me = this;

				utils.on(
					document.querySelector('.em-widgetHeader-keyboard'),
					utils.click,
					function(){
						var status = utils.hasClass(this, 'icon-keyboard-down');
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
								easemobim.chatFaceWrapper.style.top = 43 + easemobim.send.getBoundingClientRect().height + 'px';
								break;
							case 'down':
								easemobim.send.style.bottom = '0';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = 'auto';
								easemobim.imChatBody.style.bottom = easemobim.send.getBoundingClientRect().height + 'px';
								easemobim.chatFaceWrapper.style.bottom = easemobim.send.getBoundingClientRect().height + 'px';
								easemobim.chatFaceWrapper.style.top = 'auto';
								me.scrollBottom(50);
								break;
						}
					}
				);
				
				if(!utils.isTop){
					// 最小化
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
				utils.on(easemobim.imChatBody, utils.click, function () {
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

					utils.addClass(this, 'em-hide');
					utils.removeClass(utils.$Dom(id + '_loading'), 'em-hide');
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
					me.sendTextMsg(utils.html(this), null, {ext:
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
				
				function handleSendBtn(){
					utils.toggleClass(
						easemobim.sendBtn,
						'disabled',
						!me.readyHandled || !easemobim.textarea.value
					);
				};

				utils.on(easemobim.textarea, 'keyup', handleSendBtn);
				utils.on(easemobim.textarea, 'change', handleSendBtn);
				utils.on(easemobim.textarea, 'input', handleSendBtn);
				
				if ( utils.isMobile ) {
					var handleFocus = function () {
						easemobim.textarea.style.overflowY = 'auto';
						me.scrollBottom(800);
						clearInterval(me.focusText);
						me.focusText = setInterval(function () {
							document.body.scrollTop = 10000;
						}, 100);
					};
					utils.on(easemobim.textarea, 'input', function () {
						me.autoGrowOptions.update();
						me.scrollBottom(800);
					});
					utils.on(easemobim.textarea, 'focus', handleFocus);
					utils.one(easemobim.textarea, 'touchstart', handleFocus);
					utils.on(easemobim.textarea, 'blur', function () {
						clearInterval(me.focusText);
					});
				}

				// 发送文件
				utils.on(doms.fileInput, 'change', function () {
					var fileInput = doms.fileInput;
					var file = fileInput.files && fileInput.files[0];
					
					// 未选择文件
					if(!fileInput.value){
						return;
					}

					if(file.size < _const.UPLOAD_FILESIZE_LIMIT){
						me.sendFileMsg(Easemob.im.Utils.getFileUrl('em-widget-file-input'));
					}
					else{
						me.errorPrompt('文件大小不能超过10MB')
					}	
				});

				// 发送图片
				utils.on(doms.imgInput, 'change', function () {
					var fileInput = doms.imgInput;
					var file = fileInput.files && fileInput.files[0];
					var	fileType = file.name.split('.').pop().toLowerCase();

					// 未选择文件
					if(!fileInput.value){
						return;
					}

					if(!~_const.UPLOAD_IMG_TYPE.indexOf(fileType)){
						me.errorPrompt('不支持的图片格式');
						return;
					}

					if(file.size < _const.UPLOAD_FILESIZE_LIMIT){
						me.sendImgMsg(Easemob.im.Utils.getFileUrl('em-widget-img-input'));
					}
					else{
						me.errorPrompt('文件大小不能超过10MB');
					}
				});

				//hide face wrapper
				utils.on(document, utils.click, function ( ev ) {
					var e = window.event || ev,
						t = e.srcElement || e.target;

					if ( !utils.hasClass(t, 'e-face') ) {
						utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
					}
				});

				utils.on(easemobim.sendFileBtn, 'touchend', function () {
					easemobim.textarea.blur();
				});
				//弹出文件选择框
				utils.on(easemobim.sendFileBtn, 'click', function () {
					if ( !me.readyHandled ) {
						me.errorPrompt('正在连接中...');
						return false;
					}
					if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
						me.errorPrompt('当前浏览器需要安装flash发送wenj');
						return false;	
					}
					doms.fileInput.click();
				});
				utils.on(easemobim.sendImgBtn, 'touchend', function () {
					easemobim.textarea.blur();
				});
				
				utils.on(easemobim.sendImgBtn, 'click', function () {
					if ( !me.readyHandled ) {
						me.errorPrompt('正在连接中...');
						return false;
					}
					if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
						me.errorPrompt('当前浏览器需要安装flash发送图片');
						return false;	
					}
					doms.imgInput.click();
				});

				//显示留言界面
				utils.on(easemobim.noteBtn, 'click', function () {
					easemobim.leaveMessage.show();
				});

				//hot key
				utils.on(easemobim.textarea, 'keydown', function ( evt ) {
					if(evt.keyCode !== 13) return;

					if(utils.isMobile || evt.ctrlKey || evt.shiftKey){
						return false;
					}
					else{
						utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
						if ( utils.hasClass(easemobim.sendBtn, 'disabled') ) {
							return false;
						}
						me.sendTextMsg();

						// 可能是事件绑定得太多了，导致换行清不掉，稍后解决
						setTimeout(function(){
							easemobim.textarea.value = '';
						}, 0);
					}
				});

				utils.on(easemobim.sendBtn, 'click', function () {
					if ( utils.hasClass(this, 'disabled') ) {
						return false;
					}
					var textMsg = easemobim.textarea.value;
					if(textMsg.length > 1500){
						me.errorPrompt("输入字数过多");
						return false;
					}
					utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
					me.sendTextMsg();
					if ( utils.isMobile ) {
						easemobim.textarea.style.height = '34px';
						easemobim.textarea.style.overflowY = 'hidden';
						me.direction === 'up' || (easemobim.imChatBody.style.bottom = '77px');
						easemobim.textarea.focus();
					}
					return false;
				});
			}
			, scrollBottom: function ( wait ) {
				var ocw = easemobim.imChatBody;

				wait 
				? (clearTimeout(this.scbT), this.scbT = setTimeout(function () {
					ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
				}, wait))
				: (ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000);
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

				var isSelf = from == config.user.username && (from || config.user.username),
					curWrapper = me.chatWrapper;

				var div = document.createElement('div');
				utils.html(div, msg.get(!isSelf));

				if ( isHistory ) {
					utils.insertBefore(curWrapper, div, curWrapper.childNodes[0]);
				} else {
					curWrapper.appendChild(div);
					me.scrollBottom(utils.isMobile ? 800 : null);
				}
				var imgList = utils.$Class('img.em-widget-imgview', div),
					img = imgList.length > 0 ? imgList[0] : null;
					
				if ( img ) {
					utils.on(img, 'load', function () {
						me.scrollBottom();
						img = null;
					});
				}
				div = null;
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

				if ( utils.isMobile ) {
					return;
				}

				var me = this;

				if ( me.opened && !utils.isTop) {
					transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
				}

				if ( utils.isMin() || !me.opened ) {
					me.soundReminder();
					utils.isTop || transfer.send(easemobim.EVENTS.SLIDE, window.transfer.to);
					utils.isTop || transfer.send({
						event: 'notify',
						data: {
							avatar: this.currentAvatar,
							title: '新消息',
							brief: message.brief
						}
					}, window.transfer.to);
				}
			}
			//receive message function
			, receiveMsg: function ( msg, type, isHistory ) {
				if (config.offDuty) return;

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

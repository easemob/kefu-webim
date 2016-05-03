/**
 * webim交互相关
 */
;(function () {

    easemobim.chat = function ( config ) {
		var utils = easemobim.utils;

		easemobim.im = utils.$Dom('EasemobKefuWebim'),
		easemobim.imBtn = utils.$Dom('easemobWidgetPopBar'),
		easemobim.imChat = utils.$Dom('EasemobKefuWebimChat'),
		easemobim.imChatBody = utils.$Dom('easemobWidgetBody'),
		easemobim.send = utils.$Dom('easemobWidgetSend'),
		easemobim.textarea = easemobim.send.getElementsByTagName('textarea')[0],
		easemobim.sendBtn = utils.$Dom('easemobWidgetSendBtn'),
		easemobim.faceBtn = easemobim.send.getElementsByTagName('i')[0],
		easemobim.realFile = utils.$Dom('easemobWidgetFileInput'),
		easemobim.sendFileBtn = utils.$Dom('easemobWidgetFile'),
		easemobim.dragHeader = utils.$Dom('easemobWidgetDrag'),
		easemobim.dragBar = easemobim.dragHeader.getElementsByTagName('p')[0],
		easemobim.chatFaceWrapper = utils.$Dom('EasemobKefuWebimFaceWrapper'),
		easemobim.messageCount = easemobim.imBtn.getElementsByTagName('span')[0];
		easemobim.swfupload = null;//flash 上传


        return {
            init: function () {
                this.setConnection();
                this.scbT = 0;//sroll bottom timeout stamp
				this.msgCount = 0;//未读消息数
                this.msgTimeSpan = {};//用于处理1分钟之内的消息只显示一次时间
                this.opened = true;//聊天窗口是否已展示

				this.setTheme();
                this.setMinmum();
                this.soundReminder();
				this.mobile();
				this.setRoot();
                this.bindEvents();
            }
			, setGroup: function ( msg ) {
				if ( config.emgroup ) {
					msg.body.ext = msg.body.ext || {};
					msg.body.ext.weichat = msg.body.ext.weichat || {};
					msg.body.ext.weichat.queueName = decodeURIComponent(config.emgroup);
				}
				if ( config.visitor ) {
					msg.body.ext = msg.body.ext || {};
					msg.body.ext.weichat = msg.body.ext.weichat || {};
					msg.body.ext.weichat.visitor = config.visitor;
				}
			}
			, setRoot: function () {
				if ( !utils.root ) { return false; }

				config.dragenable = false;
				this.fillFace();
			}
			, mobile: function () {
				if ( !utils.isMobile ) { return false; }

				config.dragenable = false;
				var i = document.createElement('i');
				i.style.right = '9px';
				utils.addClass(i, 'easemobWidgetHeader-keyboard easemobWidgetHeader-keyboard-down');
				easemobim.dragHeader.appendChild(i);
			}
            , ready: function () {
                this.setNotice();
                this.sdkInit();
                this.open();
                this.handleGroup();
                this.getSession();
				this.setLogo();
				this.initAutoGrow();
                this.chatWrapper.getAttribute('data-getted') || config.newuser || this.getHistory();
            }
			, initAutoGrow: function () {
				var me = this;

				if ( !me.autoGrowOptions ) {
                    me.autoGrowOptions = {};
                    me.autoGrowOptions.callback = function () {
                        var height = easemobim.send.getBoundingClientRect().height;
						if ( me.direction === 'up' ) {
							easemobim.chatFaceWrapper.style.top = 43 + easemobim.send.getBoundingClientRect().height + 'px';
						} else {
							easemobim.imChatBody.style.bottom = height + 'px';
							easemobim.chatFaceWrapper.style.bottom = easemobim.send.getBoundingClientRect().height + 'px';
						}
                    };
                    me.autoGrowOptions.dom = easemobim.textarea;
					setTimeout(function () {
						utils.isMobile && easemobim.autogrow(me.autoGrowOptions);
					}, 1000);
                }
			}
            , setConnection: function() {
                this.conn = new Easemob.im.Connection({ 
					url: config.xmppServer,
					retry: true,
					multiResources: config.resources
				});
            }
            , handleChatWrapperByHistory: function ( chatHistory, chatWrapper ) {
                if ( chatHistory.length === easemobim.LISTSPAN ) {
                    chatWrapper.setAttribute('data-start', Number(chatHistory[easemobim.LISTSPAN - 1].chatGroupSeqId) - 1);
                    chatWrapper.setAttribute('data-history', 0);
                } else {
                    chatWrapper.setAttribute('data-history', 1);
                }
            }
            , getHistory: function ( notScroll ) {
                if ( config.offDuty || config.newuser ) {
                    return;
                }

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
                            me.handleHistory(msg.data);
                            notScroll || me.scrollBottom();
                        }
                    });
                } else {
                    Number(chatWrapper.getAttribute('data-history')) || easemobim.api('getGroup', {
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
                                    me.handleHistory(msg.data);
                                    notScroll || me.scrollBottom();
                                }
                            });
                        }
                    });
                }
                chatWrapper.setAttribute('data-getted', 1);
            }
			, getGreeting: function () {
				var me = this,
					msg = null;

				if ( me.greetingGetted ) {
					return;
				}

				me.greetingGetted = true;

				easemobim.api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg && msg.data ) {
						msg = {
							data: msg.data,
							type: 'txt',
							noprompt: true
						};
						me.receiveMsg(msg, 'txt');
					}

					easemobim.api('getRobertGreeting', {
						tenantId: config.tenantId
					}, function ( msg ) {
						if ( msg && msg.data ) {
							var rGreeting = msg.data;

							switch ( rGreeting.greetingTextType ) {
								case 0:
									msg = {
										msg: rGreeting.greetingText,
										type: 'txt',
										noprompt: true
									};
									me.receiveMsg(msg, 'txt');
									break;
								case 1:
									try {
										var greetingObj = Easemob.im.Utils.parseJSON(rGreeting.greetingText.replace(/&quot;/g, '"'));
										if ( rGreeting.greetingText === '{}' ) {
											msg = {
												msg: '该菜单不存在',
												type: 'txt',
												noprompt: true
											};
											me.receiveMsg(msg, 'txt');
										} else {
											msg = { 
												ext: greetingObj.ext,
												noprompt: true
											 };
											me.receiveMsg(msg);	
										}
									} catch ( e ) {}
									break;
								default: break;
							}
						}
					});
				});
			}
            , getSession: function () {
				if ( config.offDuty ) { return; }

                var me = this

				if ( !me.session || !me.sessionSent ) {
					me.sessionSent = true;
					me.agent = me.agent || {};

					easemobim.api('getSession', {
						id: config.user.username
						, orgName: config.orgName
						, appName: config.appName
						, imServiceNumber: config.toUser
						, tenantId: config.tenantId
					}, function ( msg ) {
						if ( msg && msg.data ) {
							var ref = config.referrer ? decodeURIComponent(config.referrer) : document.referrer;
							me.agentCount = msg.data.onlineAgentCount;
						} else {
							me.session = null;
							me.getGreeting();
						}

						if ( !msg.data.serviceSession ) {
							me.getGreeting();
						} else {
							me.session = msg.data.serviceSession;
							msg.data.serviceSession.visitorUser 
							&& msg.data.serviceSession.visitorUser.userId 
							&& easemobim.api('sendVisitorInfo', {
								tenantId: config.tenantId,
								visitorId: msg.data.serviceSession.visitorUser.userId,
								referer:  ref
							});//ref info
						}
					});
				}
            }
            , handleGroup: function () {
                this.handleChatContainer(config.toUser);
                this.chatWrapper = utils.$Dom(config.toUser);
            }
            , handleChatContainer: function ( userName ) {
                var curChatContainer = utils.$Dom(userName);

                this.setAgentProfile( {userNickname: config.title} );
                if ( curChatContainer ) {
                    utils.removeClass(curChatContainer, 'em-hide');
                    utils.addClass(utils.siblings(curChatContainer, 'easemobWidget-chat'), 'em-hide');
                    utils.removeClass(utils.$Dom(config.toUser + '-transfer'), 'em-hide');
                } else {
                    curChatContainer = document.createElement('div');
                    curChatContainer.id = userName;
                    utils.addClass(curChatContainer, 'easemobWidget-chat');
                    utils.insertBefore(easemobim.imChatBody, curChatContainer, easemobim.imChatBody.childNodes[this.hasLogo ? 1 : 0]);

                    curChatContainer = document.createElement('div');
                    curChatContainer.id = config.toUser + '-transfer';
					utils.addClass(curChatContainer, 'easemobWidget-status-prompt');
                    easemobim.imChat.appendChild(curChatContainer);
                    curChatContainer = null;
                    this.handleChatContainer(userName);     
                }
            }
            , handleHistory: function ( chatHistory ) {
                var me = this;

                if ( chatHistory.length > 0 ) {
                    utils.each(chatHistory, function ( k, v ) {
                        var msgBody = v.body,
                            msg,
                            isSelf = msgBody.from === config.user.username;

                        if ( msgBody && msgBody.bodies.length > 0 ) {
                            msg = msgBody.bodies[0];
                            if ( msgBody.from === config.user.username ) {
                                switch ( msg.type ) {
                                    case 'img':
                                        msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
                                        msg.to = msgBody.to;
                                        me.sendImgMsg(msg, true);
                                        break;
									case 'file':
                                        msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
                                        msg.to = msgBody.to;
                                        me.sendFileMsg(msg, true);
                                        break;
                                    case 'txt':
                                        me.sendTextMsg(msg.msg, msgBody.to);
                                        break;
                                }
                            } else {
                                if ( msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType && msgBody.ext.weichat.ctrlType == 'inviteEnquiry'//判断是否为满意度调查的消息
                                || msgBody.ext && msgBody.ext.msgtype && msgBody.ext.msgtype.choice//机器人自定义菜单
                                || msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType === 'TransferToKfHint' ) {//机器人转人工
                                    me.receiveMsg(msgBody, '', true);
                                } else {
                                    me.receiveMsg({
                                        data: msg.msg,
                                        url: /^http/.test(msg.url) ? msg.url : config.base + msg.url,
                                        from: msgBody.from,
                                        to: msgBody.to
                                    }, msg.type, true);
                                }
                            }
							if ( msg.type === 'cmd' || msg.type === 'txt' && !msg.msg ) {
								
							} else {
								me.appendDate(v.timestamp || msgBody.timestamp, isSelf ? msgBody.to : msgBody.from, true);
							}
                        }
                    });
                }
            }
			, setKeyboard: function ( direction ) {
				var me = this;

				me.direction = direction;					
				switch ( direction ) {
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
            , setAgentProfile: function ( info ) {
                var nickName = utils.$Class('span.easemobWidgetHeader-nickname')[0],
                    avatar = utils.$Class('img.easemobWidgetHeader-portrait')[0];

                utils.html(nickName, info && info.userNickname ? info.userNickname : info && info.agentUserNiceName || config.defaultAgentName);

				this.currentAvatar = info && info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.defaultAvatar;
                if ( avatar.getAttribute('src') !== this.currentAvatar ) {
                    var cur = this.currentAvatar;

                    avatar.onload = function () {
                        avatar.style.opacity = '1';
                    };
					avatar.style.opacity = '0';
					avatar.setAttribute('src', cur);
                }
            }
            , setMinmum: function () {
                if ( !config.minimum || utils.root ) {
                    return;
                }
                var me = this,
					min = document.createElement('a');

                min.setAttribute('href', 'javascript:;');
                min.setAttribute('title', '关闭');
                utils.addClass(min, 'easemobWidgetHeader-min bg-color border-color');
                easemobim.dragHeader.appendChild(min);
                utils.on(min, 'mousedown touchstart', function () {
					me.close();
					return false;
				});
                utils.on(min, 'mouseenter', function () {
                    utils.addClass(this, 'hover-color');
                });
                utils.on(min, 'mouseleave', function () {
                    utils.removeClass(this, 'hover-color');
                });
                min = null;
            }
			, setTheme: function () {
                var me = this;

				easemobim.api('getTheme', {
					tenantId: config.tenantId
				}, function ( msg ) {
					config.theme = msg.data && msg.data.length && msg.data[0].optionValue ? msg.data[0].optionValue : '天空之城';

					if ( !easemobim.THEME[config.theme] ) {
						config.theme = '天空之城';
					}

					var style = document.createElement('style');
					style.setAttribute('type', 'text/css');
					utils.html(style, easemobim.THEME[config.theme].css);
					var head = document.head || document.getElementsByTagName('head')[0];
					head.appendChild(style);
				});

            }
			, setLogo: function () {
				if ( !utils.$Class('div.easemobWidget-tenant-logo').length && config.logo ) {
					utils.html(this.chatWrapper, '<div class="easemobWidget-tenant-logo"><img src="' + config.logo + '"></div>' + utils.html(this.chatWrapper));
					this.hasLogo = true;
				}
			}
            , setNotice: function () {
                var me = this;

                if ( me.slogan || config.offDuty ) {
                    return;
                }

                easemobim.api('getSlogan', {
                    tenantId: config.tenantId
                }, function ( msg ) {
                    if ( msg.data && msg.data.length > 0 && msg.data[0].optionValue ) {
                        easemobim.imChatBody.style.top = '90px';
                        me.slogan = document.createElement('div');
                        utils.addClass(me.slogan, 'easemobWidget-word');

                        var slogan = Easemob.im.Utils.parseLink(msg.data[0].optionValue);
                        utils.html(me.slogan, "<span>" + slogan + "</span><a class='easemobWidget-word-close' href='javascript:;'></a>");
                        easemobim.imChat.appendChild(me.slogan);

                        //关闭广告语按钮
                        utils.on(utils.$Class('a.easemobWidget-word-close'), utils.click, function () {
                            utils.addClass(me.slogan, 'em-hide');
                            easemobim.imChatBody.style.top = '43px';
                        });
                    }
                });
            }
            , fillFace: function () {
                if ( utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0]) ) {
                    return;
                }

				var faceStr = '',
					count = 0,
					me = this;

                utils.on(easemobim.faceBtn, 'mouseenter', function () {
                    utils.isMobile || utils.addClass(this, 'theme-color');
                })
                utils.on(easemobim.faceBtn, 'mouseleave', function () {
                    utils.isMobile || utils.removeClass(this, 'theme-color');
                });
                utils.on(easemobim.faceBtn, utils.click, function () {
					easemobim.textarea.blur();
                    utils.hasClass(easemobim.chatFaceWrapper, 'em-hide')
                    ? utils.removeClass(easemobim.chatFaceWrapper, 'em-hide')
                    : utils.addClass(easemobim.chatFaceWrapper, 'em-hide')

					if ( faceStr ) return false;
					faceStr = '<li class="e-face">';
					utils.each(Easemob.im.EMOTIONS.map, function ( k, v ) {
						count += 1;
						faceStr += ["<div class='easemobWidget-face-bg e-face'>",
										"<img class='easemobWidget-face-img e-face em-emotion' ",
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
                    utils.removeClass(easemobim.sendBtn, 'disabled');
                    if ( utils.isMobile ) {
                        me.autoGrowOptions.update();//update autogrow
                        setTimeout(function () {
                            easemobim.textarea.scrollTop = 10000;
                        }, 100);
                    }
                    utils.removeClass(easemobim.sendBtn, 'disabled');
                }, easemobim.chatFaceWrapper);
            }
            , errorPrompt: function ( msg, isAlive ) {//暂时所有的提示都用这个方法
                var me = this;

                if ( !me.ePrompt ) {
                    me.ePrompt = document.createElement('p');
                    me.ePrompt.className = 'easemobWidget-error-prompt em-hide';
                    utils.html(me.ePrompt, '<span></span>');
                    easemobim.imChat.appendChild(me.ePrompt);
                    me.ePromptContent = me.ePrompt.getElementsByTagName('span')[0];
                }
                
                utils.html(me.ePromptContent, msg);
                utils.removeClass(me.ePrompt, 'em-hide');
                isAlive || setTimeout(function(){
                    utils.html(me.ePromptContent, '');
                    utils.addClass(me.ePrompt, 'em-hide');
                }, 2000);
            }
            , setOffline: function () {
                if ( typeof easemobim.leaveMessage === 'function' ) {
					this.slogan && utils.addClass(this.slogan, 'em-hide');
					utils.addClass(easemobim.imBtn.getElementsByTagName('a')[0], 'easemobWidget-offline-bg');
					utils.removeClass(easemobim.leaveMessage.dom, 'em-hide');
					utils.addClass(easemobim.imChatBody, 'em-hide');
					utils.addClass(easemobim.send, 'em-hide');
				}
            }
            , close: function ( outerTrigger ) {
                this.opened = false;
				if ( !config.hide ) {
					utils.addClass(easemobim.imChat, 'em-hide');
					setTimeout(function () {
						utils.removeClass(easemobim.imBtn, 'em-hide');
					}, 60);
				}
				easemobim.EVENTS.CLOSE.data = { trigger: true };
				utils.root || transfer.send(easemobim.EVENTS.CLOSE);
            }
            , show: function ( outerTrigger ) {
				var me = this;

				if ( !outerTrigger ) {
					easemobim.EVENTS.SHOW.data = { trigger: true };
					utils.root || transfer.send(easemobim.EVENTS.SHOW);
				}
                me.opened = true;
                me.fillFace();
                me.scrollBottom(50);
                utils.addClass(easemobim.imBtn, 'em-hide');
                utils.removeClass(easemobim.imChat, 'em-hide');
                try { easemobim.textarea.focus(); } catch ( e ) {}
				me.resetPrompt();
            }
            , sdkInit: function () {
                var me = this;
                
                me.conn.listen({
                    onOpened: function () {
                        me.conn.setPresence();
                        me.conn.heartBeat(me.conn);

                        if ( easemobim.textarea.value ) {
                            utils.removeClass(easemobim.sendBtn, 'disabled');
                        }
                        utils.html(easemobim.sendBtn, '发送');
                    }
                    , onTextMessage: function ( message ) {
                        me.receiveMsg(message, 'txt');
                    }
					, onEmotionMessage: function ( message ) {
                        me.receiveMsg(message, 'face');
                    }
                    , onPictureMessage: function ( message ) {
                        me.receiveMsg(message, 'img');
                    }
					, onFileMessage: function ( message ) {
                        me.receiveMsg(message, 'file');
                    }
                    , onCmdMessage: function ( message ) {
                        me.receiveMsg(message, 'cmd');
                    }
                    , onError: function ( e ) {
                        if ( e.reconnect ) {
                            me.open();
                        } else {
                            me.conn.stopHeartBeat(me.conn);
                            typeof config.onerror === 'function' && config.onerror(e);
                        }
                    }
                });
            }
            , appendDate: function ( date, to, isHistory ) {
                var chatWrapper = utils.$Dom(to || config.toUser),
                    dom = document.createElement('div'),
                    fmt = 'M月d日 hh:mm';

                if ( !chatWrapper ) {
                    return;
                }
                utils.html(dom, new Date(date).format(fmt));
                utils.addClass(dom, 'easemobWidget-date');
                if ( !isHistory ) {
                    if ( !this.msgTimeSpan[to] || (date - this.msgTimeSpan[to] > 60000) ) {//间隔大于1min  show
                        chatWrapper.appendChild(dom); 
                    }
                    this.resetSpan(to);
                } else {
                    utils.insertBefore(chatWrapper, dom, chatWrapper.getElementsByTagName('div')[this.hasLogo ? 1 : 0]);
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
					, apiUrl: (utils.ssl ? 'https://' : 'http://') + config.restServer
				};
				
				if ( config.user.password ) {
					op.pwd = config.user.password;
				} else {
					op.accessToken = config.user.token;
				}

				me.conn.open(op);
            }
            , soundReminder: function () {
                var me = this;

                //if lte ie 8 , return
                if ( (utils.getIEVersion && utils.getIEVersion < 9) || utils.isMobile || !config.soundReminder ) {
                    me.soundReminder = function () {};
                    return;
                }

                me.reminder = document.createElement('a');
                me.reminder.setAttribute('href', 'javascript:;');
                utils.addClass(me.reminder, 'easemobWidgetHeader-audio theme-color');
                easemobim.dragHeader.appendChild(me.reminder);

                //音频按钮静音
                utils.on(me.reminder, 'mousedown touchstart', function () {
                    me.silence = me.silence ? false : true;
                    utils.hasClass(me.reminder, 'easemobWidgetHeader-silence') 
                    ? utils.removeClass(me.reminder, 'easemobWidgetHeader-silence') 
                    : utils.addClass(me.reminder, 'easemobWidgetHeader-silence');

                    return false;
                });

                if ( window.HTMLAudioElement ) {
                    var ast = 0;
                    
                    me.audio = document.createElement('audio');
                    me.audio.src = config.staticPath + '/mp3/msg.m4a';
                    me.soundReminder = function () {
                        if ( (utils.isMin() ? false : me.opened) || ast !== 0 || me.silence ) {
                            return;
                        }
                        ast = setTimeout(function() {
                            ast = 0;
                        }, 3000);
                        me.audio.play();
                    };
                }
            }
            , setThemeBackground: function ( obj ) {
                utils.isMobile || utils.addClass(obj, 'bg-color');
            }
            , clearThemeBackground: function ( obj ) {
                utils.isMobile || utils.removeClass(obj, 'bg-color');
            }
            , setThemeColor: function ( obj ) {
                utils.isMobile || utils.addClass(obj, 'theme-color');
            }
            , clearThemeColor: function ( obj ) {
                utils.isMobile || utils.removeClass(obj, 'theme-color');
            }
            , bindEvents: function () {
                var me = this;

				utils.live('i.easemobWidgetHeader-keyboard', utils.click, function () {
					if ( utils.hasClass(this, 'easemobWidgetHeader-keyboard-up') ) {
						utils.addClass(this, 'easemobWidgetHeader-keyboard-down');
						utils.removeClass(this, 'easemobWidgetHeader-keyboard-up');
						me.setKeyboard('down');
					} else {
						utils.addClass(this, 'easemobWidgetHeader-keyboard-up');
						utils.removeClass(this, 'easemobWidgetHeader-keyboard-down');
						me.setKeyboard('up');
					}
				});
				
				!utils.isMobile && utils.on(easemobim.imBtn, utils.click, function () {
					me.show();
				});
				utils.on(easemobim.imChatBody, utils.click, function () {
					easemobim.textarea.blur();
					return false;
				});
                utils.on(document, 'mouseover', function () {
					utils.root || transfer.send(easemobim.EVENTS.RECOVERY);
                });
				utils.live('img.easemobWidget-imgview', 'click', function () {
					easemobim.imgView.show(this.getAttribute('src'));
                });
                utils.live('button.easemobWidget-list-btn', 'mouseover', function () {
                    me.setThemeBackground(this);
                });
                utils.live('button.easemobWidget-list-btn', 'mouseout', function () {
                    me.clearThemeBackground(this);
                });
                utils.on(easemobim.sendFileBtn, 'mouseenter', function () {
                    me.setThemeColor(this);
                });
                utils.on(easemobim.sendFileBtn, 'mouseleave', function () {
                    me.clearThemeColor(this);
                });

				if ( config.dragenable ) {//drag
					
					easemobim.dragBar.style.cursor = 'move';

					utils.isMobile || utils.on(easemobim.dragBar, 'mousedown', function ( ev ) {
						var e = window.event || ev;
						easemobim.textarea.blur();//ie a  ie...
						easemobim.EVENTS.DRAGREADY.data = { x: e.clientX, y: e.clientY };
						utils.root || transfer.send(easemobim.EVENTS.DRAGREADY);
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
                    utils.live('div.easemobWidget-date', 'touchstart', function ( ev ) {
                        var e = ev || window.event,
                            touch = e.touches;

                        if ( e.touches && e.touches.length > 0 ) {
                            _startY = touch[0].pageY;
                        }
                    });
                    utils.live('div.easemobWidget-date', 'touchmove', function ( ev ) {
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
                            touch = e.touches,
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
                    utils.live('div.easemobWidget-chat', 'mousewheel', getHis);
                    utils.live('div.easemobWidget-chat', 'DOMMouseScroll', getHis);
                }());

                //resend
                utils.live('div.easemobWidget-msg-status', utils.click, function () {
                    var id = this.getAttribute('id').slice(0, -7);

                    utils.addClass(this, 'em-hide');
                    utils.removeClass(utils.$Dom(id + '_loading'), 'em-hide');
                    me.conn.send(id);
                });

				utils.live('button.js_robertTransferBtn', utils.click,  function () {
                    var that = this;

                    me.transferToKf(that.getAttribute('data-id'), that.getAttribute('data-sessionid'));
                    return false;
                });

                //机器人列表
                utils.live('button.js_robertbtn', utils.click, function () {
                    var that = this;

                    me.sendTextMsg(utils.html(that), null, {
                        msgtype: {
                            choice: { menuid: that.getAttribute('data-id') }
                        }
                    });
                    return false;
                });
                
                var handleSendBtn = function () {
                    easemobim.textarea.value && utils.html(easemobim.sendBtn) !== '连接中' ? utils.removeClass(easemobim.sendBtn, 'disabled') : utils.addClass(easemobim.sendBtn, 'disabled');
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

                //选中文件并发送
                utils.on(easemobim.realFile, 'change', function () {
                    me.sendImgMsg();
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
                    if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
                        me.errorPrompt('当前浏览器需要安装flash发送图片');
                        return false;    
                    }
                    easemobim.realFile.click();
                });

                //hot key
                utils.on(easemobim.textarea, 'keydown', function ( evt ) {
                    var that = this;
                    if ( (utils.isMobile && evt.keyCode === 13) 
                        || (evt.ctrlKey && evt.keyCode === 13) 
                        || (evt.shiftKey && evt.keyCode === 13) ) {

                        that.value = that.value + '\n';
                        return false;
                    } else if ( evt.keyCode === 13 ) {
                        utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
                        if ( utils.hasClass(easemobim.sendBtn, 'disabled') ) {
                            return false;
                        }
                        me.sendTextMsg();
                        setTimeout(function(){
                            that.value = '';
                        }, 0);
                    }
                });

                utils.on(easemobim.sendBtn, 'click', function () {
                    if ( utils.hasClass(this, 'disabled') ) {
                        return false;
                    }
                    utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
                    me.sendTextMsg();
                    if ( utils.isMobile ) {
                        easemobim.textarea.style.height = '34px';
                        easemobim.textarea.style.overflowY = 'hidden';
                        me.direction === 'up' || (easemobim.imChatBody.style.bottom = '43px');
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
            , sendImgMsg: function ( file, isHistory ) {
                var me = this,
                    msg = new Easemob.im.EmMessage('img', isHistory ? null : me.conn.getUniqueId());

                msg.set({
					apiUrl: (utils.ssl ? 'https://' : 'http://') + config.restServer,
                    file: file || Easemob.im.Utils.getFileUrl(easemobim.realFile.getAttribute('id')),
                    to: config.toUser,
                    uploadError: function ( error ) {
                        //显示图裂，无法重新发送
                        if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
                            easemobim.swfupload && easemobim.swfupload.settings.upload_error_handler();
                        } else {
                            var id = error.id,
                                wrap = utils.$Dom(id);
    
                            utils.html(utils.$Class('a.easemobWidget-noline')[0], '<i class="easemobWidget-unimage">I</i>');
                            utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                            me.scrollBottom();
                        }
                    },
                    uploadComplete: function ( data ) {
                        me.handleTransfer('sending');
                    },
                    success: function ( id ) {
                        utils.$Remove(utils.$Dom(id + '_loading'));
                        utils.$Remove(utils.$Dom(id + '_failed'));
                    },
                    fail: function ( id ) {
                        utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                        utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
                    },
                    flashUpload: easemobim.flashUpload
                });
                if ( !isHistory ) {
					me.setGroup(msg);
                    me.conn.send(msg.body);
                    easemobim.realFile.value = '';
                    if ( Easemob.im.Utils.isCanUploadFileAsync ) {
                        me.appendDate(new Date().getTime(), config.toUser);
                        me.appendMsg(config.user.username, config.toUser, msg);
                    }
                } else {
                    me.appendMsg(config.user.username, file.to, msg, true);
                }
            }
			, sendFileMsg: function ( file, isHistory ) {
                var me = this,
                    msg = new Easemob.im.EmMessage('file', isHistory ? null : me.conn.getUniqueId()),
					file = file || Easemob.im.Utils.getFileUrl(easemobim.realFile.getAttribute('id'));

				if ( !file || !file.filetype || !config.FILETYPE[file.filetype.toLowerCase()] ) {
                    chat.errorPrompt('不支持此文件');
					easemobim.realFile.value = null;
					return false;
				}

                msg.set({
					apiUrl: (utils.ssl ? 'https://' : 'http://') + config.restServer,
                    file: file,
                    to: config.toUser,
                    uploadError: function ( error ) {
                        //显示图裂，无法重新发送
                        if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
                            easemobim.swfupload && easemobim.swfupload.settings.upload_error_handler();
                        } else {
                            var id = error.id,
                                wrap = utils.$Dom(id);
    
                            utils.html(utils.$Class('a.easemobWidget-noline')[0], '<i class="easemobWidget-unimage">I</i>');
                            utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                            me.scrollBottom();
                        }
                    },
                    uploadComplete: function ( data ) {
                        me.handleTransfer('sending');
                    },
                    success: function ( id ) {
                        utils.$Remove(utils.$Dom(id + '_loading'));
                        utils.$Remove(utils.$Dom(id + '_failed'));
                    },
                    fail: function ( id ) {
                        utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                        utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
                    },
                    flashUpload: easemobim.flashUpload
                });
                if ( !isHistory ) {
					me.setGroup(msg);
                    me.conn.send(msg.body);
                    easemobim.realFile.value = '';
                    if ( Easemob.im.Utils.isCanUploadFileAsync ) {
                        me.appendDate(new Date().getTime(), config.toUser);
                        me.appendMsg(config.user.username, config.toUser, msg);
                    }
                } else {
                    me.appendMsg(config.user.username, file.to, msg, true);
                }
            }
            , handleTransfer: function ( action, info ) {
                var wrap = utils.$Dom(config.toUser + '-transfer');

                config.agentList = config.agentList || {};
                config.agentList[config.toUser] = config.agentList[config.toUser] || {};
				if ( !this.session && this.agentCount < 1 ) {
					utils.addClass(wrap, 'none');
					utils.removeClass(wrap, 'transfer');
					utils.removeClass(wrap, 'link');
					utils.removeClass(wrap, 'em-hide');
					this.handleMobileHeader();
				} else if ( action === 'sending' ) {
					if ( config.offDuty || this.session ) { return; }

                    if ( !config.agentList[config.toUser].firstMsg && !this.chatWrapper.getAttribute('data-session') ) {
                        config.agentList[config.toUser].firstMsg = true;
						utils.addClass(wrap, 'link');
						utils.removeClass(wrap, 'transfer');
						utils.removeClass(wrap, 'none');
                        utils.removeClass(wrap, 'em-hide');
                    }
					this.handleMobileHeader();
                } else if ( action === 'transfer' ) {
                    utils.addClass(wrap, 'transfer');
                    utils.removeClass(wrap, 'link');
                    utils.removeClass(wrap, 'none');
                    utils.removeClass(wrap, 'em-hide');
					this.handleMobileHeader();
                } else if ( action === 'reply' ) {
                    utils.addClass(wrap, 'em-hide');
                    if ( info ) {
                        info && this.setAgentProfile({
                            userNickname: info.userNickname,
                            avatar: info.avatar
                        });
                    }
					if ( utils.isMobile ) {
						utils.removeClass(easemobim.dragHeader.getElementsByTagName('img')[0], 'em-hide');
						utils.removeClass(easemobim.dragHeader.getElementsByTagName('span')[0], 'em-hide');
					}
                }
            }
			, handleMobileHeader: function () {
				if ( utils.isMobile ) {
					utils.addClass(easemobim.dragHeader.getElementsByTagName('img')[0], 'em-hide');
					utils.addClass(easemobim.dragHeader.getElementsByTagName('span')[0], 'em-hide');
				}
			}
            , appendMsg: function ( from, to, msg, isHistory ) {//消息上屏
                var isSelf = from == config.user.username && (from || config.user.username),
					me = this,
                    curWrapper = me.chatWrapper;

                var div = document.createElement('div');
                div.className = 'emim-clear emim-mt20 emim-tl emim-msg-wrapper ';
                div.className += isSelf ? 'emim-fr' : 'emim-fl';
                utils.html(div, msg.get(!isSelf));

                if ( isHistory ) {
                    utils.insertBefore(curWrapper, div, curWrapper.childNodes[me.hasLogo ? 1 : 0]);
                } else {
                    curWrapper.appendChild(div);
					me.scrollBottom(utils.isMobile ? 800 : null);
                }
				var imgList = utils.$Class('img.easemobWidget-imgview', div),
					img = imgList.length > 0 ? imgList[0] : null;
					
				if ( img ) {
					utils.on(img, 'load', function () {
						me.scrollBottom();
						img = null;
					});
				}
                div = null;
            }
            , sendTextMsg: function ( message, isHistory, ext ) {
                var me = this;
                
                var msg = new Easemob.im.EmMessage('txt', isHistory ? null : me.conn.getUniqueId());
                msg.set({
                    value: message || easemobim.textarea.value,
                    to: config.toUser,
                    success: function ( id ) {
                        utils.$Remove(utils.$Dom(id + '_loading'));
                        utils.$Remove(utils.$Dom(id + '_failed'));
                        me.handleTransfer('sending');
                    },
                    fail: function ( id ) {
                        utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                        utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
                    }
                });

                if ( ext ) {
                    utils.extend(msg.body, ext);
                }

				utils.addClass(easemobim.sendBtn, 'disabled');
                if ( !isHistory ) {
					me.setGroup(msg);
                    me.conn.send(msg.body);
					easemobim.textarea.value = '';
					if ( msg.body.ext && msg.body.ext.type === 'custom' ) { return; }
					me.appendDate(new Date().getTime(), config.toUser);
					me.appendMsg(config.user.username, config.toUser, msg);
                } else {
                    me.appendMsg(config.user.username, isHistory, msg, true);
                }
            }
			, transferToKf: function ( id, sessionId ) {
                var me = this;

				var msg = new Easemob.im.EmMessage('cmd');
				msg.set({
                    to: config.toUser
					, action: 'TransferToKf'
                    , ext: {
                        weichat: {
                            ctrlArgs: {
                                id: id,
								serviceSessionId: sessionId,
                            }
                        }
                    }
                });
                me.conn.send(msg.body);
            }
            , sendSatisfaction: function ( level, content, session, invite ) {
                var me = this;

                var msg = new Easemob.im.EmMessage('txt', me.conn.getUniqueId());
                msg.set({value: '', to: config.toUser});
                utils.extend(msg.body, {
                    ext: {
                        weichat: {
                            ctrlType: 'enquiry'
                            , ctrlArgs: {
                                inviteId: invite || ''
                                , serviceSessionId: session || ''
                                , detail: content
                                , summary: level
                            }
                        }
                    }
                });
                me.conn.send(msg.body);
            }
            , messagePrompt: function ( message ) {//未读消息提醒

				if ( utils.isMobile ) {
					return;
				}

				var me = this;

				if ( !me.opened ) {
					utils.removeClass(utils.html(easemobim.messageCount, ''), 'em-hide');
					me.msgCount += 1;

					if ( me.msgCount > 9 ) {
						utils.html(utils.addClass(easemobim.messageCount, 'mutiCount'), '\…');
					} else {
						utils.html(utils.removeClass(easemobim.messageCount, 'mutiCount'), me.msgCount);
					}

				} else {
					me.resetPrompt();
				}

				if ( utils.isMin() || !me.opened ) {
					me.soundReminder();
					easemobim.EVENTS.NOTIFY.data = {
						avatar: this.currentAvatar,
						title: '新消息',
						brief: message.brief
					};
					utils.root || transfer.send(easemobim.EVENTS.SLIDE);
					utils.root || transfer.send(easemobim.EVENTS.NOTIFY);
				}
            }
			, resetPrompt: function () {
				this.msgCount = 0;
				utils.addClass(utils.html(easemobim.messageCount, ''), 'em-hide');
				utils.root || transfer.send(easemobim.EVENTS.RECOVERY);
			}
            , receiveMsg: function ( msg, type, isHistory ) {
                if ( config.offDuty ) {
                    return;
                }

				//绑定访客的情况有可能会收到多关联的消息，不是自己的不收
				if ( !isHistory && msg.from != config.toUser && !msg.noprompt ) {
					return;
				}

                var me = this,
                    message = null;

                //满意度评价
                if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType && msg.ext.weichat.ctrlType == 'inviteEnquiry' ) {
                    type = 'satisfactionEvaluation';  
                } else if ( msg.ext && msg.ext.msgtype && msg.ext.msgtype.choice ) {//机器人自定义菜单
                    type = 'robertList';  
                } else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType === 'TransferToKfHint' ) {//机器人转人工
                    type = 'robertTransfer';  
				}

                switch ( type ) {
					case 'txt':
                        message = new Easemob.im.EmMessage('txt');
                        message.set({value: msg.data});
                        break;
					case 'face':
						message = new Easemob.im.EmMessage('txt');
						var msgStr = '', brief = '';

						for ( var i = 0, l = msg.data.length; i < l; i++ ) {
							brief += msg.data[i].type === 'emotion' ? "[表情]" : msg.data[i].data;
							msgStr += msg.data[i].type === 'emotion' ? "\<img class=\'em-emotion\' src=\'" + msg.data[i].data + "\' alt=\'表情\'\/\>" : msg.data[i].data;
						}
						message.set({value: msgStr, emotion: true, brief: brief});
						break;
                    case 'img':
                        message = new Easemob.im.EmMessage('img');
                        message.set({file: {url: msg.url}});
                        break;
					case 'file':
                        message = new Easemob.im.EmMessage('file');
                        message.set({file: {url: msg.url, filename: msg.filename}});
                        break;
                    case 'satisfactionEvaluation':
                        message = new Easemob.im.EmMessage('list');
                        message.set({value: '请对我的服务做出评价', list: ['\
                            <div class="easemobWidget-list-btns">\
                                <button class="easemobWidget-list-btn js_satisfybtn" data-inviteid="' + msg.ext.weichat.ctrlArgs.inviteId + '"\
								 data-servicesessionid="'+ msg.ext.weichat.ctrlArgs.serviceSessionId + '">立即评价</button>\
                            </div>']});
                        break;
                    case 'robertList':
                        message = new Easemob.im.EmMessage('list');
                        var str = '',
                            robertV = msg.ext.msgtype.choice.items || msg.ext.msgtype.choice.list;

                        if ( robertV.length > 0 ) {
                            str = '<div class="easemobWidget-list-btns">';
                            for ( var i = 0, l = robertV.length; i < l; i++ ) {
                                str += '<button class="easemobWidget-list-btn js_robertbtn" data-id="' + robertV[i].id + '">' + (robertV[i].name || robertV[i]) + '</button>';
                            }
                            str += '</div>';
                        }
                        message.set({value: msg.ext.msgtype.choice.title, list: str});
                        break;
					case 'robertTransfer':
						message = new Easemob.im.EmMessage('list');
                        var str = '',
                            robertV = [msg.ext.weichat.ctrlArgs];

                        if ( robertV.length > 0 ) {
                            str = '<div class="easemobWidget-list-btns">';
                            for ( var i = 0, l = robertV.length; i < l; i++ ) {
                                str += '<button class="easemobWidget-list-btn js_robertTransferBtn"\
								 data-sessionid="' + robertV[i].serviceSessionId + '" data-id="' + robertV[i].id + '">' + robertV[i].label + '</button>';
                            }
                            str += '</div>';
                        }
                        message.set({ value: msg.data || msg.ext.weichat.ctrlArgs.label, list: str });
                        break;
                    default: break;
                }
                
                if ( !isHistory ) {
					
					msg.noprompt || this.getSession();

                    if ( msg.ext && msg.ext.weichat && msg.ext.weichat.event && (msg.ext.weichat.event.eventName === 'ServiceSessionTransferedEvent' 
					|| msg.ext.weichat.event.eventName === 'ServiceSessionTransferedForAgentQueueEvent') ) {
						//transfer msg, show transfer tip
                        this.handleTransfer('transfer');
                    } else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.event && msg.ext.weichat.event.eventName === 'ServiceSessionClosedEvent' ) {
						this.session = null, this.sessionSent = false, this.handleTransfer('reply');//hide tip
					} else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.event && msg.ext.weichat.event.eventName === 'ServiceSessionOpenedEvent' ) {
						this.agentCount < 1 && (this.agentCount = 1);//fake
                        this.handleTransfer('reply');//hide tip
					} else if ( msg.ext && msg.ext.weichat ) {
                        if ( !msg.ext.weichat.agent ) {//switch off
                            this.handleTransfer('reply');
                        } else {//switch on
                             msg.ext.weichat.agent && msg.ext.weichat.agent.userNickname !== '调度员' && this.handleTransfer('reply', msg.ext.weichat.agent);
                        }
                    }

                    if ( !message || !message.value ) {//空消息不显示
                        return;
                    }
                    if ( !msg.noprompt ) {
						me.messagePrompt(message);
					}
					me.appendDate(new Date().getTime(), msg.from);
                    me.resetSpan();
                    me.appendMsg(msg.from, msg.to, message);
                    me.scrollBottom();
					if ( config.receive ) {
						easemobim.EVENTS.ONMESSAGE.data = {
							from: msg.from,
							to: msg.to,
							message: message
						};
						utils.root || transfer.send(easemobim.EVENTS.ONMESSAGE);
					}
                } else {
                    if ( !message || !message.value ) {
                        return;
                    }
                    me.appendMsg(msg.from, msg.to, message, true);
                }
            }
        };
    };


    /**
     * 调用指定接口获取数据
    */
    easemobim.api = function ( apiName, data, callback ) {
        //cache
        easemobim.api[apiName] = easemobim.api[apiName] || {};

        var ts = new Date().getTime();
        easemobim.api[apiName][ts] = callback;
        easemobim.getData
        .send({
            api: apiName
            , data: data
            , timespan: ts
        })
        .listen(function ( msg ) {
            if ( easemobim.api[msg.call] && typeof easemobim.api[msg.call][msg.timespan] === 'function' ) {

                var callback = easemobim.api[msg.call][msg.timespan];
                delete easemobim.api[msg.call][msg.timespan];

                if ( msg.status !== 0 ) {
					typeof config.onerror === 'function' && config.onerror(msg);
                } else {
                    callback(msg);
                }
            }
        });
    };
}());

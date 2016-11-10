/**
 * webim交互相关
 */
;(function () {

    easemobim.chat = function ( config ) {
		var utils = easemobim.utils;
        // todo: 把dom都移到里边
        var doms = {
            agentStatusText: utils.$Class('span.em-header-status-text')[0],
            agentStatusSymbol: utils.$Dom('easemobWidgetAgentStatus'),
            nickName: utils.$Class('span.easemobWidgetHeader-nickname')[0]
        };

        easemobim.doms = doms;

		//DOM init
		easemobim.im = utils.$Dom('EasemobKefuWebim');
		easemobim.imBtn = utils.$Dom('easemobWidgetPopBar');
		easemobim.imChat = utils.$Dom('EasemobKefuWebimChat');
		easemobim.imChatBody = utils.$Dom('easemobWidgetBody');
		easemobim.send = utils.$Dom('easemobWidgetSend');
		easemobim.textarea = easemobim.send.getElementsByTagName('textarea')[0];
		easemobim.sendBtn = utils.$Dom('easemobWidgetSendBtn');
		easemobim.faceBtn = easemobim.send.getElementsByTagName('i')[0];
		easemobim.realFile = utils.$Dom('easemobWidgetFileInput');
		easemobim.sendFileBtn = utils.$Dom('easemobWidgetFile');
		easemobim.noteBtn = utils.$Dom('easemobWidgetNote');
		easemobim.mobileNoteBtn = utils.$Dom('easemobWidgetNotem');
		easemobim.dragHeader = utils.$Dom('easemobWidgetDrag');
		easemobim.dragBar = easemobim.dragHeader.getElementsByTagName('p')[0];
		easemobim.chatFaceWrapper = utils.$Dom('EasemobKefuWebimFaceWrapper');
		easemobim.messageCount = easemobim.imBtn.getElementsByTagName('span')[0];
        easemobim.avatar = utils.$Class('img.easemobWidgetHeader-portrait')[0];
		easemobim.swfupload = null;//flash 上传


        //cache current agent
        config.agentUserId = null;

		//chat window object
        return {
            init: function () {
                
                this.channel = easemobim.channel.call(this, config);

				//create & init connection
                this.setConnection();
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
				//add min icon
                this.setMinmum();
				//init sound reminder
                this.soundReminder();
				//root adjust
				this.setRoot();
				//bind events on dom
                this.bindEvents();
            }
            , handleReady: function ( info ) {
                var me = this;

                if ( me.readyHandled ) {
                    return false;
                }

                me.readyHandled = true;

                if ( info && config.user ) {
                    config.user.token = config.user.token || info.accessToken;
                }

                easemobim.leaveMessage && easemobim.leaveMessage.auth(me.token, config);

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
			, setRoot: function () {
				if ( !utils.isTop ) { return false; }

				config.dragenable = false;
				this.fillFace();
			}
			, mobile: function () {
				if ( !utils.isMobile ) { return false; }

				//mobile need set drag disable
				config.dragenable = false;

                config.ticket && !config.offDuty && utils.removeClass(easemobim.mobileNoteBtn, 'em-hide');

				if ( !config.hideKeyboard && !config.offDuty ) {
					var i = document.createElement('i');
					utils.addClass(i, 'easemobWidgetHeader-keyboard easemobWidgetHeader-keyboard-down');
					easemobim.dragHeader.appendChild(i);
				}
			}
            , ready: function () {
				//add tenant notice
                this.setNotice();
				//add msg callback
                this.sdkInit();
				//connect to xmpp server
                this.open();
				//create chat container
                this.handleGroup();
				//get service serssion info
                this.getSession();
				//set tenant logo
				this.setLogo();
				//mobile set textarea can growing with inputing
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
							easemobim.chatFaceWrapper.style.top = 43 + height + 'px';
						} else {
							easemobim.imChatBody.style.bottom = height + 'px';
							easemobim.chatFaceWrapper.style.bottom = height + 'px';
						}
                    };
                    me.autoGrowOptions.dom = easemobim.textarea;
					setTimeout(function () {
						utils.isMobile && easemobim.autogrow(me.autoGrowOptions);
					}, 1000);
                }
			}
            , setConnection: function() {
                this.conn = this.channel.getConnection();
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
				var me = this,
					msg = null;

				if ( me.greetingGetted ) {
					return;
				}

				me.greetingGetted = true;

				//system greeting
				easemobim.api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg && msg.data ) {
						msg = {
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
						};
						me.receiveMsg(msg, 'txt');
					}

					//robert greeting
					easemobim.api('getRobertGreeting', {
						tenantId: config.tenantId,
						originType: 'webim'
					}, function ( msg ) {
						if ( msg && msg.data ) {
							var rGreeting = msg.data;

							switch ( rGreeting.greetingTextType ) {
								case 0:
									//robert text greeting
									msg = {
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
									};
									me.receiveMsg(msg, 'txt');
									break;
								case 1:
									try {
										var greetingObj = Easemob.im.Utils.parseJSON(rGreeting.greetingText.replace(/&quot;/g, '"'));
										if ( rGreeting.greetingText === '{}' ) {
											msg = {
												data: '该菜单不存在',
												type: 'txt',
												noprompt: true
											};
											me.receiveMsg(msg, 'txt');
										} else {
											//robert list greeting
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
            , getNickNameOption: function () {
				if ( config.offDuty ) { return; }

                easemobim.api('getNickNameOption', {
                    tenantId: config.tenantId
                }, function ( msg ) {
                    if ( msg && msg.data && msg.data.length > 0 ) {
                        config.nickNameOption = msg.data[0].optionValue === 'true' ? true : false;
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
                        var ref = config.referrer ? decodeURIComponent(config.referrer) : document.referrer;
                        me.onlineHumanAgentCount = msg.data.onlineHumanAgentCount;//人工坐席数
                        me.onlineRobotAgentCount = msg.data.onlineRobotAgentCount;//机器人坐席数
                        me.agentCount = me.onlineHumanAgentCount/1 + me.onlineRobotAgentCount/1;
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
                            referer:  ref
                        });//ref info
                    }


                    if ( !me.nicknameGetted ) {
                        me.nicknameGetted = true;
                        //get the switcher of agent nickname
                        me.getNickNameOption();
                    }
                });
            }
            , handleGroup: function () {
                this.chatWrapper = this.handleChatContainer();
            }
            , handleChatContainer: function () {
                var curChatContainer = utils.$Class('div.easemobWidget-chat', easemobim.imChatBody);

				this.setAgentProfile({
					tenantName: config.defaultAgentName,
                    avatar: config.tenantAvatar
				});
                if ( curChatContainer && curChatContainer.length > 0 ) {
                    return curChatContainer[0];
                } else {
                    curChatContainer = document.createElement('div');
                    utils.addClass(curChatContainer, 'easemobWidget-chat');
                    utils.insertBefore(easemobim.imChatBody, curChatContainer, easemobim.imChatBody.childNodes[this.hasLogo ? 1 : 0]);

                    var transfer = document.createElement('div');
                    transfer.id = 'transfer';
					utils.addClass(transfer, 'easemobWidget-status-prompt');
                    easemobim.imChat.appendChild(transfer);
                    return curChatContainer;
                }
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
                        doms.agentStatusText.innerText = easemobim._const.agentStatusText[state];
                        doms.agentStatusSymbol.className = 'easemobWidget-agent-status ' + easemobim._const.agentStatusClassName[state];
                    }
                });
            }
            , setAgentProfile: function ( info ) {

                var avatarImg = info && info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.tenantAvatar || config.defaultAvatar;

                //更新企业头像和名称
                if ( info.tenantName ) {
                    doms.nickName.innerText = info.tenantName;
                    easemobim.avatar.setAttribute('src', avatarImg);
                }

                //昵称开关关闭
                if (!config.nickNameOption) return;

                // fake: 默认不显示调度员昵称
                if('调度员' === info.userNickname) return;

                if(!info.userNickname) return;

                //更新坐席昵称
                doms.nickName.innerText = info.userNickname;

				this.currentAvatar = avatarImg;
                var src = easemobim.avatar.getAttribute('src');

                if ( !this.currentAvatar ) { return; }
                easemobim.avatar.setAttribute('src', this.currentAvatar);

                //更新头像显示状态
                //只有头像和昵称更新成客服的了才开启轮训
                //this.updateAgentStatus();
            }
            , setMinmum: function () {
                if ( !config.minimum || utils.isTop ) {
                    return;
                }
                var me = this,
					min = document.createElement('a');

                min.setAttribute('href', 'javascript:;');
                min.setAttribute('title', '关闭');
                utils.addClass(min, 'easemobWidgetHeader-min bg-color border-color');
                easemobim.dragHeader.appendChild(min);
                utils.on(min, 'mousedown touchstart', function () {
                    utils.isTop || transfer.send(easemobim.EVENTS.CLOSE, window.transfer.to);
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
			//fill emotions async
            , fillFace: function () {
                if ( utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0]) ) {
                    return;
                }

				var faceStr = '',
					count = 0,
					me = this;

                if(utils.isMobile){
                    utils.on(easemobim.faceBtn, 'mouseenter', function () {
                        utils.addClass(this, 'theme-color');
                    })
                    utils.on(easemobim.faceBtn, 'mouseleave', function () {
                        utils.removeClass(this, 'theme-color');
                    });
                }
                utils.on(easemobim.faceBtn, utils.click, function () {
					easemobim.textarea.blur();
                    utils.toggleClass(easemobim.chatFaceWrapper, 'em-hide');

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

                if ( !me.ePrompt ) {
                    me.ePrompt = document.createElement('p');
                    me.ePrompt.className = 'easemobWidget-error-prompt em-hide';
                    utils.html(me.ePrompt, '<span></span>');
                    easemobim.imChat.appendChild(me.ePrompt);
                    me.ePromptContent = me.ePrompt.getElementsByTagName('span')[0];
                }
                
                utils.html(me.ePromptContent, msg);
                utils.removeClass(me.ePrompt, 'em-hide');
                isAlive || setTimeout(function () {
                    utils.html(me.ePromptContent, '');
                    utils.addClass(me.ePrompt, 'em-hide');
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

				this.mobile();

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
                        utils.addClass(easemobim.send, 'easemobWidget-send-disable');
                        break;
                    default:// show note
                        if ( easemobim.leaveMessage ) {
                            this.slogan && utils.addClass(this.slogan, 'em-hide');
                            //utils.addClass(easemobim.imBtn.getElementsByTagName('a')[0], 'easemobWidget-offline-bg');
                            utils.removeClass(easemobim.leaveMessage.dom, 'em-hide');
                            utils.addClass(easemobim.imChatBody, 'em-hide');
                            utils.addClass(easemobim.send, 'em-hide');
                            easemobim.leaveMessage.show(isOffDuty);
                        }
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
                me.fillFace();
                me.scrollBottom(50);
                utils.addClass(easemobim.imBtn, 'em-hide');
                utils.removeClass(easemobim.imChat, 'em-hide');
                if (!config.offDuty || config.offDutyType !== 'none') {
                    try { easemobim.textarea.focus(); } catch ( e ) {}
                }
				me.resetPrompt();
            }
            , sdkInit: function () {
                this.channel.listen();
            }
            , appendDate: function ( date, to, isHistory ) {
                var chatWrapper = this.chatWrapper,
                    dom = document.createElement('div'),
                    fmt = 'M月d日 hh:mm';

                if ( !chatWrapper ) {
                    return;
                }
                utils.html(dom, new Date(date).format(fmt));
                utils.addClass(dom, 'easemobWidget-date');

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
					, apiUrl: location.protocol + '//' + config.restServer
				};

				if ( config.user.token ) {
					op.accessToken = config.user.token;
				} else {
					op.pwd = config.user.password;
				}

				me.conn.open(op);
            }
            , soundReminder: function () {
                var me = this;
                var ast = 0;

                if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
                    return;
                }

                me.reminder = document.createElement('a');
                me.reminder.setAttribute('href', 'javascript:;');
                utils.addClass(me.reminder, 'easemobWidgetHeader-audio theme-color');
                easemobim.dragHeader.appendChild(me.reminder);

                //音频按钮静音
                utils.on(me.reminder, 'mousedown touchstart', function () {
                    me.silence = !me.silence;
                    utils.toggleClass(me.reminder, 'easemobWidgetHeader-silence', me.slience);

                    return false;
                });

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
				
				!utils.isMobile && !utils.isTop && utils.on(easemobim.imBtn, utils.click, function () {
				    transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
				});
				utils.on(easemobim.imChatBody, utils.click, function () {
					easemobim.textarea.blur();
					return false;
				});
                utils.on(document, 'mouseover', function () {
					utils.isTop || transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
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
                utils.on(easemobim.noteBtn, 'mouseenter', function () {
                    me.setThemeColor(this);
                });
                utils.on(easemobim.noteBtn, 'mouseleave', function () {
                    me.clearThemeColor(this);
                });

				if (config.dragenable && !utils.isMobile) {//drag
					
					easemobim.dragBar.style.cursor = 'move';

					utils.on(easemobim.dragBar, 'mousedown', function ( ev ) {
						var e = window.event || ev;
						easemobim.textarea.blur();//ie a  ie...
						easemobim.EVENTS.DRAGREADY.data = { x: e.clientX, y: e.clientY };
                        utils.isTop || transfer.send(easemobim.EVENTS.DRAGREADY, window.transfer.to);
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
                    if ( this.getAttribute('data-type') === 'txt' ) {
                        me.channel.reSend('txt', id);
                    } else {
                        me.conn.send(id);
                    }
                });

				utils.live('button.js_robotTransferBtn', utils.click,  function () {
                    var that = this;

                    if ( that.clicked ) { return false; }

                    that.clicked = true;
                    me.transferToKf(that.getAttribute('data-id'), that.getAttribute('data-sessionid'));
                    return false;
                });

                //机器人列表
                utils.live('button.js_robotbtn', utils.click, function () {
                    var that = this;

                    me.sendTextMsg(utils.html(that), null, {
                        msgtype: {
                            choice: { menuid: that.getAttribute('data-id') }
                        }
                    });
                    return false;
                });
                
                var handleSendBtn = function () {
                    if ( !me.readyHandled ) {
                        utils.addClass(easemobim.sendBtn, 'disabled');
                        return false;
                    }
                    utils.toggleClass(easemobim.sendBtn, 'disabled', !easemobim.textarea.value);
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
                    easemobim.realFile.value && me.sendImgMsg();
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
                        me.errorPrompt('当前浏览器需要安装flash发送图片');
                        return false;    
                    }
                    easemobim.realFile.click();
                });

                //显示留言界面
                utils.on(easemobim.noteBtn, 'click', function () {
                    easemobim.leaveMessage.show();
                });
                utils.on(easemobim.mobileNoteBtn, 'click', function () {
                    easemobim.leaveMessage.show();
                });

                //hot key
                utils.on(easemobim.textarea, 'keydown', function ( evt ) {
                    if(evt.keyCode !== 13) return;

                    if(utils.isMobile || evt.ctrlKey || evt.shiftKey){
                        this.value += '\n';
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
                            this.value = '';
                        }.bind(this), 0);
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
                        this.appendEventMsg(easemobim._const.eventMessageText.NOTE);
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
                    this.appendEventMsg(easemobim._const.eventMessageText.CREATE);
                } else if ( action === 'close' ) {//显示会话关闭
                    this.appendEventMsg(easemobim._const.eventMessageText.CLOSED);
                } else if ( action === 'transferd' ) {//显示转接到客服
                    this.appendEventMsg(easemobim._const.eventMessageText.TRANSFER);
                } else if ( action === 'transfering' ) {//显示转接中
                    this.appendEventMsg(easemobim._const.eventMessageText.TRANSFERING);
                 } else if ( action === 'linked' ) {//接入成功
                    this.appendEventMsg(easemobim._const.eventMessageText.LINKED);
                }

                if(action === 'transferd' || action === 'linked'){
                    //坐席发生改变
                    this.handleAgentStatusChanged(info);
                }
            }
            //坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
            , handleAgentStatusChanged: function ( info ) {
                if ( !info ) { return; }

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
                if (config.hideStatus) { return; }

                var dom = document.createElement('div');

                dom.innerText = msg;
                dom.className = 'easemobWidget-event';

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
			//未读消息提醒
            , messagePrompt: function ( message ) {

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
					utils.isTop || transfer.send(easemobim.EVENTS.SLIDE, window.transfer.to);
					utils.isTop || transfer.send(easemobim.EVENTS.NOTIFY, window.transfer.to);
				}
            }
			, resetPrompt: function () {
				this.msgCount = 0;
				utils.addClass(utils.html(easemobim.messageCount, ''), 'em-hide');
				utils.isTop || transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
			}
			//receive message function
            , receiveMsg: function ( msg, type, isHistory ) {
                if ( config.offDuty ) {
                    return;
                }

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

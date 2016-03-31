/*
    im业务逻辑代码
    version: 1.4.0
*/

;(function ( window, undefined ) {
    'use strict';

    var main = function ( config ) {
        var sendQueue = {};//记录技能组切换时的登录间隙所发送的消息
        var userHash = {};//记录所有user相关
        var isGroupChat = false;//当前是否技能组聊天窗口
        var isShowDirect = false;//不同技能组之间，直接显示
        var curGroup = '';//记录当前技能组，如果父级页面切换技能组，则直接打开chatwindow，不toggle   
        var swfupload = null;//flash "上传利器"-_-b
        var https = location.protocol === 'https:' ? true : false;
        var click = EasemobWidget.utils.isMobile && ('ontouchstart' in window) ? 'touchstart' : 'click';
        config.root = window.top == window;
        config.json.hide = config.json.hide == 'false' ? false : config.json.hide;
        config.json.sat = config.json.sat == 'false' ? false : config.json.sat;
        config.json.tenants = config.json.tenants == 'false' ? false : config.json.tenants;


        //
        EasemobWidget.init(config, function () {
            if ( config.root && config.json && config.json.emgroup ) {
                isGroupChat = true;
                curGroup = config.json.emgroup;
				userHash[curGroup]  = {
					user: config.user,
					password: config.password
				};
                
            } else {
				userHash.normal  = {
					user: config.user,
					password: config.password
				};
            }

            im.init();
        });

       
        /*
            聊天窗口所有业务逻辑代码
        */
        var im = ({
            init: function(){
				this.getNotice();//
                this.getDom();//绑定所有相关dom至this
                this.setTheme();//设置相应主题
				this.showChatIfRoot();//展示聊天窗口内容
                this.handleFixedBtn();//展示悬浮小按钮
                this.setOffline();//设置企业logo
                this.setTitle(config.json.emgroup ? config.json.emgroup : '');//设置im.html的标题
                this.audioAlert();//init audio
                this.mobileInit();//h5 适配
                this.bindEvents();//开始绑定dom各种事件
				this.handleSatisEntry();//是否允许访客主动发起满意度评价
                this.handleSkill();
            }
			, handleSatisEntry: function () {
				if ( config.json && config.json.sat ) {
                    this.Im.find('.easemobWidget-satisfaction').removeClass('hide');
                }
			}
			, showChatIfRoot: function () {
				config.root && (this.min.addClass('hide'), this.toggleChatWindow());
			}
			, handleSkill: function () {
				if ( config.json && config.json.emgroup && config.root ) {//处理技能组
                    var value = config.json.emgroup;
                    this.handleGroup(value);
                    userHash[value] = userHash[value] || {};
                    userHash[value].user = Emc.get(value + config.json.tenantId, config.json.tenants);
                    curGroup = value;
                }
				this.open();
			}
			, getNotice: function () {
				var me = this;

				if ( config.offline ) {
					return;
				}

				EasemobWidget.api.getWord(config.json.tenantId)
				.done(function ( winfo ) {
					config.word = winfo && winfo.length ? winfo[0].optionValue : '';
					me.setWord();
				});
			}
			, getNickName: function ( nameObj ) {
				if ( nameObj ) {
					return nameObj.userNicename || nameObj.userNickname;
				} else {
					return null;
				}
			}
            , getSession: function () {
                var value = isGroupChat ? curGroup : 'normal',
                    me = this;

                if ( userHash[value].sessionGetted ) {
                    (!isGroupChat || userHash[value].session) && me.setTitle('', userHash[value].agent);
                } else {
					userHash[value].sessionGetted = true;
                    userHash[value].agent = userHash[value].agent || {};
					me.setLogo();//设置企业logo

                    EasemobWidget.api.getSession(userHash[value].user, config)
                    .done(function(info){

						if ( !info ) {
							me.getGreeting();
						} else {
							userHash[value].session = info;
							userHash[value].agent.userNickname = info.agentUserNiceName;
							me.setTitle('', userHash[value].agent);
							info.visitorUser 
							&& info.visitorUser.userId 
							&& EasemobWidget.api.sendVisitorInfo(config.json.tenantId, info.visitorUser.userId);//ref info
						}
                    })
                    .fail(function () {
                        userHash[value].session = null;
						me.getGreeting();
                    });
                }
            }
			, getGreeting: function () {
				var me = this,
					wrapper = me.chatWrapper || null;

				$.when(
					EasemobWidget.api.getSystemGreeting(config)
					, EasemobWidget.api.getRobertGreeting(config)
				)
				.done(function(sGreeting, rGreeting){
					var msg = null;
					if ( sGreeting ) {
						msg = {
							msg: sGreeting,
							type: 'txt'
						};
						msg && me.receiveMsg(msg, 'txt', null, wrapper, true);
					}
					if ( rGreeting ) {
						switch ( rGreeting.greetingTextType ) {
							case 0:
								msg = {
									msg: rGreeting.greetingText,
									type: 'txt'
								};
								me.receiveMsg(msg, 'txt', null, wrapper, true);
								break;
							case 1:
								try {
									var greetingObj = $.parseJSON(rGreeting.greetingText.replace(/&quot;/g, '"'));
									if ( rGreeting.greetingText === '{}' ) {
										msg = {
											msg: '该菜单不存在',
											type: 'txt'
										};
										me.receiveMsg(msg, 'txt', null, wrapper, true);
									} else {
										msg = { ext: greetingObj.ext };
										me.receiveMsg(msg, null, null, wrapper, true);	
									}
								} catch ( e ) {}
								break;
							default: break;
						}
					}
				})
				.fail(function(){});
			}
            /*, getBase64: (function () {
                var canvas = $('<canvas>').get(0);
                if ( !canvas.getContext ) {
                    return;
                }
                var ctx = canvas.getContext("2d"),
                    img = new Image();

                return function ( url, callback ) {
                    img.onload = function () {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(this, 0, 0);
                        typeof callback === 'function' && callback(canvas.toDataURL('image/png'));
                    };
                    img.src = url;
                };
            }())
            , getBlob: function ( base64 ) {
                var me = this;
                try {
                    if ( base64.indexOf('data:image') < 0 ) {
                        this.getBase64(base64, function(blob) {
                            me.getBlob(blob);
                        });
                    }
                    var bytes = window.atob(base64.split(',')[1]),
                        ab = new ArrayBuffer(bytes.length),
                        ia = new Uint8Array(ab);

                    for ( var i = 0, l = bytes.length; i < l; i++ ) {
                        ia[i] = bytes.charCodeAt(i);
                    }
                    return new Blob( [ab], {type: 'image/png', encoding: 'utf-8'});
                } catch ( e ) {
                    return null;
                }
            }*/
            , paste: function ( obj, callback ) {
                var me = this;
                    //ctrl_pressed = false;

                /*if ( me.isIE !== null && me.isIE < 11 ) {
                    return;
                }*/
                
                /*me.headBar.add($('#easemobWidgetSend')).add($('#easemobWidgetBody')).on('keydown', function( e ) {
                    var ev = e.originalEvent,
                        k = ev.keyCode;

                    if ( k === 17 || ev.metaKey || ev.ctrlKey ) {
                        ctrl_pressed = true;
                    }
                    if ( k === 86 ) {
                        if ( ctrl_pressed === true && !window.Clipboard ) {
                            pw.focus();
                            setTimeout(function () {
                                ctrl_pressed = false;
                            }, 50);
                        }
                    }
                });*/

                /*var pw = $('<div>');
                pw.attr('contenteditable', '');
                pw.css({'opacity': 0, position: 'fixed', top: '-10px', left: '-10px', width: '1px', height: '1px', overflow: 'hidden'});
                pw.on('DOMSubtreeModified', function() {
                    if ( !ctrl_pressed ) {
                        return true;
                    } else {
                        ctrl_pressed = false;
                    }
                    var img = pw.find('img');
                    if ( img.length > 0 && img.attr('src') ) {
                        var b = me.getBlob(img.attr('src'));
                        if ( b ) {
                            callback instanceof Function && callback(b);
                        } else {
                            callback instanceof Function && callback();
                        }
                    }
                    var word = pw.children().length === 0 ? pw.html() : pw.children().eq(0).html();
                    me.textarea.val(me.textarea.val() + word).change();
                    pw.html('');
                });
                $('body').append(pw);*/

                $(obj).on('paste', function ( e ) {
                    var ev = e.originalEvent;

                    try {
                        if ( ev.clipboardData && ev.clipboardData.types ) {
                            if ( ev.clipboardData.items.length > 0 ) {
                                if ( /^image\/\w+$/.test(ev.clipboardData.items[0].type) ) {
                                    callback instanceof Function && callback(ev.clipboardData.items[0].getAsFile());
                                }
                            }
                        } else if ( window.clipboardData ) {
                            var url = window.clipboardData.getData('URL');
                            
                            callback instanceof Function && callback(url);
                        }
                    } catch ( ex ) {/*error Value of 'err' may be overwritten in IE 8 and earlier.*/
                        callback instanceof Function && callback();
                    }
                });
            }
            , getConnection: function () {
                return new Easemob.im.Connection({
					url: 'im-api' + config.cluster + '.easemob.com'
				});
            }
            , getHistory: function ( from, wrapper, callback ) {

                if ( config.offline ) {
                    return;
                }

                var me = this;
                wrapper = wrapper || im.chatWrapper;

                if(!wrapper.data('group')) return;

				if ( wrapper.data('hised') ) {
                    return;
                }

				wrapper.attr('data-hised', 1);

                EasemobWidget.api.getHistory(
                    from 
                    , EasemobWidget.LISTSPAN
                    , wrapper.data('group')
                    , config.json.tenantId
                )
                .done(function ( info ) {
                    if ( info && info.length == EasemobWidget.LISTSPAN ) {
                        wrapper.attr('data-start', Number(info[EasemobWidget.LISTSPAN - 1].chatGroupSeqId) - 1);
                        wrapper.attr('data-history', 0);
                    } else {
                        wrapper.attr('data-history', 1);
                    }
                    callback instanceof Function && callback(wrapper, info);
                });
            }
            , setAttribute: function () {
                this.msgCount = 0;//未读消息数
                this.scbT = 0;//sroll bottom timeout stamp
                this.autoGrowOptions = {};
                this.historyGetted = { normal: false };//第一次获取历史记录
                this.msgTimeSpan = {};//用于处理1分钟之内的消息只显示一次时间
                this.isIE = EasemobWidget.utils.getIEVersion();
                
                return this;
            }
            , handleGroup: function ( type ) {
                if ( typeof type === 'string' ) {
                    type = type;
                    im.group = type;
                    im.handleChatContainer(im.group);
                } else {
                    if ( !im.group ) {
                        type.ext 
                        && type.ext.weichat 
                        && type.ext.weichat.queueName 
                        && delete type.ext.weichat.queueName;

                        return;
                    }
                    type.ext = type.ext || {};
                    type.ext.weichat = type.ext.weichat || {};
                    type.ext.weichat.queueName = im.group;
                }
            }
            , handleChatContainer: function ( groupId ) {
                var curChatContainer = $(document.getElementById(groupId));

                if ( curChatContainer.length > 0 ) {
                    this.chatWrapper = curChatContainer;
                    this.setTitle(groupId);
                    curChatContainer.removeClass('hide').siblings('.easemobWidget-chat').addClass('hide');
                    this.Im.find('#' + groupId + '-transfer').removeClass('hide').siblings('.easemobWidget-status-prompt').addClass('hide');
                } else {
                    curChatContainer = $('<div data-start="0" data-history="1" id="' + groupId + '" class="easemobWidget-chat"></div>');
                    $('#normal').parent().prepend(curChatContainer);
                    $('#normal').parent().parent().append('<div id="' + groupId + '-transfer" class="easemobWidget-status-prompt"></div>');
                    this.handleChatContainer(groupId);     
                }
            }
            , handleHistory: function ( cwrapper ) {
                var me = this;

                if ( config.history && config.history.length > 0 ) {
                    $.each(config.history, function ( k, v ) {
						var wrapper = cwrapper || this.chatWrapper;
                        /*
                            @param1:
                            @param2(boolean); true: 历史记录
                            @param3(dom); 需要append消息的wrapper 
                        */
                        var msg = v.body;

                        if ( v.body && v.body.bodies.length > 0 ) {
                            msg = v.body.bodies[0];
                            if ( v.body.from && v.body.from.indexOf('webim-visitor') > -1 ) {

                                //访客发送的满意度评价不在历史记录中展示
                                if(v.body.ext 
                                && v.body.ext.weichat 
                                && v.body.ext.weichat.ctrlType 
                                && v.body.ext.weichat.ctrlType == 'enquiry') {
                                    return;
                                }

                                switch(msg.type) {
                                    case 'img':
                                        im.sendImgMsg(msg, wrapper);
                                        break;
                                    case 'txt':
                                        im.sendTextMsg(msg, wrapper, true);
                                        break;
                                }
                            } else {

                                //判断是否为满意度调查的消息
                                if(v.body.ext && v.body.ext.weichat && v.body.ext.weichat.ctrlType && v.body.ext.weichat.ctrlType == 'inviteEnquiry'
								|| v.body.ext && v.body.ext.msgtype && v.body.ext.msgtype.choice
								|| v.body.ext && v.body.ext.weichat && v.body.ext.weichat.ctrlType === 'TransferToKfHint' ) {
                                    msg = v.body;
                                }
                                im.receiveMsg(msg, msg.type, 'history', wrapper);
                            }
                            (msg.msg || msg.filename) && msg.type != 'cmd' && im.addDate(v.timestamp || v.body.timestamp, true, wrapper);
                        }
                    });

					var key = isGroupChat ? curGroup : 'normal';
                    if ( !im.historyGetted[key] ) {
                        im.chatWrapper.find('img:last').on('load', im.scrollBottom);
                        im.scrollBottom();
                        im.historyGetted[key] = true;
                    }
                }
            }
            , setTitle: function ( title, info ) {
				if ( !this.headBar ) {
					return;
				}

                var nickName = this.headBar.find('.easemobWidgetHeader-nickname'),
                    avatar = this.headBar.find('.easemobWidgetHeader-portrait');

				var nName = this.getNickName(info);

				var avatarSrc = info && info.avatar ? info.avatar : config.avatar;

				if ( !/ossimages/.test(avatarSrc) ) {
					avatarSrc = '//' + location.host + '/ossimages/' + avatarSrc.replace(/^https?:\/\//, '');
				}
                nickName.html(nName ? nName : (config.tenantName + (title ? '-' + title : '')));
                avatar.attr('src', avatarSrc).removeClass('hide');
                document.title = nickName.html() + (title ? '' : '-客服');
            }
            , mobileInit: function(){
                if(!EasemobWidget.utils.isMobile) return;
                this.Im.find('.easemobWidget-satisfaction').addClass('hide');

                if(!config.json.hide && !config.root) {
                    this.fixedBtn.css({width: '100%', top: '0'});
                    this.fixedBtn.children().css({
                        width: '100%'
                        , 'border-radius': '0'
                        , 'text-align': 'center'
                        , 'font-size': '18px'
                        , 'height': '40px'
                        , 'line-height': '40px'
                    });
                }
                this.Im.addClass('easemobWidgetWrapper-mobile');
                this.evaluate.addClass('hide');
                this.mobileLink.attr('href', location.href);
				this.sendbtn.removeClass('disabled');
            }
            , setWord: function () {
                if ( config.word && !config.offline ) {
                    this.chatWrapper.parent().css('top', '90px');
                    this.word.find('span').html(Easemob.im.Utils.parseLink(config.word));
                    this.word.removeClass('hide');
                }
            }
			, setLogo: function () {
				if ( config.logo ) {
					this.chatWrapper.prepend('<div class="easemobWidget-tenant-logo"><img src="' + config.logo + '"></div>');
				}
			}
            , fillFace: function(){
                var faceStr = '<li class="e-face">',
                    count = 0;

                $.each(Easemob.im.EMOTIONS.map, function(k, v){
                    count += 1;
                    faceStr += ["<div class='easemobWidget-face-bg e-face'>",
                                    "<img class='easemobWidget-face-img e-face' ",
                                        "src='" + Easemob.im.EMOTIONS.path + v + "' ",
                                        "data-value=" + k + " />",
                                "</div>"].join('');

                    if(count % 7 === 0) {
                        faceStr += '</li><li class="e-face">';
                    }
                });

                if(count % 7 === 0) {
                    faceStr = faceStr.slice(0, -('<li class="e-face">').length);
                } else {
                    faceStr += '</li>';
                }

                this.faceWrapper.html(faceStr), faceStr = null;
				this.faceFilled = true;
            }
            , errorPrompt: function(msg) {//暂时所有的提示都用这个方法
                var me = this;
                me.ePrompt.html(msg).removeClass('hide');
                setTimeout(function(){
                    me.ePrompt.html(msg).addClass('hide');
                }, 2000); 
            }
            , setTheme: function() {
                
				EasemobWidget.api.getTheme(config.json.tenantId)
				.always(function ( tinfo ) {
					config.theme = tinfo && tinfo.length ? tinfo[0].optionValue : '天空之城';

					if ( config.json.color ) {
						var color = config.json.color;
						this.min.css('background-color', color);
						this.fixedBtn.children().css('background-color', color);
						this.headBar.css('background-color', color);
						this.sendbtn.css('background-color', color);
					} else if ( config.theme ) {
						if(!EasemobWidget.THEME[config.theme]) config.theme = '天空之城';
						//$('head').append('<link rel="stylesheet" href="/webim/theme/'+encodeURIComponent(config.theme)+'.css" />');
						$('<style type="text/css">' + EasemobWidget.THEME[config.theme].css + '</style>').appendTo('head');
					}
				})
                 
            }
            , handleFixedBtn: function() {
                if(!config.json.hide && !config.root) {
                     this.fixedBtn.removeClass('hide');
                }
            }
            , setOffline: function() {
                var me = this;

				EasemobWidget.api.getStatus(config.json.tenantId)
				.done(function ( offline ) {
					config.offline = offline;
					if ( !offline ) {
						me.chatWrapper.parent().removeClass('hide');
						me.sendbtn.parent().removeClass('hide');
						//me.dutyStatus.html('(在线)');
					} else {
						me.fixedBtn.find('a').addClass('easemobWidget-offline-bg');
						me.offline.removeClass('hide');
						me.chatWrapper.parent().addClass('hide');
						me.sendbtn.parent().addClass('hide');
						me.word.addClass('hide');
						//me.dutyStatus.html('(离线)');
					}
				});
            }
            , toggleChatWindow: function(windowStatus) {
                var me = this;

                me.handleTransfer();
                if(!config.root) {
                    setTimeout(function(){
                        !config.json.hide && me.fixedBtn.toggleClass('hide');
                    }, 100);
                    message.sendToParent(windowStatus == 'show' || me.Im.hasClass('hide') ? 'showChat' : 'minChat');
                    windowStatus == 'show' 
                        ? (
                            config.json.hide || me.fixedBtn.removeClass('hide')
                            , me.Im.removeClass('hide')
                        ) 
                        : me.Im.toggleClass('hide');
                } else {
                    me.Im.removeClass('hide');
                }

                if(me.Im.hasClass('hide')) {
                    me.isOpened = false;
                } else {
                    me.textarea.focus();
                    me.isOpened = true;
                    me.scrollBottom(50);
                }
                me.addPrompt();
            }
            , sdkInit: function(conn){
                var me = this;
                
                conn.listen({
                    onOpened: function(){
						me.sendbtn.removeClass('em-init').html('发送');
                        conn.setPresence();
                        conn.heartBeat(conn);
                        while(sendQueue[curGroup] && sendQueue[curGroup].length) {
                            conn.send(sendQueue[curGroup].pop());
                        }
                    }
                    , onTextMessage: function(message){
                        me.receiveMsg(message, 'txt');
                    }
                    , onEmotionMessage: function(message){
                        me.receiveMsg(message, 'face');
                    }
                    , onPictureMessage: function(message){
                        me.receiveMsg(message, 'img');
                    }
                    , onCmdMessage: function(message){
                        me.receiveMsg(message, 'cmd');
                    }
                    , onFileMessage: function(message) {
                        me.receiveMsg(message, 'file');
                    }
                    , onClosed: function() {}
                    , onError: function(e){
                        e.reconnect ? me.open() : conn.stopHeartBeat(conn);
                    }
                });
            }
            , addDate: function(date, isHistory, wrapper) {
                var htmlPre = '<div class="easemobWidget-date">',
                    htmlEnd = '</div>',
                    fmt = 'M月d日 hh:mm';

                wrapper = wrapper || this.chatWrapper;

                var id = wrapper.attr('id');

                if(date) {
					var logo = wrapper.find('.easemobWidget-tenant-logo');
					
					if ( logo.length > 0 ) {
						$(htmlPre + new Date(date).format(fmt) + htmlEnd).insertAfter(logo); 
					} else {
						$(htmlPre + new Date(date).format(fmt) + htmlEnd).insertBefore(wrapper.find('div:first')); 
					}
                } else if(!isHistory) {
                    if(!this.msgTimeSpan[id] 
                    || (new Date().getTime() - this.msgTimeSpan[id] > 60000)) {//间隔大于1min  show

                        wrapper.append(htmlPre + new Date().format(fmt) + htmlEnd); 
                    }
                    this.resetSpan(id);
                }
            }
            , resetSpan: function(id) {
                this.msgTimeSpan[id] = new Date().getTime();
            }
            , open: function () {
				var me = this,
                    key = isGroupChat ? curGroup : 'normal';

				if ( userHash[key].user && userHash[key].password ) {
					me.connectToServer(key);
					me.getSession();

					me.chatWrapper.data('hised') || me.getHistory(0, me.chatWrapper, function ( wrapper, info ) {
						config.history = info;
						me.handleHistory(wrapper);
					});
				} else {
					me.handleUser(userHash[key], function () {
						me.connectToServer(key);
						me.getSession();

						me.getHistory(0, me.chatWrapper, function ( wrapper, info ) {
							config.history = info;
							me.handleHistory(wrapper);
						});

					}, isGroupChat ? curGroup : null);
				}
            }
			, connectToServer: function ( key ) {
				var me = this;

				if(!userHash[key].conn) {
					userHash[key].conn = me.getConnection();
					me.sdkInit(userHash[key].conn);
				}
				me.conn = userHash[key].conn;
				setTimeout(function () {
					me.conn.open({
						user : userHash[key].user
						, pwd : userHash[key].password
						, appKey : config.appkey
						, apiUrl: config.apiUrl
					});
				}, 500);
			}
            , getDom: function(){
                this.offline = $('#easemobWidgetOffline');
                this.leaveMsgBtn = this.offline.find('button');
                this.contact = this.offline.find('input');
                this.leaveMsg = this.offline.find('textarea');
                this.fixedBtn = $('#easemobWidgetPopBar');
                this.Im = $('.easemobWidgetWrapper');
                this.pasteWrapper = $('.easemobWidget-paste-wrapper');
                this.chatWrapper = this.Im.find('.easemobWidget-chat');
                this.textarea = this.Im.find('.easemobWidget-textarea');
                this.sendbtn = this.Im.find('#easemobWidgetSendBtn');
                this.evaluate = this.sendbtn.parent().find('.easemobWidget-satisfaction');
                this.facebtn = this.Im.find('.easemobWidget-face');
                this.uploadbtn = this.Im.find('#easemobWidgetFile');
                this.realfile = this.Im.find('#easemobWidgetFileInput');
                this.faceWrapper = this.Im.find('.easemobWidget-face-container');
                this.headBar = this.Im.find('#easemobWidgetHeader');
                this.min = this.Im.find('.easemobWidgetHeader-min');
                this.audioSign = this.Im.find('.easemobWidgetHeader-audio');
                this.closeWord = this.Im.find('.easemobWidget-word-close');
                this.word = this.Im.find('.easemobWidget-word');
                this.messageCount = this.fixedBtn.find('.easemobWidget-msgcount');
                this.ePrompt = this.Im.find('.easemobWidget-error-prompt');
                this.mobileLink = this.Im.find('#easemobWidgetLink');
                this.dutyStatus = this.Im.find('.easemobWidgetHeader-word-status');
                this.satisDialog = this.Im.find('.easemobWidget-satisfaction-dialog');
                this.transfer = this.Im.find('.easemobWidget-transferring');
            }
            , audioAlert: function(){
                var me = this;

                //if lte ie 8 , return
                if ( me.isIE !== null && me.isIE < 9 || EasemobWidget.utils.isMobile ) {
                    this.audioSign.addClass('hide');
                    me.playaudio = function () {};
                    return;
                }
                if ( window.HTMLAudioElement ) {
                    var ast = 0;
                    
                    me.audio = $('<audio src="static/mp3/msg.m4a"></audio>').get(0);

                    me.playaudio = function(){
                        if ( (EasemobWidget.utils.isMin() ? false : me.isOpened) || ast !== 0 || me.silence ) {
                            return;
                        }
                        ast = setTimeout(function() {
                            ast = 0;
                        }, 3000);
                        me.audio.play();
                    };
                }
            }
            , face: function(msg){
                var me = this;
                if($.isArray(msg)){
                    msg = '[' + msg[0] + ']';
                }
                else if(/\[.*\]/.test(msg)){
                    msg = msg.replace(/&amp;/g, '&');
                    msg = msg.replace(/&#39;/g, '\'');
                    msg = msg.replace(/&lt;/g, '<');
                    $.each(Easemob.im.EMOTIONS.map, function(k, v){
                        while(msg.indexOf(k) >= 0){
                            msg = msg.replace(k
                                , '<img class=\"chat-face-all\" src=\"' + Easemob.im.EMOTIONS.path + Easemob.im.EMOTIONS.map[k] + '\">');
                        }
                    });
                }
                return msg;
            }
            , toggleFaceWrapper: function(e){
				!im.faceFilled && im.fillFace();

                var h = im.sendbtn.parent().outerHeight();
                im.faceWrapper.parent().css('bottom', h + 'px').toggleClass('hide');
                return false;
            }
            , bindEvents: function(){
                var me = this;
                

                //orientation
                $(window).on('orientationchange', function() {
                    //setTimeout(me.textarea.focus, 1000);
                });

                //add hove fix theme
                me.Im.on('mouseenter', '.easemobWidget-list-btn button', function(){
                    $(this).addClass('bg-color');
                })
                .on('mouseleave', '.easemobWidget-list-btn button', function(){
                    $(this).removeClass('bg-color');

                })
                .on('touchstart', '.easemobWidget-list-btn button', function(){
                    $(this).addClass('bg-color');
                    
                })
                .on('touchend', '.easemobWidget-list-btn button', function(){
                    $(this).removeClass('bg-color');
                    
                });

                (function(){
                    var f = null;
                    me.paste(document, function(blob){
                        if(!blob) {
                            return;
                        }
                        me.pasteWrapper.removeClass('hide');
                        window.URL.createObjectURL
                        && (f = blob)
                        && me.pasteWrapper.find('.easemobWidget-paste-image').append($('<img src="' + window.URL.createObjectURL(blob) + '"/>'));
                    });
                    me.pasteWrapper.on('click', '.js_cancelsend', function(){
                        me.pasteWrapper.find('.easemobWidget-paste-image').html('');
                        me.pasteWrapper.addClass('hide');
                    });
                    me.pasteWrapper.on('click', '.js_sendimg', function(){
                        me.realfile.val('');
                        if(!f) {
                            return false;
                        }
                        me.sendImgMsg(null, null, {data: f, url: me.pasteWrapper.find('.easemobWidget-paste-image img').attr('src')}, me.conn.getUniqueId());
                        me.pasteWrapper.find('.easemobWidget-paste-image').html('');
                        me.pasteWrapper.addClass('hide');
                    });
                }());
                
                //resend
                me.Im.on(click, '.easemobWidget-msg-status', function(){
                    var that = $(this),
                        w = that.parent().parent(),
                        id = w.attr('id');

                    that.addClass('hide');
                    w.find('.easemobWidget-msg-loading').removeClass('hide');
                    me.send(id);
                });                

                //drag
                me.headBar.find('.js_drag').on('mousedown', function(e){
                    var ev = e.originalEvent;
                    me.textarea.blur();//ie a  ie...
                    message.sendToParent('dragready' + ev.clientX + '&' + ev.clientY);
                    return false;
                }).on('mouseup', function(){
                    message.sendToParent('dragend');
                    return false;
                });
                

                //满意度调查
                me.evaluate.on(click, function(){
                    //clear cache
                    me.satisDialog.get(0).inviteId = '';
                    me.satisDialog.get(0).serviceSessionId = '';

                    me.satisDialog.removeClass('hide');
                });
                me.Im.on(click, '.js_satisfybtn button', function(){
                    var that = $(this);

                    //cache
                    me.satisDialog.get(0).inviteId = that.data('inviteid');
                    me.satisDialog.get(0).serviceSessionId = that.data('servicesessionid');

                    me.satisDialog.removeClass('hide');
                    return false;
                });
                me.satisDialog.on(click, 'i, .js_cancel', function(){
                    me.satisDialog.addClass('hide');
                });
                me.satisDialog.on(click, '.js_satisfy', function(){
                    var suc = me.satisDialog.find('.js_suc'),
                        level = me.satisDialog.find('li.sel').length,
                        text = me.satisDialog.find('textarea');

                    if(level === 0) {
                        me.errorPrompt('请先选择星级');
                        return false;
                    }
                    me.sendSatisfaction(level, text.val());

                    text.blur();
                    suc.removeClass('hide');

                    setTimeout(function(){
                        text.val('');

                        $.each(me.satisDialog.find('li.sel'), function(k, v){
                            $(v).removeClass('sel');
                        });
                        suc.addClass('hide');
                        me.satisDialog.addClass('hide');
                    }, 1500);

                });
                me.satisDialog.on(click, 'li', function(e){
                    e.originalEvent.preventDefault && e.originalEvent.preventDefault();

                    var that = $(this),
                        par = that.parent(),
                        temp = par.find('li');

                    for ( var i = 0; i < 5; i++ ) {
                        if ( i <= that.index() ) {
                            temp.eq(i).addClass('sel');
                        } else {
                            temp.eq(i).removeClass('sel');
                        }
                    }

                    e.originalEvent.stopPropagation && e.originalEvent.stopPropagation();
                });

                me.Im.on(click, '.js_robertTransferBtn button', function(){
                    var that = this;
                    me.transferToKf(that.getAttribute('data-id'), that.getAttribute('data-sessionid'));
                    return false;
                });

                //机器人列表
                me.Im.on(click, '.js_robertbtn button', function(){
                    var that = $(this);
                    me.sendTextMsg({msg: that.html()}, null, null, {
                        msgtype: {
                            choice: { menuid: that.data('id') }
                        }
                    });
                    return false;
                });

                //关闭广告语按钮
                me.closeWord.on(click, function(){
                    me.word.fadeOut();
                    me.chatWrapper.parent().css('top', '43px');
                });

                //autogrow  callback
                me.autoGrowOptions.callback = function() {
                    var h = im.sendbtn.parent().outerHeight();
                    im.faceWrapper.parent().css('bottom', h + 'px');
                };

                EasemobWidget.utils.isMobile && me.textarea.autogrow(me.autoGrowOptions);
                
                //
                me.textarea.on('keyup change input', function(){
                    $(this).val() && !me.sendbtn.hasClass('em-init') ? me.sendbtn.removeClass('disabled') : me.sendbtn.addClass('disabled');
                })
                .on("keydown", function(evt){//hot key
                    var that = $(this);
                    if((EasemobWidget.utils.isMobile && evt.keyCode == 13) 
                        || (evt.ctrlKey && evt.keyCode == 13) 
                        || (evt.shiftKey && evt.keyCode == 13)) {

                        that.val($(this).val()+'\n');
                        return false;
                    } else if(evt.keyCode == 13) {
                        me.faceWrapper.parent().addClass('hide');
                        if(me.sendbtn.hasClass('disabled') || me.sendbtn.hasClass('em-init')) {
                            return false;
                        }
                        me.sendTextMsg();
                        setTimeout(function(){
                            that.val('');
                        }, 0);
                    }
                });
                if ( EasemobWidget.utils.isMobile ) {
                    var handleFocus = function () {
                        me.textarea.css('overflow-y', 'auto');
                        var scrollTimer = function () {
                            $('html, body').scrollTop(me.textarea.offset().top + 47);
                            me.focusText = setTimeout(scrollTimer, 200);
                        };
                        scrollTimer();
                        me.scrollBottom(800);
                    }
                    me.textarea.on('input', function(){
                        me.autoGrowOptions.update();
                        me.scrollBottom(800);
                    })
                    .on('focus', handleFocus)
                    .one('touchstart', handleFocus)//防止android部分机型滚动条常驻，看着像bug ==b
                    .on('blur', function(){
                        clearTimeout(me.focusText);
                    })
                }

                //最小化按钮的多态
                me.min.on('mouseenter mouseleave', function(){
                    $(this).toggleClass('hover-color');
                }).on('click', function(e){
                    me.toggleChatWindow();
                    return false;
                });

                //音频按钮静音
                me.audioSign.on('click', function(e){
                    var that = $(this);
                    me.silence = me.silence ? false : true;
                    that.toggleClass('easemobWidgetHeader-silence');
                    return false;
                });

                //表情的展开和收起
                me.facebtn.on(click, me.toggleFaceWrapper)
                .on('mouseenter', function(){
                    EasemobWidget.utils.isMobile || $(this).addClass('theme-color');
                })
                .on('mouseleave', function(){
                    EasemobWidget.utils.isMobile || $(this).removeClass('theme-color');
                });

                //表情的选中
                me.faceWrapper.on(click, '.easemobWidget-face-bg', function(e){
                    e.originalEvent.preventDefault && e.originalEvent.preventDefault();

                    !EasemobWidget.utils.isMobile && me.textarea.focus();
                    me.textarea.val(me.textarea.val()+$(this).find('img').data('value'));
                    if(EasemobWidget.utils.isMobile){
                        me.autoGrowOptions.update();//update autogrow
                        setTimeout(function(){
                            me.textarea.get(0).scrollTop = 10000;
                        }, 100);
                    }
                    me.sendbtn.removeClass('disabled');

                    e.originalEvent.stopPropagation && e.originalEvent.stopPropagation();
                });

                //悬浮小按钮的点击事件
                me.fixedBtn.find('a').on('click', function(){
                    if(EasemobWidget.utils.isMobile) {
                        $(this).attr({
                            target: '_blank'
                            , href: location.href
                        });
                    } else {
                        me.chatWrapper.removeClass('hide').siblings().addClass('hide');
                        me.Im.find('#' + me.chatWrapper.attr('id') + '-transfer').removeClass('hide').siblings('.easemobWidget-status-prompt').addClass('hide');
                        me.toggleChatWindow();
                        me.scrollBottom();
                    }
                });

                //选中文件并发送
                me.realfile.on('change', function(){
                    me.sendImgMsg();
                })
                .on('click', function(){
                    if(!Easemob.im.Utils.isCanUploadFile()) {
                        me.errorPrompt('当前浏览器不支持发送图片');
                        return false;    
                    }
                });

                //hide face wrapper
                $(document).on(click, function(ev){
                    var e = window.event || ev,
                        t = $(e.srcElement || e.target);

                    if(!t.hasClass('e-face')) {
                        me.faceWrapper.parent().addClass('hide');
                    }
                });

                //主要用于移动端触发virtual keyboard的收起
                $('.e-face').on('touchstart', function(e){
                    me.textarea.blur();

                    //此坑用于防止android部分机型滚动条常驻，看着像bug ==b
                    !me.textarea.val() && me.textarea.css('overflow-y', 'hidden');
                });

                //弹出文件选择框
                me.uploadbtn.on('click', function(){
                    if(!Easemob.im.Utils.isCanUploadFile()) {
                        me.errorPrompt('当前浏览器不支持发送图片');
                        return false;    
                    }
                    
                    me.realfile.click();
                })
                .on('mouseenter', function(){
                    EasemobWidget.utils.isMobile || $(this).addClass('theme-color');
                })
                .on('mouseleave', function(){
                    EasemobWidget.utils.isMobile || $(this).removeClass('theme-color');
                });

                me.sendbtn.on('click', function(){
                    if(me.sendbtn.hasClass('disabled') || me.sendbtn.hasClass('em-init')) {
                        return false;
                    }
                    me.faceWrapper.parent().addClass('hide');
                    me.sendTextMsg();
                    EasemobWidget.utils.isMobile && me.textarea.css({
                        height: '34px'
                        , overflowY: 'hidden'
                    }).focus();
                    return false;
                });

                //
                me.leaveMsgBtn.on(click, function(){
                    if(!me.contact.val() && !me.leaveMsg.val()) {
                        me.errorPrompt('联系方式和留言不能为空');
                    } else if(!me.contact.val()) {
                        me.errorPrompt('联系方式不能为空');
                    } else if(!me.leaveMsg.val()) {
                        me.errorPrompt('留言不能为空');
                    } else if(!/^\d{5,11}$/g.test(me.contact.val()) 
                        && !/^[a-zA-Z0-9-_]+@([a-zA-Z0-9-]+[.])+[a-zA-Z]+$/g.test(me.contact.val())) {
                        me.errorPrompt('请输入正确的手机号码/邮箱/QQ号');
                    } else {
                        var opt = {
                            to: config.to
                            , msg: '手机号码/邮箱/QQ号：' + me.contact.val() + '   留言：' + me.leaveMsg.val()
                            , type: 'txt'
                        };
                        me.handleGroup(opt);
                        me.send(opt);
                        //me.errorPrompt('留言成功');
                        var succeed = me.leaveMsgBtn.parent().find('.easemobWidget-success-prompt');
                        succeed.removeClass('hide');
                        setTimeout(function(){
                            succeed.addClass('hide');
                        }, 1500);
                        me.contact.val('');
                        me.leaveMsg.val('');
                    }
                });

                //pc 和 wap 的上划加载历史记录的方法
                var st, memPos = 0, _startY, _y, touch, DIS=200, _fired=false;
                var triggerGetHistory = function(){
                    
                    me.chatWrapper.attr('data-history') != 1 
                    && EasemobWidget.api.getHistory(
                        me.chatWrapper.attr('data-start')
                        , EasemobWidget.LISTSPAN
                        , me.chatWrapper.data('group')
                        , config.json.tenantId
                    )
                    .done(function(info){

                        if(info && info.length == EasemobWidget.LISTSPAN) {
                            var start = Number(info[EasemobWidget.LISTSPAN - 1].chatGroupSeqId) - 1;
                            start === 0 && setTimeout(function() {
                                me.chatWrapper.attr('data-history', 1);
                            }, 0);
                            me.chatWrapper.attr('data-start', start);
                            me.chatWrapper.attr('data-history', 0);
                        } else {
                            setTimeout(function() {
                                me.chatWrapper.attr('data-history', 1);
                            }, 0);
                        }
                        config.history = info;
                        im.handleHistory();
                    });
                };

                //wap
                me.chatWrapper.parent().on('touchstart', function(e){
                    var touch = e.originalEvent.touches;
                    if(e.originalEvent.touches && e.originalEvent.touches.length>0) {
                        _startY = touch[0].pageY;
                    }
                })
                .on('touchmove', function(e){
                    var $t = $(this);
                    var touch = e.originalEvent.touches;
                    if(e.originalEvent.touches && e.originalEvent.touches.length>0) {

                        touch = e.originalEvent.touches;
                        _y = touch[0].pageY;
                        if(_y-_startY > 8 && $t.scrollTop() <= 50) {
                            clearTimeout(st);
                            st = setTimeout(function(){
                                triggerGetHistory();
                            }, 100);
                        }
                    }
                });

                //pc
                me.Im.on('mousewheel DOMMouseScroll', '.easemobWidget-chat', function(e){
                    var $t = $(this);
                    
                    if(e.originalEvent.wheelDelta / 120 > 0 || e.originalEvent.detail < 0) {//up
                        clearTimeout(st);
                        st = setTimeout(function(){
                            if(Math.abs($t.offset().top) <= 100) {
                                triggerGetHistory();
                            }
                        }, 400);
                    }
                });
            }
            , scrollBottom: function(type){
                var ocw = im.chatWrapper.parent().get(0);
                
                type 
                ? (clearTimeout(this.scbT), this.scbT = setTimeout(function(){
                    ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
                }, type))
                : (ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000);
            }
            , sendImgMsg: function ( msg, wrapper, file, msgId ) {
                var me = this;
                wrapper = wrapper || me.chatWrapper;

				var msge = new Easemob.im.EmMessage('img', msgId || (msg ? null : me.conn.getUniqueId()));
				var logo = wrapper.find('.easemobWidget-tenant-logo');
					
				

                if ( msg ) {
					msge.set({file: msg});

					if ( logo.length > 0 ) {
						$(msge.get()).insertAfter(logo);
					} else {
						wrapper.prepend(msge.get());
					}

                    return;
                }

                if ( Easemob.im.Utils.isCanUploadFileAsync() ) {
                    if ( me.realfile.val() ) {
                        file = Easemob.im.Utils.getFileUrl(me.realfile.attr('id'));
                    } else if ( !file ) {
                        return;
                    }
                }

				msge.set({
                    file: file,
                    to: config.to,
					apiUrl: config.apiUrl,
                    uploadError: function ( error ) {
                        //显示图裂，无法重新发送
                        if ( !Easemob.im.Utils.isCanUploadFileAsync() ) {
                            swfupload && swfupload.settings.upload_error_handler();
                        } else {
                            setTimeout(function() {
                                var id = error.id,
                                    w = $('#' + id),
                                    a = w.find('img:last').parent();

                                a.removeClass('easemobWidget-noline').html('').append($('<i class="easemobWidget-unimage">I</i>'));
                                w.find('.easemobWidget-msg-loading').addClass('hide');
                                me.scrollBottom();
                            }, 0);
                        }
                    },
                    uploadComplete: function ( data, id ) {
                        me.handleTransfer('sending');
                        me.chatWrapper.find('img:last').on('load', im.scrollBottom);
                        $('#' + id).find('.easemobWidget-noline').attr('href', 'view.html?url=' + encodeURIComponent(data.uri + '/' + data.entities[0].uuid));
                    },
                    success: function ( id ) {
                        $('#' + id).find('.easemobWidget-msg-loading').addClass('hide');
                    },
                    fail: function ( id ) {
						var msg = $('#' + id);

                        msg.find('.easemobWidget-msg-loading').addClass('hide');
                        msg.find('.easemobWidget-msg-status').removeClass('hide');
                    },
                    flashUpload: flashUpload
                });

                me.handleGroup(msge.body);
                me.send(msge.body);
                me.addDate();
                me.realfile.val('');
				if ( Easemob.im.Utils.isCanUploadFileAsync() ) {
					me.chatWrapper.append(msge.get());
				}
                me.chatWrapper.find('img:last').on('load', me.scrollBottom);
            }

			, handleUser: function ( cache, callback, key ) {
				var me = this,
					wrapper = me.chatWrapper || $('#noraml');

				//如果取到缓存user，获取密码，否则新创建
				if ( cache.user ) {
					config.user = cache.user;
	
					$.when(
						EasemobWidget.api.getPwd(config, config.json.tenantId),
						EasemobWidget.api.getGroup(config, config.json.tenantId)
					)
					.done(function ( p, g ) {
						wrapper.attr('data-group', g);
						cache.password = p;
						config.password = p;

						typeof callback == 'function' && callback();
					});
				} else {
					wrapper.attr('data-hised', 1);//新用户不获取历史记录

					EasemobWidget.api.getUser(config, config.json.tenantId)
					.done(function ( info ) {
						cache.user = info.userId;
						cache.password = info.userPassword;
						config.user = info.userId;
						config.password = info.userPassword;

						if ( config.root ) {
							if ( config.json && config.json.emgroup ) {
								Emc.set(config.json.emgroup + config.json.tenantId, cache.user, config.json.tenants);
							} else {
								Emc.set('emKefuUser' + config.json.tenantId, cache.user, config.json.tenants);
							}
						} else {
							key ? message.sendToParent('setgroupuser@' + cache.user + '@emgroupuser@' + key)
							: message.sendToParent('setuser@' + cache.user);
						}

						typeof callback == 'function' && callback();
					});
				}
			}

            , handleTransfer: function ( action, wrapper, info ) {
                var key = isGroupChat ? curGroup : 'normal';

                var wrap = wrapper || this.chatWrapper;

                if ( action === 'sending' ) {
                    if ( !userHash[key].firstMsg && !userHash[key].session ) {
                        userHash[key].firstMsg = true;
                        this.Im.find('#' + wrap.attr('id') + '-transfer').addClass('link').removeClass('transfer');
                        if ( EasemobWidget.utils.isMobile ) {
                            this.headBar.find('.js_drag').addClass('hide');
                        }
                    }
                } else if ( action === 'transfer' ) {
                    this.Im.find('#' + wrap.attr('id') + '-transfer').addClass('transfer').removeClass('link');
                    EasemobWidget.utils.isMobile && this.headBar.find('.js_drag').addClass('hide');
                } else if ( action === 'reply' ) {
                    this.Im.find('#' + wrap.attr('id') + '-transfer').removeClass('transfer link');
                    if ( info ) {
                        userHash[key].agent = userHash[key].agent || {};
                        userHash[key].agent.userNickname = this.getNickName(info);
                        userHash[key].agent.avatar = info.avatar;
                        info && userHash[wrap.attr('id')].user === config.user && this.setTitle('', userHash[key].agent);
                    }
                    if ( EasemobWidget.utils.isMobile ) {
                        this.headBar.find('.js_drag').removeClass('hide');
                    }
                }
            }
            , sendTextMsg: function ( msg, wrapper, isHistory, ext ) {
                var me = this;
                wrapper = wrapper || me.chatWrapper;

				if ( !msg && !me.textarea.val() ) {
                    return;
                }

				var msge = new Easemob.im.EmMessage('txt', isHistory ? null : me.conn.getUniqueId());
				msge.set({
                    value: msg ? msg.msg : me.textarea.val()
                    , to: config.to
                    , ext: ext
                    , success: function(id) {
                        $('#' + id).find('.easemobWidget-msg-loading').addClass('hide');
                    }
                    , fail: function(id) {
                        var msg = $('#' + id);

                        msg.find('.easemobWidget-msg-loading').addClass('hide');
                        msg.find('.easemobWidget-msg-status').removeClass('hide');
                    }
                });

                if ( isHistory ) {
					var logo = wrapper.find('.easemobWidget-tenant-logo');
					
					if ( logo.length > 0 ) {
						$(msge.get()).insertAfter(logo);
					} else {
						wrapper.prepend(msge.get());
					}
                    return;
                }

                me.handleTransfer('sending');
                msge.value && me.addDate();
                
                //local append
                wrapper.append(msge.get());
                me.textarea.val('');
                me.scrollBottom(EasemobWidget.utils.isMobile ? 700 : undefined);
                me.handleGroup(msge.body);
                me.send(msge.body);
            }
            , send: function ( option ) {
                var me = this,
                    resend = typeof option == 'string',
                    id = resend ? option : option.id;

                if ( !resend && isGroupChat ) {
                    sendQueue[curGroup] || (sendQueue[curGroup] = []);
                }

                if ( isGroupChat && userHash[curGroup] && (!userHash[curGroup].conn || !userHash[curGroup].conn.isOpened()) ) {
                    resend || sendQueue[curGroup].push(option);
                } else {
                    me.conn.send(option);
                }
            }
			, transferToKf: function ( id, sessionId ) {
                var me = this;

				var msg = new Easemob.im.EmMessage('cmd');
				msg.set({
                    to: config.to
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
				me.handleGroup(msg.body);
                me.send(msg.body);
            }
            , sendSatisfaction: function(level, content) {
                var me = this;
                
                var opt = {
                    to: config.to
                    , msg: ''
                    , type: 'txt'
                    , ext: {
                        weichat: {
                            ctrlType: 'enquiry'
                            , ctrlArgs: {
                                inviteId: me.satisDialog.get(0).inviteId || ''
                                , serviceSessionId: me.satisDialog.get(0).serviceSessionId || ''
                                , detail: content
                                , summary: level
                            }
                        }
                    }
                };

                this.handleGroup(opt);
                
                this.send(opt);
            }
            , addPrompt: function(detail){//未读消息提醒，以及让父级页面title滚动
                if(!this.isOpened && this.msgCount > 0) {
                    if(this.msgCount > 9) {
                        this.messageCount.addClass('mutiCount').html('\…');
                    } else {
                        this.messageCount.removeClass('mutiCount').html(this.msgCount);
                    }
                    message.sendToParent('msgPrompt');
                    this.notify(detail || '');
                } else {
                    this.msgCount = 0;
                    this.messageCount.html('').addClass('hide');
                    message.sendToParent('recoveryTitle');
                }
            }
            , notify: function ( detail ) {
                message.sendToParent('notify' + (detail || ''));
            }
            , receiveMsg: function ( msg, type, isHistory, wrapper, noPrompt ) {
				if ( config.offline ) {
                    return;
                }

                var me = this,
					message = null;

                wrapper = wrapper || me.chatWrapper;

                
                if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType && msg.ext.weichat.ctrlType == 'inviteEnquiry' ) {//满意度评价
                    type = 'satisfactionEvaluation';  
                } else if ( msg.ext && msg.ext.msgtype && msg.ext.msgtype.choice ) {//机器人自定义菜单
                    type = 'robertList';  
                }  else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType === 'TransferToKfHint' ) {//机器人转人工
                    type = 'robertTransfer';  
				}

                switch ( type ) {
					case 'txt':
						message = new Easemob.im.EmMessage('txt');
                        message.set({value: msg.data || msg.msg});
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
                            <div class="easemobWidget-list-btns easemobWidget-list-btn js_satisfybtn">\
                                <button data-inviteid="' + msg.ext.weichat.ctrlArgs.inviteId + '" data-servicesessionid="'+ msg.ext.weichat.ctrlArgs.serviceSessionId + '">立即评价</button>\
                            </div>']});
                        break;
                    case 'robertList':
						message = new Easemob.im.EmMessage('list');
                        var str = '',
                            robertV = msg.ext.msgtype.choice.items || msg.ext.msgtype.choice.list;

                        if ( robertV && robertV.length > 0 ) {
                            str = '<div class="easemobWidget-list-btns easemobWidget-list-btn js_robertbtn">';
                            for ( var i = 0, l = robertV.length; i < l; i++ ) {
                                str += '<button data-id="' + robertV[i].id + '">' + (robertV[i].name || robertV[i]) + '</button>';
                            }
                            str += '</div>';
                        } else {
							if ( !msg.ext.msgtype.choice.title ) {
								return;
							}
						}
                        message.set({value: msg.ext.msgtype.choice.title || ' ', list: str});
                        break;
					case 'robertTransfer':
						message = new Easemob.im.EmMessage('list');
                        var str = '',
                            robertV = [msg.ext.weichat.ctrlArgs];

                        if ( robertV.length > 0 ) {
                            str = '<div class="easemobWidget-list-btns easemobWidget-list-btn js_robertTransferBtn">';
                            for ( var i = 0, l = robertV.length; i < l; i++ ) {
                                str += '<button data-sessionid="' + robertV[i].serviceSessionId + '" data-id="' + robertV[i].id + '">' + robertV[i].label + '</button>';
                            }
                            str += '</div>';
                        }
                        message.set({value: msg.data || msg.ext.weichat.ctrlArgs.label, list: str});
                        break;
                    default: 
						return;
                }
                
                if ( !isHistory ) {
					
                    if ( !msg.from ) {
						//current chat wrapper
                    } else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.queueName ) {//skill group
                        var n = msg.ext.weichat.queueName,
                            w = $('#' + n);

                        if ( w.length > 0 ) {
                            wrapper = w;
                        }
                    } else {//normal
                        wrapper = $('#normal');
                    }

                    if ( msg.ext && msg.ext.weichat 
					&& msg.ext.weichat.event 
					&& msg.ext.weichat.event.eventName === 'ServiceSessionTransferedEvent' ) {//transfer msg
                        me.handleTransfer('transfer', wrapper);
                    } else if ( msg.ext && msg.ext.weichat ) {
                        if ( !msg.ext.weichat.agent ) {//switch off
                            me.handleTransfer('reply', wrapper);
                        } else {//switch on
                            msg.ext.weichat.agent 
							&& me.getNickName(msg.ext.weichat.agent) !== '调度员' 
							&& me.handleTransfer('reply', wrapper, msg.ext.weichat.agent);
                        }
                    }

                    if ( type === 'cmd' ) {
                        return;
                    }
                    me.addDate(null, null, wrapper);
                    wrapper.append(message.get(true));
                    me.resetSpan();
                    me.scrollBottom();

					if ( noPrompt ) {
						return;
					}
                    me.playaudio();
                    // send prompt & notification
                    if ( !me.isOpened ) {
                        me.messageCount.html('').removeClass('hide');
                        me.msgCount += 1;
                        me.addPrompt(message.brief);
                    } else if ( EasemobWidget.utils.isMin() ) {
                        me.notify(message.brief);
                    }
                } else {
                    if ( msg.type === 'cmd' ) {
                        return;
                    }
					var logo = wrapper.find('.easemobWidget-tenant-logo');
					
					if ( logo.length > 0 ) {
						$(message.get(true)).insertAfter(wrapper.find('.easemobWidget-tenant-logo'));
					} else {
						wrapper.prepend(message.get(true));
					}
                }
            }
        }.setAttribute());

        /*
            提供上传接口
        */
        var flashUpload = function(url, options){
            swfupload.setUploadURL(url);
            swfupload.startUpload();
            swfupload.uploadOptions = options;
        };

        /*
            监听父级窗口发来的消息
        */
        var message = new TransferMessage().listenToParent(function(msg){
            var value;
            if(msg.indexOf('emgroup@') === 0) {//技能组消息
                value = msg.slice(8);
                msg = 'emgroup';
            } else if(msg.indexOf('@') > 0) {//从父级页面读取相关信息
                value = msg.split('@')[1];
                msg = msg.split('@')[0];
            }

            switch(msg) {
                case 'dragend':
                    im.scrollBottom();
                    break;
                case 'imclick'://关闭 或 展开 iframe 聊天窗口
                    if ( !userHash.normal ) {
                        return false;
                    }

                    isGroupChat = false;
                    im.chatWrapper = $('#normal');
                    im.chatWrapper.removeClass('hide').siblings().addClass('hide');
                    im.Im.find('#' + im.chatWrapper.attr('id') + '-transfer')
					.removeClass('hide')
					.siblings('.easemobWidget-status-prompt').addClass('hide');

                    if ( config.user != userHash.normal.user ) {
                        config.user = userHash.normal.user;
                        config.password = userHash.normal.password;
                        im.open();
                    }
                    im.group = false;
                    im.toggleChatWindow(curGroup ? 'show' : '');
                    curGroup = '';
                    break;
                case 'emgroup'://技能组
                    isGroupChat = true;

                    var idx = value.indexOf('@emgroupuser@'),
                        user = null;

                    if(idx > 0) {
                        user = value.slice(0, idx);
                    }
                    value = value.slice(idx + 13);
                    userHash[value] = userHash[value] || {};
                    userHash[value].user = user;

                    if(curGroup != value) {
                        curGroup = value;
                        isShowDirect = true;
                    } else {
                        isShowDirect = false;
                    }

                    im.handleGroup(value);
                    if ( userHash[curGroup].conn ) {
                        config.user = userHash[curGroup].user;
                        config.password = userHash[curGroup].password;
                    }
					im.open();
                    isShowDirect ? im.toggleChatWindow('show') : im.toggleChatWindow();
                    break;
                default: break;
            }
        });

        
        /*
            upload by flash
            param1: input file ID
        */
        var uploadShim = function ( fileInputId ) {
            if ( !Easemob.im.Utils.isCanUploadFile() ) {
                return;
            }
            var pageTitle = document.title;
            var uploadBtn = $('#' + fileInputId);
            if ( typeof SWFUpload === 'undefined' || uploadBtn.length < 1 ) return;

            return new SWFUpload({ 
                file_post_name: 'file'
                , flash_url: "static/js/swfupload.swf"
                , button_placeholder_id: fileInputId
                , button_width: uploadBtn.width() || 120
                , button_height: uploadBtn.height() || 30
                , button_cursor: SWFUpload.CURSOR.HAND
                , button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT
                , file_size_limit: 10485760
                , file_upload_limit: 0
                , file_queued_handler: function(file) {
                    if(this.getStats().files_queued > 1) {
                        this.cancelUpload();
                    }
                    if(!EasemobWidget.PICTYPE[file.type.slice(1).toLowerCase()]) {
                        im.errorPrompt('不支持此类型' + file.type);
                        this.cancelUpload();
                    } else if(10485760 < file.size) {
                        im.errorPrompt('请上传大小不超过10M的文件');
                        this.cancelUpload();
                    } else {
                        im.sendImgMsg(null, null, {name: file.name, data: file});
                    }
                }
                , file_dialog_start_handler: function() {}
                , upload_error_handler: function(file, code, msg){
                    if(code != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED
                    && code != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED 
                    && code != SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED) {
						var msg = new Easemob.im.EmMessage('img');
						msg.set({file: null});
                        im.chatWrapper.append(msg.get());
                    }
                }
                , upload_success_handler: function(file, response){
                    if ( !file || !response ) {
						return;
					}
                    try {
                        var res = Easemob.im.Utils.parseUploadResponse(response);
                        res = $.parseJSON(res);
                        if ( file && !file.url && res.entities && res.entities.length > 0 ) {
                            file.url = res.uri + '/' + res.entities[0].uuid;
                        }
						var msg = new Easemob.im.EmMessage('img');

						msg.set({file: file});
                        im.chatWrapper.append(msg.get());
						im.chatWrapper.find('img:last').on('load', function () {
							im.scrollBottom(500);
						});
						this.uploadOptions.onFileUploadComplete(res);
                    } catch ( e ) {
                        im.errorPrompt('上传图片发生错误');
                    }
                }
            });
        };
        //不支持异步upload的浏览器使用flash插件搞定
        if ( !Easemob.im.Utils.isCanUploadFileAsync() && Easemob.im.Utils.isCanUploadFile() ) {
			$.getScript('/webim/static/js/swfupload/swfupload.min.js', function () {
				swfupload = uploadShim('easemobWidgetFileInput');
				$('object[id^="SWFUpload"]').attr('title', '图片');
			});
            
        }
    };

    /*
        
    */
    window.top == window 
    ? main(EasemobWidget.utils.getConfig())
    : new TransferMessage().listenToParent(function ( msg ) {
        
        if ( msg.indexOf('initdata:') === 0 ) {
            main(EasemobWidget.utils.getConfig(msg.slice(9)));
        }
    });
}(window, undefined));

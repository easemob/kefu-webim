;(function ( window, undefined ) {
    'use strict';

	if ( typeof easemobim === 'function' ) {
		return false;
	}


    var webim = document.getElementById('EasemobKefuWebim'),
		utils = easemobim.utils,
		entry;


	//main entry
	var main = function ( config ) {

		var tenantId = utils.query('tenantId');

        config = config || {};


		if ( utils.isTop ) {

            //get config from referrer's config
            try {
                config = JSON.parse(utils.code.decode(utils.getStore('emconfig' + tenantId)));
            } catch ( e ) {}

            config.tenantId = tenantId;
            config.hide = true;
            config.to = utils.convertFalse(utils.query('to'));
            config.appKey = utils.convertFalse(decodeURIComponent(utils.query('appKey')));
            config.domain = config.domain || '//' + location.host;
            config.offDutyWord = decodeURIComponent(utils.query('offDutyWord'));
            config.offDutyType = utils.query('offDutyType');
            config.language = utils.query('language') || 'zh_CN';
            config.xmppServer = utils.convertFalse(utils.query('xmppServer'));
            config.restServer = utils.convertFalse(utils.query('restServer'));
            config.originType = utils.convertFalse(utils.query('originType'));
            config.agentName = utils.convertFalse(utils.query('agentName'));
            config.satisfaction = utils.convertFalse(utils.query('sat'));
            config.resources = utils.convertFalse(utils.query('resources'));
            config.hideStatus = utils.convertFalse(utils.query('hideStatus'));
            config.satisfaction = utils.convertFalse(utils.query('sat'));
            config.wechatAuth = utils.convertFalse(utils.query('wechatAuth'));
            config.hideKeyboard = utils.convertFalse(utils.query('hideKeyboard'));
            config.ticket = utils.query('ticket') === '' ? true : utils.convertFalse(utils.query('ticket'));//true default
            try { config.emgroup = decodeURIComponent(utils.query('emgroup')); } catch ( e ) { config.emgroup = utils.query('emgroup'); }


            //没绑定user直接取cookie
            if ( !utils.query('user') ) {
                config.user = {
                    username: utils.get('root' + config.tenantId + config.emgroup),
                    password: '',
                    token: ''
                };
            } else if ( !config.user || (config.user.username && config.user.username !== utils.query('user')) ) {
                config.user = {
                    username: '',
                    password: '',
                    token: ''
                };
			}
		}
		

		//render Tpl
		webim.innerHTML = "\
			<div id='easemobWidgetPopBar'" + (utils.isTop || !config.minimum || config.hide ? " class='em-hide'" : "") + ">\
				<a class='easemobWidget-pop-bar bg-color' href='" + (utils.isMobile ? location.href + "' target='_blank'" : "javascript:;'") + "><i></i>" + config.buttonText + "</a>\
				<span class='easemobWidget-msgcount em-hide'></span>\
			</div>\
			<div id='EasemobKefuWebimChat' class='easemobWidgetWrapper" + (utils.isTop || !config.minimum ? "" : " em-hide")  + (utils.isMobile ? " easemobWidgetWrapper-mobile" : "") + "'>\
				<div id='easemobWidgetHeader' class='easemobWidgetHeader-wrapper bg-color border-color'>\
					<div id='easemobWidgetDrag'>\
						" + (utils.isMobile || utils.isTop ? "" : "<p></p>") + "\
						<img class='easemobWidgetHeader-portrait border-color'/>\
						<span class='easemobWidgetHeader-nickname'></span>\
						<span class='em-header-status-text'></span>\
                        <i id='easemobWidgetNotem' class='easemobWidget-notem em-hide'></i>\
                        <i id='easemobWidgetAgentStatus' class='easemobWidget-agent-status em-hide'></i>\
					</div>\
				</div>\
				<div id='easemobWidgetBody' class='easemobWidgetBody-wrapper'></div>\
				<div id='EasemobKefuWebimFaceWrapper' class='easemobWidget-face-wrapper e-face em-hide'>\
					<ul class='easemobWidget-face-container'></ul>\
				</div>\
				<div id='easemobWidgetSend' class='easemobWidget-send-wrapper'>\
					<i class='easemobWidget-face e-face' tile='表情'></i>\
					<i class='easemobWidget-file' id='easemobWidgetFile' tile='图片'></i>\
					<i class='" + (config.ticket ? "easemobWidget-note" : "easemobWidget-note em-hide") + "' id='easemobWidgetNote' tile='留言'></i>\
					<input id='easemobWidgetFileInput' type='file' accept='image/*'/>\
					<textarea class='easemobWidget-textarea' spellcheck='false'></textarea>" +
					(utils.isMobile || !config.satisfaction ? "" : "<span id='EasemobKefuWebimSatisfy' class='easemobWidget-satisfaction'>请对服务做出评价</span>") + "\
					<a href='javascript:;' class='easemobWidget-send bg-color disabled' id='easemobWidgetSendBtn'>连接中</a>\
				</div>\
				<iframe id='EasemobKefuWebimIframe' class='em-hide' src='" + (config.domain || '\/\/' + location.host) + "/webim/transfer.html?v=<%= v %>'>\
			</div>";


		window.chat = easemobim.chat(config);
		var api = easemobim.api;

		config.base = location.protocol + config.domain;
		config.sslImgBase = config.domain + '/ossimages/';

        //不支持异步上传则加载swfupload
		if ( !Easemob.im.Utils.isCanUploadFileAsync && Easemob.im.Utils.isCanUploadFile ) {
			var script = document.createElement('script');
			script.onload = script.onreadystatechange = function () {
				if ( !this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ) {
					easemobim.uploadShim(config, chat);
				}
			};
			script.src = location.protocol + config.staticPath + '/js/swfupload/swfupload.min.js';
			webim.appendChild(script);
		}


		/**
		 * chat Entry
		 */
		entry = {
			init: function () {
                var me = this;

				config.toUser = config.toUser || config.to;
                //上下班状态
				api('getDutyStatus', {
					tenantId: config.tenantId
				}, function ( msg ) {
					config.offDuty = msg.data ? msg.data && config.offDutyType !== 'chat' : false;

                    chat.setOffline(config.offDuty);//根据状态展示上下班不同view
				});

				config.orgName = config.appKey.split('#')[0];
				config.appName = config.appKey.split('#')[1];

                //获取关联信息
				api('getRelevanceList', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg.data.length === 0 ) {
						chat.errorPrompt('未创建关联', true);
						return;
					}
					config.relevanceList = msg.data;
					config.tenantAvatar = utils.getAvatarsFullPath(msg.data[0].tenantAvatar, config.domain);
                    config.defaultAvatar = config.staticPath ? config.staticPath + '/img/default_avatar.png' : 'static' + '/img/default_avatar.png';
					config.defaultAgentName = msg.data[0].tenantName;
					config.logo = config.logo || msg.data[0].tenantLogo;
					config.toUser = config.toUser || msg.data[0].imServiceNumber;
					config.orgName = config.orgName || msg.data[0].orgName;
					config.appName = config.appName || msg.data[0].appName;
					config.channelid = config.channelid || msg.data[0].channelId;
					config.appKey = config.appKey || config.orgName + '#' + config.appName;
					config.restServer = config.restServer || msg.data[0].restDomain;

					var cluster = config.restServer ? config.restServer.match(/vip\d/) : '';
					cluster = cluster && cluster.length ? '-' + cluster[0] : '';
					config.xmppServer = config.xmppServer || 'im-api' + cluster + '.easemob.com'; 
					chat.init();

					if ( config.user.username && (config.user.password || config.user.token) ) {
						chat.ready();
					} else {
						
                        //检测微信网页授权
                        if ( config.wechatAuth && easemobim.wechat ) {
                            easemobim.wechat(function ( data ) {
                                try {
                                    data = JSON.parse(data);
                                } catch ( e ) {
                                    data = null;
                                }
                                if ( !data ) {//失败自动降级，随机创建访客
                                    me.go();
                                } else {
                                    config.visitor = config.visitor || {};
                                    config.visitor.userNickname = data.nickname;
                                    var oid = config.tenantId + '_' + config.orgName + '_' + config.appName + '_' + config.toUser + '_' + data.openid;
                                    easemobim.emajax({
                                        url: '/v1/webimplugin/visitors/wechat/' + oid + '?tenantId=' + config.tenantId
                                        , data: {
                                            orgName: config.orgName,
                                            appName: config.appName,
                                            imServiceNumber: config.toUser
                                        }
                                        , type: 'POST'
                                        , success: function ( info ) {
                                            try {
                                                info = JSON.parse(info);
                                            } catch ( e ) {
                                                info = null;
                                            }
                                            if ( info && info.status === 'OK' ) {
                                                config.user.username = info.entity.userId;
                                                config.user.password = info.entity.userPassword;
                                                chat.ready();
                                            } else {
                                                me.go();
                                            }
                                            
                                        }
                                        , error: function ( e ) {
                                            //失败自动降级，随机创建访客
									        me.go();
                                        }
                                    });
                                }
                            });
                            return this;
                        }

						if ( config.user.username ) {
							api('getPassword', {
								userId: config.user.username
                                , tenantId: config.tenantId
							}, function ( msg ) {
								if ( !msg.data ) {
									me.go();
								} else {
									config.user.password = msg.data;
									chat.ready();
								}
							});
						} else {
							me.go();
						}
					}
				});
				return this;
			}
            , go: function () {
                api('createVisitor', {
                    orgName: config.orgName
                    , appName: config.appName
                    , imServiceNumber: config.toUser
                    , tenantId: config.tenantId
                }, function ( msg ) {
                    config.newuser = true;
                    config.user.username = msg.data.userId;
                    config.user.password = msg.data.userPassword;
                    easemobim.EVENTS.CACHEUSER.data = {
                        username: config.user.username,
                        group: config.user.emgroup
                    };
                    utils.isTop
                    ? utils.set('root' + config.tenantId + config.emgroup, config.user.username)
                    : transfer.send(easemobim.EVENTS.CACHEUSER, window.transfer.to);
                    chat.ready();
                });
            }
			, beforeOpen: function () {}
			, open: function () {
				config.toUser = config.toUser || config.to;
				this.beforeOpen();
				chat.show();
			}
			, close: function () {
				chat.close();
				this.afterClose();
			}
			, afterClose: function () {}
		};


		utils.on(utils.$Dom('EasemobKefuWebimIframe'), 'load', function () {
			easemobim.getData = new easemobim.Transfer('EasemobKefuWebimIframe', 'data');
			entry.init();
		});


		//load modules
		typeof easemobim.leaveMessage === 'function' && (easemobim.leaveMessage = easemobim.leaveMessage(chat, tenantId));
		typeof easemobim.paste === 'function' && (easemobim.paste = easemobim.paste(chat));
		typeof easemobim.satisfaction === 'function' && easemobim.satisfaction(chat);
	};



	//Controller
	if ( !utils.isTop ) {
		window.transfer = new easemobim.Transfer(null, 'main').listen(function ( msg ) {

			if ( msg && msg.tenantId ) {
                if ( msg.parentId ) {
                    window.transfer.to = msg.parentId;
                }
				main(msg);
			} else if ( msg.event ) {
				switch ( msg.event ) {
					case easemobim.EVENTS.SHOW.event:
						entry.open();
						break;
					case easemobim.EVENTS.CLOSE.event:
						entry.close();
						break;
					case easemobim.EVENTS.EXT.event:
						chat.sendTextMsg('', false, msg.data.ext);
						break;
					case easemobim.EVENTS.TEXTMSG.event:
						chat.sendTextMsg(msg.data.data, false, msg.data.ext);
						break;
				}
			}
		}, ['easemob']);
	} else {
		main();
	}
} ( window, undefined ));

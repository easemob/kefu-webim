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

		//get config from referrer's config
		if ( !config ) {
			try {
				config = JSON.parse(utils.get('emconfig' + tenantId));
			} catch ( e ) {}
		}


		if ( utils.root ) {
			if ( !config ) {
				config = {};
				config.domain = '//' + location.host;
				config.tenantId = tenantId;
				config.appKey = '';
				config.emgroup = utils.query('emgroup');
				config.user = {
					username: utils.get('root' + config.emgroup + config.tenantId),
					password: '',
					token: ''
				};
				config.satisfaction = utils.convertFalse(utils.query('sat'));
				config.resources = utils.convertFalse(utils.query('resources'));
			} else if ( !config.user || !config.user.username || config.user.username != utils.query('user') ) {
				config.user = {
					username: utils.get('root' + config.emgroup + config.tenantId),
					password: '',
					token: ''
				};
			}
		}

		//reset
		config.hide = utils.convertFalse(config.hide);
		config.resources = utils.convertFalse(config.resources);
		config.satisfaction = utils.convertFalse(config.satisfaction);
		config.wechatAuth = utils.convertFalse(utils.query('wechatAuth'));
		config.hideKeyboard = utils.convertFalse(utils.query('hideKeyboard'));
        config.to = utils.convertFalse(utils.query('to'));
        config.appKey = utils.convertFalse(decodeURIComponent(utils.query('appKey')));
        config.xmppServer = utils.convertFalse(utils.query('xmppServer'));
        config.restServer = utils.convertFalse(utils.query('restServer'));
        config.agentName = utils.convertFalse(utils.query('agentName'));
		

		//render Tpl
		webim.innerHTML = "\
			<div id='easemobWidgetPopBar'" + (utils.root || !config.minimum || config.hide ? " class='em-hide'" : "") + "'>\
				<a class='easemobWidget-pop-bar bg-color' href='" + (utils.isMobile ? location.href + "' target='_blank'" : "javascript:;'") + "><i></i>" + config.buttonText + "</a>\
				<span class='easemobWidget-msgcount em-hide'></span>\
			</div>\
			<div id='EasemobKefuWebimChat' class='easemobWidgetWrapper" + (utils.root || !config.minimum ? "" : " em-hide")  + (utils.isMobile ? " easemobWidgetWrapper-mobile" : "") + "'>\
				<div id='easemobWidgetHeader' class='easemobWidgetHeader-wrapper bg-color border-color'>\
					<div id='easemobWidgetDrag'>\
						" + (utils.isMobile || utils.root ? "" : "<p></p>") + "\
						<img class='easemobWidgetHeader-portrait border-color'/>\
						<span class='easemobWidgetHeader-nickname'></span>\
                        <i id='easemobWidgetNotem' class='easemobWidget-notem em-hide'></i>\
					</div>\
				</div>\
				<div id='easemobWidgetBody' class='easemobWidgetBody-wrapper'></div>\
				<div id='EasemobKefuWebimFaceWrapper' class='easemobWidget-face-wrapper e-face em-hide'>\
					<ul class='easemobWidget-face-container'></ul>\
				</div>\
				<div id='easemobWidgetSend' class='easemobWidget-send-wrapper'>\
					<i class='easemobWidget-face e-face' tile='表情'></i>\
					<i class='easemobWidget-file' id='easemobWidgetFile' tile='图片'></i>\
					<i class='easemobWidget-note' id='easemobWidgetNote' tile='留言'></i>\
					<input id='easemobWidgetFileInput' type='file' accept='image/*'/>\
					<textarea class='easemobWidget-textarea' spellcheck='false'></textarea>" +
					(utils.isMobile || !config.satisfaction ? "" : "<span id='EasemobKefuWebimSatisfy' class='easemobWidget-satisfaction'>请对服务做出评价</span>") + "\
					<a href='javascript:;' class='easemobWidget-send bg-color disabled' id='easemobWidgetSendBtn'>连接中</a>\
				</div>\
				<iframe id='EasemobKefuWebimIframe' class='em-hide' src='" + (config.domain || '\/\/' + location.host) + "/webim/transfer.html?v='" + new Date().getTime() + ">\
			</div>";


		window.chat = easemobim.chat(config);
		var api = easemobim.api;

		config.base = utils.protocol + config.domain;
		config.sslImgBase = config.domain + '/ossimages/';

		if ( !Easemob.im.Utils.isCanUploadFileAsync && Easemob.im.Utils.isCanUploadFile ) {
			var script = document.createElement('script');
			script.onload = script.onreadystatechange = function () {
				if ( !this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ) {
					easemobim.uploadShim(config, chat);
				}
			};
			script.src = utils.protocol + config.staticPath + '/js/swfupload/swfupload.min.js';
			webim.appendChild(script);
		}


		/**
		 * chat Entry
		 */
		entry = {
			init: function () {
				config.toUser = config.toUser || config.to;
				api('getDutyStatus', {
					tenantId: config.tenantId
				}, function ( msg ) {
					config.offDuty = msg.data;

					if ( msg.data ) {
						chat.setOffline(true);//根据状态展示上下班不同view
					}
				});

				config.orgName = config.appKey.split('#')[0];
				config.appName = config.appKey.split('#')[1];

				api('getRelevanceList', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg.data.length === 0 ) {
						chat.errorPrompt('未创建关联', true);
						return;
					}
					config.relevanceList = msg.data;
					config.defaultAvatar = utils.getAvatarsFullPath(msg.data[0].tenantAvatar, config.domain) 
					|| (config.staticPath ? config.staticPath + '/img/default_avatar.png' : 'static' + '/img/default_avatar.png');
					config.defaultAgentName = msg.data[0].tenantName;
					config.logo = config.logo || msg.data[0].tenantLogo;
					config.toUser = config.toUser || msg.data[0].imServiceNumber;
					config.orgName = config.orgName || msg.data[0].orgName;
					config.appName = config.appName || msg.data[0].appName;
					config.appKey = config.appKey || config.orgName + '#' + config.appName;
					config.restServer = config.restServer || msg.data[0].restDomain;

					var cluster = config.restServer ? config.restServer.match(/vip\d/) : '';
					cluster = cluster && cluster.length ? '-' + cluster[0] : '';
					config.xmppServer = config.xmppServer || 'im-api' + cluster + '.easemob.com'; 
					chat.init();

					if ( config.user.username && (config.user.password || config.user.token) ) {
						chat.ready();
					} else {
						
						if ( config.user.username ) {
							api('getPassword', {
								userId: config.user.username
                                , tenantId: config.tenantId
							}, function ( msg ) {
								if ( !msg.data ) {
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
										utils.root
										? utils.set('root' + config.emgroup + config.tenantId, config.user.username)
										: transfer.send(easemobim.EVENTS.CACHEUSER);
										chat.ready();
									});
								} else {
									config.user.password = msg.data;
									chat.ready();
								}
							});
						} else {
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
								utils.root
								? utils.set('root' + config.emgroup + config.tenantId, config.user.username)
								: transfer.send(easemobim.EVENTS.CACHEUSER);
								chat.ready();
							});
						}
					}
				});
				return this;
			}
			, beforeOpen: function () {}
			, open: function ( outerTrigger ) {
				config.toUser = config.to;
				this.beforeOpen();
				chat.show(outerTrigger);
			}
			, close: function ( outerTrigger ) {
				chat.close(outerTrigger);
				this.afterClose();
			}
			, afterClose: function () {}
		};


		utils.on(utils.$Dom('EasemobKefuWebimIframe'), 'load', function () {
			easemobim.getData = new easemobim.Transfer('EasemobKefuWebimIframe');
			entry.init();
		});


		//load modules
		typeof easemobim.leaveMessage === 'function' && (easemobim.leaveMessage = easemobim.leaveMessage(chat, tenantId));
		typeof easemobim.paste === 'function' && (easemobim.paste = easemobim.paste(chat));
		typeof easemobim.satisfaction === 'function' && easemobim.satisfaction(chat);
	};



	//Controller
	if ( !utils.root ) {
		window.transfer = new easemobim.Transfer().listen(function ( msg ) {

			if ( msg && msg.tenantId ) {
				main(msg);
			} else if ( msg.event ) {
				switch ( msg.event ) {
					case easemobim.EVENTS.SHOW.event:
						entry.open(true);
						break;
					case easemobim.EVENTS.CLOSE.event:
						entry.close(true);
						break;
					case easemobim.EVENTS.EXT.event:
						chat.sendTextMsg('', false, msg.data.ext);
						break;
					case easemobim.EVENTS.TEXTMSG.event:
						chat.sendTextMsg(msg.data.data, false, msg.data.ext);
						break;
				}
			}
		});
	} else {
		main();
	}
} ( window, undefined ));

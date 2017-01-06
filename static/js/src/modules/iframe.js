;(function (utils) {
	'use strict'


	var _st = 0,
		_startPosition = {
			x: 0,
			y: 0
		};

	var _move = function ( ev ) {

		var me = this,
			e = window.event || ev,
			_width = document.documentElement.clientWidth,
			_height = document.documentElement.clientHeight,
			_x = _width - e.clientX - me.rect.width + _startPosition.x,
			_y = _height - e.clientY - me.rect.height + _startPosition.y;
		
		if ( e.clientX - _startPosition.x <= 0 ) {//left
			_x = _width - me.rect.width;
		} else if ( e.clientX + me.rect.width - _startPosition.x >= _width ) {//right
			_x = 0;
		}
		if ( e.clientY - _startPosition.y <= 0 ) {//top
			_y = _height - me.rect.height;
		} else if ( e.clientY + me.rect.height - _startPosition.y >= _height ) {//bottom
			_y = 0;
		}
		me.shadow.style.left = 'auto';
		me.shadow.style.top = 'auto';
		me.shadow.style.right = _x + 'px';
		me.shadow.style.bottom = _y + 'px';

		me.position = {
			x: _x
			, y: _y
		};
		
		clearTimeout(_st);
		_st = setTimeout(function () {
			_moveend.call(me);
		}, 500);
	};

	var _moveend = function () {
		utils.remove(document, 'mousemove', this.moveEv);
		this.iframe.style.left = 'auto';
		this.iframe.style.top = 'auto';
		this.iframe.style.right = this.position.x + 'px';
		this.iframe.style.bottom = this.position.y + 'px';
		this.shadow.style.left = 'auto';
		this.shadow.style.top = 'auto';
		this.shadow.style.right = this.position.x + 'px';
		this.shadow.style.bottom = this.position.y + 'px';
		this.shadow.style.display = 'none';
		this.iframe.style.display = 'block';
	};
	   
	var resize = function () {
		var me = this;

		utils.on(window, 'resize', function () {
			if ( !me.rect || !me.rect.width ) {
				return;
			}

			var _width = document.documentElement.clientWidth,
				_height = document.documentElement.clientHeight,
				_right = Number(me.iframe.style.right.slice(0, -2)),
				_bottom = Number(me.iframe.style.bottom.slice(0, -2));
			
			//width
			if ( _width < me.rect.width ) {
				me.iframe.style.left = 'auto';
				me.iframe.style.right = 0;
				me.shadow.style.left = 'auto';
				me.shadow.style.right = 0;
			} else if ( _width - _right < me.rect.width ) {
				me.iframe.style.right = _width - me.rect.width + 'px';
				me.iframe.style.left = 0;
				me.shadow.style.right = _width - me.rect.width + 'px';
				me.shadow.style.left = 0;
			} else {
				me.iframe.style.left = 'auto';
				me.shadow.style.left = 'auto';
			}

			//height
			if ( _height < me.rect.height ) {
				me.iframe.style.top = 'auto';
				me.iframe.style.bottom = 0;
			} else if ( _height - _bottom < me.rect.height ) {
				me.iframe.style.bottom = _height - me.rect.height + 'px';
				me.iframe.style.top = 0;
			} else {
				me.iframe.style.top = 'auto';
			}
		});
	};

	var _ready = function () {
		var me = this;

		if ( me.config.dragenable ) {
			resize.call(me);
			utils.on(me.shadow, 'mouseup', function () {
				_moveend.call(me);
			});
		}

		me.message = new easemobim.Transfer(me.iframe.id, 'easemob');

		me.iframe.style.display = 'block';

		me.config.hasReceiveCallback = typeof me.config.onmessage === 'function';
		me.onsessionclosedSt = 0, me.onreadySt = 0;
		me.config.parentId = me.iframe.id;

		me.message
		.send({event: 'initConfig', data: me.config})
		.listen(function ( msg ) {

			if ( msg.to !== me.iframe.id ) { return; }

			switch ( msg.event ) {
				case easemobim.EVENTS.ONREADY.event://onready
					if ( typeof me.config.onready === 'function' ) {
						clearTimeout(me.onreadySt);
						me.onreadySt = setTimeout(function () {
							me.config.onready();
						}, 500);
					}
					break;
					me.config.onready instanceof Function && me.config.onready();
					break;
				case easemobim.EVENTS.SHOW.event://show Chat window
					me.open();
					break;
				case easemobim.EVENTS.CLOSE.event://close Chat window
					me.close();
					break;
				case easemobim.EVENTS.NOTIFY.event://notify
					easemobim.notify(msg.data.avatar, msg.data.title, msg.data.brief);
					break;
				case easemobim.EVENTS.SLIDE.event://title slide
					easemobim.titleSlide.start();
					break;
				case easemobim.EVENTS.RECOVERY.event://title recovery 
					easemobim.titleSlide.stop();
					break;
				case easemobim.EVENTS.ONMESSAGE.event://onmessage callback
					typeof me.config.onmessage === 'function' && me.config.onmessage(msg.data);
					break;
				case easemobim.EVENTS.ONSESSIONCLOSED.event://onservicesessionclosed callback
					if ( typeof me.config.onsessionclosed === 'function' ) {
						clearTimeout(me.onsessionclosedSt);
						me.onsessionclosedSt = setTimeout(function () {
							me.config.onsessionclosed();
						}, 500);
					}
					break;
				case easemobim.EVENTS.CACHEUSER.event://cache username
					if(msg.data.username){
						utils.set(
							(me.config.to || '') + me.config.tenantId + (me.config.emgroup || ''),
							msg.data.username
						);
					}
					break;
				case easemobim.EVENTS.DRAGREADY.event:
					_startPosition.x = isNaN(Number(msg.data.x)) ? 0 : Number(msg.data.x);
					_startPosition.y = isNaN(Number(msg.data.y)) ? 0 : Number(msg.data.y);
					me.shadow.style.display = 'block';
					me.iframe.style.display = 'none';
					me.moveEv || (me.moveEv = function ( e ) {
						_move.call(me, e);
					});
					utils.on(document, 'mousemove', me.moveEv);
					break;
				case easemobim.EVENTS.DRAGEND.event:
					_moveend.call(me);
					break;
				case 'setItem':
					utils.setStore(msg.data.key, msg.data.value);
					break;
				case 'updateURL':
					me.message.send({event: 'updateURL', data: location.href});
					break;
				default:
					break;
			};
		}, ['main']);

		
		me.ready instanceof Function && me.ready();
	};








	var Iframe = function ( config, signleton ) {

		if ( !(this instanceof Iframe) ) {

			return new Iframe(config, signleton);
		} else if ( signleton && Iframe.iframe ) {

			Iframe.iframe.config = utils.copy(config);

			return Iframe.iframe;
		}

		this.url = '';
		// IE6-8 不支持修改iframe名称
		this.iframe = (/MSIE (6|7|8)/).test(navigator.userAgent)
			? document.createElement('<iframe name="' + new Date().getTime() + '">')
			: document.createElement('iframe');
		this.iframe.id = 'EasemobIframe' + new Date().getTime();
		this.iframe.name = new Date().getTime();
		this.iframe.style.cssText = 'width: 0;height: 0;border: none; position: fixed;';
		this.shadow = document.createElement('div');
		this.config = utils.copy(config);

		this.show = false;

		if ( !utils.isMobile ) {
			document.body.appendChild(this.shadow);
			document.body.appendChild(this.iframe);
		}

		var me = this;
		if ( me.iframe.readyState ) {
			me.iframe.onreadystatechange = function () {
				if ( this.readyState === 'loaded' || this.readyState === 'complete' ) {
					_ready.call(me);
				}
			};
		} else {
			me.iframe.onload = function () {
				_ready.call(me);
			};
		}

		Iframe.iframe = this;

		return this;
	};

	Iframe.prototype.set = function ( config, callback ) {

		this.config = utils.copy(config || this.config);

		// todo: 写成自动配置
		var destUrl = {
			tenantId: this.config.tenantId,
			hide: this.config.hide,
			sat: this.config.satisfaction,
			wechatAuth: this.config.wechatAuth,
			hideKeyboard: this.config.hideKeyboard,
			eventCollector: this.config.eventCollector,
			resources: this.config.resources
		};

		// todo: 写成自动配置
		this.config.agentName && (destUrl.agentName = this.config.agentName);
		this.config.emgroup && (destUrl.emgroup = this.config.emgroup);
		this.config.to && (destUrl.to = this.config.to);
		this.config.xmppServer && (destUrl.xmppServer = this.config.xmppServer);
		this.config.restServer && (destUrl.restServer = this.config.restServer);
		this.config.offDutyWord && (destUrl.offDutyWord = this.config.offDutyWord);
		this.config.offDutyType && (destUrl.offDutyType = this.config.offDutyType);
		this.config.language && (destUrl.language = this.config.language);
		this.config.appid && (destUrl.appid = this.config.appid);
		this.config.grUserId && (destUrl.grUserId = this.config.grUserId);

		// 需特殊处理
		this.config.appKey && (destUrl.appKey = encodeURIComponent(this.config.appKey));
		this.config.user && this.config.user.username && (destUrl.user = this.config.user.username);

		// 此处参数有可能为 false
		typeof this.config.hideStatus !== 'undefined' && this.config.hideStatus !== '' && (destUrl.hideStatus = this.config.hideStatus);
		typeof this.config.ticket !== 'undefined' && this.config.ticket !== '' && (destUrl.ticket = this.config.ticket);


		this.url = utils.updateAttribute(this.url, destUrl, config.path);

		if ( !this.config.user.username ) {
			// [to + ] tenantId [ + emgroup]
			this.config.user.username = utils.get(
				(this.config.to || '') + this.config.tenantId + (this.config.emgroup || '')
			);
		}

		this.config.guestId = utils.getStore('guestId');

		this.position = { x: this.config.dialogPosition.x.slice(0, -2), y: this.config.dialogPosition.y.slice(0, -2) };
		this.rect = { width: +this.config.dialogWidth.slice(0, -2), height: +this.config.dialogHeight.slice(0, -2) };
		this.iframe.frameBorder = 0;
		this.iframe.allowTransparency = 'true';

		this.iframe.style.cssText = [
			'z-index:16777269;',
			'overflow:hidden;',
			'position:fixed;',
			'bottom:10px;',
			'right:-5px;',
			'border:none;',
			'width:'			+ this.config.dialogWidth + ';',
			'height:0;',
			'display:none;',
			'transition:all .01s;'].join('');
		this.shadow.style.cssText = [
			'display:none;',
			'cursor:move;',
			'z-index:16777270;',
			'position:fixed;',
			'bottom:'			+ this.config.dialogPosition.y + ';',
			'right:'			+ this.config.dialogPosition.x + ';',
			'border:none;',
			'width:'			+ this.config.dialogWidth + ';',
			'height:'			+ this.config.dialogHeight + ';',
			'border-radius:4px;',
			'box-shadow: 0 4px 8px rgba(0,0,0,.2);',
			'border-radius: 4px;'].join('');

		this.shadow.style.background = 'url(' + location.protocol + this.config.staticPath + '/img/drag.png) no-repeat';
		this.shadow.style.backgroundSize = '100% 100%';

		if ( !this.config.hide ) {
			this.iframe.style.height = '37px';
			this.iframe.style.width = '104px';
		} else {
			this.iframe.style.height = '0';
			this.iframe.style.width = '0';
		}
		if ( utils.isMobile ) {
			this.iframe.style.cssText += 'left:0;bottom:0';
			this.iframe.style.width = '100%';
			this.iframe.style.right = '0';

			var emconfig = {};
			emconfig.domain = this.config.domain;
			emconfig.path = this.config.path;
			emconfig.staticPath = this.config.staticPath;
			this.config.user && (emconfig.user = this.config.user);
			utils.setStore(
				'emconfig' + this.config.tenantId,
				utils.code.encode(JSON.stringify(emconfig))
			);
		}

		this.iframe.src = this.url;
		this.ready = callback;
		
		return this;
	};

	Iframe.prototype.open = function () {
		var iframe = this.iframe;

		if ( this.show ) { return; }

		this.show = true;
		if ( utils.isMobile ) {
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.style.right = '0';
			iframe.style.bottom = '0';
			iframe.style.borderRadius = '0';
			iframe.style.cssText += 'box-shadow: none;';
		} else {
			iframe.style.width = this.config.dialogWidth;
			iframe.style.height = this.config.dialogHeight;
			iframe.style.visibility = 'visible';
			iframe.style.right = this.position.x + 'px';
			iframe.style.bottom = this.position.y + 'px';
			iframe.style.cssText += 'box-shadow: 0 4px 8px rgba(0,0,0,.2);border-radius: 4px;border: 1px solid #ccc\\9;';
		}
		iframe.style.visibility = 'visible';
		this.message && this.message.send(easemobim.EVENTS.SHOW);

		return this;
	};

	Iframe.prototype.close = function () {

		var iframe = this.iframe;

		if ( this.show === false ) { return; }

		this.show = false;

		clearTimeout(_st);
		iframe.style.boxShadow = 'none';
		iframe.style.borderRadius = '4px;';
		iframe.style.left = 'auto';
		iframe.style.top = 'auto';
		iframe.style.right = '-5px';
		iframe.style.bottom = '10px';
		iframe.style.border = 'none';
		if ( !this.config.hide ) {
			iframe.style.height = '37px';
			iframe.style.width = '104px';
		} else {
			iframe.style.visibility = 'hidden';
			iframe.style.width = '1px';
			iframe.style.height = '1px';
		}

		this.message && this.message.send(easemobim.EVENTS.CLOSE);
		return this;
	};

	// 发ext消息
	Iframe.prototype.send = function(extMsg) {
		this.message.send({event: 'ext', data: extMsg});
	};

	// 发文本消息
	Iframe.prototype.sendText = function(msg) {
		this.message.send({event: 'textmsg', data: msg});
	};

	easemobim.Iframe = Iframe;
}(
	easemobim.utils
));

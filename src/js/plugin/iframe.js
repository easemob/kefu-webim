(function (utils, _const) {
	'use strict';

	var _st = 0;
	var _startPosition = {
		x: 0,
		y: 0
	};
	var emptyFunc = function(){};

	function _move(ev) {
		var me = this;
		var e = window.event || ev;
		var _width = document.documentElement.clientWidth;
		var _height = document.documentElement.clientHeight;
		var _x = _width - e.clientX - me.rect.width + _startPosition.x;
		var _y = _height - e.clientY - me.rect.height + _startPosition.y;

		if (e.clientX - _startPosition.x <= 0) { //left
			_x = _width - me.rect.width;
		}
		else if (e.clientX + me.rect.width - _startPosition.x >= _width) { //right
			_x = 0;
		}
		if (e.clientY - _startPosition.y <= 0) { //top
			_y = _height - me.rect.height;
		}
		else if (e.clientY + me.rect.height - _startPosition.y >= _height) { //bottom
			_y = 0;
		}
		me.shadow.style.left = 'auto';
		me.shadow.style.top = 'auto';
		me.shadow.style.right = _x + 'px';
		me.shadow.style.bottom = _y + 'px';

		me.position = {
			x: _x,
			y: _y
		};

		clearTimeout(_st);
		_st = setTimeout(function () {
			_moveend.call(me);
		}, 500);
	}

	function _moveend() {
		var me = this;
		var iframe = me.iframe;
		var shadow = me.shadow;

		utils.off(document, 'mousemove', me.moveEv);
		iframe.style.left = 'auto';
		iframe.style.top = 'auto';
		iframe.style.right = me.position.x + 'px';
		iframe.style.bottom = me.position.y + 'px';
		iframe.style.display = 'block';
		shadow.style.left = 'auto';
		shadow.style.top = 'auto';
		shadow.style.right = me.position.x + 'px';
		shadow.style.bottom = me.position.y + 'px';
		shadow.style.display = 'none';
	}

	function _resize() {
		var me = this;

		utils.on(window, 'resize', function () {
			if (!me.rect || !me.rect.width) {
				return;
			}

			var _width = document.documentElement.clientWidth;
			var _height = document.documentElement.clientHeight;
			var _right = Number(me.iframe.style.right.slice(0, -2));
			var _bottom = Number(me.iframe.style.bottom.slice(0, -2));

			//width
			if (_width < me.rect.width) {
				me.iframe.style.left = 'auto';
				me.iframe.style.right = 0;
				me.shadow.style.left = 'auto';
				me.shadow.style.right = 0;
			}
			else if (_width - _right < me.rect.width) {
				me.iframe.style.right = _width - me.rect.width + 'px';
				me.iframe.style.left = 0;
				me.shadow.style.right = _width - me.rect.width + 'px';
				me.shadow.style.left = 0;
			}
			else {
				me.iframe.style.left = 'auto';
				me.shadow.style.left = 'auto';
			}

			//height
			if (_height < me.rect.height) {
				me.iframe.style.top = 'auto';
				me.iframe.style.bottom = 0;
			}
			else if (_height - _bottom < me.rect.height) {
				me.iframe.style.bottom = _height - me.rect.height + 'px';
				me.iframe.style.top = 0;
			}
			else {
				me.iframe.style.top = 'auto';
			}
		});
	}

	function _ready() {
		var me = this;

		if (me.config.dragenable) {
			_resize.call(me);
			utils.on(me.shadow, 'mouseup', function () {
				_moveend.call(me);
			});
		}

		me.message = new easemobim.Transfer(me.iframe.id, 'easemob', true);

		me.iframe.style.display = 'block';

		me.onsessionclosedSt = 0;
		me.onreadySt = 0;
		me.config.parentId = me.iframe.id;

		// 从config中剔除不能clone的内容
		me.callbackApi = {
			onready: me.config.onready || emptyFunc,
			onmessage: me.config.onmessage || emptyFunc,
			onsessionclosed: me.config.onsessionclosed || emptyFunc
		};
		delete me.config.onready;
		delete me.config.onmessage;
		delete me.config.onsessionclosed;

		me.message
			.send({ event: _const.EVENTS.INIT_CONFIG, data: me.config })
			.listen(function (msg) {
				if (msg.to !== me.iframe.id) return;

				switch (msg.event) {
					// onready
				case _const.EVENTS.ONREADY:
					clearTimeout(me.onreadySt);
					me.onreadySt = setTimeout(function () {
						me.callbackApi.onready();
					}, 500);
					break;
				case _const.EVENTS.SHOW:
					// 显示聊天窗口
					me.open();
					break;
				case _const.EVENTS.CLOSE:
					// 最小化聊天窗口
					me.close();
					break;
				case _const.EVENTS.NOTIFY:
					// 显示浏览器通知
					easemobim.notify(msg.data.avatar, msg.data.title, msg.data.brief);
					break;
				case _const.EVENTS.SLIDE:
					// 标题滚动
					easemobim.titleSlide.start();
					break;
				case _const.EVENTS.RECOVERY:
					// 标题滚动恢复
					easemobim.titleSlide.stop();
					break;
				case _const.EVENTS.ONMESSAGE:
					// 收消息回调
					me.callbackApi.onmessage(msg.data);
					break;
				case _const.EVENTS.ONSESSIONCLOSED:
					// 结束会话回调，此功能文档中没有
					clearTimeout(me.onsessionclosedSt);
					me.onsessionclosedSt = setTimeout(function () {
						me.callbackApi.onsessionclosed();
					}, 500);
					break;
				case _const.EVENTS.CACHEUSER:
					// 缓存im username
					if (msg.data.username) {
						utils.set(
							(me.config.to || '') + me.config.tenantId + (me.config.emgroup || ''),
							msg.data.username
						);
					}
					break;
				case _const.EVENTS.DRAGREADY:
					_startPosition.x = isNaN(Number(msg.data.x)) ? 0 : Number(msg.data.x);
					_startPosition.y = isNaN(Number(msg.data.y)) ? 0 : Number(msg.data.y);
					me.shadow.style.display = 'block';
					me.iframe.style.display = 'none';
					me.moveEv || (me.moveEv = function (e) {
						_move.call(me, e);
					});
					utils.on(document, 'mousemove', me.moveEv);
					break;
				case _const.EVENTS.DRAGEND:
					_moveend.call(me);
					break;
				case _const.EVENTS.SET_ITEM:
					utils.setStore(msg.data.key, msg.data.value);
					break;
				case _const.EVENTS.REQUIRE_URL:
					me.message.send({ event: _const.EVENTS.UPDATE_URL, data: location.href });
					break;
				case _const.EVENTS.SHOW_IMG:
					easemobim.pcImgView(msg.data);
					break;
				default:
					break;
				}
			}, ['main']);


		me.ready instanceof Function && me.ready();
	}



	var Iframe = function (config, signleton) {

		if (!(this instanceof Iframe)) {

			return new Iframe(config, signleton);
		}
		else if (signleton && Iframe.iframe) {

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

		if (!utils.isMobile) {
			document.body.appendChild(this.shadow);
			document.body.appendChild(this.iframe);
		}

		var me = this;
		if (me.iframe.readyState) {
			me.iframe.onreadystatechange = function () {
				if (this.readyState === 'loaded' || this.readyState === 'complete') {
					_ready.call(me);
				}
			};
		}
		else {
			me.iframe.onload = function () {
				_ready.call(me);
			};
		}

		Iframe.iframe = this;

		return this;
	};

	Iframe.prototype.set = function (config, callback) {

		this.config = utils.copy(config || this.config);

		// todo: 写成自动配置
		var destUrl = {
			tenantId: this.config.tenantId,
			hide: this.config.hide,
			sat: this.config.satisfaction,
			wechatAuth: this.config.wechatAuth,
			hideKeyboard: this.config.hideKeyboard,
			eventCollector: this.config.eventCollector,
			resources: this.config.resources,
			offDutyWord: this.config.offDutyWord
		};

		// todo: 写成自动配置
		this.config.agentName && (destUrl.agentName = this.config.agentName);
		this.config.emgroup && (destUrl.emgroup = this.config.emgroup);
		this.config.to && (destUrl.to = this.config.to);
		this.config.xmppServer && (destUrl.xmppServer = this.config.xmppServer);
		this.config.restServer && (destUrl.restServer = this.config.restServer);
		this.config.offDutyType && (destUrl.offDutyType = this.config.offDutyType);
		this.config.language && (destUrl.language = this.config.language);
		this.config.appid && (destUrl.appid = this.config.appid);
		this.config.grUserId && (destUrl.grUserId = this.config.grUserId);

		// 需特殊处理
		this.config.appKey && (destUrl.appKey = encodeURIComponent(this.config.appKey));
		this.config.user && this.config.user.username && (destUrl.user = this.config.user.username);

		// 此处参数有可能为 false
		typeof this.config.hideStatus !== 'undefined' && this.config.hideStatus !== '' && (destUrl.hideStatus = this.config
			.hideStatus);
		typeof this.config.ticket !== 'undefined' && this.config.ticket !== '' && (destUrl.ticket = this.config.ticket);


		this.url = utils.updateAttribute(this.url, destUrl, config.path);

		if (!this.config.user.username) {
			// 从cookie里取用户名
			// keyName = [to + ] tenantId [ + emgroup]
			this.config.isUsernameFromCookie = true;
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
			'width:' + this.config.dialogWidth + ';',
			'height:0;',
			'display:none;',
			'transition:all .01s;'].join('');
		this.shadow.style.cssText = [
			'display:none;',
			'cursor:move;',
			'z-index:16777270;',
			'position:fixed;',
			'bottom:' + this.config.dialogPosition.y + ';',
			'right:' + this.config.dialogPosition.x + ';',
			'border:none;',
			'width:' + this.config.dialogWidth + ';',
			'height:' + this.config.dialogHeight + ';',
			'border-radius:4px;',
			'box-shadow: 0 4px 8px rgba(0,0,0,.2);',
			'border-radius: 4px;'].join('');

		this.shadow.style.background = 'url(' + location.protocol + this.config.staticPath + '/img/drag.png) no-repeat';
		this.shadow.style.backgroundSize = '100% 100%';

		if (!this.config.hide) {
			this.iframe.style.height = '37px';
			this.iframe.style.width = '104px';
		}
		else {
			this.iframe.style.height = '0';
			this.iframe.style.width = '0';
		}
		if (utils.isMobile) {
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

		if (this.show) { return; }

		this.show = true;
		if (utils.isMobile) {
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.style.right = '0';
			iframe.style.bottom = '0';
			iframe.style.borderRadius = '0';
			iframe.style.cssText += 'box-shadow: none;';
		}
		else {
			iframe.style.width = this.config.dialogWidth;
			iframe.style.height = this.config.dialogHeight;
			iframe.style.visibility = 'visible';
			iframe.style.right = this.position.x + 'px';
			iframe.style.bottom = this.position.y + 'px';
			iframe.style.cssText += 'box-shadow: 0 4px 8px rgba(0,0,0,.2);border-radius: 4px;border: 1px solid #ccc\\9;';
		}
		iframe.style.visibility = 'visible';
		this.message && this.message.send({ event: _const.EVENTS.SHOW });

		return this;
	};

	Iframe.prototype.close = function () {

		var iframe = this.iframe;

		if (this.show === false) { return; }

		this.show = false;

		clearTimeout(_st);
		iframe.style.boxShadow = 'none';
		iframe.style.borderRadius = '4px;';
		iframe.style.left = 'auto';
		iframe.style.top = 'auto';
		iframe.style.right = '-5px';
		iframe.style.bottom = '10px';
		iframe.style.border = 'none';
		if (!this.config.hide) {
			iframe.style.height = '37px';
			iframe.style.width = '104px';
		}
		else {
			iframe.style.visibility = 'hidden';
			iframe.style.width = '1px';
			iframe.style.height = '1px';
		}

		this.message && this.message.send({ event: _const.EVENTS.CLOSE });
		return this;
	};

	// 发ext消息
	Iframe.prototype.send = function (extMsg) {
		this.message.send({ event: _const.EVENTS.EXT, data: extMsg });
	};

	// 发文本消息
	Iframe.prototype.sendText = function (msg) {
		this.message.send({ event: _const.EVENTS.TEXTMSG, data: msg });
	};

	easemobim.Iframe = Iframe;
}(
	easemobim.utils,
	easemobim._const
));

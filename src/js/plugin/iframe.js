

var utils = require("../common/utils");
var _const = require("../common/const");
var Transfer = require("../common/transfer");
var loading = require("./loading");
var notify = require("./notify");
var titleSlide = require("./titleSlide");
var pcImgView = require("./pcImgView");

var _st = 0;
var _startPosition = {
	x: 0,
	y: 0
};
var emptyFunc = function(){};

function _move(me, ev){
	var e = window.event || ev;
	var _width = document.documentElement.clientWidth;
	var _height = document.documentElement.clientHeight;
	var _x = _width - e.clientX - me.rect.width + _startPosition.x;
	var _y = _height - e.clientY - me.rect.height + _startPosition.y;

	if(e.clientX - _startPosition.x <= 0){ // left
		_x = _width - me.rect.width;
	}
	else if(e.clientX + me.rect.width - _startPosition.x >= _width){ // right
		_x = 0;
	}
	if(e.clientY - _startPosition.y <= 0){ // top
		_y = _height - me.rect.height;
	}
	else if(e.clientY + me.rect.height - _startPosition.y >= _height){ // bottom
		_y = 0;
	}
	me.shadow.style.left = "auto";
	me.shadow.style.top = "auto";
	me.shadow.style.right = _x + "px";
	me.shadow.style.bottom = _y + "px";

	me.position = {
		x: _x,
		y: _y
	};

	clearTimeout(_st);
	_st = setTimeout(function(){
		_moveend.call(me);
	}, 500);
}

function _moveend(){
/* jshint ignore:start */
	var me = this;
	/* jshint ignore:end */
	var iframe = me.iframe;
	var shadow = me.shadow;

	utils.off(document, "mousemove", me._onMouseMove);
	iframe.style.left = "auto";
	iframe.style.top = "auto";
	iframe.style.right = me.position.x + "px";
	iframe.style.bottom = me.position.y + "px";
	shadow.style.left = "auto";
	shadow.style.top = "auto";
	shadow.style.right = me.position.x + "px";
	shadow.style.bottom = me.position.y + "px";
	utils.removeClass(shadow, "easemobim-dragging");
	utils.removeClass(iframe, "easemobim-dragging");
}

function _bindResizeHandler(me){
	utils.on(window, "resize", function(){
		if(!me.rect || !me.rect.width) return;

		var _width = document.documentElement.clientWidth;
		var _height = document.documentElement.clientHeight;
		var _right = +me.iframe.style.right.slice(0, -2);
		var _bottom = +me.iframe.style.bottom.slice(0, -2);

		// width
		if(_width < me.rect.width){
			me.iframe.style.left = "auto";
			me.iframe.style.right = 0;
			me.shadow.style.left = "auto";
			me.shadow.style.right = 0;
		}
		else if(_width - _right < me.rect.width){
			me.iframe.style.right = _width - me.rect.width + "px";
			me.iframe.style.left = 0;
			me.shadow.style.right = _width - me.rect.width + "px";
			me.shadow.style.left = 0;
		}
		else{
			me.iframe.style.left = "auto";
			me.shadow.style.left = "auto";
		}

		// height
		if(_height < me.rect.height){
			me.iframe.style.top = "auto";
			me.iframe.style.bottom = 0;
		}
		else if(_height - _bottom < me.rect.height){
			me.iframe.style.bottom = _height - me.rect.height + "px";
			me.iframe.style.top = 0;
		}
		else{
			me.iframe.style.top = "auto";
		}
	});
}

function _ready(){
/* jshint ignore:start */
	var me = this;
	/* jshint ignore:end */

	(me.config.dragenable && !utils.isMobile) && _bindResizeHandler(me);

	me.message = new Transfer(me.iframe.id, "easemob", true);

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
	.listen(function(msg){
		if(msg.to !== me.iframe.id) return;

		var event = msg.event;
		var data = msg.data;

		switch(event){
		case _const.EVENTS.ONREADY:
			clearTimeout(me.onreadySt);
			loading.hide();
			me.onreadySt = setTimeout(function(){
				me.callbackApi.onready();
			}, 500);
			break;
		case _const.EVENTS.ON_OFFDUTY:
			loading.hide();
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
			notify(data.avatar, data.title, data.brief);
			break;
		case _const.EVENTS.SLIDE:
			// 标题滚动
			titleSlide.start();
			break;
		case _const.EVENTS.RECOVERY:
			// 标题滚动恢复
			titleSlide.stop();
			break;
		case _const.EVENTS.ONMESSAGE:
			// 收消息回调
			me.callbackApi.onmessage(data);
			break;
		case _const.EVENTS.ONSESSIONCLOSED:
			// 结束会话回调，此功能文档中没有
			clearTimeout(me.onsessionclosedSt);
			me.onsessionclosedSt = setTimeout(function(){
				me.callbackApi.onsessionclosed();
			}, 500);
			break;
		case _const.EVENTS.CACHEUSER:
			// 缓存im username
			utils.set(
				data.key,
				data.value
			);
			break;
		case _const.EVENTS.DRAGREADY:
			_startPosition.x = +data.x || 0;
			_startPosition.y = +data.y || 0;

			utils.addClass(me.iframe, "easemobim-dragging");
			utils.addClass(me.shadow, "easemobim-dragging");

			utils.on(document, "mousemove", me._onMouseMove);
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
			pcImgView(data);
			break;
		case _const.EVENTS.RESET_IFRAME:
			me.config.dialogWidth = data.dialogWidth;
			me.config.dialogHeight = data.dialogHeight;
			me.config.dialogPosition = data.dialogPosition;

			me._updatePosition();
			break;
		case _const.EVENTS.ADD_PROMPT:
			utils.addClass(me.iframe, "easemobim-has-prompt");
			break;
		case _const.EVENTS.REMOVE_PROMPT:
			utils.removeClass(me.iframe, "easemobim-has-prompt");
			break;
		default:
			break;
		}
	}, ["main"]);

	typeof me.ready === "function" && me.ready();
}



var Iframe = function(config){
	if(!(this instanceof Iframe)) return new Iframe(config);

	var me = this;
	var id = "easemob-iframe-" + utils.uuid();
	var className = "easemobim-chat-panel easemobim-hide easemobim-minimized";
	var iframe = document.createElement("iframe");
	var shadow;
	utils.isMobile && (className += " easemobim-mobile");

	iframe.frameBorder = 0;
	iframe.allowTransparency = "true";
	iframe.id = id;
	iframe.className = className;
	document.body.appendChild(iframe);

	utils.on(iframe, "load", function(){
		_ready.call(me);
	});

	if(!utils.isMobile){
		shadow = document.createElement("div");
		shadow.className = "easemobim-iframe-shadow";
		document.body.appendChild(shadow);
		utils.on(shadow, "mouseup", function(){
			_moveend.call(me);
		});
	}

	me.config = utils.copy(config);
	me.iframe = iframe;
	me.shadow = shadow;
	me.show = false;
	me._onMouseMove = function(ev){
		_move(me, ev);
	};

	Iframe.iframe = me;

	return me;
};

Iframe.prototype.set = function(config, callback){
	var shadowBackgroundImage = location.protocol + this.config.staticPath + "/img/drag.png";

	this.config = utils.copy(config || this.config);

	if(!this.config.user.username){
		// 从cookie里取用户名
		// keyName = [to + ] tenantId [ + emgroup]
		this.config.isUsernameFromCookie = true;
		this.config.user.username = utils.get(
			config.configId || ((this.config.to || "") + this.config.tenantId + (this.config.emgroup || ""))
		);
	}

	// 这个是别人种的cookie
	this.config.guestId = utils.getStore("guestId");

	this.position = {
		x: this.config.dialogPosition.x.slice(0, -2),
		y: this.config.dialogPosition.y.slice(0, -2)
	};
	this.rect = {
		width: +this.config.dialogWidth.slice(0, -2),
		height: +this.config.dialogHeight.slice(0, -2)
	};

	this._updatePosition();

	utils.toggleClass(this.iframe, "easemobim-hide", this.config.hide);

	// todo: add hash name to this file
	this.iframe.src = location.protocol + config.path + "/im.html?v=__WEBIM_PLUGIN_VERSION__";
	this.shadow && (this.shadow.style.backgroundImage = "url(" + shadowBackgroundImage + ")");

	this.ready = callback;

	return this;
};

Iframe.prototype._updatePosition = function(){
	var iframe = this.iframe;
	var shadow = this.shadow;
	var config = this.config;

	iframe.style.width = config.dialogWidth;
	iframe.style.height = config.dialogHeight;
	iframe.style.right = config.dialogPosition.x;
	iframe.style.bottom = config.dialogPosition.y;

	if(shadow){
		shadow.style.width = config.dialogWidth;
		shadow.style.height = config.dialogHeight;
		shadow.style.right = config.dialogPosition.x;
		shadow.style.bottom = config.dialogPosition.y;
	}
};

Iframe.prototype.open = function(){
	var iframe = this.iframe;

	if(this.show) return;
	this.show = true;

	// 移动端，禁止宿主页面滚动
	if(utils.isMobile){
		utils.addClass(document.body, "easemobim-mobile-body");
		utils.addClass(document.documentElement, "easemobim-mobile-html");
	}

	utils.removeClass(iframe, "easemobim-minimized");
	utils.removeClass(iframe, "easemobim-hide");

	this.message && this.message.send({ event: _const.EVENTS.SHOW });

	return this;
};

Iframe.prototype.close = function(){
	if(this.show === false) return;
	this.show = false;

	clearTimeout(_st);
	// 恢复宿主页面滚动
	if(utils.isMobile){
		utils.removeClass(document.body, "easemobim-mobile-body");
		utils.removeClass(document.documentElement, "easemobim-mobile-html");
	}

	utils.addClass(this.iframe, "easemobim-minimized");
	utils.toggleClass(this.iframe, "easemobim-hide", this.config.hide);

	this.message && this.message.send({ event: _const.EVENTS.CLOSE });
	return this;
};

// 发ext消息
Iframe.prototype.send = function(extMsg){
	this.message.send({ event: _const.EVENTS.EXT, data: extMsg });
};

// 发文本消息
Iframe.prototype.sendText = function(msg){
	this.message.send({ event: _const.EVENTS.TEXTMSG, data: msg });
};

module.exports = Iframe;

var utils = require("../common/utils");
var _const = require("../common/const");
var Transfer = require("../common/transfer");
var loading = require("./loading");
var notify = require("./notify");
var titleSlide = require("./titleSlide");
var pcImgView = require("./pcImgview");

var _st = 0;
var _startPosition = {
	x: 0,
	y: 0
};
var emptyFunc = function(){};

function _move(ctx, ev){
	var e = window.event || ev;
	var _width = document.documentElement.clientWidth;
	var _height = document.documentElement.clientHeight;
	var _x = _width - e.clientX - ctx.rect.width + _startPosition.x;
	var _y = _height - e.clientY - ctx.rect.height + _startPosition.y;

	if(e.clientX - _startPosition.x <= 0){ // left
		_x = _width - ctx.rect.width;
	}
	else if(e.clientX + ctx.rect.width - _startPosition.x >= _width){ // right
		_x = 0;
	}
	if(e.clientY - _startPosition.y <= 0){ // top
		_y = _height - ctx.rect.height;
	}
	else if(e.clientY + ctx.rect.height - _startPosition.y >= _height){ // bottom
		_y = 0;
	}
	ctx.shadow.style.left = "auto";
	ctx.shadow.style.top = "auto";
	ctx.shadow.style.right = _x + "px";
	ctx.shadow.style.bottom = _y + "px";

	ctx.position = {
		x: _x,
		y: _y
	};

	clearTimeout(_st);
	_st = setTimeout(function(){
		_moveend.call(ctx);
	}, 500);
}

function _moveend(){
	var me = this;
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

function _bindResizeHandler(ctx){
	utils.on(window, "resize", function(){
		if(!ctx.rect || !ctx.rect.width){
			return;
		}

		var _width = document.documentElement.clientWidth;
		var _height = document.documentElement.clientHeight;
		var _right = +ctx.iframe.style.right.slice(0, -2);
		var _bottom = +ctx.iframe.style.bottom.slice(0, -2);

		// width
		if(_width < ctx.rect.width){
			ctx.iframe.style.left = "auto";
			ctx.iframe.style.right = 0;
			ctx.shadow.style.left = "auto";
			ctx.shadow.style.right = 0;
		}
		else if(_width - _right < ctx.rect.width){
			ctx.iframe.style.right = _width - ctx.rect.width + "px";
			ctx.iframe.style.left = 0;
			ctx.shadow.style.right = _width - ctx.rect.width + "px";
			ctx.shadow.style.left = 0;
		}
		else{
			ctx.iframe.style.left = "auto";
			ctx.shadow.style.left = "auto";
		}

		// height
		if(_height < ctx.rect.height){
			ctx.iframe.style.top = "auto";
			ctx.iframe.style.bottom = 0;
		}
		else if(_height - _bottom < ctx.rect.height){
			ctx.iframe.style.bottom = _height - ctx.rect.height + "px";
			ctx.iframe.style.top = 0;
		}
		else{
			ctx.iframe.style.top = "auto";
		}
	});
}

function _ready(){
	var me = this;
	var i, l;

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
		var event = msg.event;
		var data = msg.data;

		if(msg.to !== me.iframe.id){
			return;
		}

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
			me._updatePosition(data);
			break;
		case _const.EVENTS.ADD_PROMPT:
			utils.addClass(me.iframe, "easemobim-has-prompt");
			break;
		case _const.EVENTS.REMOVE_PROMPT:
			utils.removeClass(me.iframe, "easemobim-has-prompt");
			break;
		case _const.EVENTS.SCROLL_TO_BOTTOM:
			document.body.scrollTop = 9999;
			break;
		default:
			break;
		}
	}, ["main"]);

	// 发送ready前缓存的消息
	for(i = 0, l = me.extendMessageList.length; i < l; i++){
		me.message.send({ event: _const.EVENTS.EXT, data: me.extendMessageList[i] });
	}
	for(i = 0, l = me.textMessageList.length; i < l; i++){
		me.message.send({ event: _const.EVENTS.TEXTMSG, data: me.textMessageList[i] });
	}

	typeof me.ready === "function" && me.ready();
}



function Iframe(config){
	var me = this;
	var id = "easemob-iframe-" + utils.uuid();
	var className = "easemobim-chat-panel easemobim-hide easemobim-minimized";
	var iframe = document.createElement("iframe");
	var shadow;

	if(!(this instanceof Iframe)){
		return new Iframe(config);
	}
	utils.isMobile && (className += " easemobim-mobile");

	iframe.frameBorder = 0;
	iframe.allowTransparency = "true";
	iframe.id = id;
	iframe.className = className;
	iframe.allow = "microphone; camera";
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

	me.config = config;
	me.iframe = iframe;
	me.shadow = shadow;
	me.show = false;
	me._onMouseMove = function(ev){
		_move(me, ev);
	};
	me.textMessageList = [];
	me.extendMessageList = [];

	Iframe.iframe = me;

	return me;
}

Iframe.prototype.set = function(config, callback){
	var shadowBackgroundImage = this.config.staticPath + "/img/drag.png";

	this.config = utils.copy(config || this.config);

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

	this.iframe.src = config.path + __("config.im_html_path") + "?v=__WEBIM_PLUGIN_VERSION__";
	this.shadow && (this.shadow.style.backgroundImage = "url(" + shadowBackgroundImage + ")");

	this.ready = callback;
	titleSlide.enable = config.titleSlide;

	return this;
};

Iframe.prototype._updatePosition = function(newData){
	var iframe = this.iframe;
	var shadow = this.shadow;
	var config = newData || this.config;

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

	if(this.show) return this;
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
	if(this.show === false) return this;
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

// 发 ext 消息
Iframe.prototype.send = function(extMsg){
	if(this.message){
		this.message.send({ event: _const.EVENTS.EXT, data: extMsg });
	}
	else{
		// 没有初始化前缓存消息，等ready 后发送
		this.extendMessageList.push(extMsg);
	}
};

// 发文本消息
Iframe.prototype.sendText = function(msg){
	if(this.message){
		this.message.send({ event: _const.EVENTS.TEXTMSG, data: msg });
	}
	else{
		this.textMessageList.push(msg);
	}
};

module.exports = Iframe;

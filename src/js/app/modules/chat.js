var WebIM = require('easemob-websdk');

var utils = require('../../common/utils');
var _const = require('../../common/const');
var uikit = require('./uikit');
var apiHelper = require('./apiHelper');
var eventListener = require('./tools/eventListener');
var channel = require('./channel');
var profile = require('./tools/profile');
var imgView = require('./imgview');
var createMessageView = require('./uikit/createMessageView');

var isEmojiInitilized;
var isMessageChannelReady;
var config;

var topBar = document.querySelector('.em-widget-header');
var editorView = document.querySelector('.em-widget-send-wrapper');

var doms = {
	imBtn: document.getElementById('em-widgetPopBar'),
	imChat: document.getElementById('em-kefu-webim-chat'),
	agentStatusText: topBar.querySelector('.em-header-status-text'),
	dragBar: topBar.querySelector('.drag-bar'),
	minifyBtn: topBar.querySelector('.btn-min'),
	audioBtn: topBar.querySelector('.btn-audio'),
	switchKeyboardBtn: topBar.querySelector('.btn-keyboard'),

	emojiBtn: editorView.querySelector('.em-bar-emoji'),
	sendImgBtn: editorView.querySelector('.em-widget-img'),
	sendFileBtn: editorView.querySelector('.em-widget-file'),
	sendBtn: editorView.querySelector('.em-widget-send'),
	satisfaction: editorView.querySelector('.em-widget-satisfaction'),
	textInput: editorView.querySelector('.em-widget-textarea'),
	noteBtn: editorView.querySelector('.em-widget-note'),
	queuingNumberStatus: editorView.querySelector('.queuing-number-status'),

	imgInput: document.querySelector('.upload-img-container'),
	fileInput: document.querySelector('.upload-file-container'),
	emojiContainer: document.querySelector('.em-bar-emoji-container'),
	chatWrapper: document.querySelector('.chat-wrapper'),
	emojiWrapper: document.querySelector('.em-bar-emoji-wrapper'),

	topBar: topBar,
	editorView: editorView,
	block: null
};

module.exports = chat = {
	doms: doms,
	init: _init,
	close: _close,
	show: _show,
};


function _initUI(){
	(utils.isTop || !config.minimum) && utils.removeClass(doms.imChat, 'hide');

	// 设置联系客服按钮文字
	document.querySelector('.em-widget-pop-bar').innerText = config.buttonText;

	// 添加移动端样式类
	utils.isMobile && utils.addClass(document.body, 'em-mobile');


	// 最小化按钮
	config.minimum
		&& !utils.isTop
		&& utils.removeClass(doms.minifyBtn, 'hide');

	// 静音按钮
	window.HTMLAudioElement
		&& !utils.isMobile
		&& config.soundReminder
		&& utils.removeClass(doms.audioBtn, 'hide');

	// 输入框位置开关
	utils.isMobile
		&& !config.hideKeyboard
		&& utils.removeClass(doms.switchKeyboardBtn, 'hide');
}

function _initSoundReminder(){
	if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) return;

	var audioDom = document.createElement('audio');
	var slienceSwitch = document.querySelector('.em-widget-header .btn-audio');
	var isSlienceEnable = false;
	var play = _.throttle(function () {
		audioDom.play();
	}, 3000, { trailing: false });

	audioDom.src = config.staticPath + '/mp3/msg.m4a';

	//音频按钮静音
	utils.on(slienceSwitch, 'click', function () {
		isSlienceEnable = !isSlienceEnable;
		utils.toggleClass(slienceSwitch, 'icon-slience', isSlienceEnable);
		utils.toggleClass(slienceSwitch, 'icon-bell', !isSlienceEnable);
	});

	eventListener.add(_const.SYSTEM_EVENT.MESSAGE_PROMPT, function (){
		!isSlienceEnable && play();
	});
}

function _setLogo() {
	if (!config.logo.enabled) return;
	var logoImgWapper = document.querySelector('.em-widget-tenant-logo');
	var logoImg = logoImgWapper.querySelector('img');

	utils.removeClass(logoImgWapper, 'hide');
	logoImg.src = config.logo.url;
}

function _scrollToBottom(){
	var scrollToBottom = utils.getDataByPath(profile, 'currentOfficialAccount.messageView.scrollToBottom');
	// 有可能在 messageView 未初始化时调用
	// todo: remove this detect
	typeof scrollToBottom === 'function' && scrollToBottom();
}

function _initAutoGrow(){
	var originHeight = doms.textInput.clientHeight;
	var inputBoxPosition;

	// 键盘上下切换按钮
	utils.on(doms.switchKeyboardBtn, 'click', function (){
		var status = utils.hasClass(this, 'icon-keyboard-down');
		var height = doms.editorView.getBoundingClientRect().height;
		inputBoxPosition = status ? 'down' : 'up';

		utils.toggleClass(this, 'icon-keyboard-up', status);
		utils.toggleClass(this, 'icon-keyboard-down', !status);

		switch (inputBoxPosition) {
		case 'up':
			doms.editorView.style.bottom = 'auto';
			doms.editorView.style.zIndex = '3';
			doms.editorView.style.top = '43px';
			doms.chatWrapper.style.bottom = '0';
			doms.emojiWrapper.style.bottom = 'auto';
			doms.emojiWrapper.style.top = 43 + height + 'px';
			doms.queuingNumberStatus.style.top = height + 'px';
			break;
		case 'down':
			doms.editorView.style.bottom = '0';
			doms.editorView.style.zIndex = '3';
			doms.editorView.style.top = 'auto';
			doms.chatWrapper.style.bottom = height + 'px';
			doms.emojiWrapper.style.bottom = height + 'px';
			doms.emojiWrapper.style.top = 'auto';
			doms.queuingNumberStatus.style.top = '-26px';
			_scrollToBottom();
			break;
		}
	});

	utils.on(doms.textInput, 'input change', update);

	// todo: 高度不改变时，不更新dom
	function update() {
		var height = this.value ? this.scrollHeight : originHeight;
		this.style.height = height + 'px';
		this.scrollTop = 9999;
		callback();
	}

	function callback() {
		var height = doms.editorView.getBoundingClientRect().height;
		if (inputBoxPosition === 'up') {
			doms.emojiWrapper.style.top = 43 + height + 'px';
			doms.queuingNumberStatus.style.top = height + 'px';
		}
		else {
			doms.chatWrapper.style.bottom = height + 'px';
			doms.emojiWrapper.style.bottom = height + 'px';
		}
		_scrollToBottom();
	}
}

function _initOfficialAccount(){
	eventListener.add(
		_const.SYSTEM_EVENT.NEW_OFFICIAL_ACCOUNT_FOUND,
		function(officialAccount){
			officialAccount.messageView = createMessageView({
				officialAccount: officialAccount
			});
		}
	);

	// init default system message view
	channel.attemptToAppendOfficialAccount({
		type: 'SYSTEM',
		official_account_id: 'default',
		img: null
	});

	profile.currentOfficialAccount = profile.systemOfficialAccount;
	profile.systemOfficialAccount.messageView.show();

	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, [profile.systemOfficialAccount]);
}

function _bindEvents() {
	if (!utils.isTop) {
		// 最小化按钮
		utils.on(doms.minifyBtn, 'click', function () {
			transfer.send({ event: _const.EVENTS.CLOSE });
		});

		utils.on(document, 'mouseover', function () {
			transfer.send({ event: _const.EVENTS.RECOVERY });
		});
	}

	utils.on(doms.chatWrapper, 'click', function () {
		doms.textInput.blur();
	});

	utils.live('img.em-widget-imgview', 'click', function () {
		var imgSrc = this.getAttribute('src');
		imgView.show(imgSrc);
	});

	if (config.dragenable && !utils.isTop && !utils.isMobile) {

		doms.dragBar.style.cursor = 'move';

		utils.on(doms.dragBar, 'mousedown', function (ev) {
			var e = window.event || ev;
			doms.textInput.blur(); //ie a  ie...
			transfer.send({
				event: _const.EVENTS.DRAGREADY,
				data: {
					x: e.clientX,
					y: e.clientY
				}
			});
			return false;
		}, false);
	}

	//resend
	utils.live('div.em-widget-msg-status', 'click', function () {
		var id = this.getAttribute('id').slice(0, -'_failed'.length);
		var type = this.getAttribute('data-type');

		channel.reSend(type, id);
		utils.addClass(this, 'hide');
		utils.removeClass(document.getElementById(id + '_loading'), 'hide');
	});

	// 机器人列表
	utils.live('button.js_robotbtn', 'click', function () {
		channel.sendMenuClick(this.innerText, this.getAttribute('data-id'));
	});

	function handleSendBtn() {
		var isEmpty = !doms.textInput.value.trim();

		utils.toggleClass(
			doms.sendBtn,
			'disabled', !isMessageChannelReady || isEmpty
		);
	}

	if (Modernizr.oninput) {
		utils.on(doms.textInput, 'input change', handleSendBtn);
	}
	else {
		utils.on(doms.textInput, 'keyup change', handleSendBtn);
	}

	if (utils.isMobile) {
		utils.on(doms.textInput, 'focus touchstart', function () {
			doms.textInput.style.overflowY = 'auto';
			_scrollToBottom();
		});
	}

	// 回车发送消息
	utils.on(doms.textInput, 'keydown', function (evt) {
		if (
			evt.keyCode === 13
			&& !utils.isMobile
			&& !evt.ctrlKey
			&& !evt.shiftKey
		) {
			// ie8 does not support preventDefault & stopPropagation
			if (evt.preventDefault) {
				evt.preventDefault();
			}
			utils.trigger(doms.sendBtn, 'click');
		}
	});

	utils.on(doms.sendBtn, 'click', function () {
		var textMsg = doms.textInput.value;

		if (utils.hasClass(this, 'disabled')) {
			// 禁止发送
		}
		else if (textMsg.length > _const.MAX_TEXT_MESSAGE_LENGTH) {
			uikit.tip('输入字数过多');
		}
		else {
			channel.sendText(textMsg);
			doms.textInput.value = '';
			utils.trigger(doms.textInput, 'change');
		}
	});
}

function _close() {
	profile.isChatWindowOpen = false;

	if (!config.hide) {
		utils.addClass(doms.imChat, 'hide');
		utils.removeClass(doms.imBtn, 'hide');
	}

	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.CHAT_WINDOW_CLOSED, []);
}

function _show() {
	profile.isChatWindowOpen = true;
	utils.addClass(doms.imBtn, 'hide');
	utils.removeClass(doms.imChat, 'hide');
	_scrollToBottom();
	if (
		// todo: fix this issue
		// todo: onInit !isChatWindowOpen && _show()
		profile.isInOfficeHours
		// IE 8 will throw an error when focus an invisible element
		&& doms.textInput.offsetHeight > 0
	) {
		doms.textInput.focus();
	}

	transfer.send({ event: _const.EVENTS.RECOVERY });

	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.CHAT_WINDOW_OPENED, []);
}

function _onReady(){
	if (isMessageChannelReady) return;

	isMessageChannelReady = true;

	doms.sendBtn.innerHTML = '发送';
	utils.trigger(doms.textInput, 'change');

	// todo: discard this
	// bug fix:
	// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
	if (config.minimum === false || config.eventCollector === true) {
		transfer.send({ event: _const.EVENTS.SHOW });
	}

	// onready 回调
	transfer.send({ event: _const.EVENTS.ONREADY });
}

function _init() {
	config = profile.config;

	channel.init();

	profile.isChatWindowOpen = true;

	_initSoundReminder();

	_initUI();

	_bindEvents();

	_initOfficialAccount();

	_initSession();

	_onReady();
}

function _initSession(){
	// 灰度列表
	profile.grayList = {};

	// 移动端输入框自动增长
	utils.isMobile && _initAutoGrow();
}

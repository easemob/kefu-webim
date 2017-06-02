easemobim.chat = (function (_const, utils, uikit, api, apiHelper, satisfaction, createMessageView, profile) {
	return function (config) {
		var isChatWindowOpen;
		var isEmojiInitilized;
		var isMessageChannelReady;
		var currentMessageView;
		var inputBoxPosition;
		var channel;
		var conn;

		// DOM init
		var topBar = document.querySelector('.em-widget-header');
		var editorView = document.querySelector('.em-widget-send-wrapper');
		easemobim.imBtn = document.getElementById('em-widgetPopBar');

		// todo: 把dom都移到里边
		var doms = {
			imChat: document.getElementById('em-kefu-webim-chat'),
			//待接入排队人数显示
			agentWaitNumber: document.querySelector('.queuing-number-status'),
			agentStatusSymbol: topBar.querySelector('.agent-status'),
			agentStatusText: topBar.querySelector('.em-header-status-text'),
			avatar: topBar.querySelector('.em-widget-header-portrait'),
			nickname: topBar.querySelector('.em-widget-header-nickname'),
			dragBar: topBar.querySelector('.drag-bar'),
			minifyBtn: topBar.querySelector('.btn-min'),
			audioBtn: topBar.querySelector('.btn-audio'),
			switchKeyboardBtn: topBar.querySelector('.btn-keyboard'),
			inputState: topBar.querySelector('.em-agent-input-state'),

			emojiBtn: editorView.querySelector('.em-bar-emoji'),
			sendImgBtn: editorView.querySelector('.em-widget-img'),
			sendFileBtn: editorView.querySelector('.em-widget-file'),
			sendBtn: editorView.querySelector('.em-widget-send'),
			satisfaction: editorView.querySelector('.em-widget-satisfaction'),
			toKefuBtn: editorView.querySelector('.em-widget-to-kefu'),
			textInput: editorView.querySelector('.em-widget-textarea'),
			noteBtn: editorView.querySelector('.em-widget-note'),

			imgInput: document.querySelector('.upload-img-container'),
			fileInput: document.querySelector('.upload-file-container'),
			emojiContainer: document.querySelector('.em-bar-emoji-container'),
			chatWrapper: document.querySelector('.chat-wrapper'),
			emojiWrapper: document.querySelector('.em-bar-emoji-wrapper'),

			topBar: topBar,
			editorView: editorView,
			block: null
		};

		function _initUI(){
			(utils.isTop || !config.minimum) && utils.removeClass(doms.imChat, 'hide');

			// 设置联系客服按钮文字
			document.querySelector('.em-widget-pop-bar').innerText = config.buttonText;

			// 添加移动端样式类
			utils.isMobile && utils.addClass(document.body, 'em-mobile');

			// 留言按钮
			config.ticket && utils.removeClass(doms.noteBtn, 'hide');

			// 最小化按钮
			config.minimum
				&& !utils.isTop
				&& utils.removeClass(doms.minifyBtn, 'hide');

			// 低版本浏览器不支持上传文件/图片
			if (WebIM.utils.isCanUploadFileAsync){
				utils.removeClass(doms.sendImgBtn, 'hide');
				utils.removeClass(doms.sendFileBtn, 'hide');
			}

			// h5title设置
			if(config.ui.H5Title.enabled){
				document.title = config.ui.H5Title.content;
			}

			// 静音按钮
			window.HTMLAudioElement
				&& !utils.isMobile
				&& config.soundReminder
				&& utils.removeClass(doms.audioBtn, 'hide');

			// 输入框位置开关
			utils.isMobile
				&& !config.hideKeyboard
				&& utils.removeClass(doms.switchKeyboardBtn, 'hide');

			// 满意度评价按钮
			config.satisfaction
				&& utils.removeClass(
					document.querySelector('.em-widget-satisfaction'),
					'hide'
				);
		}

		function _setLogo() {
			if (!config.logo.enabled) return;
			var logoImgWapper = document.querySelector('.em-widget-tenant-logo');
			var logoImg = logoImgWapper.querySelector('img');

			utils.removeClass(logoImgWapper, 'hide');
			logoImg.src = config.logo.url;
		}

		function _setToKefuBtn(options){
			if (!config.toolbar.transferToKefu) return;
			if (options.isSessionOpen){
				apiHelper.getCurrentServiceSession().then(function (res) {
					var isRobotAgent = res && res.agentUserType === 6;
					utils.toggleClass(doms.toKefuBtn, 'hide', !isRobotAgent);
				});
			}
			else{
				apiHelper.getRobertIsOpen().then(function (isRobotEnable) {
					utils.toggleClass(doms.toKefuBtn, 'hide', !isRobotEnable);
				});
			}
		}

		function _setNotice() {
			var noticeContent = document.querySelector('.em-widget-tip .content');
			var noticeCloseBtn = document.querySelector('.em-widget-tip .tip-close');

			apiHelper.getNotice().then(function(notice){
				if(!notice.enabled) return;
				var slogan = notice.content;

				// 设置信息栏内容
				noticeContent.innerHTML = WebIM.utils.parseLink(slogan);
				// 显示信息栏
				utils.addClass(doms.imChat, 'has-tip');

				// 隐藏信息栏按钮
				utils.on(
					noticeCloseBtn,
					utils.click,
					function () {
						// 隐藏信息栏
						utils.removeClass(doms.imChat, 'has-tip');
					}
				);
			});
		}

		function _initEmoji() {
			utils.on(doms.emojiBtn, utils.click, function () {
				doms.textInput.blur();
				utils.toggleClass(doms.emojiWrapper, 'hide');

				// 懒加载，打开表情面板时才初始化图标
				if (!isEmojiInitilized) {
					isEmojiInitilized = true;
					doms.emojiContainer.innerHTML = genHtml();
				}
			});

			// 表情的选中
			utils.live('img.emoji', utils.click, function (e) {
				!utils.isMobile && doms.textInput.focus();
				doms.textInput.value += this.getAttribute('data-value');
				utils.trigger(doms.textInput, 'change');
			}, doms.emojiWrapper);

			// todo: kill .e-face to make it more elegant
			// ie8 does not support stopPropagation -_-||
			// 点击别处时隐藏表情面板
			utils.on(document, utils.click, function (ev) {
				var e = window.event || ev;
				var target = e.srcElement || e.target;

				if (!utils.hasClass(target, 'e-face')) {
					utils.addClass(doms.emojiWrapper, 'hide');
				}
			});

			function genHtml() {
				var path = WebIM.Emoji.path;
				var EMOJI_COUNT_PER_LINE = 7;

				return _.chain(WebIM.Emoji.map)
					// 生成图标html
					.map(function (value, key) {
						return '<div class="em-bar-emoji-bg e-face">'
							+ '<img class="e-face emoji" src="'
							+ path + value
							+ '" data-value=' + key + ' />'
							+ '</div>';
					})
					// 按照下标分组
					.groupBy(function (elem, index) {
						return Math.floor(index / EMOJI_COUNT_PER_LINE);
					})
					// 增加wrapper
					.map(function (elem) {
						return '<li class="e-face">' + elem.join('') + '</li>';
					})
					// 结束链式调用
					.value()
					// 把数组拼接成字符串
					.join('');
			}
		}

		function _setOffline() {
			switch (config.offDutyType) {
			case 'none':
				// 下班禁止留言、禁止接入会话
				utils.appendHTMLToBody([
					'<div class="em-model"></div>',
					'<div class="em-dialog off-duty-prompt">',
					'<div class="bg-color header">提示</div>',
					'<div class="body">',
					'<p class="content">' + config.offDutyWord + '</p>',
					'</div>',
					'</div>'
				].join(''));
				break;
			default:
				// 只允许留言此时无法关闭留言页面
				easemobim.leaveMessage({hideCloseBtn: true});
				break;
			}
		}

		function _getGreeting() {
			Promise.all([
				apiHelper.getSystemGreeting(),
				apiHelper.getRobertGreeting()
			]).then(function(result){
				var systemGreetingText = result[0];
				var robotGreetingObj = result[1];
				var greetingTextType = robotGreetingObj.greetingTextType;
				var greetingText = robotGreetingObj.greetingText;
				var greetingObj = {};

				// 系统欢迎语
				systemGreetingText && channel.handleReceive({
					data: systemGreetingText,
					noprompt: true
				}, 'txt');

				// 机器人欢迎语
				switch (greetingTextType) {
				case 0:
					// 文本消息
					channel.handleReceive({
						data: greetingText,
						noprompt: true
					}, 'txt');
					break;
				case 1:
					// 菜单消息
					greetingObj = JSON.parse(greetingText.replace(/&amp;quot;/g, '"'));

					greetingObj.ext && channel.handleReceive({
						ext: greetingObj.ext,
						noprompt: true
					});
					break;
				case undefined:
					// 未设置机器人欢迎语
					break;
				default:
					console.error('unknown robot greeting type.');
					break;
				}
			});
		}

		function _getNickNameOption() {
			api('getNickNameOption', {
				tenantId: config.tenantId
			}, function (msg) {
				config.nickNameOption = utils.getDataByPath(msg, 'data.0.optionValue') === 'true';
			});
		}

		function _getCurrentMessageView(){
			return profile.currentOfficialAccount.messageView;
		}

		function _initAutoGrow(){
			var originHeight = doms.textInput.clientHeight;

			utils.on(doms.textInput, 'input change', update);

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
				}
				else {
					doms.chatWrapper.style.bottom = height + 'px';
					doms.emojiWrapper.style.bottom = height + 'px';
				}
				_getCurrentMessageView().scrollToBottom();
			}
		}

		function _initMessageView(){
			apiHelper.getOfficalAccounts().then(initMessageView, function(err){
				// 未创建会话时初始化默认服务号
				if (err === _const.ERROR_MSG.VISITOR_DOES_NOT_EXIST){
					initMessageView([], {isNewUser: true});
				}
				else {
					throw err;
				}
			});

			// 获取在线坐席数
			apiHelper.getExSession().then(function(data) {
				profile.hasHumanAgentOnline = data.onlineHumanAgentCount > 0;
				profile.hasRobotAgentOnline = data.onlineRobotAgentCount > 0;
			});

			function initMessageView(collection, opt){
				var option = opt || {};
				var sessionList;
				var officialAccountList = _.isEmpty(collection)
					? [{
						type: 'SYSTEM',
						official_account_id: null,
						img: null
					}]
					: collection;

				// init message view
				_.each(officialAccountList, function(item){
					item.messageView = createMessageView({
						parentContainer: doms.chatWrapper,
						isNewUser: option.isNewUser,
						id: item.official_account_id,
						channel: channel
					});
				});

				// init session list
				sessionList = app.sessionList.init({
					collection: collection,
					callback: changeMessageViewTo
				});

				// 如果有自定义服务号则显示列表
				if (_.findWhere(officialAccountList, {type: 'CUSTOM'})){
					sessionList.show();
					// todo: show list button
					utils.on(doms.avatar, 'click', sessionList.show);
					// 营销功能打开标志
					profile.ctaEnable = true;
				}
				else {
					profile.currentOfficialAccount = _.findWhere(officialAccountList, {type: 'SYSTEM'});
				}

				profile.systemOfficialAccount = _.findWhere(officialAccountList, {type: 'SYSTEM'});
				profile.officialAccountList = officialAccountList;

				function changeMessageViewTo(id){
					var targerOfficialAccountProfile = _.findWhere(officialAccountList, {official_account_id: id});
					_.each(officialAccountList, function(item){
						item.messageView.hide();
					});
					targerOfficialAccountProfile.messageView.show();
					profile.currentOfficialAccount = targerOfficialAccountProfile;
				}
				_getLastSession(profile.currentOfficialAccount.official_account_id);
			}
		}

		function _getLastSession(officialAccountId){
			apiHelper.getLastSession(officialAccountId).then(function(session){
				var sessionId = session.session_id;
				var state = session.state;
				var agentId = session.agent_id;

				profile.agentId = agentId;
				profile.serviceSessionId = sessionId;
				profile.sessionState = state;

				if (state === _const.SESSION_STATE.WAIT){
					apiHelper.reportVisitorAttributes(sessionId);
					_setToKefuBtn({isSessionOpen: true});
				}
				else if (state === _const.SESSION_STATE.PROCESSING){
					// 确保正在进行中的会话，刷新后还会继续轮询坐席状态
					_startToGetAgentStatus();

					_setToKefuBtn({isSessionOpen: true});
					apiHelper.reportVisitorAttributes(sessionId);
				}
				else if (
					state === _const.SESSION_STATE.ABORT
					|| state === _const.SESSION_STATE.TERMINAL
					|| state === _const.SESSION_STATE.RESOLVED
				){
					// 结束的会话获取欢迎语
					_getGreeting();
					_setToKefuBtn({isSessionOpen: false});
				}
				else{
					throw 'unknown session state';
				}
			}, function(err){
				if (err === _const.ERROR_MSG.SESSION_DOES_NOT_EXIST){
					_getGreeting();
				}
				else {
					throw err;
				}
			});
		}

		function _bindEvents() {
			if (!utils.isTop) {
				// 最小化按钮
				utils.on(document.querySelector('.em-widget-header .btn-min'), 'click', function () {
					transfer.send({ event: _const.EVENTS.CLOSE });
				});

				utils.on(easemobim.imBtn, utils.click, function () {
					transfer.send({ event: _const.EVENTS.SHOW });
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
				easemobim.imgView.show(imgSrc);
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
			utils.live('div.em-widget-msg-status', utils.click, function () {
				var id = this.getAttribute('id').slice(0, -'_failed'.length);

				utils.addClass(this, 'hide');
				utils.removeClass(document.getElementById(id + '_loading'), 'hide');
				if (this.getAttribute('data-type') === 'txt') {
					channel.reSend('txt', id);
				}
				else {
					conn.send(id);
				}
			});

			utils.live('button.js_robotTransferBtn', utils.click, function () {
				var id = this.getAttribute('data-id');
				var ssid = this.getAttribute('data-sessionid');

				// 只能评价1次
				if (!this.clicked) {
					this.clicked = true;
					channel.sendTransferToKf(id, ssid);
				}
			});

			utils.live('button.js-transfer-to-ticket', utils.click, function () {
				Promise.all([
					apiHelper.getSessionQueueId(),
					apiHelper.getCurrentServiceSession()
				]).then(function(result){
					var ssid = utils.getDataByPath(result[0], 'entity.serviceSessionId')
						|| utils.getDataByPath(result[1], 'serviceSessionId');
					ssid && api('closeServiceSession', {
						tenantId: config.tenantId,
						orgName: config.orgName,
						appName: config.appName,
						userName: config.user.username,
						token: config.user.token,
						serviceSessionId: ssid
					});
				});

				easemobim.leaveMessage({
					preData: {
						name: config.visitor.trueName,
						phone: config.visitor.phone,
						mail: config.visitor.email,
						// 	取最近10条消息，最大1000字
						content: utils.getBrief('\n' + profile.systemOfficialAccount.messageView.getRecentMsg(10), 1000)
					}
				});
			});

			// 机器人列表
			utils.live('button.js_robotbtn', utils.click, function () {
				channel.sendText(this.innerText, {
					ext: {
						msgtype: {
							choice: {
								menuid: this.getAttribute('data-id')
							}
						}
					}
				});
			});

			// 满意度评价
			utils.live('button.js_satisfybtn', 'click', function () {
				var serviceSessionId = this.getAttribute('data-servicesessionid');
				var inviteId = this.getAttribute('data-inviteid');
				satisfaction.show(inviteId, serviceSessionId);
			});

			var messagePredict = _.throttle(function (msg) {
				profile.agentId
					&& config.visitorUserId
					&& api('messagePredict', {
						tenantId: config.tenantId,
						visitor_user_id: config.visitorUserId,
						agentId: profile.agentId,
						content: utils.getBrief(msg, _const.MESSAGE_PREDICT_MAX_LENGTH),
						timestamp: _.now(),
					});
			}, 1000);

			function handleSendBtn() {
				var isEmpty = !doms.textInput.value.trim();

				utils.toggleClass(
					doms.sendBtn,
					'disabled', !isMessageChannelReady || isEmpty
				);
				config.grayList.msgPredictEnable
					&& !isEmpty
					&& messagePredict(doms.textInput.value);
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
					_getCurrentMessageView().scrollToBottom();
				});

				// 键盘上下切换按钮
				utils.on(
					document.querySelector('.em-widget-header .btn-keyboard'),
					'click',
					function () {
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
							break;
						case 'down':
							doms.editorView.style.bottom = '0';
							doms.editorView.style.zIndex = '3';
							doms.editorView.style.top = 'auto';
							doms.chatWrapper.style.bottom = height + 'px';
							doms.emojiWrapper.style.bottom = height + 'px';
							doms.emojiWrapper.style.top = 'auto';
							_getCurrentMessageView().scrollToBottom();
							break;
						}
					}
				);
			}

			// 发送文件
			utils.on(doms.fileInput, 'change', function () {
				var fileInput = doms.fileInput;
				var filesize = utils.getDataByPath(fileInput, 'files.0.size');

				if (!fileInput.value) {
					// 未选择文件
				}
				else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
					uikit.tip('文件大小不能超过10MB');
				}
				else {
					channel.sendFile(WebIM.utils.getFileUrl(fileInput), fileInput);
				}
			});

			// 发送图片
			utils.on(doms.imgInput, 'change', function () {
				var fileInput = doms.imgInput;
				// ie8-9 do not support multifiles, so you can not get files
				var filesize = utils.getDataByPath(fileInput, 'files.0.size');

				if (!fileInput.value) {
					// 未选择文件
				}
				// 某些浏览器不能获取到正确的文件名，所以放弃文件类型检测
				// else if (!/\.(png|jpg|jpeg|gif)$/i.test(fileInput.value)) {
					// uikit.tip('不支持的图片格式');
				// }
				// 某些浏览器无法获取文件大小, 忽略
				else if (filesize > _const.UPLOAD_FILESIZE_LIMIT) {
					uikit.tip('文件大小不能超过10MB');
					fileInput.value = '';
				}
				else {
					channel.sendImg(WebIM.utils.getFileUrl(fileInput), fileInput);
				}
			});

			//弹出文件选择框
			utils.on(doms.sendFileBtn, 'click', function () {
				// 发送文件是后来加的功能，无需考虑IE兼容
				if (!isMessageChannelReady) {
					uikit.tip('正在连接中...');
				}
				else {
					doms.fileInput.click();
				}
			});

			utils.on(doms.sendImgBtn, 'click', function () {
				if (!isMessageChannelReady) {
					uikit.tip('正在连接中...');
				}
				else {
					doms.imgInput.click();
				}
			});

			// 显示留言页面
			utils.on(doms.noteBtn, 'click', function () {
				easemobim.leaveMessage();
			});

			// 人工客服接起会话
			utils.on(doms.toKefuBtn, 'click', function () {
				channel.sendTransferToKf();
				utils.addClass(doms.toKefuBtn, 'hide');
			});

			// 满意度评价
			utils.on(doms.satisfaction, 'click', function () {
				doms.textInput.blur();
				satisfaction.show();
			});

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

		// todo: 拆分这部分
		function _startToGetAgentStatus() {
			if (config.agentStatusTimer) return;

			// start to poll
			config.agentStatusTimer = setInterval(function () {
				_updateAgentStatus();
			}, 5000);
		}

		function _stopGettingAgentStatus() {
			config.agentStatusTimer = clearInterval(config.agentStatusTimer);
		}

		function _clearAgentStatus() {
			doms.agentStatusSymbol.className = 'hide';
			doms.agentStatusText.innerText = '';
		}

		function _updateAgentStatus() {
			if (!profile.agentId || !config.nickNameOption || !config.user.token) {
				_stopGettingAgentStatus();
				return;
			}

			apiHelper.getAgentStatus(profile.agentId).then(function (state) {
				if (state) {
					doms.agentStatusText.innerText = _const.agentStatusText[state];
					doms.agentStatusSymbol.className = 'em-widget-agent-status ' + _const.agentStatusClassName[state];
				}
			});
		}

		return {
			init: function () {
				var me = this;

				channel = this.channel = easemobim.channel(this, config);

				conn = this.conn = new WebIM.connection({
					url: config.xmppServer,
					retry: true,
					isMultiLoginSessions: config.resources,
					heartBeatWait: _const.HEART_BEAT_INTERVAL
				});

				//chat window status
				isChatWindowOpen = true;
				//init sound reminder
				this.soundReminder();

				_initUI();

				_initEmoji();
				//bind events on dom
				_bindEvents();

				Promise.all([
					apiHelper.getDutyStatus(),
					apiHelper.getGrayList(),
					apiHelper.getToken()
				]).then(function(result){
					var dutyStatus = result[0];
					var grayList = result[1];

					// 灰度列表
					config.grayList = grayList;

					// 当配置为下班进会话时执行与上班相同的逻辑
					config.isInOfficehours = dutyStatus || config.offDutyType === 'chat';

					// 设置企业信息
					me.setEnterpriseInfo();

					if (config.isInOfficehours) {
						// 显示广告条
						_setLogo();

						// 移动端输入框自动增长
						utils.isMobile && _initAutoGrow();

						// 添加sdk回调
						channel.listen();

						// 连接xmpp server
						me.open();

						// 设置信息栏
						_setNotice();

						_initMessageView();

						// 获取坐席昵称设置
						_getNickNameOption();

						// 待接入排队人数显示
						me.waitListNumber.start();

						//轮询坐席的输入状态
						me.agentInputState.start();

						// 第二通道收消息初始化
						channel.initSecondChannle();
					}
					else {
						// 设置下班时间展示的页面
						_setOffline();
					}
				}, function (err) {
					throw err;
				});
			},
			handleReady: function (info) {
				var me = this;

				if (isMessageChannelReady) return;

				isMessageChannelReady = true;
				doms.sendBtn.innerHTML = '发送';
				utils.trigger(doms.textInput, 'change');

				// bug fix:
				// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
				if (config.minimum === false || config.eventCollector === true) {
					transfer.send({ event: _const.EVENTS.SHOW });
				}
				if (info) {
					config.user.token = config.user.token || info.accessToken;
				}

				// 发送用于回呼访客的命令消息
				if (this.cachedCommandMessage) {
					channel.sendText('', this.cachedCommandMessage);
					this.cachedCommandMessage = null;
				}

				transfer.send({ event: _const.EVENTS.ONREADY });

				if (config.extMsg) {
					channel.sendText('', { ext: config.extMsg });
				}
			},

			setEnterpriseInfo: function () {
				this.setAgentProfile({
					tenantName: config.defaultAgentName,
					avatar: config.tenantAvatar
				});
			},
			startToGetAgentStatus: _startToGetAgentStatus,
			clearAgentStatus: _clearAgentStatus,
			updateAgentStatus: _updateAgentStatus,
			stopGettingAgentStatus: _stopGettingAgentStatus,
			setToKefuBtn: _setToKefuBtn,

			agentInputState: (function () {
				var isStarted = false;
				var timer;
				var prevTimestamp = 0;

				function _start() {
					// 没有灰度的时候  不做查询
					if (!config.grayList.agentInputStateEnable) return;
					isStarted = true;
					// 保证当前最多只有1个timer
					clearInterval(timer);
					api('getCurrentServiceSession', {
						id: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						imServiceNumber: config.toUser,
						tenantId: config.tenantId
					}, function (msg) {
						var data = msg.data || {};
						var sessionId = data.serviceSessionId;

						if (sessionId && isStarted) {
							timer = setInterval(function () {
								getAgentInputState(sessionId);
							}, _const.AGENT_INPUT_STATE_INTERVAL);
						}
					});
				}

				function getAgentInputState(sessionId) {
					if (!config.user.token) {
						console.error('undefined token');
						return;
					}
					// 当聊天窗口或者浏览器最小化时 不去发轮询请求
					if(!isChatWindowOpen || utils.isBrowserMinimized()){
						return;
					}

					api('getAgentInputState', {
						username: config.user.username,
						orgName: config.orgName,
						appName: config.appName,
						tenantId: config.tenantId,
						serviceSessionId: sessionId,
						token: config.user.token,
					}, function (resp) {
						var nowData = resp.data.entity;
						//当返回的时间戳小于当前时间戳时  不做任何处理
						if(prevTimestamp > nowData.timestamp){
							return;
						}
						//当返回的时间戳大于当前时间戳时  处理以下逻辑
						prevTimestamp = nowData.timestamp;
						if (!nowData.input_state_tips) {
							utils.addClass(doms.inputState, 'hide');
						}
						else {
							utils.removeClass(doms.inputState, 'hide');
						}
					});
				}

				function _stop() {
					clearInterval(timer);
					utils.addClass(doms.inputState, 'hide');
					isStarted = false;
				}
				return {
					start: _start,
					stop: _stop
				};
			})(),
			waitListNumber: (function () {

				var isStarted = false;
				var timer = null;
				var prevTime = 0;

				function _start() {
					if (!config.grayList.waitListNumberEnable) return;

					isStarted = true;
					// 保证当前最多只有1个timer
					// 每次调用start都必须重新获取queueId
					clearInterval(timer);
					api('getSessionQueueId', {
						tenantId: config.tenantId,
						visitorUsername: config.user.username,
						techChannelInfo: config.orgName + '%23' + config.appName + '%23' + config.toUser
					}, function (resp) {
						var nowData = resp.data.entity;
						var queueId;
						var sessionId;

						if (nowData && nowData.state === 'Wait') {
							queueId = nowData.queueId;
							sessionId = nowData.serviceSessionId;
							// 避免请求在 轮询停止以后回来 而导致误开始
							// todo: use promise to optimize it
							if (isStarted) {
								timer = setInterval(function () {
									getWaitNumber(queueId, sessionId);
								}, 1000);
							}
						}
					});
				}

				function getWaitNumber(queueId, sessionId) {
					api('getWaitListNumber', {
						tenantId: config.tenantId,
						queueId: queueId,
						serviceSessionId: sessionId
					}, function (resp) {
						var nowData = resp.data.entity;
						if (nowData.visitorUserWaitingNumber === 'no') {
							utils.addClass(doms.agentWaitNumber, 'hide');
						}
						else if (nowData.visitorUserWaitingTimestamp > prevTime) {
							prevTime = nowData.visitorUserWaitingTimestamp;
							utils.removeClass(doms.agentWaitNumber, 'hide');
							doms.agentWaitNumber.querySelector('label').innerHTML = nowData.visitorUserWaitingNumber;
						}
						else {}
					});
				}

				function _stop() {
					clearInterval(timer);
					prevTime = 0;
					isStarted = false;
					utils.addClass(doms.agentWaitNumber, 'hide');
				}
				return {
					start: _start,
					stop: _stop
				};
			}()),
			setAgentProfile: function (info) {
				var avatarImg = info.avatar
					? utils.getAvatarsFullPath(info.avatar, config.domain)
					: profile.tenantAvatar || profile.defaultAvatar;

				if (info.tenantName) {
					// 更新企业头像和名称
					doms.nickname.innerText = info.tenantName;
					doms.avatar.src = avatarImg;
				}
				else if (
					info.userNickname
					// 昵称启用
					&& config.nickNameOption
					// fake: 默认不显示调度员昵称
					&& '调度员' !== info.userNickname
				) {
					//更新坐席昵称
					doms.nickname.innerText = info.userNickname;
					if (avatarImg) {
						doms.avatar.src = avatarImg;
					}
				}

				// 缓存头像地址
				profile.currentAgentAvatar = avatarImg;
			},

			//close chat window
			close: function () {
				isChatWindowOpen = false;

				if (!config.hide) {
					utils.addClass(doms.imChat, 'hide');
					utils.removeClass(easemobim.imBtn, 'hide');
				}
			},
			//show chat window
			show: function () {
				var me = this;
				var currentMessageView = _getCurrentMessageView();

				isChatWindowOpen = true;
				utils.addClass(easemobim.imBtn, 'hide');
				utils.removeClass(doms.imChat, 'hide');
				if (
					config.isInOfficehours
					// IE 8 will throw an error when focus an invisible element
					&& doms.textInput.offsetHeight > 0
				) {
					doms.textInput.focus();
				}
				// 有可能在 messageView 未初始化时调用
				currentMessageView && currentMessageView.scrollToBottom();
				transfer.send({ event: _const.EVENTS.RECOVERY });
			},
			open: function () {
				var op = {
					user: config.user.username,
					appKey: config.appKey,
					apiUrl: location.protocol + '//' + config.restServer
				};

				if (config.user.token) {
					op.accessToken = config.user.token;
				}
				else {
					op.pwd = config.user.password;
				}

				conn.open(op);

				Modernizr.peerconnection
					&& config.grayList.audioVideo
					&& easemobim.videoChat.init(conn, channel.sendText, config);
			},
			soundReminder: function () {
				if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
					return;
				}

				var me = this;
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

				me.soundReminder = function () {
					if (!isSlienceEnable && (utils.isBrowserMinimized() || !isChatWindowOpen)) {
						play();
					}
				};
			},

			getCurrentMessageView: _getCurrentMessageView,
			messagePrompt: function (message) {
				if (utils.isTop) return;

				var me = this;
				var value = message.value;
				var tmpVal;
				var brief;
				var avatar = profile.ctaEnable
					? profile.currentOfficialAccount.img
					: profile.currentAgentAvatar;

				switch (message.type) {
				case 'txt':
				case 'list':
					tmpVal = typeof value === 'string'
						? value.replace(/\n/mg, '')
						: _.map(value, function(item){
							return item.type === 'emoji' ? '[表情]' : item.data;
						}).join('').replace(/\n/mg, '');
					brief = utils.getBrief(tmpVal, 15);
					break;
				case 'img':
					brief = '[图片]';
					break;
				case 'file':
					brief = '[文件]';
					break;
				default:
					brief = '';
				}

				if (isChatWindowOpen) {
					transfer.send({ event: _const.EVENTS.RECOVERY });
				}

				if (utils.isBrowserMinimized() || !isChatWindowOpen) {
					me.soundReminder();
					transfer.send({ event: _const.EVENTS.SLIDE });
					transfer.send({
						event: _const.EVENTS.NOTIFY,
						data: {
							avatar: avatar,
							title: '新消息',
							brief: brief
						}
					});
				}
			},
		};
	};
}(
	easemobim._const,
	easemobim.utils,
	easemobim.uikit,
	easemobim.api,
	easemobim.apiHelper,
	easemobim.satisfaction,
	app.createMessageView,
	app.profile
));

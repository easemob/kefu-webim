app.createMessageView = (function(_const, utils, uikit, apiHelper){
	var tpl = '<div class="chat-container"></div>';

	return function(opt){
		var parentContainer = opt.parentContainer;
		var isNewUser = opt.isNewUser;
		var channel = opt.channel;
		var officialAccountId = opt.id;
		var el = utils.createElementFromHTML(tpl);

		var currHistoryMsgSeqId = 0;
		var hasHistoryMessage;

		var msgTimeSpanBegin = new Date(2099, 0).getTime();
		var msgTimeSpanEnd = new Date(1970, 0).getTime();

		var recentMsg = [];

		parentContainer.appendChild(el);

		if (!isNewUser){
			// 拉取历史消息
			_getHistory(_scrollToBottom);

			// 初始化历史消息拉取
			_initHistoryPuller();
		}

		function _getRecentMsg(maxCount){
			return _.map(recentMsg.slice(0, maxCount), function(item){
				var type = item.msg.type;
				var date = utils.formatDate(item.date);
				var role = item.isReceived ? '客服坐席' : '访客';
				var value = item.msg.value;

				switch (type){
					case 'txt':
						break;
					case 'img':
						value = '[图片]';
						break;
					case 'file':
						value = '[文件]';
						break;
					case 'list':
						value = '[菜单]';
						break;
					default:
						value = '[未知消息类型]';
						break;
				}

				return '[' + date + '] ' + role + '\n' + value;
			}).join('\n');
		}

		function _appendEventMsg(msg) {
			_appendDate();
			// todo: xss defence
			utils.appendHTMLTo(el, [
				'<div class="em-widget-event">',
				'<span>' + msg + '</span>',
				'</div>'
			].join(''));
			_scrollToBottom();
		}

		function _appendMsg(msg, options){
			var opt = options || {};
			var isReceived = opt.isReceived;
			var isHistory = opt.isHistory;
			var date = opt.timestamp || _.now();
			var dom = app.genDomFromMsg(msg, isReceived, isHistory);
			var img = dom.querySelector('.em-widget-imgview');

			if (isHistory) {
				el.insertBefore(dom, el.firstChild);
				// 历史消息是向前插入，所以时间戳应在消息之后上屏
				_appendDate(date, isHistory);
			}
			else {
				// 时间戳上屏
				_appendDate(date, isHistory);

				if (img) {
					// 如果包含图片，则需要等待图片加载后再滚动消息
					el.appendChild(dom);
					_scrollToBottom();
					utils.one(img, 'load', function () {
						_scrollToBottom();
					});
				}
				else {
					// 非图片消息直接滚到底
					el.appendChild(dom);
					_scrollToBottom();
				}
			}
			// 缓存上屏的消息
			var msgData = {
				isReceived: isReceived,
				msg: msg,
				date: date
			};
			isHistory ? recentMsg.push(msgData) : recentMsg.unshift(msgData);
		}

		function _appendDate(timestamp, isHistory) {
			var dom = utils.createElementFromHTML([
				'<div class="em-widget-date">',
				'<span>' + utils.formatDate(date) + '</span>',
				'</div>'
			].join(''));
			var date = timestamp || _.now();

			if (isHistory) {
				msgTimeSpanBegin - date > _const.MESSAGE_TIME_SPAN_INTERVAL
					&& el.insertBefore(dom, el.firstChild);
			}
			else {
				date - msgTimeSpanEnd > _const.MESSAGE_TIME_SPAN_INTERVAL
					&& el.appendChild(dom);
			}

			// 更新时间范围
			date < msgTimeSpanBegin && (msgTimeSpanBegin = date);
			date > msgTimeSpanEnd && (msgTimeSpanEnd = date);
		}

		function _getHistory(callback){
			if (hasHistoryMessage === false) return;
			apiHelper.getOfficalAccountMessage(
				officialAccountId,
				currHistoryMsgSeqId
			).then(function(msgList){
				var length = msgList.length;
				var earliestMsg = msgList[length - 1] || {};
				var nextMsgSeq = earliestMsg.id;

				currHistoryMsgSeqId = nextMsgSeq;
				hasHistoryMessage = length === _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME && nextMsgSeq > 0;
				_.each(msgList, channel.handleHistoryMsg);
				typeof callback === 'function' && callback();
			});
		}

		function _initHistoryPuller(){
			var st;
			var _startY;
			var _y;

			if (utils.isMobile){
				// wap
				utils.live('div.em-widget-date', 'touchstart', function (ev) {
					_startY = utils.getDataByPath(ev, 'touches.0.pageY');
				});
				utils.live('div.em-widget-date', 'touchmove', function (ev) {
					_y = utils.getDataByPath(ev, 'touches.0.pageY');
					if (_y - _startY > 8 && this.getBoundingClientRect().top >= 0) {
						clearTimeout(st);
						st = setTimeout(function () {
							_getHistory();
						}, 100);
					}
				});
			}
			else {
				// pc端
				utils.on(parentContainer, 'mousewheel DOMMouseScroll', function (ev) {
					var that = this;

					if (ev.wheelDelta / 120 > 0 || ev.detail < 0) {
						clearTimeout(st);
						st = setTimeout(function () {
							if (that.getBoundingClientRect().top >= 0) {
								_getHistory();
							}
						}, 400);
					}
				});
			}
		}

		function _scrollToBottom(){
			parentContainer.scrollTop = parentContainer.scrollHeight - parentContainer.offsetHeight + 9999;
		}

		function _hide(){
			utils.addClass(el, 'hide');
		}

		function _show(){
			utils.removeClass(el, 'hide');
		}

		return {
			show: function(){
				_show();
				return this;
			},
			hide: function(){
				_hide();
				return this;
			},
			scrollToBottom: _scrollToBottom,
			appendMsg: _appendMsg,
			appendEventMsg: _appendEventMsg,
			getRecentMsg: _getRecentMsg,
			el: el
		};
	};
}(easemobim._const, easemobim.utils, app.uikit, app.apiHelper));

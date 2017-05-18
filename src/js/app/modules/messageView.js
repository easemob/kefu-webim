app.createMessageView = (function(utils, uikit, apiHelper){
	return function(opt){
		var parentContainer = opt.parentContainer;
		var isNewUser = opt.isNewUser;
		var chat = opt.chat;
		var el = utils.createElementFromHTML('<div class="chat-container"></div>');

		var currHistoryMsgSeqId = 0;
		var hasHistoryMessage;

		parentContainer.appendChild(el);

		if (!isNewUser){
			// 拉取历史消息
			_getHistory(_scrollToBottom);

			// 初始化历史消息拉取
			_initHistoryPuller();
		}

		function _getHistory(callback){
			if (hasHistoryMessage === false) return;
			apiHelper.getHistory(currHistoryMsgSeqId).then(function(msgList){
				var earliestMsg = msgList[msgList.length - 1] || {};
				var nextMsgSeq = earliestMsg.chatGroupSeqId - 1;

				currHistoryMsgSeqId = nextMsgSeq;
				hasHistoryMessage = nextMsgSeq > 0;
				_.each(msgList, chat.channel.handleHistoryMsg);
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
					var touch = ev.touches;

					if (ev.touches && ev.touches.length > 0) {
						_startY = touch[0].pageY;
					}
				});
				utils.live('div.em-widget-date', 'touchmove', function (ev) {
					var touch = ev.touches;

					if (ev.touches && ev.touches.length > 0) {
						_y = touch[0].pageY;
						if (_y - _startY > 8 && this.getBoundingClientRect().top >= 0) {
							clearTimeout(st);
							st = setTimeout(function () {
								_getHistory();
							}, 100);
						}
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
			el: el
		}
	}
}(easemobim.utils, easemobim.uikit, easemobim.apiHelper));

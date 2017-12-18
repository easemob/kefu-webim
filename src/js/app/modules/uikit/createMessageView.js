var utils = require("../../../common/utils");
var _const = require("../../../common/const");
var profile = require("../tools/profile");
var genDomFromMsg = require("../tools/messageFactory");
var eventListener = require("../tools/eventListener");
var apiHelper = require("../apiHelper");
var channel = require("../channel");

var tpl = require("raw-loader!../../../../template/chatContainer.html");

module.exports = function(opt){
	var officialAccount = opt.officialAccount;
	var parentContainer = opt.parentContainer;
	var el = utils.createElementFromHTML(_.template(tpl)({
		msg_in_loading: __("common.loading"),
		no_more_msg: __("common.no_more_msg"),
	}));
	var loadingMore = el.querySelector(".loading-tip");
	var noMoreMsg = el.querySelector(".no-more-msg");
	var currHistoryMsgSeqId = 0;
	var noMoreHistoryMessage;

	var msgTimeSpanBegin = new Date(2099, 0).getTime();
	var msgTimeSpanEnd = new Date(1970, 0).getTime();

	parentContainer.appendChild(el);
	eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_LIST_GOT, function(){
		var id = officialAccount.official_account_id;
		// 拉取历史消息
		_getHistory(_scrollToBottom);

		// 初始化历史消息拉取
		_initHistoryPuller();

		apiHelper.getLastSession(id).then(function(entity){
			officialAccount.agentId = entity.agent_id;
			officialAccount.sessionId = entity.session_id;
			officialAccount.sessionState = entity.state;
			officialAccount.agentType = entity.agent_type;
			officialAccount.skillGroupId = entity.skill_group_id;
			officialAccount.isSessionOpen = (
				entity.state === _const.SESSION_STATE.PROCESSING
				|| entity.state === _const.SESSION_STATE.WAIT
			);

			eventListener.excuteCallbacks(_const.SYSTEM_EVENT.SESSION_RESTORED, [officialAccount]);
		}, function(err){
			if(err === _const.ERROR_MSG.SESSION_DOES_NOT_EXIST){
				eventListener.excuteCallbacks(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, [officialAccount]);
			}
			else{
				throw err;
			}
		});
	});

	return {
		show: _show,
		hide: _hide,
		scrollToBottom: _scrollToBottom,
		appendMsg: _appendMsg,
		appendEventMsg: _appendEventMsg,
		el: el
	};

	function _appendEventMsg(msg){
		_appendDate();
		// todo: xss defence
		utils.appendHTMLTo(el, [
			"<div class=\"em-widget-event\">",
			"<span>" + msg + "</span>",
			"</div>"
		].join(""));
		_scrollToBottom();
	}

	function _appendMsg(msg, options){
		var opt = options || {};
		var isReceived = opt.isReceived;
		var isHistory = opt.isHistory;
		var date = opt.timestamp || _.now();
		var dom = genDomFromMsg(msg, isReceived, isHistory);
		var img = dom.querySelector(".em-widget-imgview");

		if(isHistory){
			el.insertBefore(dom, el.firstChild);
			// 历史消息是向前插入，所以时间戳应在消息之后上屏
			_appendDate(date, isHistory);
		}
		else{
			// 时间戳上屏
			_appendDate(date, isHistory);

			if(img){
				// 如果包含图片，则需要等待图片加载后再滚动消息
				el.appendChild(dom);
				_scrollToBottom();
				utils.one(img, "load", function(){
					_scrollToBottom();
				});
			}
			else{
				// 非图片消息直接滚到底
				el.appendChild(dom);
				_scrollToBottom();
			}
		}
	}

	function _appendDate(timestamp, isHistory){
		var dom = utils.createElementFromHTML([
			"<div class=\"em-widget-date\">",
			"<span>" + utils.formatDate(timestamp) + "</span>",
			"</div>"
		].join(""));
		var date = timestamp || _.now();

		if(isHistory){
			msgTimeSpanBegin - date > _const.MESSAGE_TIME_SPAN_INTERVAL
				&& el.insertBefore(dom, el.firstChild);
		}
		else{
			date - msgTimeSpanEnd > _const.MESSAGE_TIME_SPAN_INTERVAL
				&& el.appendChild(dom);
		}

		// 更新时间范围
		date < msgTimeSpanBegin && (msgTimeSpanBegin = date);
		date > msgTimeSpanEnd && (msgTimeSpanEnd = date);
	}

	function _getHistory(callback){
		if(noMoreHistoryMessage) return;
		utils.removeClass(loadingMore, "hide");
		apiHelper.getOfficalAccountMessage(
			officialAccount.official_account_id,
			currHistoryMsgSeqId
		).then(function(msgList){
			var length = msgList.length;
			var earliestMsg = msgList[length - 1] || {};
			var nextMsgSeq = earliestMsg.id;
			utils.addClass(loadingMore, "hide");
			currHistoryMsgSeqId = nextMsgSeq;
			noMoreHistoryMessage = length < _const.GET_HISTORY_MESSAGE_COUNT_EACH_TIME || nextMsgSeq <= 0;
			noMoreHistoryMessage && utils.removeClass(noMoreMsg, "hide");
			_.each(msgList, channel.handleHistoryMsg);
			typeof callback === "function" && callback();
		});
	}

	function _initHistoryPuller(){
		var st;
		var _startY;
		var _y;

		if(utils.isMobile){
			// wap
			utils.on(el, "touchstart", function(ev){
				_startY = utils.getDataByPath(ev, "changedTouches.0.pageY");
			});
			utils.on(el, "touchend", function(ev){
				_y = utils.getDataByPath(ev, "changedTouches.0.pageY");
				if(_y - _startY > 8 && this.getBoundingClientRect().top >= 0){
					clearTimeout(st);
					st = setTimeout(function(){
						_getHistory();
					}, 100);
				}
			});
		}
		else{
			// pc端
			utils.on(el, "mousewheel DOMMouseScroll", function(ev){
				if(officialAccount !== profile.currentOfficialAccount) return;
				var that = this;

				if(ev.wheelDelta / 120 > 0 || ev.detail < 0){
					clearTimeout(st);
					st = setTimeout(function(){
						if(that.getBoundingClientRect().top >= 0){
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
		utils.addClass(el, "hide");
	}

	function _show(){
		utils.removeClass(el, "hide");
	}
};

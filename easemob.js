window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

/** PrivateFunction: Array.prototype.indexOf
 *  Return the index of an object in an array.
 *
 *  This function is not supplied by some JavaScript implementations, so
 *  we provide it if it is missing.  This code is from:
 *  http://developer.mozilla.org/En/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
 *
 *  Parameters:
 *	(Object) elt - The object to look for.
 *	(Integer) from - The index from which to start looking. (optional).
 *
 *  Returns:
 *	The index of elt in the array or -1 if not found.
 */
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (elt /*, from*/ ) {
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) {
			from += len;
		}

		for (; from < len; from++) {
			if (from in this && this[from] === elt) {
				return from;
			}
		}

		return -1;
	};
}

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim */
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype.forEach) {

	Array.prototype.forEach = function (callback, thisArg) {

		var T, k;

		if (this === null) {
			throw new TypeError('this is null or not defined');
		}

		// 1. Let O be the result of calling toObject() passing the
		// |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get() internal
		// method of O with the argument "length".
		// 3. Let len be toUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If isCallable(callback) is false, throw a TypeError exception. 
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as
				// the this value and argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}

// reverted for backwards compatibility with ie8
// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function(global) {
	'use strict';
	if (!global.console) {
		global.console = {};
	}
	var con = global.console;
	var prop, method;
	var dummy = function() {};
	var properties = ['memory'];
	var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
		 'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
		 'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
	while (prop = properties.pop()) if (!con[prop]) con[prop] = {};
	while (method = methods.pop()) if (!con[method]) con[method] = dummy;
	// Using `this` for web workers & supports Browserify / Webpack.
})(typeof window === 'undefined' ? this : window);
(function () {
	window.easemobim = window.easemobim || {};

	var _isMobile = /mobile/i.test(navigator.userAgent);

	function _isNodeList(nodes) {
		var stringRepr = Object.prototype.toString.call(nodes);

		return typeof nodes === 'object'
			&& /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr)
			&& typeof nodes.length === 'number'
			&& (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
	}

	function _addClass(elem, className) {
		if (!_hasClass(elem, className)) {
			elem.className += ' ' + className;
		}
	}

	function _removeClass(elem, className) {
		if (_hasClass(elem, className)) {
			elem.className = (
				(' ' + elem.className + ' ')
				.replace(new RegExp(' ' + className + ' ', 'g'), ' ')
			).trim();
		}
	}

	function _hasClass(elem, className) {
		return !!~(' ' + elem.className + ' ').indexOf(' ' + className + ' ');
	}

	function _eachElement(elementOrNodeList, fn /* *arguments */ ) {
		if (typeof fn !== 'function') return;

		var nodeList = _isNodeList(elementOrNodeList) ? elementOrNodeList : [elementOrNodeList];
		var extraArgs = [];
		var i, l, tmpElem;

		// parse extra arguments
		for (i = 2, l = arguments.length; i < l; ++i) {
			extraArgs.push(arguments[i]);
		}

		for (i = 0, l = nodeList.length; i < l; ++i) {
			(tmpElem = nodeList[i])
			&& (tmpElem.nodeType === 1 || tmpElem.nodeType === 9 || tmpElem.nodeType === 11)
			&& fn.apply(null, [tmpElem].concat(extraArgs));
		}
	}

	function _bind(elem, evt, handler, isCapture) {
		if (elem.addEventListener) {
			elem.addEventListener(evt, handler, isCapture);
		}
		else if (elem.attachEvent) {
			// todo: add window.event to evt
			// todo: add srcElement
			// todo: remove this _event
			elem['_' + evt] = function () {
				handler.apply(elem, arguments);
			};
			elem.attachEvent('on' + evt, elem['_' + evt]);
		}
		else {
			elem['on' + evt] = handler;
		}
	}

	function _unbind(elem, evt, handler) {
		var keyName = '_' + evt;
		var eventName = 'on' + evt;

		if (elem.removeEventListener && handler) {
			elem.removeEventListener(evt, handler);
		}
		else if (elem.detachEvent) {
			elem.detachEvent(eventName, elem[keyName]);
			delete elem[keyName];
		}
		else {
			elem[eventName] = null;
		}
	}

	easemobim.utils = {
		isTop: true,
		isNodeList: _isNodeList,
		formatDate: function(d, format){
			var date = d ? new Date(d) : new Date();
			var fmt = format || 'M月d日 hh:mm';
			var o = {
				'M+': date.getMonth() + 1, //月份
				'd+': date.getDate(), //日
				'h+': date.getHours(), //小时
				'm+': date.getMinutes(), //分
				's+': date.getSeconds() //秒
			};

			if (/(y+)/.test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
			}

			for (var k in o) {
				if (new RegExp('(' + k + ')').test(fmt)) {
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? o[k] : (('00' + o[k]).substr(('' + o[k]).length)));
				}
			}
			return fmt;
		},
		filesizeFormat: function (filesize) {
			var UNIT_ARRAY = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
			var exponent;
			var result;

			if (filesize > 0) {
				exponent = Math.floor(Math.log(filesize) / Math.log(1024));
				result = (filesize / Math.pow(1024, exponent)).toFixed(2) + ' ' + UNIT_ARRAY[exponent];
			}
			else if (filesize === 0) {
				result = '0 B';
			}
			else {
				result = '';
			}
			return result;
		},
		uuid: function () {
			var s = [];
			var hexDigits = '0123456789abcdef';

			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}

			s[14] = '4';
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
			s[8] = s[13] = s[18] = s[23] = '-';

			return s.join('');
		},
		convertFalse: function (obj) {
			obj = typeof obj === 'undefined' ? '' : obj;
			return obj === 'false' ? false : obj;
		},
		$Remove: function (elem) {
			if (!elem) return;

			if (elem.remove) {
				elem.remove();
			}
			else if (elem.parentNode) {
				elem.parentNode.removeChild(elem);
			}
			else {}
		},
		live: function (selector, ev, handler, wrapper) {
			var me = this;
			var container = wrapper || document;
			me.on(container, ev, function (e) {
				var evt = e || window.event;
				var target = evt.target || evt.srcElement;
				var targetList = container.querySelectorAll(selector);
				var i, l;

				for (i = 0, l = targetList.length; i < l; ++i) {
					targetList[i] === target && handler.call(target, evt);
				}
			});
		},
		on: function (elementOrNodeList, event, handler, isCapture) {
			event.split(' ').forEach(function (evt) {
				evt && _eachElement(elementOrNodeList, _bind, evt, handler, isCapture);
			});
		},
		off: function (elementOrNodeList, event, handler) {
			event.split(' ').forEach(function (evt) {
				evt && _eachElement(elementOrNodeList, _unbind, evt, handler);
			});
		},
		one: function (element, ev, handler, isCapture) {
				if (!element || !ev) return;

				var tempFn = function () {
					handler.apply(this, arguments);
					_unbind(element, ev, tempFn);
				};
				_bind(element, ev, tempFn, isCapture);
			}
			// 触发事件，对于ie8只支持原生事件，不支持自定义事件
			,
		trigger: function (element, eventName) {
			if (document.createEvent) {
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent(eventName, true, false);
				element.dispatchEvent(ev);
			}
			else {
				element.fireEvent('on' + eventName);
			}
		},
		// todo： 去掉 使用 _.extend 替代
		extend: function (object, extend) {
			for (var o in extend) {
				if (extend.hasOwnProperty(o)) {
					var t = Object.prototype.toString.call(extend[o]);
					if (t === '[object Array]') {
						object[o] = [];
						this.extend(object[o], extend[o]);
					}
					else if (t === '[object Object]') {
						object[o] = {};
						this.extend(object[o], extend[o]);
					}
					else {
						object[o] = extend[o];
					}
				}
			}
			return object;
		},
		addClass: function (elementOrNodeList, className) {
			_eachElement(elementOrNodeList, _addClass, className);
			return elementOrNodeList;
		},
		removeClass: function (elementOrNodeList, className) {
			_eachElement(elementOrNodeList, _removeClass, className);
			return elementOrNodeList;
		},
		hasClass: function (elem, className) {
			if (!elem) return false;
			return _hasClass(elem, className);
		},
		toggleClass: function (element, className, stateValue) {
			if (!element || !className) return;

			var ifNeedAddClass = typeof stateValue === 'undefined'
				? !_hasClass(element, className)
				: stateValue;

			if (ifNeedAddClass) {
				_addClass(element, className);
			}
			else {
				_removeClass(element, className);
			}
		},
		getDataByPath: function (obj, path) {
			var propArray = path.split('.');
			var currentObj = obj;

			return seek();

			function seek() {
				var prop = propArray.shift();

				if (typeof prop !== 'string') {
					// path 遍历完了，返回当前值
					return currentObj;
				}
				else if (typeof currentObj === 'object' && currentObj !== null) {
					// 正常遍历path，递归调用
					currentObj = currentObj[prop];
					return seek();
				}
				else {
					// 没有找到path，返回undefined
					return;
				}
			}
		},
		query: function (key) {
			var reg = new RegExp('[?&]' + key + '=([^&]*)(?=&|$)');
			var matches = reg.exec(location.search);
			return matches ? matches[1] : '';
		},
		isAndroid: /android/i.test(navigator.useragent),
		isMobile: _isMobile,
		click: _isMobile && ('ontouchstart' in window) ? 'touchstart' : 'click',
		// detect if the browser is minimized
		isMin: function () {
			return document.visibilityState === 'hidden' || document.hidden;
		},
		setStore: function (key, value) {
			try {
				localStorage.setItem(key, value);
			}
			catch (e) {}
		},
		getStore: function (key) {
			try {
				return localStorage.getItem(key);
			}
			catch (e) {}
		},
		clearStore: function (key) {
			try {
				localStorage.removeItem(key);
			}
			catch (e) {}
		},
		clearAllStore: function () {
			try {
				localStorage.clear();
			}
			catch (e) {}
		},
		set: function (key, value, expiration) {
			var date = new Date();
			// 过期时间默认为30天
			var expiresTime = date.getTime() + (expiration || 30) * 24 * 3600 * 1000;
			date.setTime(expiresTime);
			document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';path=/;expires=' + date.toGMTString();
		},
		get: function (key) {
			var matches = document.cookie.match('(^|;) ?' + encodeURIComponent(key) + '=([^;]*)(;|$)');
			return matches ? decodeURIComponent(matches[2]) : '';
		},
		getAvatarsFullPath: function (url, domain) {
			if (!url) return;

			url = url.replace(/^(https?:)?\/\/?/, '');
			var isKefuAvatar = ~url.indexOf('img-cn');
			var ossImg = ~url.indexOf('ossimages');

			return isKefuAvatar && !ossImg ? domain + '/ossimages/' + url : '//' + url;
		},
		getConfig: function (key) { //get config from current script
			var src;
			var obj = {};
			var scripts = document.scripts;

			for (var s = 0, l = scripts.length; s < l; s++) {
				if (~scripts[s].src.indexOf('easemob.js')) {
					src = scripts[s].src;
					break;
				}
			}

			if (!src) {
				return { json: obj, domain: '' };
			}

			var tmp;
			var idx = src.indexOf('?');
			var sIdx = ~src.indexOf('//') ? src.indexOf('//') : 0;
			var domain = src.slice(sIdx, src.indexOf('/', sIdx + 2));
			var arr = src.slice(idx + 1).split('&');

			for (var i = 0, len = arr.length; i < len; i++) {
				tmp = arr[i].split('=');
				obj[tmp[0]] = tmp.length > 1 ? decodeURIComponent(tmp[1]) : '';
			}
			return { json: obj, domain: domain };
		},
		// 向url里边添加或更新query params
		updateAttribute: function (link, attr, path) {
			var url = link || location.protocol + path + '/im.html?tenantId=';

			for (var o in attr) {
				if (attr.hasOwnProperty(o) && typeof attr[o] !== 'undefined') {
					// 此处可能有坑
					if (~url.indexOf(o + '=')) {
						url = url.replace(new RegExp(o + '=[^&#?]*', 'gim'), o + '=' + (attr[o] !== '' ? attr[o] : ''));
					}
					else {
						url += '&' + o + '=' + (attr[o] !== '' ? attr[o] : '');
					}
				}
			}
			return url;
		},
		copy: function (obj) {
			// todo：移到，easemob.js 里边
			return this.extend({}, obj);
		},
		code: (function () {
			var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

			var obj = {
				/**
				 * Encodes a string in base64
				 *
				 * @param {String}
				 *			input The string to encode in base64.
				 */
				encode: function (input) {
					var output = "";
					var chr1, chr2, chr3;
					var enc1, enc2, enc3, enc4;
					var i = 0;

					do {
						chr1 = input.charCodeAt(i++);
						chr2 = input.charCodeAt(i++);
						chr3 = input.charCodeAt(i++);

						enc1 = chr1 >> 2;
						enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
						enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
						enc4 = chr3 & 63;

						if (isNaN(chr2)) {
							enc3 = enc4 = 64;
						}
						else if (isNaN(chr3)) {
							enc4 = 64;
						}

						output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
							+ keyStr.charAt(enc3) + keyStr.charAt(enc4);
					} while (i < input.length);

					return output;
				},

				/**
				 * Decodes a base64 string.
				 *
				 * @param {String}
				 *			input The string to decode.
				 */
				decode: function (input) {
					var output = "";
					var chr1, chr2, chr3;
					var enc1, enc2, enc3, enc4;
					var i = 0;

					// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
					input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

					do {
						enc1 = keyStr.indexOf(input.charAt(i++));
						enc2 = keyStr.indexOf(input.charAt(i++));
						enc3 = keyStr.indexOf(input.charAt(i++));
						enc4 = keyStr.indexOf(input.charAt(i++));

						chr1 = (enc1 << 2) | (enc2 >> 4);
						chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
						chr3 = ((enc3 & 3) << 6) | enc4;

						output = output + String.fromCharCode(chr1);

						if (enc3 != 64) {
							output = output + String.fromCharCode(chr2);
						}
						if (enc4 != 64) {
							output = output + String.fromCharCode(chr3);
						}
					} while (i < input.length);

					return output;
				}
			};

			return obj;
		})()
	};
}());

(function () {
	easemobim._const = {
		agentStatusText: {
			Idle: '(离线)',
			Online: '(空闲)',
			Busy: '(忙碌)',
			Leave: '(离开)',
			Hidden: '(隐身)',
			Offline: '(离线)',
			Logout: '(离线)',
			Other: ''
		},

		// todo: change the class name to icon-*
		// 坐席状态，dom上的className值
		agentStatusClassName: {
			Idle: 'online',
			Online: 'online',
			Busy: 'busy',
			Leave: 'leave',
			Hidden: 'hidden',
			Offline: 'offline',
			Logout: 'offline',
			Other: 'hide'
		},

		// todo: simplify this part
		eventMessageText: {
			TRANSFERING: '会话转接中，请稍候',
			TRANSFER: '会话已被转接至其他客服',
			LINKED: '会话已被客服接起',
			CLOSED: '会话已结束',
			NOTE: '当前暂无客服在线，请您留下联系方式，稍后我们将主动联系您',
			CREATE: '会话创建成功'
		},

		themeMap: {
			'天空之城': 'theme-1',
			'丛林物语': 'theme-2',
			'红瓦洋房': 'theme-3',
			'鲜美橙汁': 'theme-4',
			'青草田间': 'theme-5',
			'湖光山色': 'theme-6',
			'冷峻山峰': 'theme-7',
			'月色池塘': 'theme-8',
			'天籁湖光': 'theme-9',
			'商务风格': 'theme-10'
		},

		IM: {
			WEBIM_CONNCTION_OPEN_ERROR: 1,
			WEBIM_CONNCTION_AUTH_ERROR: 2,
			WEBIM_CONNCTION_AJAX_ERROR: 17,
			WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31
		},

		EVENTS: {
			NOTIFY: 'notify',
			RECOVERY: 'recoveryTitle',
			SHOW: 'showChat',
			CLOSE: 'closeChat',
			CACHEUSER: 'setUser',
			DRAGREADY: 'dragReady',
			DRAGEND: 'dragEnd',
			SLIDE: 'titleSlide',
			ONMESSAGE: 'onMessage',
			ONSESSIONCLOSED: 'onSessionClosed',
			EXT: 'ext',
			TEXTMSG: 'textmsg',
			ONREADY: 'onready',
			SET_ITEM: 'setItem',
			UPDATE_URL: 'updateURL',
			REQUIRE_URL: 'requireURL',
			INIT_CONFIG: 'initConfig'
		},

		//上传文件大小限制
		UPLOAD_FILESIZE_LIMIT: 1024 * 1024 * 10,

		// 超时未收到 kefu-ack 启用第二通道发消息
		FIRST_CHANNEL_MESSAGE_TIMEOUT: 10000,

		// 发送消息第二通道失败后，最多再试1次
		SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT: 1,

		// 如果im连接超时后启用第二通道
		FIRST_CHANNEL_CONNECTION_TIMEOUT: 20000,

		// IM心跳时间间隔
		HEART_BEAT_INTERVAL: 60000,

		// 第二通道收消息轮询时间间隔
		SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL: 60000,

		// 消息预知功能截断长度
		MESSAGE_PREDICT_MAX_LENGTH: 100,

		// 最大文本消息长度
		MAX_TEXT_MESSAGE_LENGTH: 1500,

		// 每次拉取历史消息条数
		GET_HISTORY_MESSAGE_COUNT_EACH_TIME: 10,

		for_block_only: null
	};
}());

window.easemobim = window.easemobim || {};
window.easemobIM = window.easemobIM || {};

easemobIM.Transfer = easemobim.Transfer = (function () {
	'use strict';

	var handleMsg = function (e, callback, accept) {
		// 微信调试工具会传入对象，导致解析出错
		if ('string' !== typeof e.data) return;
		var msg = JSON.parse(e.data);
		var i;
		var l;
		//兼容旧版的标志
		var flag = false;

		if (accept && accept.length) {
			for (i = 0, l = accept.length; i < l; i++) {
				if (msg.key === accept[i]) {
					flag = true;
					typeof callback === 'function' && callback(msg);
				}
			}
		}
		else {
			typeof callback === 'function' && callback(msg);
		}

		if (!flag && accept) {
			for (i = 0, l = accept.length; i < l; i++) {
				if (accept[i] === 'data') {
					typeof callback === 'function' && callback(msg);
					break;
				}
			}
		}
	};

	var Message = function (iframeId, key) {
		if (!(this instanceof Message)) {
			return new Message(iframeId);
		}
		this.key = key;
		this.iframe = document.getElementById(iframeId);
		this.origin = location.protocol + '//' + location.host;
	};

	Message.prototype.send = function (msg, to) {

		msg.origin = this.origin;

		msg.key = this.key;

		if (to) {
			msg.to = to;
		}

		msg = JSON.stringify(msg);

		if (this.iframe) {
			this.iframe.contentWindow.postMessage(msg, '*');
		}
		else {
			window.parent.postMessage(msg, '*');
		}
		return this;
	};

	Message.prototype.listen = function (callback, accept) {
		var me = this;

		if (window.addEventListener) {
			window.addEventListener('message', function (e) {
				handleMsg.call(me, e, callback, accept);
			}, false);
		}
		else if (window.attachEvent) {
			window.attachEvent('onmessage', function (e) {
				handleMsg.call(me, e, callback, accept);
			});
		}
		return this;
	};

	return Message;
}());

/**
 * 浏览器提示
 */
easemobim.notify = function () {
	var st = 0;

	easemobim.notify = function (img, title, content) {
		if (st !== 0) {
			return;
		}
		st = setTimeout(function () {
			st = 0;
		}, 3000);
		if (window.Notification) {
			if (Notification.permission === 'granted') {
				var notification = new Notification(
					title || '', {
						icon: img || '',
						body: content || ''
					}
				);
				notification.onclick = function () {
					if (typeof window.focus === 'function') {
						window.focus();
					}
					this.close();
					typeof easemobim.titleSlide === 'object' && easemobim.titleSlide.stop();
				};
				setTimeout(function () {
					notification.close();
				}, 3000);
			}
			else {
				Notification.requestPermission();
			}
		}
	};
};

/**
 * title滚动
 */
easemobim.titleSlide = function () {
	var newTitle = '新消息提醒';
	var titleST = 0;
	var originTitle = document.title;
	var tempArr = (originTitle + newTitle).split('');
	var word;

	easemobim.titleSlide = {
		stop: function () {
			clearInterval(titleST);
			titleST = 0;
			document.title = originTitle;
		},
		start: function () {
			if (titleST) {
				return;
			}
			titleST = setInterval(function () {
				word = tempArr.shift();
				document.title = word + Array.prototype.join.call(tempArr, '');
				tempArr.push(word);
			}, 360);
		}
	};
};

(function (utils, _const) {
	'use strict';

	var _st = 0;
	var _startPosition = {
		x: 0,
		y: 0
	};

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

		me.message = new easemobim.Transfer(me.iframe.id, 'easemob');

		me.iframe.style.display = 'block';

		me.config.hasReceiveCallback = typeof me.config.onmessage === 'function';
		me.onsessionclosedSt = 0, me.onreadySt = 0;
		me.config.parentId = me.iframe.id;

		me.message
			.send({ event: _const.EVENTS.INIT_CONFIG, data: me.config })
			.listen(function (msg) {
				if (msg.to !== me.iframe.id) { return; }

				switch (msg.event) {
				case _const.EVENTS.ONREADY: //onready
					if (typeof me.config.onready === 'function') {
						clearTimeout(me.onreadySt);
						me.onreadySt = setTimeout(function () {
							me.config.onready();
						}, 500);
					}
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
					typeof me.config.onmessage === 'function' && me.config.onmessage(msg.data);
					break;
				case _const.EVENTS.ONSESSIONCLOSED:
					// 结束会话回调，此功能文档中没有
					if (typeof me.config.onsessionclosed === 'function') {
						clearTimeout(me.onsessionclosedSt);
						me.onsessionclosedSt = setTimeout(function () {
							me.config.onsessionclosed();
						}, 500);
					}
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

/*
 * 环信移动客服WEB访客端插件接入js
 */

;
(function (window, undefined) {
	'use strict';
	var utils = easemobim.utils;
	easemobim.config = easemobim.config || {};
	easemobim.version = 'citic.43.15.12';
	easemobim.tenants = {};

	var DEFAULT_CONFIG = {
		tenantId: '',
		to: '',
		agentName: '',
		appKey: '',
		domain: '',
		path: '',
		ticket: true,
		staticPath: '',
		buttonText: '联系客服',
		dialogWidth: '360px',
		dialogHeight: '550px',
		dragenable: true,
		minimum: true,
		soundReminder: true,
		dialogPosition: { x: '10px', y: '10px' },
		user: {
			username: '',
			password: '',
			token: ''
		}
	};
	var config = utils.copy(DEFAULT_CONFIG);


	//get parameters from easemob.js
	var baseConfig = utils.getConfig();
	var _config = {};

	var iframe;

	//init title slide function
	easemobim.titleSlide();
	//init browser notify function
	easemobim.notify();

	reset();

	// growing io user id
	// 由于存在cookie跨域问题，所以从配置传过去
	easemobim.config.grUserId = utils.get('gr_user_id');


	//init _config & concat config and global easemobim.config
	function reset() {
		config = utils.copy(DEFAULT_CONFIG);
		utils.extend(config, easemobim.config);
		_config = utils.copy(config);

		var hide = utils.convertFalse(_config.hide) !== '' ? _config.hide : baseConfig.json.hide,
			resources = utils.convertFalse(_config.resources) !== '' ? _config.resources : baseConfig.json.resources,
			sat = utils.convertFalse(_config.satisfaction) !== '' ? _config.satisfaction : baseConfig.json.sat;

		_config.tenantId = _config.tenantId || baseConfig.json.tenantId;
		_config.hide = utils.convertFalse(hide);
		_config.resources = utils.convertFalse(resources);
		_config.satisfaction = utils.convertFalse(sat);
		_config.domain = _config.domain || baseConfig.domain;
		_config.path = _config.path || (baseConfig.domain + '/webim');
		_config.staticPath = _config.staticPath || (baseConfig.domain + '/webim/static');
	}

	/*
	 * @param: {String} 技能组名称，选填
	 * 兼容旧版接口，建议使用easemobim.bind方法
	 */
	window.easemobIM = function (group) {
		easemobim.bind({ emgroup: group });
	};
	window.easemobIMS = function (tenantId, group) {
		easemobim.bind({ tenantId: tenantId, emgroup: group });
	};

	/*
	 * @param: {Object} config
	 */
	easemobim.bind = function (config) {
		// 防止空参数调用异常
		config = config || {};
		config.emgroup = config.emgroup || easemobim.config.emgroup || '';

		var cacheKeyName = config.tenantId + config.emgroup;

		for (var i in easemobim.tenants) {
			if (easemobim.tenants.hasOwnProperty(i)) {
				easemobim.tenants[i].close();
			}
		}

		iframe = easemobim.tenants[cacheKeyName];

		if (iframe) {
			iframe.open();
		}
		else {
			reset();
			utils.extend(_config, config);

			if (!_config.tenantId) {
				console.warn('未指定tenantId!');
				return;
			}

			iframe = easemobim.Iframe(_config);
			easemobim.tenants[cacheKeyName] = iframe;
			iframe.set(_config, utils.isMobile ? null : iframe.open);
		}


		if (utils.isMobile) {
			var prefix = (_config.tenantId || '') + (_config.emgroup || '');

			//store ext
			if (_config.extMsg) {
				utils.setStore(prefix + 'ext', JSON.stringify(_config.extMsg));
			}

			//store visitor info 
			if (_config.visitor) {
				utils.setStore(prefix + 'visitor', JSON.stringify(_config.visitor));
			}

			// todo: make this part more readable
			var a = window.event.srcElement || window.event.target,
				counter = 5;

			while (a && a.nodeName !== 'A' && counter--) {
				a = a.parentNode;
			}

			if (!a || a.nodeName !== 'A') {
				return;
			}

			a.setAttribute('href', iframe.url);
			a.setAttribute('target', '_blank');

		}
	};

	//open api1: send custom extend message
	easemobim.sendExt = function (ext) {
		iframe.send({
			ext: ext
		});
	};

	//open api2: send text message
	/*
	 * @param: {object} 消息体
	 * {
	 *		data: "text msg",
	 *		ext: {}
	 * }
	 */

	easemobim.sendText = function (msg) {
		iframe && iframe.sendText(msg);
	};

	//auto load
	if (
		(!_config.hide || _config.autoConnect || _config.eventCollector)
		&& _config.tenantId
	) {
		var cacheKeyName = config.tenantId + (config.emgroup || '');

		iframe = easemobim.tenants[cacheKeyName] || easemobim.Iframe(_config);
		easemobim.tenants[cacheKeyName] = iframe;
		iframe.set(_config, iframe.close);
		// 访客上报用后失效
		easemobim.config.eventCollector = false;
	}

	//support cmd & amd
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = easemobim;
	}
	else if (typeof define === 'function' && (define.amd || define.cmd)) {
		define([], function () {
			return easemobim;
		});
	}
}(window, undefined));

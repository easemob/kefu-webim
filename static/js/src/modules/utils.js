;(function () {
	window.easemobim = window.easemobim || {};

	var _isAndroid = /android/i.test(navigator.useragent);
	var _isMobile = /mobile/i.test(navigator.userAgent);
	var _getIEVersion = (function () {
			var result, matches;

			matches = navigator.userAgent.match(/MSIE (\d+)/i);
			if(matches && matches[1]) {
				result = +matches[1];
			}
			else{
				result = 9999;
			}
			return result;
		}());

	easemobim.utils = {
		isTop: window.top === window.self
		, nodeListType: {
			'[object Object]': true,
			'[object NodeList]': true,
			'[object HTMLCollection]': true,
			'[object Array]': true
		}
		, isSupportWebRTC: !!(
			window.webkitRTCPeerConnection
			|| window.mozRTCPeerConnection
			|| window.RTCPeerConnection
		)
		, filesizeFormat: function(filesize){
			var UNIT_ARRAY = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'];
			var exponent;
			var result;

			if(filesize){
				exponent = Math.floor(Math.log(filesize) / Math.log(1024));
				result = (filesize / Math.pow(1024, exponent)).toFixed(2) + ' ' + UNIT_ARRAY[exponent];
			}
			else{
				result = '0 B';
			}
			return result;
		}
		, uuid: function () {
			var s = [], hexDigits = '0123456789abcdef';

			for ( var i = 0; i < 36; i++ ) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}

			s[14] = '4';
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
			s[8] = s[13] = s[18] = s[23] = '-';

			return s.join('');
		}
		, convertFalse: function ( obj ) {
			obj = typeof obj === 'undefined' ? '' : obj;
			return obj === 'false' ? false : obj;
		}
		, $Dom: function ( id ) {
			return document.getElementById(id);
		}
		, each: function ( obj, fn ) {
			for ( var i in obj ) {
				if ( obj.hasOwnProperty(i) ) {
					typeof fn === 'function' && fn(i, obj[i]);
				}
			}
		}
		, $Remove: function ( target ) {
			if (!target) return;

			if(target.remove){
				target.remove();
			}
			else if(target.parentNode){
				target.parentNode.removeChild(target);
			}
			else{}
		}
		, siblings: function ( currentNode, classFilter ) {
			if ( !currentNode || !currentNode.parentNode ) {
				return null;
			}
			var nodes = currentNode.parentNode.childNodes,
				result = [];

			for ( var d = 0, len = nodes.length; d < len; d++ ) {
				if ( nodes[d].nodeType === 1 && nodes[d] != currentNode ) {
					if ( classFilter && this.hasClass(nodes[d], classFilter) ) {
						result.push(nodes[d]);
					}
				}
			}
			return result;
		}
		, insertBefore: function ( parentNode, newDom, curDom ) {
			if ( parentNode && newDom ) {
				if ( parentNode.childNodes.length === 0 ) {
					parentNode.appendChild(newDom);
				} else {
					parentNode.insertBefore(newDom, curDom || null);
				}
			}
		}
		, getIEVersion: _getIEVersion
		, live: function ( target, ev, fn, wrapper ) {
			var me = this,
				el = wrapper || document;
			me.on(el, ev, function ( e ) {
				var ev = e || window.event,
					tar = ev.target || ev.srcElement,
					targetList = target.split('.').length < 2 ? el.getElementsByTagName(target) : me.$Class(target);

				if ( targetList.length ) {
					for ( var len = targetList.length, i = 0; i < len; i++ ) {
						if ( targetList[i] == tar || targetList[i] == tar.parentNode ) {
							fn.apply(targetList[i] == tar ? tar : tar.parentNode, arguments);
						}   
					}
				} else {
					if ( targetList == target ) {
						fn.apply( target, arguments );
					}
				}
			});
		}
		, on: (function () {
			var bind = function ( target, ev, fn, isCapture ) {
				if ( !ev ) { return false; }

				var evArr = ev.split(' ');

				for ( var i = 0, l = evArr.length; i < l; i++ ) {
					if ( target.addEventListener ) {
						target.addEventListener(evArr[i], fn, isCapture);
					} else if ( target.attachEvent ) {
						target['_' + evArr[i]] = function () {
							fn.apply(target, arguments);
						}
						target.attachEvent('on' + evArr[i], target['_' + evArr[i]]);
					} else {
						target['on' + evArr[i]] = fn;
					}
				}
			};
			return function ( target, ev, fn, isCapture ) {
				if ( Object.prototype.toString.call(target) in this.nodeListType && target.length ) {
					for ( var i = 0, l = target.length; i < l; i++ ) {
						target[i].nodeType === 1 && bind(target[i], ev, fn, isCapture);
					}
				} else {
					bind(target, ev, fn, isCapture);
				}
			};
		}())
		, remove: function ( target, ev, fn ) {
			if ( !target ) {
				return;
			}
			if ( target.removeEventListener ) {
				target.removeEventListener(ev, fn);
			} else if ( target.detachEvent ) {
				target.detachEvent('on' + ev, target['_' + ev]);
			} else {
				target['on' + ev] = null;
			}
		}
		, one: function ( target, ev, fn, isCapture ) {
			var me = this,
				tfn = function () {
					fn.apply(this, arguments);
					me.remove(target, ev, tfn);
				};
			me.on(target, ev, tfn, isCapture);  
		}
		// 触发事件，对于ie8只支持原生事件，不支持自定义事件
		, trigger: function(element, eventName){
			if (document.createEvent) {
				var ev = document.createEvent('HTMLEvents');
				ev.initEvent(eventName, true, false);
				element.dispatchEvent(ev);
			} else {
				element.fireEvent('on' + eventName);
			}
		}
		, extend: function ( object, extend ) {
			var tmp;
			for ( var o in extend ) {
				if ( extend.hasOwnProperty(o) ) {
					var t = Object.prototype.toString.call(extend[o]);
					if ( t === '[object Array]' ) {
						object[o] = [];
						this.extend(object[o], extend[o]);
					} else if ( t === '[object Object]' ) {
						object[o] = {};
						this.extend(object[o], extend[o]);
					} else {
						object[o] = extend[o];
					}
				}
			}
			return object;
		}
		, addClass: function ( target, className ) {
			var i, l;

			if (!target) { return; }

			if ( Object.prototype.toString.call(target) in this.nodeListType && target.length ) {
				for ( i = 0, l = target.length; i < l; i++ ) {
					if ( !this.hasClass(target[i], className) && typeof target[i].className !== 'undefined') {
						target[i].className += ' ' + className;
					}
				}
			} else {
				if ( !this.hasClass(target, className) ) {
					target.className += ' ' + className;
				}
			}
			return target;
		}
		, removeClass: function ( target, className ) {
			var i, l;

			if (!target) { return; }

			if (target.length && Object.prototype.toString.call(target) in this.nodeListType) {
				for ( i = 0, l = target.length; i < l; i++ ) {
					if ( typeof target[i].className !== 'undefined' && this.hasClass(target[i], className) ) {
						target[i].className = (
							(' ' + target[i].className + ' ')
								.replace(new RegExp(' ' + className + ' ', 'g'), ' ')
						).trim();
					}
				}
			} else {
				if ( typeof target.className !== 'undefined' && this.hasClass(target, className) ) {
					target.className = (
						(' ' + target.className + ' ')
							.replace(new RegExp(' ' + className + ' ', 'g'), ' ')
					).trim();
				}
			}
			return target;
		}
		, hasClass: function ( target, className ) {
			if (!target) { return false;}

			return !!~(' ' + target.className + ' ').indexOf(' ' + className + ' ');
		}
		, toggleClass: function(target, className, stateValue) {
			var ifNeedAddClass;

			if(!target || ! className) return;

			if(typeof stateValue !== 'undefined'){
				ifNeedAddClass = stateValue;
			}
			else{
				ifNeedAddClass = !this.hasClass(target, className);
			}

			if(ifNeedAddClass){
				this.addClass(target, className);
			}
			else{
				this.removeClass(target, className);
			}
		}
		, $Class: function ( DomDotClass, parentNode ) {
			var temp = DomDotClass.split('.'),
				tag = temp[0],
				className = temp[1];

			var parent = parentNode || document;
			if ( parent.getElementsByClassName ) {
				return parent.getElementsByClassName(className);
			} else {
				var tags = parent.getElementsByTagName(tag),
					arr = [];
				for ( var i = 0, l = tags.length; i < l; i++ ) {
					if ( this.hasClass(tags[i], className) ) {
						arr.push(tags[i]);
					}
				}
				tags = null;
				return arr;
			}
		}
		, html: function ( dom, html ) {
			if (!dom) return;

			if ( typeof html === 'undefined' ) {
				return dom.innerHTML;
			} else {
				dom.innerHTML = html;
			}
			return dom;
		}
		, encode: function ( str ) {
			if ( !str || str.length === 0 ) {
				return '';
			}
			var s = '';
			s = str.replace(/&amp;/g, "&");
			s = s.replace(/<(?=[^o][^)])/g, "&lt;");
			s = s.replace(/>/g, "&gt;");
			//s = s.replace(/\'/g, "&#39;");
			s = s.replace(/\"/g, "&quot;");
			return s;
		}
		, decode: function ( str ) {
			if ( !str || str.length === 0 ) {
				return '';
			}
			var s = '';
			s = str.replace(/&amp;/g, "&");
			s = s.replace(/&#39;/g, "'");
			s = s.replace(/&lt;o\)/g, "<o)");
			return s;
		}
		, query: function ( key ) {
			var reg = new RegExp('[?&]' + key + '=([^&]*)(?=&|$)');
			var matches = reg.exec(location.search);
			return matches ? matches[1] : '';
		}
		, isAndroid: _isAndroid
		, isMobile: _isMobile
		, click: _isMobile && ('ontouchstart' in window) ? 'touchstart' : 'click'
		, isQQBrowserInAndroid: _isAndroid && /MQQBrowser/.test(navigator.userAgent)
		// detect if the browser is minimized
		, isMin: function () {
			return document.visibilityState && document.visibilityState === 'hidden' || document.hidden;
		}
		, setStore: function ( key, value ) {
			try {
				localStorage.setItem(key, value);
			}
			catch (e){}
		}
		, getStore: function ( key ) {
			try {
				return localStorage.getItem(key);
			}
			catch (e){}
		}
		, clearStore: function ( key ) {
			try {
				localStorage.removeItem(key);
			} catch ( e ) {}
		}
		, clearAllStore: function () {
			try {
				localStorage.clear();
			} catch ( e ) {}
		}
		, set: function (key, value, expiration) {
			var date = new Date();
			// 过期时间默认为30天
			var expiresTime = date.getTime() + (expiration || 30) * 24 * 3600 * 1000;
			date.setTime(expiresTime);
			document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';path=/;expires=' + date.toGMTString();
		}
		, get: function (key) {
			var matches = document.cookie.match('(^|;) ?' + encodeURIComponent(key) + '=([^;]*)(;|$)');
			var results;
			if(matches){
				results = decodeURIComponent(matches[2]);
			}
			else {
				results = '';
			}
			return results;
		}
		, getAvatarsFullPath: function ( url, domain ) {
			var returnValue = null;

			if ( !url ) return returnValue;

			url = url.replace(/^(https?:)?\/\/?/, '');
			var isKefuAvatar = url.indexOf('img-cn') > 0 ? true : false;
			var ossImg = url.indexOf('ossimages') > 0 ? true : false;

			return isKefuAvatar && !ossImg ? domain + '/ossimages/' + url : '//' + url;
		}
		, getConfig: function ( key ) {//get config from current script
			var src;
			var obj = {};
			var scripts = document.scripts;

			for ( var s = 0, l = scripts.length; s < l; s++ ) {
				if (~scripts[s].src.indexOf('easemob.js')) {
					src = scripts[s].src;
					break;
				}
			}

			if ( !src ) {
				return {json: obj, domain: ''};
			}

			var tmp,
				idx = src.indexOf('?'),
				sIdx = ~src.indexOf('//') ? src.indexOf('//') : 0,
				domain = src.slice(sIdx, src.indexOf('/', sIdx + 2)),
				arr = src.slice(idx+1).split('&');
			
			for ( var i = 0, len = arr.length; i < len; i++ ) {
				tmp = arr[i].split('=');
				obj[tmp[0]] = tmp.length > 1 ? decodeURIComponent(tmp[1]) : '';
			}
			return {json: obj, domain: domain};
		}
		// 向url里边添加或更新query params
		, updateAttribute: function ( link, attr, path ) {
			var url = link || location.protocol + path + '/im.html?tenantId=';

			for ( var o in attr ) {
				if ( attr.hasOwnProperty(o) && typeof attr[o] !== 'undefined' ) {
					// 此处可能有坑
					if (~url.indexOf(o + '=')) {
						url = url.replace(new RegExp(o + '=[^&#?]*', 'gim'), o + '=' + (attr[o] !== '' ? attr[o] : ''));
					} else {
						url += '&' + o + '=' + (attr[o] !== '' ? attr[o] : '');
					}
				}
			}
			return url;
		},
		copy: function ( obj ) {
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
				encode : function ( input ) {
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

						if ( isNaN(chr2) ) {
							enc3 = enc4 = 64;
						} else if ( isNaN(chr3) ) {
							enc4 = 64;
						}

						output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
								+ keyStr.charAt(enc3) + keyStr.charAt(enc4);
					} while ( i < input.length );

					return output;
				},

				byteEncode : function ( bytes ) {
					var output = "";
					var chr1, chr2, chr3;
					var enc1, enc2, enc3, enc4;
					var i = 0;

					do {
						chr1 = bytes[i++];
						chr2 = bytes[i++];
						chr3 = bytes[i++];

						enc1 = chr1 >> 2;
						enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
						enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
						enc4 = chr3 & 63;

						if ( isNaN(chr2) ) {
							enc3 = enc4 = 64;
						} else if ( isNaN(chr3) ) {
							enc4 = 64;
						}

						output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
								+ keyStr.charAt(enc3) + keyStr.charAt(enc4);
					} while ( i < bytes.length );

					return output;
				},

				/**
				 * Decodes a base64 string.
				 *
				 * @param {String}
				 *			input The string to decode.
				 */
				decode : function ( input ) {
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

						if ( enc3 != 64 ) {
							output = output + String.fromCharCode(chr2);
						}
						if ( enc4 != 64 ) {
							output = output + String.fromCharCode(chr3);
						}
					} while ( i < input.length );

					return output;
				}
			};

			return obj;
		})()
	};
}());



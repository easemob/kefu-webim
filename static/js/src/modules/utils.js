/**
 * utils
 */
;(function () {
	window.easemobim = window.easemobim || {};

	var _isAndroid = /android/i.test(navigator.useragent),
		_ssl = location.protocol === 'https:',
		_protocol = _ssl ? 'https:' : 'http:',
		_isMobile = /mobile/i.test(navigator.userAgent),
		_getIEVersion = (function () {
			var ua = navigator.userAgent,matches,tridentMap={'4':8,'5':9,'6':10,'7':11};
			matches = ua.match(/MSIE (\d+)/i);
			if(matches&&matches[1]) {
				return +matches[1];
			}
			matches = ua.match(/Trident\/(\d+)/i);
			if(matches&&matches[1]) {
				return tridentMap[matches[1]]||null;
			}
			return 10000;
		}());
		

	easemobim.utils = {
        window: {
            width: document.body.clientWidth,
            height: document.body.clientHeight,
        }
		, ssl: _ssl
		, root: window.top == window
		, protocol: _protocol
		, nodeListType: {
			'[object Object]': 1,
			'[object NodeList]': 1,
			'[object HTMLCollection]': 1,
			'[object Array]': 1
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
			if ( target ) {
				if ( target.remove ) {
					target.remove();
				} else {
					var parentNode = target.parentNode;
					if ( parentNode ) {
						parentNode.removeChild(target);
					}
				}
			}
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
					} else {
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
			if ( !target ) {
				return;
			}
			if ( Object.prototype.toString.call(target) in this.nodeListType && target.length ) {
				for ( var i = 0, l = target.length; i < l; i++ ) {
					if ( !this.hasClass(target[i], className) ) {
						typeof target[i].className !== 'undefined' && (target[i].className += ' ' + className);
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
			if ( !target ) {
				return;
			}
			if ( Object.prototype.toString.call(target) in this.nodeListType && target.length ) {
				for ( var i = 0, l = target.length; i < l; i++ ) {
					while ( typeof target[i].className !== 'undefined' && target[i].className.indexOf(className) >= 0 ) {
						target[i].className = target[i].className.replace(className, '');
					}
				}
			} else {
				while ( target.className.indexOf(className) >= 0 ) {
					target.className = target.className.replace(className, '');
				}
			}
			return target;
		}
		, hasClass: function ( target, className ) {
			if ( !target || !target.className ) {
				return false;
			}
			
			var classArr = target.className.split(' ');
			for ( var i = 0, l = classArr.length; i < l; i++ ) {
				if ( classArr[i].indexOf(className) > -1 ) {
					return true;
				}
			}
			return false;
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
			if ( !dom ) {
				return;
			}
			if ( _getIEVersion && _getIEVersion < 9 && dom.nodeName === 'STYLE' ) {
				dom.styleSheet.cssText = html || '';
			} else {
				if ( typeof html === 'undefined' ) {
					return dom.innerHTML;
				} else {
					dom.innerHTML = html;
				}
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
			s = s.replace(/\n/g, "<br>");
			return s;
		}
		, decode: function ( str ) {
			if ( !str || str.length === 0 ) {
				return '';
			}
			var s = '';
			s = str.replace(/&amp;/g, "&");
			return s;
		}
		, query: function ( key ) {
			var r = location.href.match(new RegExp('[?&]?'+key+'=[0-9a-zA-Z@%._-]*[^&]', 'g'));
			r = r && r[0] ? (r[0][0]=='?' || r[0][0]=='&' ? r[0].slice(1) : r[0]) : '';
			return r.slice(key.length+1);
		}
		, isAndroid: _isAndroid
		, isMobile: _isMobile
		, click: _isMobile && ('ontouchstart' in window) ? 'touchstart' : 'click'
		, isQQBrowserInAndroid: _isAndroid && /MQQBrowser/.test(navigator.userAgent)
		, isQQBrowserInAndroid: function () {
			return this.isAndroid && /MQQBrowser/.test(navigator.userAgent);
		}
		, isMin: function () {//detect the browser if minimize
			if ( document.visibilityState && document.visibilityState === 'hidden' || document.hidden ) {
				return true;
			} else {
				return false;
			}
		}
        , setStore: function ( key, value ) {
            if ( typeof value === 'undefined' ) {
                return;
            }
            try {
                localStorage.setItem(key, value);
            } catch ( e ) {}
        }
        , getStore: function ( key ) {
            try {
                return localStorage.getItem(key);
            } catch ( e ) {}
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
		, set: function ( key, value, local ) {
			if ( local && 'localStorage' in window ) {
				localStorage.setItem(encodeURIComponent(key), encodeURIComponent(value));
			} else {
				var date = new Date();
				date.setTime(date.getTime() + 30*24*3600*1000);
				document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';path=/;expires=' + date.toGMTString();
			}
		}
		, get: function ( key, local ) {
			if ( local && 'localStorage' in window ) {
				var value = localStorage.getItem(encodeURIComponent(key));
				return value ? value : ''; 
			} else {
				var results = document.cookie.match('(^|;) ?' + encodeURIComponent(key) + '=([^;]*)(;|$)'); 
				return results ? decodeURIComponent(results[2]) : '';
			}
		}
		, getAvatarsFullPath: function ( url, domain ) {
			var returnValue = null;

			if ( !url ) return returnValue;

			url = url.replace(/^(https?:)?\/\/?/, '');
			var isKefuAvatar = url.indexOf('img-cn') > 0 ? true : false;
			var ossImg = url.indexOf('ossimages') > 0 ? true : false;

			return isKefuAvatar && !ossImg ? domain + '/ossimages/' + url : '//' + url;
		}
		, encode: function ( str, history ) {
			if ( !str || str.length === 0 ) return "";
			var s = '';
			s = str.replace(/&amp;/g, "&");
			s = s.replace(/<(?=[^o][^)])/g, "&lt;");
			s = s.replace(/>/g, "&gt;");
			//s = s.replace(/\'/g, "&#39;");
			s = s.replace(/\"/g, "&quot;");
			s = s.replace(/\n/g, "<br>");
			return s;
		}
		, decode: function ( str ) {
			if ( !str || str.length === 0 ) return "";
			var s = '';
			s = str.replace(/&amp;/g, "&");
			return s;
		}
		, convertFalse: function ( obj ) {
			obj = typeof obj === 'undefined' ? '' : obj;
			return obj === 'false' ? false : obj;
		}
		, queryString: function ( url, key ) {//queryString
			var r = url.match(new RegExp('[?&]?'+key+'=[0-9a-zA-Z%@._-]*[^&]', 'g'));
			r = r && r[0] ? (r[0][0]=='?' || r[0][0]=='&' ? r[0].slice(1) : r[0]) : '';

			return r.slice(key.length+1);
		}
		, getConfig: function ( key, searchScript ) {//get config from current script
			var that;

			if ( key && searchScript ) {
				var scripts = document.scripts;
				for ( var s = 0, l = scripts.length; s < l; s++ ) {
					if ( scripts[s].src && 0 < scripts[s].src.indexOf(key) ) {
						that = scripts[s].src;
						break;
					}
				}
			} else if ( key ) {
				that = key;
			} else {
				that = location.href;
			}

			var obj = {};
			if ( !that ) {
				return {
					str: ''
					, json: obj
					, domain: ''
				};
			}

			var tmp,
				idx = that.indexOf('?'),
				sIdx = that.indexOf('//') > -1 ? that.indexOf('//') : 0,
				domain = that.slice(sIdx, that.indexOf('/', sIdx + 2)),
				arr = that.slice(idx+1).split('&');
			
			obj.src = that.slice(0, idx);
			for ( var i = 0, len = arr.length; i < len; i++ ) {
				tmp = arr[i].split('=');
				obj[tmp[0]] = tmp.length > 1 ? decodeURIComponent(tmp[1]) : '';
			}
			return {
				str: that
				, json: obj
				, domain: domain
			};
		}
		, updateAttribute: function ( link, attr, path ) {
			var url = link || _protocol + path + '/im.html?tenantId=';

			for ( var o in attr ) {
				if ( attr.hasOwnProperty(o) && typeof attr[o] !== 'undefined' ) {
					if ( url.indexOf(o + '=') < 0 ) {
						url += '&' + o + '=' + (attr[o] !== '' ? attr[o] : '');
					} else {
						url = url.replace(new RegExp(o + '=[^&#?]*', 'gim'), o + '=' + (attr[o] !== '' ? attr[o] : ''));
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
                 *            input The string to encode in base64.
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
                 *            input The string to decode.
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



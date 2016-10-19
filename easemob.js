/**
 * utils
 */
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

			if ( target.remove ) {
				target.remove();
			} else {
				target.parentNode && parentNode.removeChild(target);
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
			var url = link || location.protocol + path + '/im.html?tenantId=';

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



window.easemobim = window.easemobim || {};
window.easemobIM = window.easemobIM || {};

easemobIM.Transfer = easemobim.Transfer = (function () {
	'use strict'
   
    var handleMsg = function ( e, callback, accept ) {
        if ( JSON && JSON.parse ) {
            var msg = e.data;
            msg = JSON.parse(msg);


            var flag = false;//兼容旧版的标志
            if ( accept && accept.length ) {
                for ( var i = 0, l = accept.length; i < l; i++ ) {
                    if ( msg.key === accept[i] ) {
                        flag = true;
                        typeof callback === 'function' && callback(msg);
                    }
                }
            } else {
                typeof callback === 'function' && callback(msg);
            }

            if ( !flag && accept ) {
                for ( var i = 0, l = accept.length; i < l; i++ ) {
                    if ( accept[i] === 'data' ) {
                        typeof callback === 'function' && callback(msg);
                        break;
                    }
                }
            }
        }
    };

    var Message = function ( iframeId, key ) {
        if ( !(this instanceof Message) ) {
             return new Message(iframeId);
        }
        this.key = key;
        this.iframe = document.getElementById(iframeId);
        this.origin = location.protocol + '//' + location.host;
    };

    Message.prototype.send = function ( msg, to ) {

        msg.origin = this.origin;

        msg.key = this.key;

        if ( to ) {
            msg.to = to;
        }

        msg = JSON.stringify(msg);

        if ( this.iframe ) {
            this.iframe.contentWindow.postMessage(msg, '*');
        } else {
            window.parent.postMessage(msg, '*');
        }
        return this;
    };

    Message.prototype.listen = function ( callback, accept ) {
		var me = this;

        if ( window.addEventListener ) {
            window.addEventListener('message', function ( e ) {
                handleMsg.call(me, e, callback, accept);
            }, false);
        } else if ( window.attachEvent ) {
            window.attachEvent('onmessage', function ( e ) {
                handleMsg.call(me, e, callback, accept);
            });
        }
        return this;
    };

    return Message;
}());

//事件
easemobim.EVENTS = {
	NOTIFY: {
		event: 'notify'
	},
	RECOVERY: {
		event: 'recoveryTitle'
	},
	SHOW: {
		event: 'showChat'
	},
    CLOSE: {
		event: 'closeChat'
	},
    CACHEUSER: {
		event: 'setUser'
	},
	DRAGREADY: {
		event: 'dragReady'
	},
	DRAGEND: {
		event: 'dragEnd'
	},
	SLIDE: {
		event: 'titleSlide'
	},
	ONMESSAGE: {
		event: 'onMessage'
	},
	ONSESSIONCLOSED: {
		event: 'onSessionClosed'
	},
	EXT: {
		event: 'ext'
	},
	TEXTMSG: {
		event: 'textmsg'
	},
	ONREADY: {
		event: 'onready'
	}
};

/**
 * 浏览器提示
 */
easemobim.notify = function () {
	var st = 0;

	easemobim.notify = function ( img, title, content ) {
		if ( st !== 0 ) {
			return;
		}
		st = setTimeout(function () {
			st = 0;
		}, 3000);
		img = img || '';
		title = title || '';
		content = content || '';
		try {
			if ( window.Notification ) {
				if ( Notification.permission === 'granted' ) {
					var notification = new Notification(
						title, {
							icon: img,
							body: content
						}
					);
					notification.onclick = function () {
						if ( typeof window.focus === 'function' ) {
							window.focus();
						}
						this.close();
						typeof easemobim.titleSlide === 'object' && easemobim.titleSlide.stop();
					};
					setTimeout(function () {
						notification.close();
					}, 3000);
				} else {
					Notification.requestPermission();
				}
			}
		} catch ( e ) {}
	};
};

/**
 * title滚动
 */
easemobim.titleSlide = function ( config ) {
	var newTitle = '新消息提醒',
		titleST = 0,
		originTitle = document.title,
		tempArr = (originTitle + newTitle).split(''),
		word;

	easemobim.titleSlide = {
		stop: function () {
			clearInterval(titleST);
			titleST = 0;
			document.title = originTitle;
		},
		start: function () {
			if ( titleST ) {
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

;(function () {
	'use strict'


	var _st = 0,
		_startPosition = {
			x: 0,
			y: 0
        };

    var _move = function ( ev ) {

        var me = this,
			e = window.event || ev,
            _width = document.documentElement.clientWidth,
            _height = document.documentElement.clientHeight,
            _x = _width - e.clientX - me.rect.width + _startPosition.x,
            _y = _height - e.clientY - me.rect.height + _startPosition.y;
        
        if ( e.clientX - _startPosition.x <= 0 ) {//left
            _x = _width - me.rect.width;
        } else if ( e.clientX + me.rect.width - _startPosition.x >= _width ) {//right
            _x = 0;
        }
        if ( e.clientY - _startPosition.y <= 0 ) {//top
            _y = _height - me.rect.height;
        } else if ( e.clientY + me.rect.height - _startPosition.y >= _height ) {//bottom
            _y = 0;
        }
        me.shadow.style.left = 'auto';
        me.shadow.style.top = 'auto';
        me.shadow.style.right = _x + 'px';
        me.shadow.style.bottom = _y + 'px';

        me.position = {
            x: _x
            , y: _y
        };
        
        clearTimeout(_st);
        _st = setTimeout(function () {
			_moveend.call(me);
		}, 500);
    };

    var _moveend = function () {
        easemobim.utils.remove(document, 'mousemove', this.moveEv);
        this.iframe.style.left = 'auto';
        this.iframe.style.top = 'auto';
        this.iframe.style.right = this.position.x + 'px';
        this.iframe.style.bottom = this.position.y + 'px';
        this.shadow.style.left = 'auto';
        this.shadow.style.top = 'auto';
        this.shadow.style.right = this.position.x + 'px';
        this.shadow.style.bottom = this.position.y + 'px';
        this.shadow.style.display = 'none';
        this.iframe.style.display = 'block';
    };
       
    var resize = function () {
		var me = this;

        easemobim.utils.on(window, 'resize', function () {
            if ( !me.rect || !me.rect.width ) {
                return;
            }

            var _width = document.documentElement.clientWidth,
                _height = document.documentElement.clientHeight,
                _right = Number(me.iframe.style.right.slice(0, -2)),
                _bottom = Number(me.iframe.style.bottom.slice(0, -2));
            
            //width
            if ( _width < me.rect.width ) {
                me.iframe.style.left = 'auto';
                me.iframe.style.right = 0;
                me.shadow.style.left = 'auto';
                me.shadow.style.right = 0;
            } else if ( _width - _right < me.rect.width ) {
                me.iframe.style.right = _width - me.rect.width + 'px';
                me.iframe.style.left = 0;
                me.shadow.style.right = _width - me.rect.width + 'px';
                me.shadow.style.left = 0;
            } else {
                me.iframe.style.left = 'auto';
                me.shadow.style.left = 'auto';
            }

            //height
            if ( _height < me.rect.height ) {
                me.iframe.style.top = 'auto';
                me.iframe.style.bottom = 0;
            } else if ( _height - _bottom < me.rect.height ) {
                me.iframe.style.bottom = _height - me.rect.height + 'px';
                me.iframe.style.top = 0;
            } else {
                me.iframe.style.top = 'auto';
            }
        });
    };

	var _ready = function () {
		var me = this;

		if ( me.config.dragenable ) {
			resize.call(me);
			easemobim.utils.on(me.shadow, 'mouseup', function () {
				_moveend.call(me);
			});
		}

		var me = this;
		me.message = new easemobim.Transfer(me.iframe.id, 'easemob');

		me.iframe.style.display = 'block';
		me.config.iframeId = me.iframe.id;

		me.config.receive = typeof me.config.onmessage === 'function';
		me.onsessionclosedSt = 0, me.onreadySt = 0;
        me.config.parentId = me.iframe.id;

		me.message
		.send(me.config)
		.listen(function ( msg ) {

            if ( msg.to !== me.iframe.id ) { return; }

			switch ( msg.event ) {
				case easemobim.EVENTS.ONREADY.event://onready
                    if ( typeof me.config.onready === 'function' ) {
						clearTimeout(me.onreadySt);
						me.onreadySt = setTimeout(function () {
							me.config.onready();
						}, 500);
					}
					break;
					me.config.onready instanceof Function && me.config.onready();
					break;
				case easemobim.EVENTS.SHOW.event://show Chat window
					me.open();
					break;
				case easemobim.EVENTS.CLOSE.event://close Chat window
					me.close();
					break;
				case easemobim.EVENTS.NOTIFY.event://notify
					easemobim.notify(msg.data.avatar, msg.data.title, msg.data.brief);;
					break;
				case easemobim.EVENTS.SLIDE.event://title slide
					easemobim.titleSlide.start();
					break;
				case easemobim.EVENTS.RECOVERY.event://title recovery 
					easemobim.titleSlide.stop();
					break;
				case easemobim.EVENTS.ONMESSAGE.event://onmessage callback
					typeof me.config.onmessage === 'function' && me.config.onmessage(msg.data);
					break;
				case easemobim.EVENTS.ONSESSIONCLOSED.event://onservicesessionclosed callback
					if ( typeof me.config.onsessionclosed === 'function' ) {
						clearTimeout(me.onsessionclosedSt);
						me.onsessionclosedSt = setTimeout(function () {
							me.config.onsessionclosed();
						}, 500);
					}
					break;
				case easemobim.EVENTS.CACHEUSER.event://cache username
					if ( !msg.data.username ) { break; }

					var groupKey = me.config.emgroup ? me.config.tenantId + me.config.emgroup : me.config.tenantId;
					if ( me.config.to ) {
						easemobim.utils.set(me.config.to + groupKey, msg.data.username);
					} else {
						easemobim.utils.set(groupKey, msg.data.username);
					}
					break;
				case easemobim.EVENTS.DRAGREADY.event:
					_startPosition.x = isNaN(Number(msg.data.x)) ? 0 : Number(msg.data.x);
					_startPosition.y = isNaN(Number(msg.data.y)) ? 0 : Number(msg.data.y);
					me.shadow.style.display = 'block';
					me.iframe.style.display = 'none';
					me.moveEv || (me.moveEv = function ( e ) {
						_move.call(me, e);
					});
					easemobim.utils.on(document, 'mousemove', me.moveEv);
					break;
				case easemobim.EVENTS.DRAGEND.event:
					_moveend.call(me);
					break;
				default: break;
			};
		}, ['main']);

		
		me.ready instanceof Function && me.ready();
	};








	var Iframe = function ( config, signleton ) {

		if ( !(this instanceof Iframe) ) {

			return new Iframe(config, signleton);
		} else if ( signleton && Iframe.iframe ) {

			Iframe.iframe.config = easemobim.utils.copy(config);

			return Iframe.iframe;
		}

		this.url = '';
		this.iframe = (/MSIE (6|7|8)/).test(navigator.userAgent)
			? document.createElement('<iframe name="' + new Date().getTime() + '">')
			: document.createElement('iframe');
		this.iframe.id = 'EasemobIframe' + new Date().getTime();
		this.iframe.name = new Date().getTime();
		this.iframe.style.cssText = 'width: 0;height: 0;border: none; position: fixed;';
		this.shadow = document.createElement('div');
		this.config = easemobim.utils.copy(config);

        this.show = false;

		if ( !easemobim.utils.isMobile ) {
            document.body.appendChild(this.shadow);
            document.body.appendChild(this.iframe);
        }

		var me = this;
		if ( me.iframe.readyState ) {
			me.iframe.onreadystatechange = function () {
				if ( this.readyState === 'loaded' || this.readyState === 'complete' ) {
					_ready.call(me);
				}
			};
		} else {
			me.iframe.onload = function () {
				_ready.call(me);
			};
		}

		Iframe.iframe = this;

		return this;
	};

	Iframe.prototype.set = function ( config, callback ) {

		this.config = easemobim.utils.copy(config || this.config);

        var destUrl = {
			tenantId: this.config.tenantId,
			hide: this.config.hide,
			sat: this.config.visitorSatisfactionEvaluate,
			wechatAuth: this.config.wechatAuth,
			hideKeyboard: this.config.hideKeyboard,
			resources: this.config.resources
        };
		this.config.emgroup && (destUrl.emgroup = this.config.emgroup);

		var user = this.config.user && this.config.user.username ? this.config.user.username : '';
		user && (destUrl.user = user);

		this.config.to && (destUrl.to = this.config.to);
		this.config.appKey && (destUrl.appKey = encodeURIComponent(this.config.appKey || ''));
		this.config.xmppServer && (destUrl.xmppServer = this.config.xmppServer);
		this.config.restServer && (destUrl.restServer = this.config.restServer);
		this.config.offDutyWord && (destUrl.offDutyWord = this.config.offDutyWord);
		this.config.offDutyType && (destUrl.offDutyType = this.config.offDutyType);
		this.config.language && (destUrl.language = this.config.language);
		typeof this.config.hideStatus !== 'undefined' && this.config.hideStatus !== '' && (destUrl.hideStatus = this.config.hideStatus);
		typeof this.config.ticket !== 'undefined' && this.config.ticket !== '' && (destUrl.ticket = this.config.ticket);
		typeof this.config.appid !== 'undefined' && this.config.appid !== '' && (destUrl.appid = this.config.appid);
		typeof this.config.originType !== 'undefined' && this.config.originType !== '' && (destUrl.originType = this.config.originType);
		this.config.agentName && (destUrl.agentName = this.config.agentName);


		this.url = easemobim.utils.updateAttribute(this.url, destUrl, config.path);


		if ( !this.config.user.username ) {
			var groupKey = this.config.emgroup ? this.config.tenantId + this.config.emgroup : this.config.tenantId;

			if ( this.config.to ) {
				this.config.user.username = easemobim.utils.get(this.config.to + groupKey);
			} else {
				this.config.user.username = easemobim.utils.get(groupKey);
			}
		}


		this.position = { x: this.config.dialogPosition.x.slice(0, -2), y: this.config.dialogPosition.y.slice(0, -2) };
		this.rect = { width: this.config.dialogWidth.slice(0, -2)/1, height: this.config.dialogHeight.slice(0, -2)/1 };
		this.iframe.frameBorder = 0;
		this.iframe.allowTransparency = 'true';

		this.iframe.style.cssText = [
			'z-index:16777269;',
			'overflow:hidden;',
			'position:fixed;',
			'bottom:10px;',
			'right:-5px;',
			'border:none;',
			'width:'			+ this.config.dialogWidth + ';',
			'height:0;',
			'display:none;',
			'transition:all .01s;'].join('');
		this.shadow.style.cssText = [
			'display:none;',
			'cursor:move;',
			'z-index:16777270;',
			'position:fixed;',
			'bottom:'			+ this.config.dialogPosition.y + ';',
			'right:'			+ this.config.dialogPosition.x + ';',
			'border:none;',
			'width:'			+ this.config.dialogWidth + ';',
			'height:'			+ this.config.dialogHeight + ';',
			'border-radius:4px;',
			'box-shadow: 0 4px 8px rgba(0,0,0,.2);',
			'border-radius: 4px;'].join('');

		this.shadow.style.background = 'url(' + location.protocol + this.config.staticPath + '/img/drag.png) no-repeat';
		this.shadow.style.backgroundSize = '100% 100%';

		if ( !this.config.hide ) {
			this.iframe.style.height = '37px';
			this.iframe.style.width = '104px';
		} else {
			this.iframe.style.height = '0';
			this.iframe.style.width = '0';
		}
		if ( easemobim.utils.isMobile ) {
			this.iframe.style.cssText += 'left:0;bottom:0';
			this.iframe.style.width = '100%';
			this.iframe.style.right = '0';

            var emconfig = {};
            emconfig.domain = this.config.domain;
            emconfig.path = this.config.path;
            emconfig.staticPath = this.config.staticPath;
			this.config.user && (emconfig.user = this.config.user);
			easemobim.utils.setStore('emconfig' + this.config.tenantId, easemobim.utils.code.encode(JSON.stringify(emconfig)));
		}

		this.iframe.src = this.url;
		this.ready = callback;
		
		return this;
	};

	Iframe.prototype.open = function () {
		var iframe = this.iframe;

        if ( this.show ) { return; }

        this.show = true;
		if ( easemobim.utils.isMobile ) {
			iframe.style.width = '100%';
			iframe.style.height = '100%';
			iframe.style.right = '0';
			iframe.style.bottom = '0';
			iframe.style.borderRadius = '0';
			iframe.style.cssText += 'box-shadow: none;';
		} else {
			iframe.style.width = this.config.dialogWidth;
			iframe.style.height = this.config.dialogHeight;
			iframe.style.visibility = 'visible';
			iframe.style.right = this.position.x + 'px';
			iframe.style.bottom = this.position.y + 'px';
			iframe.style.cssText += 'box-shadow: 0 4px 8px rgba(0,0,0,.2);border-radius: 4px;border: 1px solid #ccc\\9;';
		}
		iframe.style.visibility = 'visible';
		this.message && this.message.send(easemobim.EVENTS.SHOW);

		return this;
	};

	Iframe.prototype.close = function () {

		var iframe = this.iframe;

        if ( this.show === false ) { return; }

        this.show = false;

        clearTimeout(_st);
		iframe.style.boxShadow = 'none';
		iframe.style.borderRadius = '4px;';
		iframe.style.left = 'auto';
		iframe.style.top = 'auto';
		iframe.style.right = '-5px';
		iframe.style.bottom = '10px';
		iframe.style.border = 'none';
		if ( !this.config.hide ) {
			iframe.style.height = '37px';
			iframe.style.width = '104px';
		} else {
			iframe.style.visibility = 'hidden';
			iframe.style.width = '1px';
			iframe.style.height = '1px';
		}

		this.message && this.message.send(easemobim.EVENTS.CLOSE);
		return this;
	};

	Iframe.prototype.send = function ( ext ) {
		easemobim.EVENTS.EXT.data = ext;	
		this.message.send(easemobim.EVENTS.EXT);
	};

	Iframe.prototype.sendText = function ( msg ) {
		easemobim.EVENTS.TEXTMSG.data = msg;	
		this.message.send(easemobim.EVENTS.TEXTMSG);
	};

	window.easemobim = window.easemobim || {};
	easemobim.Iframe = Iframe;

}());

/*
 * 环信移动客服WEB访客端插件接入js
 */

;(function ( window, undefined ) {
    'use strict';
    window.easemobim = window.easemobim || {};
    easemobim.version = '43.9';
    easemobim.tenants = {};

	var CONF = {
		tenantId: '',
		to: '',
		agentName: '',
		appKey: '',
		domain: '',
		path: '',
        ticket: true,
		staticPath: '',
		buttonText: '联系客服',
		dialogWidth: '400px',
		dialogHeight: '500px',
		dragenable: true,
		minimum: true,
		soundReminder: true,
		dialogPosition: { x: '10px', y: '10px' },
		user: {
			username: '',
			password: '',
			token: ''
		}
	}, config = easemobim.utils.copy(CONF);


	//get parameters from easemob.js
    var baseConfig = easemobim.utils.getConfig('easemob.js', true),
		_config = {};


	//init _config & concat config and global easemobim.config
	var reset = function () {
		config = easemobim.utils.copy(CONF);
		easemobim.utils.extend(config, easemobim.config);
		_config = easemobim.utils.copy(config);

		var hide = easemobim.utils.convertFalse(_config.hide) !== '' ? _config.hide : baseConfig.json.hide,
			resources = easemobim.utils.convertFalse(_config.resources) !== '' ? _config.resources :  baseConfig.json.resources,
			sat = easemobim.utils.convertFalse(_config.satisfaction) !== '' ? _config.satisfaction :  baseConfig.json.sat;

		_config.tenantId = _config.tenantId || baseConfig.json.tenantId;
		_config.hide = easemobim.utils.convertFalse(hide);
		_config.resources = easemobim.utils.convertFalse(resources);
		_config.satisfaction = easemobim.utils.convertFalse(sat);
		_config.domain = _config.domain || baseConfig.domain;
		_config.path = _config.path || (baseConfig.domain + '/webim');
		_config.staticPath = _config.staticPath || (baseConfig.domain + '/webim/static');
	};

	reset();


	/*
	 * @param: {String} 技能组名称，选填
	 * 为兼容老版，建议使用easemobim.bind方法
	 */
	window.easemobIM = function ( group ) {
		easemobim.bind({ emgroup: group });
	};
	window.easemobIMS = function ( tenantId, group ) {
		easemobim.bind({ tenantId: tenantId, emgroup: group });
	};

    var iframe;

	/*
	 * @param: {Object} config
	 */
	easemobim.bind = function ( config ) {
		// 防止空参数调用异常
		config = config || {};
        config.emgroup = config.emgroup || '';

        for ( var i in easemobim.tenants ) {
            if ( easemobim.tenants.hasOwnProperty(i) ) {
                easemobim.tenants[i].close();
            }
        }

        iframe = easemobim.tenants[config.tenantId + config.emgroup];


        if ( iframe ) {
            iframe.open();
        } else {
            reset();
            easemobim.utils.extend(_config, config);

            if ( !_config.tenantId ) { return; }

            iframe = easemobim.Iframe(_config);
            easemobim.tenants[config.tenantId + config.emgroup] = iframe;
            iframe.set(_config, easemobim.utils.isMobile ? null : iframe.open);
        }


        //growingio
        var gr_user_id = easemobim.utils.get('gr_user_id');
        if ( gr_user_id ) {
            easemobim.utils.setStore(_config.tenantId + 'gr_user_id', gr_user_id);
        }

		if ( easemobim.utils.isMobile ) {

            //store ext
            if ( _config.extMsg ) {
                easemobim.utils.setStore(_config.tenantId + _config.emgroup + 'ext', JSON.stringify(_config.extMsg));
            }

            //store visitor info 
            if ( _config.visitor ) {
                easemobim.utils.setStore(_config.tenantId + _config.emgroup + 'visitor', JSON.stringify(_config.visitor));
            }


			var a = window.event.srcElement || window.event.target,
				counter = 5;

			while( a && a.nodeName !== 'A' && counter-- ) {
				a = a.parentNode;
			}

			if ( !a || a.nodeName !== 'A' ) {
				return;
			}

			a.setAttribute('href', iframe.url);
			a.setAttribute('target', '_blank');

		}
	};


	//init title slide function
	easemobim.titleSlide(_config);
	//init browser notify function
	easemobim.notify();


	//open api1: send custom extend message
	easemobim.sendExt = function ( ext ) {
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
	easemobim.sendText = function ( msg ) {
		iframe && iframe.sendText(msg);
	};

	//auto load
	if ( (!_config.hide || _config.autoConnect) && _config.tenantId ) {
        if ( !iframe ) {
            iframe = easemobim.Iframe(_config);
        }
		iframe.set(_config, iframe.close);
	}

    //support cmd & amd
    if ( typeof module === 'object' && typeof module.exports === 'object' ) {
         module.exports = easemobim;
     } else if ( typeof define === 'function' && (define.amd || define.cmd) ) {
         define([], function () {
             return easemobim;
         });
     }
}(window, undefined));

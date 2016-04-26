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
		ssl: _ssl
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
		, live: function ( target, ev, fn ) {
			var me = this;
			me.on(document, ev, function ( e ) {
				var ev = e || window.event,
					tar = ev.target || ev.srcElement,
					targetList = target.split('.').length < 2 ? document.getElementsByTagName(target) : me.$Class(target);

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
				tmp = this.convertFalse(extend[o]);
				if ( extend.hasOwnProperty(o) && (tmp || tmp === false) ) {
					object[o] = extend[o];
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
			var r = location.href.match(new RegExp('[?&]?'+key+'=[0-9a-zA-Z%._-]*[^&]', 'g'));
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

			return isKefuAvatar && !ossImg ? '//' + url : domain + '/' + url;
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
		, updateAttribute: function ( link, attr ) {
			var url = link || _protocol + easemobim.config.path + '?tenantId=';

			for ( var o in attr ) {
				if ( attr.hasOwnProperty(o) ) {
					if ( url.indexOf(o + '=') < 0 ) {
						url += '&' + o + '=' + attr[o];
					} else {
						url = url.replace(new RegExp(o + '=[^&#?]*', 'gim'), o + '=' + attr[o]);
					}
				}
			}
			return url;
		}
		, copy: function ( obj ) {
			var result = {};
			for ( var key in obj ) {
				if ( obj.hasOwnProperty(key) ) {
					result[key] = typeof obj[key] === 'object' ? this.copy(obj[key]) : obj[key];
				}
			} 
			return result; 
		}
	};
}());



window.easemobim = window.easemobim || {};

easemobim.Transfer = (function () {
	'use strict'
   
    var handleMsg = function ( e, callback ) {
        if ( JSON && JSON.parse ) {
            var msg = e.data;
            msg = JSON.parse(msg);
            typeof callback === 'function' && callback(msg);
        }
    };

    var Message = function ( iframeId ) {
        if ( !(this instanceof Message) ) {
             return new Message(iframeId);
        }
        this.iframe = document.getElementById(iframeId);
        this.origin = location.protocol + '//' + location.host;
    };

    Message.prototype.send = function ( msg ) {

        msg.origin = this.origin;
        msg = JSON.stringify(msg);

        if ( this.iframe ) {
            this.iframe.contentWindow.postMessage(msg, '*');
        } else {
            window.parent.postMessage(msg, '*');
        }
        return this;
    };

    Message.prototype.listen = function ( callback ) {
		var me = this;

        if ( window.addEventListener ) {
            window.addEventListener('message', function ( e ) {
                handleMsg.call(me, e, callback);
            }, false);
        } else if ( window.attachEvent ) {
            window.attachEvent('onmessage', function ( e ) {
                handleMsg.call(me, e, callback);
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
						easemobim.config.titleSlide && typeof easemobim.titleSlide === 'object' && easemobim.titleSlide.stop();
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
			if ( !config.titleSlide ) {
				return;
			}
			clearInterval(titleST);
			titleST = 0;
			document.title = originTitle;
		},
		start: function () {
			if ( !config.titleSlide || titleST ) {
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

		if ( !me.config.user.username ) {
			if ( me.config.to ) {
				me.config.user.username = easemobim.utils.get(me.config.to);
			} else {
				me.config.user.username = easemobim.utils.get(me.config.emgroup ? me.config.emgroup + me.config.tenantId : me.config.tenantId);
			}
		}

		if ( me.config.dragenable ) {
			resize.call(me);
			easemobim.utils.on(me.shadow, 'mouseup', function () {
				_moveend.call(me);
			});
		}

		var me = this;
		me.message = new easemobim.Transfer(me.iframe.id);

		me.iframe.style.display = 'block';
		me.config.iframeId = me.iframe.id;

		me.config.receive = typeof me.config.onmessage === 'function';

		me.message
		.send(me.config)
		.listen(function ( msg ) {
			if ( msg.iframeId && msg.iframeId !== me.iframe.id ) { return; }

			switch ( msg.event ) {
				case easemobim.EVENTS.SHOW.event://show Chat window
					me.open(msg.data.trigger);
					break;
				case easemobim.EVENTS.CLOSE.event://show Chat window
					me.close(msg.data.trigger);
					break;
				case easemobim.EVENTS.NOTIFY.event://notify
					easemobim.notify(msg.data.avatar, msg.data.title, msg.data.brief);;
					break;
				case easemobim.EVENTS.SLIDE.event://title slide
					me.config.titleSlide && easemobim.titleSlide.start();
					break;
				case easemobim.EVENTS.RECOVERY.event://title recovery 
					me.config.titleSlide && easemobim.titleSlide.stop();
					break;
				case easemobim.EVENTS.ONMESSAGE.event://onmessage callback
					typeof me.config.onmessage === 'function' && me.config.onmessage(msg.data);
					break;
				case easemobim.EVENTS.CACHEUSER.event://cache username
					if ( !msg.data.username ) { break; }
					if ( me.config.to ) {
						easemobim.utils.set(me.config.to, msg.data.username);
					} else {
						easemobim.utils.set(me.config.emgroup ? me.config.emgroup + me.config.tenantId : me.config.tenantId, msg.data.username);
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
		});

		
		me.ready instanceof Function && me.ready();
		me.config.onready instanceof Function && me.config.onready();
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
		this.iframe.style.cssText = 'width: 0;height: 0;border: none;';
		this.shadow = document.createElement('div');
		this.config = easemobim.utils.copy(config);

		document.body.appendChild(this.shadow);
		document.body.appendChild(this.iframe);

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

		this.position = { x: this.config.dialogPosition.x.slice(0, -2), y: this.config.dialogPosition.y.slice(0, -2) };
		this.rect = { width: this.config.dialogWidth.slice(0, -2)/1, height: this.config.dialogHeight.slice(0, -2)/1 };
		this.iframe.frameBorder = 0;
		this.iframe.allowTransparency = 'true';

		this.iframe.style.cssText = [
			'z-index:16777269;',
			'overflow:hidden;',
			'position:fixed;',
			'bottom:'			+ this.config.dialogPosition.y + ';',
			'right:'			+ Number(this.config.dialogPosition.x.slice(0, -2) - 15) + 'px;',
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

		this.shadow.style.background = 'url(' + easemobim.utils.protocol + this.config.staticPath + '/img/drag.png) no-repeat';
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
		}

		this.iframe.src = easemobim.utils.updateAttribute(this.url, {
			tenantId: this.config.tenantId,
			hide: this.config.hide,
			sat: this.config.visitorSatisfactionEvaluate,
			resources: this.config.resources,
			emgroup: this.config.emgroup || ''
		});

		this.ready = callback;
		return this;
	};

	Iframe.prototype.open = function ( trigger ) {
		var iframe = this.iframe;

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
		this.message && !trigger && this.message.send(easemobim.EVENTS.SHOW);

		return this;
	};

	Iframe.prototype.close = function ( trigger ) {

		var iframe = this.iframe;

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

		this.message && !trigger && this.message.send(easemobim.EVENTS.CLOSE);
		return this;
	};

	window.easemobim = window.easemobim || {};
	easemobim.Iframe = Iframe;

}());

/*
 * 两种接入方式：
 * 1.<script src='//kefu.easemob.com/webim/easemob.js?tenantId=10954&hide=false&sat=true'></script>线上引用的方式支持参数较少，请参考环信官网文档；
 * 2.<script src='//本地路径/easemob.js'></script>;详细配置参考demo.html
 */


;(function ( window, undefined ) {
    'use strict';

	var config = {
		tenantId: '',
		to: '',
		appKey: '',
		domain: '//kefu.easemob.com',
		path: '//kefu.easemob.com/webim/im.html',
		staticPath: '//kefu.easemob.com/webim/static',
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
	};


	//save global config
	easemobim.utils.extend(config, easemobim.config);


	//get parameters from easemob script
    var baseConfig = easemobim.utils.getConfig('easemob.js', true),
		iframe = easemobim.Iframe(easemobim.config, true);


	var init = function () {
		easemobim.config = easemobim.utils.copy(config);

		easemobim.config.tenantId = easemobim.config.tenantId || baseConfig.json.tenantId;
		easemobim.config.hide = easemobim.utils.convertFalse(easemobim.config.hide) !== '' ? easemobim.config.hide :  baseConfig.json.hide;
		easemobim.config.resources = easemobim.utils.convertFalse(easemobim.config.resources) !== '' ? easemobim.config.resources :  baseConfig.json.resources;
		easemobim.config.satisfaction = easemobim.utils.convertFalse(easemobim.config.satisfaction) !== '' ? easemobim.config.satisfaction :  baseConfig.json.sat;
	};
	



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


	/*
	 * @param: {Object} config
	 */
	easemobim.bind = function ( config ) {
		init();
		easemobim.utils.extend(easemobim.config, config);
		easemobim.config.emgroup = config.emgroup;

		if ( !easemobim.config.tenantId ) { return; }

		iframe.set(easemobim.config, iframe.open);
	};

	easemobim.titleSlide(easemobim.config);
	easemobim.notify();

	if ( !easemobim.config.hide && easemobim.config.tenantId ) {
		iframe.set(easemobim.config, iframe.close);
	}

}(window, undefined));

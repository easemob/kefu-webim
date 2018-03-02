

var _isMobile = /mobile/i.test(navigator.userAgent);
// var _isIE8 = /Trident\/4\.0/.test(navigator.userAgent);

function _isNodeList(nodes){
	var stringRepr = Object.prototype.toString.call(nodes);

	return typeof nodes === "object"
		&& /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr)
		&& typeof nodes.length === "number"
		&& (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
}

function _addClass(elem, className){
	if(!_hasClass(elem, className)){
		elem.className += " " + className;
	}
}

function _removeClass(elem, className){
	if(_hasClass(elem, className)){
		elem.className = (
			(" " + elem.className + " ")
			.replace(new RegExp(" " + className + " ", "g"), " ")
		).trim();
	}
}

function _hasClass(elem, className){
	return !!~(" " + elem.className + " ").indexOf(" " + className + " ");
}

function _eachElement(elementOrNodeList, fn /* *arguments */){
	if(typeof fn !== "function") return;

	var nodeList = _isNodeList(elementOrNodeList) ? elementOrNodeList : [elementOrNodeList];
	var extraArgs = [];
	var i, l, tmpElem;

	// parse extra arguments
	for(i = 2, l = arguments.length; i < l; ++i){
		extraArgs.push(arguments[i]);
	}

	for(i = 0, l = nodeList.length; i < l; ++i){
		(tmpElem = nodeList[i])
		&& fn.apply(null, [tmpElem].concat(extraArgs));
	}
}

function _bind(elem, evt, handler, isCapture){
	if(elem.addEventListener){
		elem.addEventListener(evt, handler, isCapture);
	}
	else if(elem.attachEvent){
		// todo: add window.event to evt
		// todo: add srcElement
		// todo: remove this _event
		elem["_" + evt] = function(){
			handler.apply(elem, arguments);
		};
		elem.attachEvent("on" + evt, elem["_" + evt]);
	}
	else{}
}

function _unbind(elem, evt, handler){
	var keyName = "_" + evt;
	var eventName = "on" + evt;

	if(elem.removeEventListener && handler){
		elem.removeEventListener(evt, handler);
	}
	else if(elem.detachEvent){
		elem.detachEvent(eventName, elem[keyName]);
		delete elem[keyName];
	}
	else{}
}

function _appendHtmlToElement(element, html){
	if(!element) return;

	var tmpDiv = document.createElement("div");
	var documentFragment = document.createDocumentFragment();
	var children;
	var el;

	tmpDiv.innerHTML = html;
	children = tmpDiv.childNodes;
	el = children[0];

	while(children.length > 0){
		documentFragment.appendChild(children[0]);
	}

	element.appendChild(documentFragment);
	return el;
}

module.exports = {
	isTop: window.top === window.self,
	isNodeList: _isNodeList,
	isAndroid: /android/i.test(navigator.userAgent),
	isQQBrowser: /MQQBrowser/i.test(navigator.userAgent),
	isIOS: /(iPad|iPhone|iPod)/i.test(navigator.userAgent),
	isMobile: _isMobile,
	click: _isMobile && ("ontouchstart" in window) ? "touchstart" : "click",
	isBrowserMinimized: function(){
		return document.visibilityState === "hidden" || document.hidden;
	},
	appendHTMLTo: _appendHtmlToElement,
	appendHTMLToBody: function(html){
		return _appendHtmlToElement(document.body, html);
	},
	createElementFromHTML: function(html){
		var tmpDiv = document.createElement("div");
		tmpDiv.innerHTML = html;
		return tmpDiv.childNodes[0];
	},
	getBrief: function(str, length){
		if(typeof str !== "string") return "";
		return str.length > length ? str.slice(0, length) + "..." : str;
	},
	formatDate: function(d, format){
		var date = d ? new Date(d) : new Date();
		var fmt = format || "M月d日 hh:mm";
		var o = {
			"M+": date.getMonth() + 1, // 月份
			"d+": date.getDate(), // 日
			"h+": date.getHours(), // 小时
			"m+": date.getMinutes(), // 分
			"s+": date.getSeconds() // 秒
		};

		if(/(y+)/.test(fmt)){
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}

		for(var k in o){
			if(new RegExp("(" + k + ")").test(fmt)){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? o[k] : (("00" + o[k]).substr(("" + o[k]).length)));
			}
		}
		return fmt;
	},
	filesizeFormat: function(filesize){
		var UNIT_ARRAY = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
		var exponent;
		var result;

		if(filesize > 0){
			exponent = Math.floor(Math.log(filesize) / Math.log(1024));
			result = (filesize / Math.pow(1024, exponent)).toFixed(2) + " " + UNIT_ARRAY[exponent];
		}
		else if(filesize === 0){
			result = "0 B";
		}
		else{
			result = "";
		}
		return result;
	},
	uuid: function(){
		var s = [];
		var hexDigits = "0123456789abcdef";

		for(var i = 0; i < 36; i++){
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}

		s[14] = "4";
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = "-";

		return s.join("");
	},
	convertFalse: function(obj){
		obj = typeof obj === "undefined" ? "" : obj;
		return obj === "false" ? false : obj;
	},
	removeDom: function(elem){
		if(!elem) return;

		if(elem.remove){
			elem.remove();
		}
		else if(elem.parentNode){
			elem.parentNode.removeChild(elem);
		}
		else{}
	},
	live: function(selector, ev, handler, wrapper){
		var me = this;
		var container = wrapper || document;
		me.on(container, ev, function(e){
			var evt = e || window.event;
			var target = evt.target || evt.srcElement;
			var parentOfTarget = target.parentNode;
			var targetList = container.querySelectorAll(selector);
			var i;
			var l;
			var currentElement;

			for(i = 0, l = targetList.length; i < l; ++i){
				currentElement = targetList[i];
				if(currentElement === target){
					handler.call(target, evt);
				}
				else if(currentElement === parentOfTarget){
					handler.call(parentOfTarget, evt);
				}
			}
		});
	},
	on: function(elementOrNodeList, event, handler, isCapture){
		event.split(" ").forEach(function(evt){
			evt && _eachElement(elementOrNodeList, _bind, evt, handler, isCapture);
		});
	},
	off: function(elementOrNodeList, event, handler){
		event.split(" ").forEach(function(evt){
			evt && _eachElement(elementOrNodeList, _unbind, evt, handler);
		});
	},
	one: function(element, ev, handler, isCapture){
		if(!element || !ev) return;

		var tempFn = function(){
			handler.apply(this, arguments);
			_unbind(element, ev, tempFn);
		};
		_bind(element, ev, tempFn, isCapture);
	},
	// 触发事件，对于ie8只支持原生事件，不支持自定义事件
	trigger: function(element, eventName){
		if(document.createEvent){
			var ev = document.createEvent("HTMLEvents");
			ev.initEvent(eventName, true, false);
			element.dispatchEvent(ev);
		}
		else{
			element.fireEvent("on" + eventName);
		}
	},
	// todo： 去掉 使用 _.extend 替代
	extend: function(object, extend){
		for(var key in extend){
			if(extend.hasOwnProperty(key)){
				var value = extend[key];
				var type = Object.prototype.toString.call(value);
				if(value === void 0){
					// patch ie8 will change undefined to {}
					object[key] = value;
				}
				else if(type === "[object Array]"){
					object[key] = [];
					this.extend(object[key], value);
				}
				else if(type === "[object Object]"){
					object[key] = {};
					this.extend(object[key], value);
				}
				else{
					object[key] = value;
				}
			}
		}
		return object;
	},
	addClass: function(elementOrNodeList, className){
		_eachElement(elementOrNodeList, _addClass, className);
		return elementOrNodeList;
	},
	removeClass: function(elementOrNodeList, className){
		_eachElement(elementOrNodeList, _removeClass, className);
		return elementOrNodeList;
	},
	hasClass: function(elem, className){
		if(!elem) return false;
		return _hasClass(elem, className);
	},
	toggleClass: function(element, className, stateValue){
		if(!element || !className) return;

		var ifNeedAddClass = typeof stateValue === "undefined"
			? !_hasClass(element, className)
			: stateValue;

		if(ifNeedAddClass){
			_addClass(element, className);
		}
		else{
			_removeClass(element, className);
		}
	},
	getDataByPath: function(obj, path){
		var propArray = path.split(".");
		var currentObj = obj;

		return seek();

		function seek(){
			var prop = propArray.shift();

			if(typeof prop !== "string"){
				// path 遍历完了，返回当前值
				return currentObj;
			}
			else if(typeof currentObj === "object" && currentObj !== null){
				// 正常遍历path，递归调用
				currentObj = currentObj[prop];
				return seek();
			}
			
			// 没有找到path，返回undefined
			return void 0;
			
		}
	},
	query: function(key){
		var reg = new RegExp("[?&]" + key + "=([^&]*)(?=&|$)");
		var matches = reg.exec(location.search);
		return matches ? matches[1] : "";
	},
	setStore: function(key, value){
		try{
			localStorage.setItem(key, value);
		}
		catch(e){}
	},
	getStore: function(key){
		try{
			return localStorage.getItem(key);
		}
		catch(e){}
	},
	clearStore: function(key){
		try{
			localStorage.removeItem(key);
		}
		catch(e){}
	},
	clearAllStore: function(){
		try{
			localStorage.clear();
		}
		catch(e){}
	},
	set: function(key, value, expiration){
		var date = new Date();
		// 过期时间默认为30天
		var expiresTime = date.getTime() + (expiration || 30) * 24 * 3600 * 1000;
		date.setTime(expiresTime);
		document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + ";path=/;expires=" + date.toGMTString();
	},
	get: function(key){
		var matches = document.cookie.match("(^|;) ?" + encodeURIComponent(key) + "=([^;]*)(;|$)");
		return matches ? decodeURIComponent(matches[2]) : "";
	},
	getAvatarsFullPath: function(url, domain){
		if(!url) return;

		url = url.replace(/^(https?:)?\/\/?/, "");
		var isKefuAvatar = ~url.indexOf("img-cn");
		var ossImg = ~url.indexOf("ossimages");

		return isKefuAvatar && !ossImg ? domain + "/ossimages/" + url : "//" + url;
	},
	copy: function(obj){
		// todo：移到，easemob.js 里边
		return this.extend({}, obj);
	}
};

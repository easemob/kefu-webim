var _isMobile = /mobile/i.test(navigator.userAgent);
// var _isIE8 = /Trident\/4\.0/.test(navigator.userAgent);

module.exports = {
	isTop: window.top === window.self,
	isAndroid: /android/i.test(navigator.userAgent),
	isQQBrowser: /MQQBrowser/i.test(navigator.userAgent),
	isIOS: /(iPad|iPhone|iPod)/i.test(navigator.userAgent),
	isSafari: /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent),
	isMobile: _isMobile,
	isBrowserMinimized: function(){
		return document.visibilityState === "hidden" || document.hidden;
	},

	getBrief: function(str, length){
		if(typeof str !== "string") return "";
		return str.length > length ? str.slice(0, length) + "..." : str;
	},

	formatDate: function(date){
		return moment(date || _.now()).format(__("config.message_timestamp_format"));
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
		var i;

		for(i = 0; i < 36; i++){
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
			return undefined;
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

	copy: function(obj){
		// todo：移到，easemob.js 里边
		return _.extend({}, obj);
	},

	getAvatarsFullPath: function(url, domain){
		// 以前头像上传到阿里云的oss，那时阿里云的oss不支持https
		// 此处的逻辑是检测到阿里云的地址如果没有使用ossimages代理则加个代理
		// todo: 现在已经不使用这种逻辑了，但是为了兼容老数据所以没删除
		// 让运维洗一下数据，这部分逻辑就可以去掉了

		if(!url) return;

		url = url.replace(/^(https?:)?\/\/?/, "");
		var isKefuAvatar = ~url.indexOf("img-cn");
		var ossImg = ~url.indexOf("ossimages");

		return isKefuAvatar && !ossImg ? domain + "/ossimages/" + url : "//" + url;
	},

	handleProtocol: function(val){
		return /(http:|https:)?(\/\/)/.test(val)
			? val
			: "//" + val;
	},

	mergePath: function(){
		var paths = Array.prototype.slice.apply(arguments);
		return paths.reduce(function(preResult, curElem){
			return preResult.replace(/\/*$/, "") + "/" + curElem.replace(/^\/*/, "");
		}, paths.shift());
	},

	sameProtocol: function(url){
		url = url || "";
		// 全清理
		url = url.replace(/^http[s]?:/, "");
		url = url.replace(/^\/\//, "");
		url = "//" + url;
		return url;
	},
};

/**
 * common
 */
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

Date.prototype.format = function ( fmt ) {
	var o = {
		'M+': this.getMonth() + 1,	//月份
		'd+': this.getDate(),		//日
		'h+': this.getHours(),		//小时
		'm+': this.getMinutes(),	//分
		's+': this.getSeconds()		//秒
	};

	if ( /(y+)/.test(fmt) ) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
	}

	for ( var k in o ) {
		if ( new RegExp('(' + k + ')').test(fmt) ) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? o[k] : (('00' + o[k]).substr(('' + o[k]).length)));
		}
	}
	return fmt;   
};

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
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(elt /*, from*/){
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
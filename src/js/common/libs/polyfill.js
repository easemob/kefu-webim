window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

/* jshint ignore:start */

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
	Array.prototype.indexOf = function(elt /* , from*/){
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if(from < 0){
			from += len;
		}

		for(; from < len; from++){
			if(from in this && this[from] === elt){
				return from;
			}
		}

		return -1;
	};
}

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim */
if(!String.prototype.trim){
	String.prototype.trim = function(){
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if(!Array.prototype.forEach){

	Array.prototype.forEach = function(callback, thisArg){

		var T, k;

		if(this === null){
			throw new TypeError("this is null or not defined");
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
		if(typeof callback !== "function"){
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if(arguments.length > 1){
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while(k < len){

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c
			// c. If kPresent is true, then
			if(k in O){

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
(function(global){

	if(!global.console){
		global.console = {};
	}
	var con = global.console;
	var prop, method;
	var dummy = function(){};
	var properties = ["memory"];
	var methods = ("assert,clear,count,debug,dir,dirxml,error,exception,group," +
		"groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd," +
		"show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn").split(",");
	while(prop = properties.pop())if(!con[prop]) con[prop] = {};
	while(method = methods.pop())if(!con[method]) con[method] = dummy;
	// Using `this` for web workers & supports Browserify / Webpack.
})(typeof window === "undefined" ? this : window);

/* jshint ignore:end */

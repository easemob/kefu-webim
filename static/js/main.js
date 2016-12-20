/** File: strophe.js
 *  A JavaScript library for XMPP BOSH/XMPP over Websocket.
 *
 *  This is the JavaScript version of the Strophe library.  Since JavaScript
 *  had no facilities for persistent TCP connections, this library uses
 *  Bidirectional-streams Over Synchronous HTTP (BOSH) to emulate
 *  a persistent, stateful, two-way connection to an XMPP server.  More
 *  information on BOSH can be found in XEP 124.
 *
 *  This version of Strophe also works with WebSockets.
 *  For more information on XMPP-over WebSocket see this RFC:
 *  http://tools.ietf.org/html/rfc7395
 */

/* All of the Strophe globals are defined in this special function below so
 * that references to the globals become closures.  This will ensure that
 * on page reload, these references will still be available to callbacks
 * that are still executing.
 */

/* jshint ignore:start */
(function (callback) {
/* jshint ignore:end */

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

(function (root, factory) {
	//if (typeof define === 'function' && define.amd) {
	if (false) {
		define('strophe-base64', function () {
			return factory();
		});
	} else {
		// Browser globals
		root.Base64 = factory();
	}
}(this, function () {
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	var obj = {
		/**
		 * Encodes a string in base64
		 * @param {String} input The string to encode in base64.
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
					enc2 = ((chr1 & 3) << 4);
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}

				output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
					keyStr.charAt(enc3) + keyStr.charAt(enc4);
			} while (i < input.length);

			return output;
		},

		/**
		 * Decodes a base64 string.
		 * @param {String} input The string to decode.
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
}));

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define */

/* Some functions and variables have been stripped for use with Strophe */

(function (root, factory) {
	//if (typeof define === 'function' && define.amd) {
	if (false) {
		define('strophe-sha1', function () {
			return factory();
		});
	} else {
		// Browser globals
		root.SHA1 = factory();
	}
}(this, function () {

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = new Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  var i, j, t, olda, oldb, oldc, oldd, olde;
  for (i = 0; i < x.length; i += 16)
  {
	olda = a;
	oldb = b;
	oldc = c;
	oldd = d;
	olde = e;

	for (j = 0; j < 80; j++)
	{
	  if (j < 16) { w[j] = x[i + j]; }
	  else { w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1); }
	  t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
					   safe_add(safe_add(e, w[j]), sha1_kt(j)));
	  e = d;
	  d = c;
	  c = rol(b, 30);
	  b = a;
	  a = t;
	}

	a = safe_add(a, olda);
	b = safe_add(b, oldb);
	c = safe_add(c, oldc);
	d = safe_add(d, oldd);
	e = safe_add(e, olde);
  }
  return [a, b, c, d, e];
}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if (t < 20) { return (b & c) | ((~b) & d); }
  if (t < 40) { return b ^ c ^ d; }
  if (t < 60) { return (b & c) | (b & d) | (c & d); }
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
		 (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if (bkey.length > 16) { bkey = core_sha1(bkey, key.length * 8); }

  var ipad = new Array(16), opad = new Array(16);
  for (var i = 0; i < 16; i++)
  {
	ipad[i] = bkey[i] ^ 0x36363636;
	opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * 8);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = [];
  var mask = 255;
  for (var i = 0; i < str.length * 8; i += 8)
  {
	bin[i>>5] |= (str.charCodeAt(i / 8) & mask) << (24 - i%32);
  }
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = 255;
  for (var i = 0; i < bin.length * 32; i += 8)
  {
	str += String.fromCharCode((bin[i>>5] >>> (24 - i%32)) & mask);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  var triplet, j;
  for (var i = 0; i < binarray.length * 4; i += 3)
  {
	triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16) |
			  (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 ) |
			   ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
	for (j = 0; j < 4; j++)
	{
	  if (i * 8 + j * 6 > binarray.length * 32) { str += "="; }
	  else { str += tab.charAt((triplet >> 6*(3-j)) & 0x3F); }
	}
  }
  return str;
}

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
return {
	b64_hmac_sha1:  function (key, data){ return binb2b64(core_hmac_sha1(key, data)); },
	b64_sha1:	   function (s) { return binb2b64(core_sha1(str2binb(s),s.length * 8)); },
	binb2str:	   binb2str,
	core_hmac_sha1: core_hmac_sha1,
	str_hmac_sha1:  function (key, data){ return binb2str(core_hmac_sha1(key, data)); },
	str_sha1:	   function (s) { return binb2str(core_sha1(str2binb(s),s.length * 8)); }
};
}));

/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*
 * Everything that isn't used by Strophe has been stripped here!
 */

(function (root, factory) {
	//if (typeof define === 'function' && define.amd) {
	if (false) {
		define('strophe-md5', function () {
			return factory();
		});
	} else {
		// Browser globals
		root.MD5 = factory();
	}
}(this, function (b) {
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	var safe_add = function (x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	};

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	var bit_rol = function (num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	};

	/*
	 * Convert a string to an array of little-endian words
	 */
	var str2binl = function (str) {
		var bin = [];
		for(var i = 0; i < str.length * 8; i += 8)
		{
			bin[i>>5] |= (str.charCodeAt(i / 8) & 255) << (i%32);
		}
		return bin;
	};

	/*
	 * Convert an array of little-endian words to a string
	 */
	var binl2str = function (bin) {
		var str = "";
		for(var i = 0; i < bin.length * 32; i += 8)
		{
			str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & 255);
		}
		return str;
	};

	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	var binl2hex = function (binarray) {
		var hex_tab = "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++)
		{
			str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
				hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
		}
		return str;
	};

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	var md5_cmn = function (q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q),safe_add(x, t)), s),b);
	};

	var md5_ff = function (a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	};

	var md5_gg = function (a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	};

	var md5_hh = function (a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	};

	var md5_ii = function (a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	};

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	var core_md5 = function (x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << ((len) % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var a =  1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d =  271733878;

		var olda, oldb, oldc, oldd;
		for (var i = 0; i < x.length; i += 16)
		{
			olda = a;
			oldb = b;
			oldc = c;
			oldd = d;

			a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
			d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
			b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
			d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
			c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
			d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
			d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

			a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
			d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
			c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
			b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
			d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
			c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
			d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
			c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
			a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
			d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
			c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
			b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
			d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
			b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
			d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
			c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
			d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
			a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
			d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
			b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
			d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
			c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
			d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
			d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
			a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
			d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
			b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return [a, b, c, d];
	};

	var obj = {
		/*
		 * These are the functions you'll usually want to call.
		 * They take string arguments and return either hex or base-64 encoded
		 * strings.
		 */
		hexdigest: function (s) {
			return binl2hex(core_md5(str2binl(s), s.length * 8));
		},

		hash: function (s) {
			return binl2str(core_md5(str2binl(s), s.length * 8));
		}
	};
	return obj;
}));

/*
	This program is distributed under the terms of the MIT license.
	Please see the LICENSE file for details.

	Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */

/** PrivateFunction: Function.prototype.bind
 *  Bind a function to an instance.
 *
 *  This Function object extension method creates a bound method similar
 *  to those in Python.  This means that the 'this' object will point
 *  to the instance you want.  See
 *  <a href='https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind'>MDC's bind() documentation</a> and
 *  <a href='http://benjamin.smedbergs.us/blog/2007-01-03/bound-functions-and-function-imports-in-javascript/'>Bound Functions and Function Imports in JavaScript</a>
 *  for a complete explanation.
 *
 *  This extension already exists in some browsers (namely, Firefox 3), but
 *  we provide it to support those that don't.
 *
 *  Parameters:
 *	(Object) obj - The object that will become 'this' in the bound function.
 *	(Object) argN - An option argument that will be prepended to the
 *	  arguments given for the function call
 *
 *  Returns:
 *	The bound function.
 */
if (!Function.prototype.stropheBind) {
	Function.prototype.stropheBind = function (obj /*, arg1, arg2, ... */)
	{
		var func = this;
		var _slice = Array.prototype.slice;
		var _concat = Array.prototype.concat;
		var _args = _slice.call(arguments, 1);

		return function () {
			return func.apply(obj ? obj : this,
							  _concat.call(_args,
										   _slice.call(arguments, 0)));
		};
	};
}

/** PrivateFunction: Array.isArray
 *  This is a polyfill for the ES5 Array.isArray method.
 */
if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

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
if (!Array.prototype.indexOf)
	{
		Array.prototype.indexOf = function(elt /*, from*/)
		{
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

/*
	This program is distributed under the terms of the MIT license.
	Please see the LICENSE file for details.

	Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/*global define, document, window, setTimeout, clearTimeout, console, ActiveXObject, DOMParser */

(function (root, factory) {
	//if (typeof define === 'function' && define.amd) {
	if (false) {
		define('strophe-core', [
			'strophe-sha1',
			'strophe-base64',
			'strophe-md5',
			"strophe-polyfill"
		], function () {
			return factory.apply(this, arguments);
		});
	} else {
		// Browser globals
		var o = factory(root.SHA1, root.Base64, root.MD5);
		window.Strophe =		o.Strophe;
		window.$build =		 o.$build;
		window.$iq =			o.$iq;
		window.$msg =		   o.$msg;
		window.$pres =		  o.$pres;
		window.SHA1 =		   o.SHA1;
		window.Base64 =		 o.Base64;
		window.MD5 =			o.MD5;
		window.b64_hmac_sha1 =  o.SHA1.b64_hmac_sha1;
		window.b64_sha1 =	   o.SHA1.b64_sha1;
		window.str_hmac_sha1 =  o.SHA1.str_hmac_sha1;
		window.str_sha1 =	   o.SHA1.str_sha1;
	}
}(this, function (SHA1, Base64, MD5) {

var Strophe;

/** Function: $build
 *  Create a Strophe.Builder.
 *  This is an alias for 'new Strophe.Builder(name, attrs)'.
 *
 *  Parameters:
 *	(String) name - The root element name.
 *	(Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *	A new Strophe.Builder object.
 */
function $build(name, attrs) { return new Strophe.Builder(name, attrs); }

/** Function: $msg
 *  Create a Strophe.Builder with a <message/> element as the root.
 *
 *  Parmaeters:
 *	(Object) attrs - The <message/> element attributes in object notation.
 *
 *  Returns:
 *	A new Strophe.Builder object.
 */
function $msg(attrs) { return new Strophe.Builder("message", attrs); }

/** Function: $iq
 *  Create a Strophe.Builder with an <iq/> element as the root.
 *
 *  Parameters:
 *	(Object) attrs - The <iq/> element attributes in object notation.
 *
 *  Returns:
 *	A new Strophe.Builder object.
 */
function $iq(attrs) { return new Strophe.Builder("iq", attrs); }

/** Function: $pres
 *  Create a Strophe.Builder with a <presence/> element as the root.
 *
 *  Parameters:
 *	(Object) attrs - The <presence/> element attributes in object notation.
 *
 *  Returns:
 *	A new Strophe.Builder object.
 */
function $pres(attrs) { return new Strophe.Builder("presence", attrs); }

/** Class: Strophe
 *  An object container for all Strophe library functions.
 *
 *  This class is just a container for all the objects and constants
 *  used in the library.  It is not meant to be instantiated, but to
 *  provide a namespace for library objects, constants, and functions.
 */
Strophe = {
	/** Constant: VERSION
	 *  The version of the Strophe library. Unreleased builds will have
	 *  a version of head-HASH where HASH is a partial revision.
	 */
	VERSION: "1.2.2",

	/** Constants: XMPP Namespace Constants
	 *  Common namespace constants from the XMPP RFCs and XEPs.
	 *
	 *  NS.HTTPBIND - HTTP BIND namespace from XEP 124.
	 *  NS.BOSH - BOSH namespace from XEP 206.
	 *  NS.CLIENT - Main XMPP client namespace.
	 *  NS.AUTH - Legacy authentication namespace.
	 *  NS.ROSTER - Roster operations namespace.
	 *  NS.PROFILE - Profile namespace.
	 *  NS.DISCO_INFO - Service discovery info namespace from XEP 30.
	 *  NS.DISCO_ITEMS - Service discovery items namespace from XEP 30.
	 *  NS.MUC - Multi-User Chat namespace from XEP 45.
	 *  NS.SASL - XMPP SASL namespace from RFC 3920.
	 *  NS.STREAM - XMPP Streams namespace from RFC 3920.
	 *  NS.BIND - XMPP Binding namespace from RFC 3920.
	 *  NS.SESSION - XMPP Session namespace from RFC 3920.
	 *  NS.XHTML_IM - XHTML-IM namespace from XEP 71.
	 *  NS.XHTML - XHTML body namespace from XEP 71.
	 */
	NS: {
		HTTPBIND: "http://jabber.org/protocol/httpbind",
		BOSH: "urn:xmpp:xbosh",
		CLIENT: "jabber:client",
		AUTH: "jabber:iq:auth",
		ROSTER: "jabber:iq:roster",
		PROFILE: "jabber:iq:profile",
		DISCO_INFO: "http://jabber.org/protocol/disco#info",
		DISCO_ITEMS: "http://jabber.org/protocol/disco#items",
		MUC: "http://jabber.org/protocol/muc",
		SASL: "urn:ietf:params:xml:ns:xmpp-sasl",
		STREAM: "http://etherx.jabber.org/streams",
		FRAMING: "urn:ietf:params:xml:ns:xmpp-framing",
		BIND: "urn:ietf:params:xml:ns:xmpp-bind",
		SESSION: "urn:ietf:params:xml:ns:xmpp-session",
		VERSION: "jabber:iq:version",
		STANZAS: "urn:ietf:params:xml:ns:xmpp-stanzas",
		XHTML_IM: "http://jabber.org/protocol/xhtml-im",
		XHTML: "http://www.w3.org/1999/xhtml"
	},


	/** Constants: XHTML_IM Namespace
	 *  contains allowed tags, tag attributes, and css properties.
	 *  Used in the createHtml function to filter incoming html into the allowed XHTML-IM subset.
	 *  See http://xmpp.org/extensions/xep-0071.html#profile-summary for the list of recommended
	 *  allowed tags and their attributes.
	 */
	XHTML: {
				tags: ['a','blockquote','br','cite','em','img','li','ol','p','span','strong','ul','body'],
				attributes: {
						'a':		  ['href'],
						'blockquote': ['style'],
						'br':		 [],
						'cite':	   ['style'],
						'em':		 [],
						'img':		['src', 'alt', 'style', 'height', 'width'],
						'li':		 ['style'],
						'ol':		 ['style'],
						'p':		  ['style'],
						'span':	   ['style'],
						'strong':	 [],
						'ul':		 ['style'],
						'body':	   []
				},
				css: ['background-color','color','font-family','font-size','font-style','font-weight','margin-left','margin-right','text-align','text-decoration'],
				/** Function: XHTML.validTag
				 *
				 * Utility method to determine whether a tag is allowed
				 * in the XHTML_IM namespace.
				 *
				 * XHTML tag names are case sensitive and must be lower case.
				 */
				validTag: function(tag) {
						for (var i = 0; i < Strophe.XHTML.tags.length; i++) {
								if (tag == Strophe.XHTML.tags[i]) {
										return true;
								}
						}
						return false;
				},
				/** Function: XHTML.validAttribute
				 *
				 * Utility method to determine whether an attribute is allowed
				 * as recommended per XEP-0071
				 *
				 * XHTML attribute names are case sensitive and must be lower case.
				 */
				validAttribute: function(tag, attribute) {
						if(typeof Strophe.XHTML.attributes[tag] !== 'undefined' && Strophe.XHTML.attributes[tag].length > 0) {
								for(var i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
										if(attribute == Strophe.XHTML.attributes[tag][i]) {
												return true;
										}
								}
						}
						return false;
				},
				validCSS: function(style)
				{
						for(var i = 0; i < Strophe.XHTML.css.length; i++) {
								if(style == Strophe.XHTML.css[i]) {
										return true;
								}
						}
						return false;
				}
	},

	/** Constants: Connection Status Constants
	 *  Connection status constants for use by the connection handler
	 *  callback.
	 *
	 *  Status.ERROR - An error has occurred
	 *  Status.CONNECTING - The connection is currently being made
	 *  Status.CONNFAIL - The connection attempt failed
	 *  Status.AUTHENTICATING - The connection is authenticating
	 *  Status.AUTHFAIL - The authentication attempt failed
	 *  Status.CONNECTED - The connection has succeeded
	 *  Status.DISCONNECTED - The connection has been terminated
	 *  Status.DISCONNECTING - The connection is currently being terminated
	 *  Status.ATTACHED - The connection has been attached
	 */
	Status: {
		ERROR: 0,
		CONNECTING: 1,
		CONNFAIL: 2,
		AUTHENTICATING: 3,
		AUTHFAIL: 4,
		CONNECTED: 5,
		DISCONNECTED: 6,
		DISCONNECTING: 7,
		ATTACHED: 8,
		REDIRECT: 9
	},

	/** Constants: Log Level Constants
	 *  Logging level indicators.
	 *
	 *  LogLevel.DEBUG - Debug output
	 *  LogLevel.INFO - Informational output
	 *  LogLevel.WARN - Warnings
	 *  LogLevel.ERROR - Errors
	 *  LogLevel.FATAL - Fatal errors
	 */
	LogLevel: {
		DEBUG: 0,
		INFO: 1,
		WARN: 2,
		ERROR: 3,
		FATAL: 4
	},

	/** PrivateConstants: DOM Element Type Constants
	 *  DOM element types.
	 *
	 *  ElementType.NORMAL - Normal element.
	 *  ElementType.TEXT - Text data element.
	 *  ElementType.FRAGMENT - XHTML fragment element.
	 */
	ElementType: {
		NORMAL: 1,
		TEXT: 3,
		CDATA: 4,
		FRAGMENT: 11
	},

	/** PrivateConstants: Timeout Values
	 *  Timeout values for error states.  These values are in seconds.
	 *  These should not be changed unless you know exactly what you are
	 *  doing.
	 *
	 *  TIMEOUT - Timeout multiplier. A waiting request will be considered
	 *	  failed after Math.floor(TIMEOUT * wait) seconds have elapsed.
	 *	  This defaults to 1.1, and with default wait, 66 seconds.
	 *  SECONDARY_TIMEOUT - Secondary timeout multiplier. In cases where
	 *	  Strophe can detect early failure, it will consider the request
	 *	  failed if it doesn't return after
	 *	  Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed.
	 *	  This defaults to 0.1, and with default wait, 6 seconds.
	 */
	TIMEOUT: 1.1,
	SECONDARY_TIMEOUT: 0.1,

	/** Function: addNamespace
	 *  This function is used to extend the current namespaces in
	 *  Strophe.NS.  It takes a key and a value with the key being the
	 *  name of the new namespace, with its actual value.
	 *  For example:
	 *  Strophe.addNamespace('PUBSUB', "http://jabber.org/protocol/pubsub");
	 *
	 *  Parameters:
	 *	(String) name - The name under which the namespace will be
	 *	  referenced under Strophe.NS
	 *	(String) value - The actual namespace.
	 */
	addNamespace: function (name, value)
	{
	  Strophe.NS[name] = value;
	},

	/** Function: forEachChild
	 *  Map a function over some or all child elements of a given element.
	 *
	 *  This is a small convenience function for mapping a function over
	 *  some or all of the children of an element.  If elemName is null, all
	 *  children will be passed to the function, otherwise only children
	 *  whose tag names match elemName will be passed.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The element to operate on.
	 *	(String) elemName - The child element tag name filter.
	 *	(Function) func - The function to apply to each child.  This
	 *	  function should take a single argument, a DOM element.
	 */
	forEachChild: function (elem, elemName, func)
	{
		var i, childNode;

		for (i = 0; i < elem.childNodes.length; i++) {
			childNode = elem.childNodes[i];
			if (childNode.nodeType == Strophe.ElementType.NORMAL &&
				(!elemName || this.isTagEqual(childNode, elemName))) {
				func(childNode);
			}
		}
	},

	/** Function: isTagEqual
	 *  Compare an element's tag name with a string.
	 *
	 *  This function is case sensitive.
	 *
	 *  Parameters:
	 *	(XMLElement) el - A DOM element.
	 *	(String) name - The element name.
	 *
	 *  Returns:
	 *	true if the element's tag name matches _el_, and false
	 *	otherwise.
	 */
	isTagEqual: function (el, name)
	{
		return el.tagName == name;
	},

	/** PrivateVariable: _xmlGenerator
	 *  _Private_ variable that caches a DOM document to
	 *  generate elements.
	 */
	_xmlGenerator: null,

	/** PrivateFunction: _makeGenerator
	 *  _Private_ function that creates a dummy XML DOM document to serve as
	 *  an element and text node generator.
	 */
	_makeGenerator: function () {
		var doc;

		// IE9 does implement createDocument(); however, using it will cause the browser to leak memory on page unload.
		// Here, we test for presence of createDocument() plus IE's proprietary documentMode attribute, which would be
				// less than 10 in the case of IE9 and below.
		if (document.implementation.createDocument === undefined ||
						document.implementation.createDocument && document.documentMode && document.documentMode < 10) {
			doc = this._getIEXmlDom();
			doc.appendChild(doc.createElement('strophe'));
		} else {
			doc = document.implementation
				.createDocument('jabber:client', 'strophe', null);
		}

		return doc;
	},

	/** Function: xmlGenerator
	 *  Get the DOM document to generate elements.
	 *
	 *  Returns:
	 *	The currently used DOM document.
	 */
	xmlGenerator: function () {
		if (!Strophe._xmlGenerator) {
			Strophe._xmlGenerator = Strophe._makeGenerator();
		}
		return Strophe._xmlGenerator;
	},

	/** PrivateFunction: _getIEXmlDom
	 *  Gets IE xml doc object
	 *
	 *  Returns:
	 *	A Microsoft XML DOM Object
	 *  See Also:
	 *	http://msdn.microsoft.com/en-us/library/ms757837%28VS.85%29.aspx
	 */
	_getIEXmlDom : function() {
		var doc = null;
		var docStrings = [
			"Msxml2.DOMDocument.6.0",
			"Msxml2.DOMDocument.5.0",
			"Msxml2.DOMDocument.4.0",
			"MSXML2.DOMDocument.3.0",
			"MSXML2.DOMDocument",
			"MSXML.DOMDocument",
			"Microsoft.XMLDOM"
		];

		for (var d = 0; d < docStrings.length; d++) {
			if (doc === null) {
				try {
					doc = new ActiveXObject(docStrings[d]);
				} catch (e) {
					doc = null;
				}
			} else {
				break;
			}
		}

		return doc;
	},

	/** Function: xmlElement
	 *  Create an XML DOM element.
	 *
	 *  This function creates an XML DOM element correctly across all
	 *  implementations. Note that these are not HTML DOM elements, which
	 *  aren't appropriate for XMPP stanzas.
	 *
	 *  Parameters:
	 *	(String) name - The name for the element.
	 *	(Array|Object) attrs - An optional array or object containing
	 *	  key/value pairs to use as element attributes. The object should
	 *	  be in the format {'key': 'value'} or {key: 'value'}. The array
	 *	  should have the format [['key1', 'value1'], ['key2', 'value2']].
	 *	(String) text - The text child data for the element.
	 *
	 *  Returns:
	 *	A new XML DOM element.
	 */
	xmlElement: function (name)
	{
		if (!name) { return null; }

		var node = Strophe.xmlGenerator().createElement(name);

		// FIXME: this should throw errors if args are the wrong type or
		// there are more than two optional args
		var a, i, k;
		for (a = 1; a < arguments.length; a++) {
			var arg = arguments[a];
			if (!arg) { continue; }
			if (typeof(arg) == "string" ||
				typeof(arg) == "number") {
				node.appendChild(Strophe.xmlTextNode(arg));
			} else if (typeof(arg) == "object" &&
					   typeof(arg.sort) == "function") {
				for (i = 0; i < arg.length; i++) {
					var attr = arg[i];
					if (typeof(attr) == "object" &&
						typeof(attr.sort) == "function" &&
						attr[1] !== undefined) {
						node.setAttribute(attr[0], attr[1]);
					}
				}
			} else if (typeof(arg) == "object") {
				for (k in arg) {
					if (arg.hasOwnProperty(k)) {
						if (arg[k] !== undefined) {
							node.setAttribute(k, arg[k]);
						}
					}
				}
			}
		}

		return node;
	},

	/*  Function: xmlescape
	 *  Excapes invalid xml characters.
	 *
	 *  Parameters:
	 *	 (String) text - text to escape.
	 *
	 *  Returns:
	 *	  Escaped text.
	 */
	xmlescape: function(text)
	{
		text = text.replace(/\&/g, "&amp;");
		text = text.replace(/</g,  "&lt;");
		text = text.replace(/>/g,  "&gt;");
		text = text.replace(/'/g,  "&apos;");
		text = text.replace(/"/g,  "&quot;");
		return text;
	},

	/*  Function: xmlunescape
	*  Unexcapes invalid xml characters.
	*
	*  Parameters:
	*	 (String) text - text to unescape.
	*
	*  Returns:
	*	  Unescaped text.
	*/
	xmlunescape: function(text)
	{
		text = text.replace(/\&amp;/g, "&");
		text = text.replace(/&lt;/g,  "<");
		text = text.replace(/&gt;/g,  ">");
		text = text.replace(/&apos;/g,  "'");
		text = text.replace(/&quot;/g,  "\"");
		return text;
	},

	/** Function: xmlTextNode
	 *  Creates an XML DOM text node.
	 *
	 *  Provides a cross implementation version of document.createTextNode.
	 *
	 *  Parameters:
	 *	(String) text - The content of the text node.
	 *
	 *  Returns:
	 *	A new XML DOM text node.
	 */
	xmlTextNode: function (text)
	{
		return Strophe.xmlGenerator().createTextNode(text);
	},

	/** Function: xmlHtmlNode
	 *  Creates an XML DOM html node.
	 *
	 *  Parameters:
	 *	(String) html - The content of the html node.
	 *
	 *  Returns:
	 *	A new XML DOM text node.
	 */
	xmlHtmlNode: function (html)
	{
		var node;
		//ensure text is escaped
		if (window.DOMParser) {
			var parser = new DOMParser();
			node = parser.parseFromString(html, "text/xml");
		} else {
			node = new ActiveXObject("Microsoft.XMLDOM");
			node.async="false";
			node.loadXML(html);
		}
		return node;
	},

	/** Function: getText
	 *  Get the concatenation of all text children of an element.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - A DOM element.
	 *
	 *  Returns:
	 *	A String with the concatenated text of all text element children.
	 */
	getText: function (elem)
	{
		if (!elem) { return null; }

		var str = "";
		if (elem.childNodes.length === 0 && elem.nodeType ==
			Strophe.ElementType.TEXT) {
			str += elem.nodeValue;
		}

		for (var i = 0; i < elem.childNodes.length; i++) {
			if (elem.childNodes[i].nodeType == Strophe.ElementType.TEXT) {
				str += elem.childNodes[i].nodeValue;
			}
		}

		return Strophe.xmlescape(str);
	},

	/** Function: copyElement
	 *  Copy an XML DOM element.
	 *
	 *  This function copies a DOM element and all its descendants and returns
	 *  the new copy.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - A DOM element.
	 *
	 *  Returns:
	 *	A new, copied DOM element tree.
	 */
	copyElement: function (elem)
	{
		var i, el;
		if (elem.nodeType == Strophe.ElementType.NORMAL) {
			el = Strophe.xmlElement(elem.tagName);

			for (i = 0; i < elem.attributes.length; i++) {
				el.setAttribute(elem.attributes[i].nodeName,
								elem.attributes[i].value);
			}

			for (i = 0; i < elem.childNodes.length; i++) {
				el.appendChild(Strophe.copyElement(elem.childNodes[i]));
			}
		} else if (elem.nodeType == Strophe.ElementType.TEXT) {
			el = Strophe.xmlGenerator().createTextNode(elem.nodeValue);
		}

		return el;
	},


	/** Function: createHtml
	 *  Copy an HTML DOM element into an XML DOM.
	 *
	 *  This function copies a DOM element and all its descendants and returns
	 *  the new copy.
	 *
	 *  Parameters:
	 *	(HTMLElement) elem - A DOM element.
	 *
	 *  Returns:
	 *	A new, copied DOM element tree.
	 */
	createHtml: function (elem)
	{
		var i, el, j, tag, attribute, value, css, cssAttrs, attr, cssName, cssValue;
		if (elem.nodeType == Strophe.ElementType.NORMAL) {
			tag = elem.nodeName.toLowerCase(); // XHTML tags must be lower case.
			if(Strophe.XHTML.validTag(tag)) {
				try {
					el = Strophe.xmlElement(tag);
					for(i = 0; i < Strophe.XHTML.attributes[tag].length; i++) {
						attribute = Strophe.XHTML.attributes[tag][i];
						value = elem.getAttribute(attribute);
						if(typeof value == 'undefined' || value === null || value === '' || value === false || value === 0) {
							continue;
						}
						if(attribute == 'style' && typeof value == 'object') {
							if(typeof value.cssText != 'undefined') {
								value = value.cssText; // we're dealing with IE, need to get CSS out
							}
						}
						// filter out invalid css styles
						if(attribute == 'style') {
							css = [];
							cssAttrs = value.split(';');
							for(j = 0; j < cssAttrs.length; j++) {
								attr = cssAttrs[j].split(':');
								cssName = attr[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
								if(Strophe.XHTML.validCSS(cssName)) {
									cssValue = attr[1].replace(/^\s*/, "").replace(/\s*$/, "");
									css.push(cssName + ': ' + cssValue);
								}
							}
							if(css.length > 0) {
								value = css.join('; ');
								el.setAttribute(attribute, value);
							}
						} else {
							el.setAttribute(attribute, value);
						}
					}

					for (i = 0; i < elem.childNodes.length; i++) {
						el.appendChild(Strophe.createHtml(elem.childNodes[i]));
					}
				} catch(e) { // invalid elements
				  el = Strophe.xmlTextNode('');
				}
			} else {
				el = Strophe.xmlGenerator().createDocumentFragment();
				for (i = 0; i < elem.childNodes.length; i++) {
					el.appendChild(Strophe.createHtml(elem.childNodes[i]));
				}
			}
		} else if (elem.nodeType == Strophe.ElementType.FRAGMENT) {
			el = Strophe.xmlGenerator().createDocumentFragment();
			for (i = 0; i < elem.childNodes.length; i++) {
				el.appendChild(Strophe.createHtml(elem.childNodes[i]));
			}
		} else if (elem.nodeType == Strophe.ElementType.TEXT) {
			el = Strophe.xmlTextNode(elem.nodeValue);
		}

		return el;
	},

	/** Function: escapeNode
	 *  Escape the node part (also called local part) of a JID.
	 *
	 *  Parameters:
	 *	(String) node - A node (or local part).
	 *
	 *  Returns:
	 *	An escaped node (or local part).
	 */
	escapeNode: function (node)
	{
		if (typeof node !== "string") { return node; }
		return node.replace(/^\s+|\s+$/g, '')
			.replace(/\\/g,  "\\5c")
			.replace(/ /g,   "\\20")
			.replace(/\"/g,  "\\22")
			.replace(/\&/g,  "\\26")
			.replace(/\'/g,  "\\27")
			.replace(/\//g,  "\\2f")
			.replace(/:/g,   "\\3a")
			.replace(/</g,   "\\3c")
			.replace(/>/g,   "\\3e")
			.replace(/@/g,   "\\40");
	},

	/** Function: unescapeNode
	 *  Unescape a node part (also called local part) of a JID.
	 *
	 *  Parameters:
	 *	(String) node - A node (or local part).
	 *
	 *  Returns:
	 *	An unescaped node (or local part).
	 */
	unescapeNode: function (node)
	{
		if (typeof node !== "string") { return node; }
		return node.replace(/\\20/g, " ")
			.replace(/\\22/g, '"')
			.replace(/\\26/g, "&")
			.replace(/\\27/g, "'")
			.replace(/\\2f/g, "/")
			.replace(/\\3a/g, ":")
			.replace(/\\3c/g, "<")
			.replace(/\\3e/g, ">")
			.replace(/\\40/g, "@")
			.replace(/\\5c/g, "\\");
	},

	/** Function: getNodeFromJid
	 *  Get the node portion of a JID String.
	 *
	 *  Parameters:
	 *	(String) jid - A JID.
	 *
	 *  Returns:
	 *	A String containing the node.
	 */
	getNodeFromJid: function (jid)
	{
		if (jid.indexOf("@") < 0) { return null; }
		return jid.split("@")[0];
	},

	/** Function: getDomainFromJid
	 *  Get the domain portion of a JID String.
	 *
	 *  Parameters:
	 *	(String) jid - A JID.
	 *
	 *  Returns:
	 *	A String containing the domain.
	 */
	getDomainFromJid: function (jid)
	{
		var bare = Strophe.getBareJidFromJid(jid);
		if (bare.indexOf("@") < 0) {
			return bare;
		} else {
			var parts = bare.split("@");
			parts.splice(0, 1);
			return parts.join('@');
		}
	},

	/** Function: getResourceFromJid
	 *  Get the resource portion of a JID String.
	 *
	 *  Parameters:
	 *	(String) jid - A JID.
	 *
	 *  Returns:
	 *	A String containing the resource.
	 */
	getResourceFromJid: function (jid)
	{
		var s = jid.split("/");
		if (s.length < 2) { return null; }
		s.splice(0, 1);
		return s.join('/');
	},

	/** Function: getBareJidFromJid
	 *  Get the bare JID from a JID String.
	 *
	 *  Parameters:
	 *	(String) jid - A JID.
	 *
	 *  Returns:
	 *	A String containing the bare JID.
	 */
	getBareJidFromJid: function (jid)
	{
		return jid ? jid.split("/")[0] : null;
	},

	/** Function: log
	 *  User overrideable logging function.
	 *
	 *  This function is called whenever the Strophe library calls any
	 *  of the logging functions.  The default implementation of this
	 *  function does nothing.  If client code wishes to handle the logging
	 *  messages, it should override this with
	 *  > Strophe.log = function (level, msg) {
	 *  >   (user code here)
	 *  > };
	 *
	 *  Please note that data sent and received over the wire is logged
	 *  via Strophe.Connection.rawInput() and Strophe.Connection.rawOutput().
	 *
	 *  The different levels and their meanings are
	 *
	 *	DEBUG - Messages useful for debugging purposes.
	 *	INFO - Informational messages.  This is mostly information like
	 *	  'disconnect was called' or 'SASL auth succeeded'.
	 *	WARN - Warnings about potential problems.  This is mostly used
	 *	  to report transient connection errors like request timeouts.
	 *	ERROR - Some error occurred.
	 *	FATAL - A non-recoverable fatal error occurred.
	 *
	 *  Parameters:
	 *	(Integer) level - The log level of the log message.  This will
	 *	  be one of the values in Strophe.LogLevel.
	 *	(String) msg - The log message.
	 */
	/* jshint ignore:start */
	log: function (level, msg)
	{
		return;
	},
	/* jshint ignore:end */

	/** Function: debug
	 *  Log a message at the Strophe.LogLevel.DEBUG level.
	 *
	 *  Parameters:
	 *	(String) msg - The log message.
	 */
	debug: function(msg)
	{
		this.log(this.LogLevel.DEBUG, msg);
	},

	/** Function: info
	 *  Log a message at the Strophe.LogLevel.INFO level.
	 *
	 *  Parameters:
	 *	(String) msg - The log message.
	 */
	info: function (msg)
	{
		this.log(this.LogLevel.INFO, msg);
	},

	/** Function: warn
	 *  Log a message at the Strophe.LogLevel.WARN level.
	 *
	 *  Parameters:
	 *	(String) msg - The log message.
	 */
	warn: function (msg)
	{
		this.log(this.LogLevel.WARN, msg);
	},

	/** Function: error
	 *  Log a message at the Strophe.LogLevel.ERROR level.
	 *
	 *  Parameters:
	 *	(String) msg - The log message.
	 */
	error: function (msg)
	{
		this.log(this.LogLevel.ERROR, msg);
	},

	/** Function: fatal
	 *  Log a message at the Strophe.LogLevel.FATAL level.
	 *
	 *  Parameters:
	 *	(String) msg - The log message.
	 */
	fatal: function (msg)
	{
		this.log(this.LogLevel.FATAL, msg);
	},

	/** Function: serialize
	 *  Render a DOM element and all descendants to a String.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - A DOM element.
	 *
	 *  Returns:
	 *	The serialized element tree as a String.
	 */
	serialize: function (elem)
	{
		var result;

		if (!elem) { return null; }

		if (typeof(elem.tree) === "function") {
			elem = elem.tree();
		}

		var nodeName = elem.nodeName;
		var i, child;

		if (elem.getAttribute("_realname")) {
			nodeName = elem.getAttribute("_realname");
		}

		result = "<" + nodeName;
		for (i = 0; i < elem.attributes.length; i++) {
			   if(elem.attributes[i].nodeName != "_realname") {
				 result += " " + elem.attributes[i].nodeName +
				"='" + elem.attributes[i].value
					.replace(/&/g, "&amp;")
					   .replace(/\'/g, "&apos;")
					   .replace(/>/g, "&gt;")
					   .replace(/</g, "&lt;") + "'";
			   }
		}

		if (elem.childNodes.length > 0) {
			result += ">";
			for (i = 0; i < elem.childNodes.length; i++) {
				child = elem.childNodes[i];
				switch( child.nodeType ){
				  case Strophe.ElementType.NORMAL:
					// normal element, so recurse
					result += Strophe.serialize(child);
					break;
				  case Strophe.ElementType.TEXT:
					// text element to escape values
					result += Strophe.xmlescape(child.nodeValue);
					break;
				  case Strophe.ElementType.CDATA:
					// cdata section so don't escape values
					result += "<![CDATA["+child.nodeValue+"]]>";
				}
			}
			result += "</" + nodeName + ">";
		} else {
			result += "/>";
		}

		return result;
	},

	/** PrivateVariable: _requestId
	 *  _Private_ variable that keeps track of the request ids for
	 *  connections.
	 */
	_requestId: 0,

	/** PrivateVariable: Strophe.connectionPlugins
	 *  _Private_ variable Used to store plugin names that need
	 *  initialization on Strophe.Connection construction.
	 */
	_connectionPlugins: {},

	/** Function: addConnectionPlugin
	 *  Extends the Strophe.Connection object with the given plugin.
	 *
	 *  Parameters:
	 *	(String) name - The name of the extension.
	 *	(Object) ptype - The plugin's prototype.
	 */
	addConnectionPlugin: function (name, ptype)
	{
		Strophe._connectionPlugins[name] = ptype;
	}
};

/** Class: Strophe.Builder
 *  XML DOM builder.
 *
 *  This object provides an interface similar to JQuery but for building
 *  DOM element easily and rapidly.  All the functions except for toString()
 *  and tree() return the object, so calls can be chained.  Here's an
 *  example using the $iq() builder helper.
 *  > $iq({to: 'you', from: 'me', type: 'get', id: '1'})
 *  >	 .c('query', {xmlns: 'strophe:example'})
 *  >	 .c('example')
 *  >	 .toString()
 *  The above generates this XML fragment
 *  > <iq to='you' from='me' type='get' id='1'>
 *  >   <query xmlns='strophe:example'>
 *  >	 <example/>
 *  >   </query>
 *  > </iq>
 *  The corresponding DOM manipulations to get a similar fragment would be
 *  a lot more tedious and probably involve several helper variables.
 *
 *  Since adding children makes new operations operate on the child, up()
 *  is provided to traverse up the tree.  To add two children, do
 *  > builder.c('child1', ...).up().c('child2', ...)
 *  The next operation on the Builder will be relative to the second child.
 */

/** Constructor: Strophe.Builder
 *  Create a Strophe.Builder object.
 *
 *  The attributes should be passed in object notation.  For example
 *  > var b = new Builder('message', {to: 'you', from: 'me'});
 *  or
 *  > var b = new Builder('messsage', {'xml:lang': 'en'});
 *
 *  Parameters:
 *	(String) name - The name of the root element.
 *	(Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *	A new Strophe.Builder.
 */
Strophe.Builder = function (name, attrs)
{
	// Set correct namespace for jabber:client elements
	if (name == "presence" || name == "message" || name == "iq") {
		if (attrs && !attrs.xmlns) {
			attrs.xmlns = Strophe.NS.CLIENT;
		} else if (!attrs) {
			attrs = {xmlns: Strophe.NS.CLIENT};
		}
	}

	// Holds the tree being built.
	this.nodeTree = Strophe.xmlElement(name, attrs);

	// Points to the current operation node.
	this.node = this.nodeTree;
};

Strophe.Builder.prototype = {
	/** Function: tree
	 *  Return the DOM tree.
	 *
	 *  This function returns the current DOM tree as an element object.  This
	 *  is suitable for passing to functions like Strophe.Connection.send().
	 *
	 *  Returns:
	 *	The DOM tree as a element object.
	 */
	tree: function ()
	{
		return this.nodeTree;
	},

	/** Function: toString
	 *  Serialize the DOM tree to a String.
	 *
	 *  This function returns a string serialization of the current DOM
	 *  tree.  It is often used internally to pass data to a
	 *  Strophe.Request object.
	 *
	 *  Returns:
	 *	The serialized DOM tree in a String.
	 */
	toString: function ()
	{
		return Strophe.serialize(this.nodeTree);
	},

	/** Function: up
	 *  Make the current parent element the new current element.
	 *
	 *  This function is often used after c() to traverse back up the tree.
	 *  For example, to add two children to the same element
	 *  > builder.c('child1', {}).up().c('child2', {});
	 *
	 *  Returns:
	 *	The Stophe.Builder object.
	 */
	up: function ()
	{
		this.node = this.node.parentNode;
		return this;
	},

	/** Function: attrs
	 *  Add or modify attributes of the current element.
	 *
	 *  The attributes should be passed in object notation.  This function
	 *  does not move the current element pointer.
	 *
	 *  Parameters:
	 *	(Object) moreattrs - The attributes to add/modify in object notation.
	 *
	 *  Returns:
	 *	The Strophe.Builder object.
	 */
	attrs: function (moreattrs)
	{
		for (var k in moreattrs) {
			if (moreattrs.hasOwnProperty(k)) {
				if (moreattrs[k] === undefined) {
					this.node.removeAttribute(k);
				} else {
					this.node.setAttribute(k, moreattrs[k]);
				}
			}
		}
		return this;
	},

	/** Function: c
	 *  Add a child to the current element and make it the new current
	 *  element.
	 *
	 *  This function moves the current element pointer to the child,
	 *  unless text is provided.  If you need to add another child, it
	 *  is necessary to use up() to go back to the parent in the tree.
	 *
	 *  Parameters:
	 *	(String) name - The name of the child.
	 *	(Object) attrs - The attributes of the child in object notation.
	 *	(String) text - The text to add to the child.
	 *
	 *  Returns:
	 *	The Strophe.Builder object.
	 */
	c: function (name, attrs, text)
	{
		var child = Strophe.xmlElement(name, attrs, text);
		this.node.appendChild(child);
		if (typeof text !== "string") {
			this.node = child;
		}
		return this;
	},

	/** Function: cnode
	 *  Add a child to the current element and make it the new current
	 *  element.
	 *
	 *  This function is the same as c() except that instead of using a
	 *  name and an attributes object to create the child it uses an
	 *  existing DOM element object.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - A DOM element.
	 *
	 *  Returns:
	 *	The Strophe.Builder object.
	 */
	cnode: function (elem)
	{
		var impNode;
		var xmlGen = Strophe.xmlGenerator();
		try {
			impNode = (xmlGen.importNode !== undefined);
		}
		catch (e) {
			impNode = false;
		}
		var newElem = impNode ?
					  xmlGen.importNode(elem, true) :
					  Strophe.copyElement(elem);
		this.node.appendChild(newElem);
		this.node = newElem;
		return this;
	},

	/** Function: t
	 *  Add a child text element.
	 *
	 *  This *does not* make the child the new current element since there
	 *  are no children of text elements.
	 *
	 *  Parameters:
	 *	(String) text - The text data to append to the current element.
	 *
	 *  Returns:
	 *	The Strophe.Builder object.
	 */
	t: function (text)
	{
		var child = Strophe.xmlTextNode(text);
		this.node.appendChild(child);
		return this;
	},

	/** Function: h
	 *  Replace current element contents with the HTML passed in.
	 *
	 *  This *does not* make the child the new current element
	 *
	 *  Parameters:
	 *	(String) html - The html to insert as contents of current element.
	 *
	 *  Returns:
	 *	The Strophe.Builder object.
	 */
	h: function (html)
	{
		var fragment = document.createElement('body');

		// force the browser to try and fix any invalid HTML tags
		fragment.innerHTML = html;

		// copy cleaned html into an xml dom
		var xhtml = Strophe.createHtml(fragment);

		while(xhtml.childNodes.length > 0) {
			this.node.appendChild(xhtml.childNodes[0]);
		}
		return this;
	}
};

/** PrivateClass: Strophe.Handler
 *  _Private_ helper class for managing stanza handlers.
 *
 *  A Strophe.Handler encapsulates a user provided callback function to be
 *  executed when matching stanzas are received by the connection.
 *  Handlers can be either one-off or persistant depending on their
 *  return value. Returning true will cause a Handler to remain active, and
 *  returning false will remove the Handler.
 *
 *  Users will not use Strophe.Handler objects directly, but instead they
 *  will use Strophe.Connection.addHandler() and
 *  Strophe.Connection.deleteHandler().
 */

/** PrivateConstructor: Strophe.Handler
 *  Create and initialize a new Strophe.Handler.
 *
 *  Parameters:
 *	(Function) handler - A function to be executed when the handler is run.
 *	(String) ns - The namespace to match.
 *	(String) name - The element name to match.
 *	(String) type - The element type to match.
 *	(String) id - The element id attribute to match.
 *	(String) from - The element from attribute to match.
 *	(Object) options - Handler options
 *
 *  Returns:
 *	A new Strophe.Handler object.
 */
Strophe.Handler = function (handler, ns, name, type, id, from, options)
{
	this.handler = handler;
	this.ns = ns;
	this.name = name;
	this.type = type;
	this.id = id;
	this.options = options || {matchBare: false};

	// default matchBare to false if undefined
	if (!this.options.matchBare) {
		this.options.matchBare = false;
	}

	if (this.options.matchBare) {
		this.from = from ? Strophe.getBareJidFromJid(from) : null;
	} else {
		this.from = from;
	}

	// whether the handler is a user handler or a system handler
	this.user = true;
};

Strophe.Handler.prototype = {
	/** PrivateFunction: isMatch
	 *  Tests if a stanza matches the Strophe.Handler.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The XML element to test.
	 *
	 *  Returns:
	 *	true if the stanza matches and false otherwise.
	 */
	isMatch: function (elem)
	{
		var nsMatch;
		var from = null;

		if (this.options.matchBare) {
			from = Strophe.getBareJidFromJid(elem.getAttribute('from'));
		} else {
			from = elem.getAttribute('from');
		}

		nsMatch = false;
		if (!this.ns) {
			nsMatch = true;
		} else {
			var that = this;
			Strophe.forEachChild(elem, null, function (elem) {
				if (elem.getAttribute("xmlns") == that.ns) {
					nsMatch = true;
				}
			});

			nsMatch = nsMatch || elem.getAttribute("xmlns") == this.ns;
		}

		var elem_type = elem.getAttribute("type");
		if (nsMatch &&
			(!this.name || Strophe.isTagEqual(elem, this.name)) &&
			(!this.type || (Array.isArray(this.type) ? this.type.indexOf(elem_type) != -1 : elem_type == this.type)) &&
			(!this.id || elem.getAttribute("id") == this.id) &&
			(!this.from || from == this.from)) {
				return true;
		}

		return false;
	},

	/** PrivateFunction: run
	 *  Run the callback on a matching stanza.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The DOM element that triggered the
	 *	  Strophe.Handler.
	 *
	 *  Returns:
	 *	A boolean indicating if the handler should remain active.
	 */
	run: function (elem)
	{
		var result = null;
		try {
			result = this.handler(elem);
		} catch (e) {
			if (e.sourceURL) {
				Strophe.fatal("error: " + this.handler +
							  " " + e.sourceURL + ":" +
							  e.line + " - " + e.name + ": " + e.message);
			} else if (e.fileName) {
				if (typeof(console) != "undefined") {
					console.trace();
					console.error(this.handler, " - error - ", e, e.message);
				}
				Strophe.fatal("error: " + this.handler + " " +
							  e.fileName + ":" + e.lineNumber + " - " +
							  e.name + ": " + e.message);
			} else {
				Strophe.fatal("error: " + e.message + "\n" + e.stack);
			}

			throw e;
		}

		return result;
	},

	/** PrivateFunction: toString
	 *  Get a String representation of the Strophe.Handler object.
	 *
	 *  Returns:
	 *	A String.
	 */
	toString: function ()
	{
		return "{Handler: " + this.handler + "(" + this.name + "," +
			this.id + "," + this.ns + ")}";
	}
};

/** PrivateClass: Strophe.TimedHandler
 *  _Private_ helper class for managing timed handlers.
 *
 *  A Strophe.TimedHandler encapsulates a user provided callback that
 *  should be called after a certain period of time or at regular
 *  intervals.  The return value of the callback determines whether the
 *  Strophe.TimedHandler will continue to fire.
 *
 *  Users will not use Strophe.TimedHandler objects directly, but instead
 *  they will use Strophe.Connection.addTimedHandler() and
 *  Strophe.Connection.deleteTimedHandler().
 */

/** PrivateConstructor: Strophe.TimedHandler
 *  Create and initialize a new Strophe.TimedHandler object.
 *
 *  Parameters:
 *	(Integer) period - The number of milliseconds to wait before the
 *	  handler is called.
 *	(Function) handler - The callback to run when the handler fires.  This
 *	  function should take no arguments.
 *
 *  Returns:
 *	A new Strophe.TimedHandler object.
 */
Strophe.TimedHandler = function (period, handler)
{
	this.period = period;
	this.handler = handler;

	this.lastCalled = new Date().getTime();
	this.user = true;
};

Strophe.TimedHandler.prototype = {
	/** PrivateFunction: run
	 *  Run the callback for the Strophe.TimedHandler.
	 *
	 *  Returns:
	 *	true if the Strophe.TimedHandler should be called again, and false
	 *	  otherwise.
	 */
	run: function ()
	{
		this.lastCalled = new Date().getTime();
		return this.handler();
	},

	/** PrivateFunction: reset
	 *  Reset the last called time for the Strophe.TimedHandler.
	 */
	reset: function ()
	{
		this.lastCalled = new Date().getTime();
	},

	/** PrivateFunction: toString
	 *  Get a string representation of the Strophe.TimedHandler object.
	 *
	 *  Returns:
	 *	The string representation.
	 */
	toString: function ()
	{
		return "{TimedHandler: " + this.handler + "(" + this.period +")}";
	}
};

/** Class: Strophe.Connection
 *  XMPP Connection manager.
 *
 *  This class is the main part of Strophe.  It manages a BOSH or websocket
 *  connection to an XMPP server and dispatches events to the user callbacks
 *  as data arrives. It supports SASL PLAIN, SASL DIGEST-MD5, SASL SCRAM-SHA1
 *  and legacy authentication.
 *
 *  After creating a Strophe.Connection object, the user will typically
 *  call connect() with a user supplied callback to handle connection level
 *  events like authentication failure, disconnection, or connection
 *  complete.
 *
 *  The user will also have several event handlers defined by using
 *  addHandler() and addTimedHandler().  These will allow the user code to
 *  respond to interesting stanzas or do something periodically with the
 *  connection. These handlers will be active once authentication is
 *  finished.
 *
 *  To send data to the connection, use send().
 */

/** Constructor: Strophe.Connection
 *  Create and initialize a Strophe.Connection object.
 *
 *  The transport-protocol for this connection will be chosen automatically
 *  based on the given service parameter. URLs starting with "ws://" or
 *  "wss://" will use WebSockets, URLs starting with "http://", "https://"
 *  or without a protocol will use BOSH.
 *
 *  To make Strophe connect to the current host you can leave out the protocol
 *  and host part and just pass the path, e.g.
 *
 *  > var conn = new Strophe.Connection("/http-bind/");
 *
 *  WebSocket options:
 *
 *  If you want to connect to the current host with a WebSocket connection you
 *  can tell Strophe to use WebSockets through a "protocol" attribute in the
 *  optional options parameter. Valid values are "ws" for WebSocket and "wss"
 *  for Secure WebSocket.
 *  So to connect to "wss://CURRENT_HOSTNAME/xmpp-websocket" you would call
 *
 *  > var conn = new Strophe.Connection("/xmpp-websocket/", {protocol: "wss"});
 *
 *  Note that relative URLs _NOT_ starting with a "/" will also include the path
 *  of the current site.
 *
 *  Also because downgrading security is not permitted by browsers, when using
 *  relative URLs both BOSH and WebSocket connections will use their secure
 *  variants if the current connection to the site is also secure (https).
 *
 *  BOSH options:
 *
 *  By adding "sync" to the options, you can control if requests will
 *  be made synchronously or not. The default behaviour is asynchronous.
 *  If you want to make requests synchronous, make "sync" evaluate to true:
 *  > var conn = new Strophe.Connection("/http-bind/", {sync: true});
 *
 *  You can also toggle this on an already established connection:
 *  > conn.options.sync = true;
 *
 *  The "customHeaders" option can be used to provide custom HTTP headers to be
 *  included in the XMLHttpRequests made.
 *
 *  The "keepalive" option can be used to instruct Strophe to maintain the
 *  current BOSH session across interruptions such as webpage reloads.
 *
 *  It will do this by caching the sessions tokens in sessionStorage, and when
 *  "restore" is called it will check whether there are cached tokens with
 *  which it can resume an existing session.
 *
 *  Parameters:
 *	(String) service - The BOSH or WebSocket service URL.
 *	(Object) options - A hash of configuration options
 *
 *  Returns:
 *	A new Strophe.Connection object.
 */
Strophe.Connection = function (service, options)
{
	// The service URL
	this.service = service;

	// Configuration options
	this.options = options || {};
	var proto = this.options.protocol || "";

	// Select protocal based on service or options
	if (service.indexOf("ws:") === 0 || service.indexOf("wss:") === 0 ||
			proto.indexOf("ws") === 0) {
		this._proto = new Strophe.Websocket(this);
	} else {
		this._proto = new Strophe.Bosh(this);
	}

	/* The connected JID. */
	this.jid = "";
	/* the JIDs domain */
	this.domain = null;
	/* stream:features */
	this.features = null;

	// SASL
	this._sasl_data = {};
	this.do_session = false;
	this.do_bind = false;

	// handler lists
	this.timedHandlers = [];
	this.handlers = [];
	this.removeTimeds = [];
	this.removeHandlers = [];
	this.addTimeds = [];
	this.addHandlers = [];

	this._authentication = {};
	this._idleTimeout = null;
	this._disconnectTimeout = null;

	this.authenticated = false;
	this.connected = false;
	this.disconnecting = false;
	this.do_authentication = true;
	this.paused = false;
	this.restored = false;

	this._data = [];
	this._uniqueId = 0;

	this._sasl_success_handler = null;
	this._sasl_failure_handler = null;
	this._sasl_challenge_handler = null;

	// Max retries before disconnecting
	this.maxRetries = 5;

	// setup onIdle callback every 1/10th of a second
	this._idleTimeout = setTimeout(this._onIdle.stropheBind(this), 100);

	// initialize plugins
	for (var k in Strophe._connectionPlugins) {
		if (Strophe._connectionPlugins.hasOwnProperty(k)) {
			var ptype = Strophe._connectionPlugins[k];
			// jslint complaints about the below line, but this is fine
			var F = function () {}; // jshint ignore:line
			F.prototype = ptype;
			this[k] = new F();
			this[k].init(this);
		}
	}
};

Strophe.Connection.prototype = {
	/** Function: reset
	 *  Reset the connection.
	 *
	 *  This function should be called after a connection is disconnected
	 *  before that connection is reused.
	 */
	reset: function ()
	{
		this._proto._reset();

		// SASL
		this.do_session = false;
		this.do_bind = false;

		// handler lists
		this.timedHandlers = [];
		this.handlers = [];
		this.removeTimeds = [];
		this.removeHandlers = [];
		this.addTimeds = [];
		this.addHandlers = [];
		this._authentication = {};

		this.authenticated = false;
		this.connected = false;
		this.disconnecting = false;
		this.restored = false;

		this._data = [];
		this._requests = [];
		this._uniqueId = 0;
	},

	/** Function: pause
	 *  Pause the request manager.
	 *
	 *  This will prevent Strophe from sending any more requests to the
	 *  server.  This is very useful for temporarily pausing
	 *  BOSH-Connections while a lot of send() calls are happening quickly.
	 *  This causes Strophe to send the data in a single request, saving
	 *  many request trips.
	 */
	pause: function ()
	{
		this.paused = true;
	},

	/** Function: resume
	 *  Resume the request manager.
	 *
	 *  This resumes after pause() has been called.
	 */
	resume: function ()
	{
		this.paused = false;
	},

	/** Function: getUniqueId
	 *  Generate a unique ID for use in <iq/> elements.
	 *
	 *  All <iq/> stanzas are required to have unique id attributes.  This
	 *  function makes creating these easy.  Each connection instance has
	 *  a counter which starts from zero, and the value of this counter
	 *  plus a colon followed by the suffix becomes the unique id. If no
	 *  suffix is supplied, the counter is used as the unique id.
	 *
	 *  Suffixes are used to make debugging easier when reading the stream
	 *  data, and their use is recommended.  The counter resets to 0 for
	 *  every new connection for the same reason.  For connections to the
	 *  same server that authenticate the same way, all the ids should be
	 *  the same, which makes it easy to see changes.  This is useful for
	 *  automated testing as well.
	 *
	 *  Parameters:
	 *	(String) suffix - A optional suffix to append to the id.
	 *
	 *  Returns:
	 *	A unique string to be used for the id attribute.
	 */
	getUniqueId: function (suffix)
	{
		if (typeof(suffix) == "string" || typeof(suffix) == "number") {
			return ++this._uniqueId + ":" + suffix;
		} else {
			return ++this._uniqueId + "";
		}
	},

	/** Function: connect
	 *  Starts the connection process.
	 *
	 *  As the connection process proceeds, the user supplied callback will
	 *  be triggered multiple times with status updates.  The callback
	 *  should take two arguments - the status code and the error condition.
	 *
	 *  The status code will be one of the values in the Strophe.Status
	 *  constants.  The error condition will be one of the conditions
	 *  defined in RFC 3920 or the condition 'strophe-parsererror'.
	 *
	 *  The Parameters _wait_, _hold_ and _route_ are optional and only relevant
	 *  for BOSH connections. Please see XEP 124 for a more detailed explanation
	 *  of the optional parameters.
	 *
	 *  Parameters:
	 *	(String) jid - The user's JID.  This may be a bare JID,
	 *	  or a full JID.  If a node is not supplied, SASL ANONYMOUS
	 *	  authentication will be attempted.
	 *	(String) pass - The user's password.
	 *	(Function) callback - The connect callback function.
	 *	(Integer) wait - The optional HTTPBIND wait value.  This is the
	 *	  time the server will wait before returning an empty result for
	 *	  a request.  The default setting of 60 seconds is recommended.
	 *	(Integer) hold - The optional HTTPBIND hold value.  This is the
	 *	  number of connections the server will hold at one time.  This
	 *	  should almost always be set to 1 (the default).
	 *	(String) route - The optional route value.
	 *	(String) authcid - The optional alternative authentication identity
	 *	  (username) if intending to impersonate another user.
	 */
	connect: function (jid, pass, callback, wait, hold, route, authcid)
	{
		this.jid = jid;
		/** Variable: authzid
		 *  Authorization identity.
		 */
		this.authzid = Strophe.getBareJidFromJid(this.jid);
		/** Variable: authcid
		 *  Authentication identity (User name).
		 */
		this.authcid = authcid || Strophe.getNodeFromJid(this.jid);
		/** Variable: pass
		 *  Authentication identity (User password).
		 */
		this.pass = pass;
		/** Variable: servtype
		 *  Digest MD5 compatibility.
		 */
		this.servtype = "xmpp";
		this.connect_callback = callback;
		this.disconnecting = false;
		this.connected = false;
		this.authenticated = false;
		this.restored = false;

		// parse jid for domain
		this.domain = Strophe.getDomainFromJid(this.jid);

		this._changeConnectStatus(Strophe.Status.CONNECTING, null);

		this._proto._connect(wait, hold, route);
	},

	/** Function: attach
	 *  Attach to an already created and authenticated BOSH session.
	 *
	 *  This function is provided to allow Strophe to attach to BOSH
	 *  sessions which have been created externally, perhaps by a Web
	 *  application.  This is often used to support auto-login type features
	 *  without putting user credentials into the page.
	 *
	 *  Parameters:
	 *	(String) jid - The full JID that is bound by the session.
	 *	(String) sid - The SID of the BOSH session.
	 *	(String) rid - The current RID of the BOSH session.  This RID
	 *	  will be used by the next request.
	 *	(Function) callback The connect callback function.
	 *	(Integer) wait - The optional HTTPBIND wait value.  This is the
	 *	  time the server will wait before returning an empty result for
	 *	  a request.  The default setting of 60 seconds is recommended.
	 *	  Other settings will require tweaks to the Strophe.TIMEOUT value.
	 *	(Integer) hold - The optional HTTPBIND hold value.  This is the
	 *	  number of connections the server will hold at one time.  This
	 *	  should almost always be set to 1 (the default).
	 *	(Integer) wind - The optional HTTBIND window value.  This is the
	 *	  allowed range of request ids that are valid.  The default is 5.
	 */
	attach: function (jid, sid, rid, callback, wait, hold, wind)
	{
		if (this._proto instanceof Strophe.Bosh) {
			this._proto._attach(jid, sid, rid, callback, wait, hold, wind);
		} else {
			throw {
				name: 'StropheSessionError',
				message: 'The "attach" method can only be used with a BOSH connection.'
			};
		}
	},

	/** Function: restore
	 *  Attempt to restore a cached BOSH session.
	 *
	 *  This function is only useful in conjunction with providing the
	 *  "keepalive":true option when instantiating a new Strophe.Connection.
	 *
	 *  When "keepalive" is set to true, Strophe will cache the BOSH tokens
	 *  RID (Request ID) and SID (Session ID) and then when this function is
	 *  called, it will attempt to restore the session from those cached
	 *  tokens.
	 *
	 *  This function must therefore be called instead of connect or attach.
	 *
	 *  For an example on how to use it, please see examples/restore.js
	 *
	 *  Parameters:
	 *	(String) jid - The user's JID.  This may be a bare JID or a full JID.
	 *	(Function) callback - The connect callback function.
	 *	(Integer) wait - The optional HTTPBIND wait value.  This is the
	 *	  time the server will wait before returning an empty result for
	 *	  a request.  The default setting of 60 seconds is recommended.
	 *	(Integer) hold - The optional HTTPBIND hold value.  This is the
	 *	  number of connections the server will hold at one time.  This
	 *	  should almost always be set to 1 (the default).
	 *	(Integer) wind - The optional HTTBIND window value.  This is the
	 *	  allowed range of request ids that are valid.  The default is 5.
	 */
	restore: function (jid, callback, wait, hold, wind)
	{
		if (this._sessionCachingSupported()) {
			this._proto._restore(jid, callback, wait, hold, wind);
		} else {
			throw {
				name: 'StropheSessionError',
				message: 'The "restore" method can only be used with a BOSH connection.'
			};
		}
	},

	/** PrivateFunction: _sessionCachingSupported
	 * Checks whether sessionStorage and JSON are supported and whether we're
	 * using BOSH.
	 */
	_sessionCachingSupported: function ()
	{
		if (this._proto instanceof Strophe.Bosh) {
			if (!JSON) { return false; }
			try {
				window.sessionStorage.setItem('_strophe_', '_strophe_');
				window.sessionStorage.removeItem('_strophe_');
			} catch (e) {
				return false;
			}
			return true;
		}
		return false;
	},

	/** Function: xmlInput
	 *  User overrideable function that receives XML data coming into the
	 *  connection.
	 *
	 *  The default function does nothing.  User code can override this with
	 *  > Strophe.Connection.xmlInput = function (elem) {
	 *  >   (user code)
	 *  > };
	 *
	 *  Due to limitations of current Browsers' XML-Parsers the opening and closing
	 *  <stream> tag for WebSocket-Connoctions will be passed as selfclosing here.
	 *
	 *  BOSH-Connections will have all stanzas wrapped in a <body> tag. See
	 *  <Strophe.Bosh.strip> if you want to strip this tag.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The XML data received by the connection.
	 */
	/* jshint unused:false */
	xmlInput: function (elem)
	{
		return;
	},
	/* jshint unused:true */

	/** Function: xmlOutput
	 *  User overrideable function that receives XML data sent to the
	 *  connection.
	 *
	 *  The default function does nothing.  User code can override this with
	 *  > Strophe.Connection.xmlOutput = function (elem) {
	 *  >   (user code)
	 *  > };
	 *
	 *  Due to limitations of current Browsers' XML-Parsers the opening and closing
	 *  <stream> tag for WebSocket-Connoctions will be passed as selfclosing here.
	 *
	 *  BOSH-Connections will have all stanzas wrapped in a <body> tag. See
	 *  <Strophe.Bosh.strip> if you want to strip this tag.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The XMLdata sent by the connection.
	 */
	/* jshint unused:false */
	xmlOutput: function (elem)
	{
		return;
	},
	/* jshint unused:true */

	/** Function: rawInput
	 *  User overrideable function that receives raw data coming into the
	 *  connection.
	 *
	 *  The default function does nothing.  User code can override this with
	 *  > Strophe.Connection.rawInput = function (data) {
	 *  >   (user code)
	 *  > };
	 *
	 *  Parameters:
	 *	(String) data - The data received by the connection.
	 */
	/* jshint unused:false */
	rawInput: function (data)
	{
		return;
	},
	/* jshint unused:true */

	/** Function: rawOutput
	 *  User overrideable function that receives raw data sent to the
	 *  connection.
	 *
	 *  The default function does nothing.  User code can override this with
	 *  > Strophe.Connection.rawOutput = function (data) {
	 *  >   (user code)
	 *  > };
	 *
	 *  Parameters:
	 *	(String) data - The data sent by the connection.
	 */
	/* jshint unused:false */
	rawOutput: function (data)
	{
		return;
	},
	/* jshint unused:true */

	/** Function: send
	 *  Send a stanza.
	 *
	 *  This function is called to push data onto the send queue to
	 *  go out over the wire.  Whenever a request is sent to the BOSH
	 *  server, all pending data is sent and the queue is flushed.
	 *
	 *  Parameters:
	 *	(XMLElement |
	 *	 [XMLElement] |
	 *	 Strophe.Builder) elem - The stanza to send.
	 */
	send: function (elem)
	{
		if (elem === null) { return ; }
		if (typeof(elem.sort) === "function") {
			for (var i = 0; i < elem.length; i++) {
				this._queueData(elem[i]);
			}
		} else if (typeof(elem.tree) === "function") {
			this._queueData(elem.tree());
		} else {
			this._queueData(elem);
		}

		this._proto._send();
	},

	/** Function: flush
	 *  Immediately send any pending outgoing data.
	 *
	 *  Normally send() queues outgoing data until the next idle period
	 *  (100ms), which optimizes network use in the common cases when
	 *  several send()s are called in succession. flush() can be used to
	 *  immediately send all pending data.
	 */
	flush: function ()
	{
		// cancel the pending idle period and run the idle function
		// immediately
		clearTimeout(this._idleTimeout);
		this._onIdle();
	},

	/** Function: sendIQ
	 *  Helper function to send IQ stanzas.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The stanza to send.
	 *	(Function) callback - The callback function for a successful request.
	 *	(Function) errback - The callback function for a failed or timed
	 *	  out request.  On timeout, the stanza will be null.
	 *	(Integer) timeout - The time specified in milliseconds for a
	 *	  timeout to occur.
	 *
	 *  Returns:
	 *	The id used to send the IQ.
	*/
	sendIQ: function(elem, callback, errback, timeout) {
		var timeoutHandler = null;
		var that = this;

		if (typeof(elem.tree) === "function") {
			elem = elem.tree();
		}
		var id = elem.getAttribute('id');

		// inject id if not found
		if (!id) {
			id = this.getUniqueId("sendIQ");
			elem.setAttribute("id", id);
		}

		var expectedFrom = elem.getAttribute("to");
		var fulljid = this.jid;

		var handler = this.addHandler(function (stanza) {
			// remove timeout handler if there is one
			if (timeoutHandler) {
				that.deleteTimedHandler(timeoutHandler);
			}

			var acceptable = false;
			var from = stanza.getAttribute("from");
			if (from === expectedFrom ||
			   (expectedFrom === null &&
				   (from === Strophe.getBareJidFromJid(fulljid) ||
					from === Strophe.getDomainFromJid(fulljid) ||
					from === fulljid))) {
				acceptable = true;
			}

			if (!acceptable) {
				throw {
					name: "StropheError",
					message: "Got answer to IQ from wrong jid:" + from +
							 "\nExpected jid: " + expectedFrom
				};
			}

			var iqtype = stanza.getAttribute('type');
			if (iqtype == 'result') {
				if (callback) {
					callback(stanza);
				}
			} else if (iqtype == 'error') {
				if (errback) {
					errback(stanza);
				}
			} else {
				throw {
					name: "StropheError",
					message: "Got bad IQ type of " + iqtype
				};
			}
		}, null, 'iq', ['error', 'result'], id);

		// if timeout specified, setup timeout handler.
		if (timeout) {
			timeoutHandler = this.addTimedHandler(timeout, function () {
				// get rid of normal handler
				that.deleteHandler(handler);
				// call errback on timeout with null stanza
				if (errback) {
					errback(null);
				}
				return false;
			});
		}
		this.send(elem);
		return id;
	},

	/** PrivateFunction: _queueData
	 *  Queue outgoing data for later sending.  Also ensures that the data
	 *  is a DOMElement.
	 */
	_queueData: function (element) {
		if (element === null ||
			!element.tagName ||
			!element.childNodes) {
			throw {
				name: "StropheError",
				message: "Cannot queue non-DOMElement."
			};
		}

		this._data.push(element);
	},

	/** PrivateFunction: _sendRestart
	 *  Send an xmpp:restart stanza.
	 */
	_sendRestart: function ()
	{
		this._data.push("restart");

		this._proto._sendRestart();

		this._idleTimeout = setTimeout(this._onIdle.stropheBind(this), 100);
	},

	/** Function: addTimedHandler
	 *  Add a timed handler to the connection.
	 *
	 *  This function adds a timed handler.  The provided handler will
	 *  be called every period milliseconds until it returns false,
	 *  the connection is terminated, or the handler is removed.  Handlers
	 *  that wish to continue being invoked should return true.
	 *
	 *  Because of method binding it is necessary to save the result of
	 *  this function if you wish to remove a handler with
	 *  deleteTimedHandler().
	 *
	 *  Note that user handlers are not active until authentication is
	 *  successful.
	 *
	 *  Parameters:
	 *	(Integer) period - The period of the handler.
	 *	(Function) handler - The callback function.
	 *
	 *  Returns:
	 *	A reference to the handler that can be used to remove it.
	 */
	addTimedHandler: function (period, handler)
	{
		var thand = new Strophe.TimedHandler(period, handler);
		this.addTimeds.push(thand);
		return thand;
	},

	/** Function: deleteTimedHandler
	 *  Delete a timed handler for a connection.
	 *
	 *  This function removes a timed handler from the connection.  The
	 *  handRef parameter is *not* the function passed to addTimedHandler(),
	 *  but is the reference returned from addTimedHandler().
	 *
	 *  Parameters:
	 *	(Strophe.TimedHandler) handRef - The handler reference.
	 */
	deleteTimedHandler: function (handRef)
	{
		// this must be done in the Idle loop so that we don't change
		// the handlers during iteration
		this.removeTimeds.push(handRef);
	},

	/** Function: addHandler
	 *  Add a stanza handler for the connection.
	 *
	 *  This function adds a stanza handler to the connection.  The
	 *  handler callback will be called for any stanza that matches
	 *  the parameters.  Note that if multiple parameters are supplied,
	 *  they must all match for the handler to be invoked.
	 *
	 *  The handler will receive the stanza that triggered it as its argument.
	 *  *The handler should return true if it is to be invoked again;
	 *  returning false will remove the handler after it returns.*
	 *
	 *  As a convenience, the ns parameters applies to the top level element
	 *  and also any of its immediate children.  This is primarily to make
	 *  matching /iq/query elements easy.
	 *
	 *  The options argument contains handler matching flags that affect how
	 *  matches are determined. Currently the only flag is matchBare (a
	 *  boolean). When matchBare is true, the from parameter and the from
	 *  attribute on the stanza will be matched as bare JIDs instead of
	 *  full JIDs. To use this, pass {matchBare: true} as the value of
	 *  options. The default value for matchBare is false.
	 *
	 *  The return value should be saved if you wish to remove the handler
	 *  with deleteHandler().
	 *
	 *  Parameters:
	 *	(Function) handler - The user callback.
	 *	(String) ns - The namespace to match.
	 *	(String) name - The stanza name to match.
	 *	(String) type - The stanza type attribute to match.
	 *	(String) id - The stanza id attribute to match.
	 *	(String) from - The stanza from attribute to match.
	 *	(String) options - The handler options
	 *
	 *  Returns:
	 *	A reference to the handler that can be used to remove it.
	 */
	addHandler: function (handler, ns, name, type, id, from, options)
	{
		var hand = new Strophe.Handler(handler, ns, name, type, id, from, options);
		this.addHandlers.push(hand);
		return hand;
	},

	/** Function: deleteHandler
	 *  Delete a stanza handler for a connection.
	 *
	 *  This function removes a stanza handler from the connection.  The
	 *  handRef parameter is *not* the function passed to addHandler(),
	 *  but is the reference returned from addHandler().
	 *
	 *  Parameters:
	 *	(Strophe.Handler) handRef - The handler reference.
	 */
	deleteHandler: function (handRef)
	{
		// this must be done in the Idle loop so that we don't change
		// the handlers during iteration
		this.removeHandlers.push(handRef);
		// If a handler is being deleted while it is being added,
		// prevent it from getting added
		var i = this.addHandlers.indexOf(handRef);
		if (i >= 0) {
			this.addHandlers.splice(i, 1);
		}
	},

	/** Function: disconnect
	 *  Start the graceful disconnection process.
	 *
	 *  This function starts the disconnection process.  This process starts
	 *  by sending unavailable presence and sending BOSH body of type
	 *  terminate.  A timeout handler makes sure that disconnection happens
	 *  even if the BOSH server does not respond.
	 *  If the Connection object isn't connected, at least tries to abort all pending requests
	 *  so the connection object won't generate successful requests (which were already opened).
	 *
	 *  The user supplied connection callback will be notified of the
	 *  progress as this process happens.
	 *
	 *  Parameters:
	 *	(String) reason - The reason the disconnect is occuring.
	 */
	disconnect: function (reason)
	{
		this._changeConnectStatus(Strophe.Status.DISCONNECTING, reason);

		Strophe.info("Disconnect was called because: " + reason);
		if (this.connected) {
			var pres = false;
			this.disconnecting = true;
			if (this.authenticated) {
				pres = $pres({
					xmlns: Strophe.NS.CLIENT,
					type: 'unavailable'
				});
			}
			// setup timeout handler
			this._disconnectTimeout = this._addSysTimedHandler(
				3000, this._onDisconnectTimeout.stropheBind(this));
			this._proto._disconnect(pres);
		} else {
			Strophe.info("Disconnect was called before Strophe connected to the server");
			this._proto._abortAllRequests();
		}
	},

	/** PrivateFunction: _changeConnectStatus
	 *  _Private_ helper function that makes sure plugins and the user's
	 *  callback are notified of connection status changes.
	 *
	 *  Parameters:
	 *	(Integer) status - the new connection status, one of the values
	 *	  in Strophe.Status
	 *	(String) condition - the error condition or null
	 */
	_changeConnectStatus: function (status, condition)
	{
		// notify all plugins listening for status changes
		for (var k in Strophe._connectionPlugins) {
			if (Strophe._connectionPlugins.hasOwnProperty(k)) {
				var plugin = this[k];
				if (plugin.statusChanged) {
					try {
						plugin.statusChanged(status, condition);
					} catch (err) {
						Strophe.error("" + k + " plugin caused an exception " +
									  "changing status: " + err);
					}
				}
			}
		}

		// notify the user's callback
		if (this.connect_callback) {
			try {
				this.connect_callback(status, condition);
			} catch (e) {
				Strophe.error("User connection callback caused an " +
							  "exception: " + e);
			}
		}
	},

	/** PrivateFunction: _doDisconnect
	 *  _Private_ function to disconnect.
	 *
	 *  This is the last piece of the disconnection logic.  This resets the
	 *  connection and alerts the user's connection callback.
	 */
	_doDisconnect: function (condition)
	{
		if (typeof this._idleTimeout == "number") {
			clearTimeout(this._idleTimeout);
		}

		// Cancel Disconnect Timeout
		if (this._disconnectTimeout !== null) {
			this.deleteTimedHandler(this._disconnectTimeout);
			this._disconnectTimeout = null;
		}

		Strophe.info("_doDisconnect was called");
		this._proto._doDisconnect();

		this.authenticated = false;
		this.disconnecting = false;
		this.restored = false;

		// delete handlers
		this.handlers = [];
		this.timedHandlers = [];
		this.removeTimeds = [];
		this.removeHandlers = [];
		this.addTimeds = [];
		this.addHandlers = [];

		// tell the parent we disconnected
		this._changeConnectStatus(Strophe.Status.DISCONNECTED, condition);
		this.connected = false;
	},

	/** PrivateFunction: _dataRecv
	 *  _Private_ handler to processes incoming data from the the connection.
	 *
	 *  Except for _connect_cb handling the initial connection request,
	 *  this function handles the incoming data for all requests.  This
	 *  function also fires stanza handlers that match each incoming
	 *  stanza.
	 *
	 *  Parameters:
	 *	(Strophe.Request) req - The request that has data ready.
	 *	(string) req - The stanza a raw string (optiona).
	 */
	_dataRecv: function (req, raw)
	{
		Strophe.info("_dataRecv called");
		var elem = this._proto._reqToData(req);
		if (elem === null) { return; }

		if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
			if (elem.nodeName === this._proto.strip && elem.childNodes.length) {
				this.xmlInput(elem.childNodes[0]);
			} else {
				this.xmlInput(elem);
			}
		}
		if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
			if (raw) {
				this.rawInput(raw);
			} else {
				this.rawInput(Strophe.serialize(elem));
			}
		}

		// remove handlers scheduled for deletion
		var i, hand;
		while (this.removeHandlers.length > 0) {
			hand = this.removeHandlers.pop();
			i = this.handlers.indexOf(hand);
			if (i >= 0) {
				this.handlers.splice(i, 1);
			}
		}

		// add handlers scheduled for addition
		while (this.addHandlers.length > 0) {
			this.handlers.push(this.addHandlers.pop());
		}

		// handle graceful disconnect
		if (this.disconnecting && this._proto._emptyQueue()) {
			this._doDisconnect();
			return;
		}

		var type = elem.getAttribute("type");
		var cond, conflict;
		if (type !== null && type == "terminate") {
			// Don't process stanzas that come in after disconnect
			if (this.disconnecting) {
				return;
			}

			// an error occurred
			cond = elem.getAttribute("condition");
			conflict = elem.getElementsByTagName("conflict");
			if (cond !== null) {
				if (cond == "remote-stream-error" && conflict.length > 0) {
					cond = "conflict";
				}
				this._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
			} else {
				this._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
			}
			this._doDisconnect(cond);
			return;
		}

		// send each incoming stanza through the handler chain
		var that = this;
		Strophe.forEachChild(elem, null, function (child) {
			var i, newList;
			// process handlers
			newList = that.handlers;
			that.handlers = [];
			for (i = 0; i < newList.length; i++) {
				var hand = newList[i];
				// encapsulate 'handler.run' not to lose the whole handler list if
				// one of the handlers throws an exception
				try {
					if (hand.isMatch(child) &&
						(that.authenticated || !hand.user)) {
						if (hand.run(child)) {
							that.handlers.push(hand);
						}
					} else {
						that.handlers.push(hand);
					}
				} catch(e) {
					// if the handler throws an exception, we consider it as false
					Strophe.warn('Removing Strophe handlers due to uncaught exception: ' + e.message);
				}
			}
		});
	},


	/** Attribute: mechanisms
	 *  SASL Mechanisms available for Conncection.
	 */
	mechanisms: {},

	/** PrivateFunction: _connect_cb
	 *  _Private_ handler for initial connection request.
	 *
	 *  This handler is used to process the initial connection request
	 *  response from the BOSH server. It is used to set up authentication
	 *  handlers and start the authentication process.
	 *
	 *  SASL authentication will be attempted if available, otherwise
	 *  the code will fall back to legacy authentication.
	 *
	 *  Parameters:
	 *	(Strophe.Request) req - The current request.
	 *	(Function) _callback - low level (xmpp) connect callback function.
	 *	  Useful for plugins with their own xmpp connect callback (when their)
	 *	  want to do something special).
	 */
	_connect_cb: function (req, _callback, raw)
	{
		Strophe.info("_connect_cb was called");

		this.connected = true;

		var bodyWrap = this._proto._reqToData(req);
		if (!bodyWrap) { return; }

		if (this.xmlInput !== Strophe.Connection.prototype.xmlInput) {
			if (bodyWrap.nodeName === this._proto.strip && bodyWrap.childNodes.length) {
				this.xmlInput(bodyWrap.childNodes[0]);
			} else {
				this.xmlInput(bodyWrap);
			}
		}
		if (this.rawInput !== Strophe.Connection.prototype.rawInput) {
			if (raw) {
				this.rawInput(raw);
			} else {
				this.rawInput(Strophe.serialize(bodyWrap));
			}
		}

		var conncheck = this._proto._connect_cb(bodyWrap);
		if (conncheck === Strophe.Status.CONNFAIL) {
			return;
		}

		this._authentication.sasl_scram_sha1 = false;
		this._authentication.sasl_plain = false;
		this._authentication.sasl_digest_md5 = false;
		this._authentication.sasl_anonymous = false;

		this._authentication.legacy_auth = false;

		// Check for the stream:features tag
		var hasFeatures;
		if (bodyWrap.getElementsByTagNameNS) {
			hasFeatures = bodyWrap.getElementsByTagNameNS(Strophe.NS.STREAM, "features").length > 0;
		} else {
			hasFeatures = bodyWrap.getElementsByTagName("stream:features").length > 0 || bodyWrap.getElementsByTagName("features").length > 0;
		}
		var mechanisms = bodyWrap.getElementsByTagName("mechanism");
		var matched = [];
		var i, mech, found_authentication = false;
		if (!hasFeatures) {
			this._proto._no_auth_received(_callback);
			return;
		}
		if (mechanisms.length > 0) {
			for (i = 0; i < mechanisms.length; i++) {
				mech = Strophe.getText(mechanisms[i]);
				if (this.mechanisms[mech]) matched.push(this.mechanisms[mech]);
			}
		}
		this._authentication.legacy_auth =
			bodyWrap.getElementsByTagName("auth").length > 0;
		found_authentication = this._authentication.legacy_auth ||
			matched.length > 0;
		if (!found_authentication) {
			this._proto._no_auth_received(_callback);
			return;
		}
		if (this.do_authentication !== false)
			this.authenticate(matched);
	},

	/** Function: authenticate
	 * Set up authentication
	 *
	 *  Contiunues the initial connection request by setting up authentication
	 *  handlers and start the authentication process.
	 *
	 *  SASL authentication will be attempted if available, otherwise
	 *  the code will fall back to legacy authentication.
	 *
	 */
	authenticate: function (matched)
	{
	  var i;
	  // Sorting matched mechanisms according to priority.
	  for (i = 0; i < matched.length - 1; ++i) {
		var higher = i;
		for (var j = i + 1; j < matched.length; ++j) {
		  if (matched[j].prototype.priority > matched[higher].prototype.priority) {
			higher = j;
		  }
		}
		if (higher != i) {
		  var swap = matched[i];
		  matched[i] = matched[higher];
		  matched[higher] = swap;
		}
	  }

	  // run each mechanism
	  var mechanism_found = false;
	  for (i = 0; i < matched.length; ++i) {
		if (!matched[i].test(this)) continue;

		this._sasl_success_handler = this._addSysHandler(
		  this._sasl_success_cb.stropheBind(this), null,
		  "success", null, null);
		this._sasl_failure_handler = this._addSysHandler(
		  this._sasl_failure_cb.stropheBind(this), null,
		  "failure", null, null);
		this._sasl_challenge_handler = this._addSysHandler(
		  this._sasl_challenge_cb.stropheBind(this), null,
		  "challenge", null, null);

		this._sasl_mechanism = new matched[i]();
		this._sasl_mechanism.onStart(this);

		var request_auth_exchange = $build("auth", {
		  xmlns: Strophe.NS.SASL,
		  mechanism: this._sasl_mechanism.name
		});

		if (this._sasl_mechanism.isClientFirst) {
		  var response = this._sasl_mechanism.onChallenge(this, null);
		  request_auth_exchange.t(Base64.encode(response));
		}

		this.send(request_auth_exchange.tree());

		mechanism_found = true;
		break;
	  }

	  if (!mechanism_found) {
		// if none of the mechanism worked
		if (Strophe.getNodeFromJid(this.jid) === null) {
			// we don't have a node, which is required for non-anonymous
			// client connections
			this._changeConnectStatus(Strophe.Status.CONNFAIL,
									  'x-strophe-bad-non-anon-jid');
			this.disconnect('x-strophe-bad-non-anon-jid');
		} else {
		  // fall back to legacy authentication
		  this._changeConnectStatus(Strophe.Status.AUTHENTICATING, null);
		  this._addSysHandler(this._auth1_cb.stropheBind(this), null, null,
							  null, "_auth_1");

		  this.send($iq({
			type: "get",
			to: this.domain,
			id: "_auth_1"
		  }).c("query", {
			xmlns: Strophe.NS.AUTH
		  }).c("username", {}).t(Strophe.getNodeFromJid(this.jid)).tree());
		}
	  }

	},

	_sasl_challenge_cb: function(elem) {
	  var challenge = Base64.decode(Strophe.getText(elem));
	  var response = this._sasl_mechanism.onChallenge(this, challenge);

	  var stanza = $build('response', {
		  xmlns: Strophe.NS.SASL
	  });
	  if (response !== "") {
		stanza.t(Base64.encode(response));
	  }
	  this.send(stanza.tree());

	  return true;
	},

	/** PrivateFunction: _auth1_cb
	 *  _Private_ handler for legacy authentication.
	 *
	 *  This handler is called in response to the initial <iq type='get'/>
	 *  for legacy authentication.  It builds an authentication <iq/> and
	 *  sends it, creating a handler (calling back to _auth2_cb()) to
	 *  handle the result
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The stanza that triggered the callback.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	/* jshint unused:false */
	_auth1_cb: function (elem)
	{
		// build plaintext auth iq
		var iq = $iq({type: "set", id: "_auth_2"})
			.c('query', {xmlns: Strophe.NS.AUTH})
			.c('username', {}).t(Strophe.getNodeFromJid(this.jid))
			.up()
			.c('password').t(this.pass);

		if (!Strophe.getResourceFromJid(this.jid)) {
			// since the user has not supplied a resource, we pick
			// a default one here.  unlike other auth methods, the server
			// cannot do this for us.
			this.jid = Strophe.getBareJidFromJid(this.jid) + '/strophe';
		}
		iq.up().c('resource', {}).t(Strophe.getResourceFromJid(this.jid));

		this._addSysHandler(this._auth2_cb.stropheBind(this), null,
							null, null, "_auth_2");

		this.send(iq.tree());

		return false;
	},
	/* jshint unused:true */

	/** PrivateFunction: _sasl_success_cb
	 *  _Private_ handler for succesful SASL authentication.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The matching stanza.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	_sasl_success_cb: function (elem)
	{
		if (this._sasl_data["server-signature"]) {
			var serverSignature;
			var success = Base64.decode(Strophe.getText(elem));
			var attribMatch = /([a-z]+)=([^,]+)(,|$)/;
			var matches = success.match(attribMatch);
			if (matches[1] == "v") {
				serverSignature = matches[2];
			}

			if (serverSignature != this._sasl_data["server-signature"]) {
			  // remove old handlers
			  this.deleteHandler(this._sasl_failure_handler);
			  this._sasl_failure_handler = null;
			  if (this._sasl_challenge_handler) {
				this.deleteHandler(this._sasl_challenge_handler);
				this._sasl_challenge_handler = null;
			  }

			  this._sasl_data = {};
			  return this._sasl_failure_cb(null);
			}
		}

		Strophe.info("SASL authentication succeeded.");

		if(this._sasl_mechanism)
		  this._sasl_mechanism.onSuccess();

		// remove old handlers
		this.deleteHandler(this._sasl_failure_handler);
		this._sasl_failure_handler = null;
		if (this._sasl_challenge_handler) {
			this.deleteHandler(this._sasl_challenge_handler);
			this._sasl_challenge_handler = null;
		}

		var streamfeature_handlers = [];
		var wrapper = function(handlers, elem) {
			while (handlers.length) {
				this.deleteHandler(handlers.pop());
			}
			this._sasl_auth1_cb.stropheBind(this)(elem);
			return false;
		};
		streamfeature_handlers.push(this._addSysHandler(function(elem) {
			wrapper.stropheBind(this)(streamfeature_handlers, elem);
		}.stropheBind(this), null, "stream:features", null, null));
		streamfeature_handlers.push(this._addSysHandler(function(elem) {
			wrapper.stropheBind(this)(streamfeature_handlers, elem);
		}.stropheBind(this), Strophe.NS.STREAM, "features", null, null));

		// we must send an xmpp:restart now
		this._sendRestart();

		return false;
	},

	/** PrivateFunction: _sasl_auth1_cb
	 *  _Private_ handler to start stream binding.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The matching stanza.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	_sasl_auth1_cb: function (elem)
	{
		// save stream:features for future usage
		this.features = elem;

		var i, child;

		for (i = 0; i < elem.childNodes.length; i++) {
			child = elem.childNodes[i];
			if (child.nodeName == 'bind') {
				this.do_bind = true;
			}

			if (child.nodeName == 'session') {
				this.do_session = true;
			}
		}

		if (!this.do_bind) {
			this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
			return false;
		} else {
			this._addSysHandler(this._sasl_bind_cb.stropheBind(this), null, null,
								null, "_bind_auth_2");

			var resource = Strophe.getResourceFromJid(this.jid);
			if (resource) {
				this.send($iq({type: "set", id: "_bind_auth_2"})
						  .c('bind', {xmlns: Strophe.NS.BIND})
						  .c('resource', {}).t(resource).tree());
			} else {
				this.send($iq({type: "set", id: "_bind_auth_2"})
						  .c('bind', {xmlns: Strophe.NS.BIND})
						  .tree());
			}
		}

		return false;
	},

	/** PrivateFunction: _sasl_bind_cb
	 *  _Private_ handler for binding result and session start.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The matching stanza.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	_sasl_bind_cb: function (elem)
	{
		if (elem.getAttribute("type") == "error") {
			Strophe.info("SASL binding failed.");
			var conflict = elem.getElementsByTagName("conflict"), condition;
			if (conflict.length > 0) {
				condition = 'conflict';
			}
			this._changeConnectStatus(Strophe.Status.AUTHFAIL, condition);
			return false;
		}

		// TODO - need to grab errors
		var bind = elem.getElementsByTagName("bind");
		var jidNode;
		if (bind.length > 0) {
			// Grab jid
			jidNode = bind[0].getElementsByTagName("jid");
			if (jidNode.length > 0) {
				this.jid = Strophe.getText(jidNode[0]);

				if (this.do_session) {
					this._addSysHandler(this._sasl_session_cb.stropheBind(this),
										null, null, null, "_session_auth_2");

					this.send($iq({type: "set", id: "_session_auth_2"})
								  .c('session', {xmlns: Strophe.NS.SESSION})
								  .tree());
				} else {
					this.authenticated = true;
					this._changeConnectStatus(Strophe.Status.CONNECTED, null);
				}
			}
		} else {
			Strophe.info("SASL binding failed.");
			this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
			return false;
		}
	},

	/** PrivateFunction: _sasl_session_cb
	 *  _Private_ handler to finish successful SASL connection.
	 *
	 *  This sets Connection.authenticated to true on success, which
	 *  starts the processing of user handlers.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The matching stanza.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	_sasl_session_cb: function (elem)
	{
		if (elem.getAttribute("type") == "result") {
			this.authenticated = true;
			this._changeConnectStatus(Strophe.Status.CONNECTED, null);
		} else if (elem.getAttribute("type") == "error") {
			Strophe.info("Session creation failed.");
			this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
			return false;
		}

		return false;
	},

	/** PrivateFunction: _sasl_failure_cb
	 *  _Private_ handler for SASL authentication failure.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The matching stanza.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	/* jshint unused:false */
	_sasl_failure_cb: function (elem)
	{
		// delete unneeded handlers
		if (this._sasl_success_handler) {
			this.deleteHandler(this._sasl_success_handler);
			this._sasl_success_handler = null;
		}
		if (this._sasl_challenge_handler) {
			this.deleteHandler(this._sasl_challenge_handler);
			this._sasl_challenge_handler = null;
		}

		if(this._sasl_mechanism)
		  this._sasl_mechanism.onFailure();
		this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
		return false;
	},
	/* jshint unused:true */

	/** PrivateFunction: _auth2_cb
	 *  _Private_ handler to finish legacy authentication.
	 *
	 *  This handler is called when the result from the jabber:iq:auth
	 *  <iq/> stanza is returned.
	 *
	 *  Parameters:
	 *	(XMLElement) elem - The stanza that triggered the callback.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	_auth2_cb: function (elem)
	{
		if (elem.getAttribute("type") == "result") {
			this.authenticated = true;
			this._changeConnectStatus(Strophe.Status.CONNECTED, null);
		} else if (elem.getAttribute("type") == "error") {
			this._changeConnectStatus(Strophe.Status.AUTHFAIL, null);
			this.disconnect('authentication failed');
		}

		return false;
	},

	/** PrivateFunction: _addSysTimedHandler
	 *  _Private_ function to add a system level timed handler.
	 *
	 *  This function is used to add a Strophe.TimedHandler for the
	 *  library code.  System timed handlers are allowed to run before
	 *  authentication is complete.
	 *
	 *  Parameters:
	 *	(Integer) period - The period of the handler.
	 *	(Function) handler - The callback function.
	 */
	_addSysTimedHandler: function (period, handler)
	{
		var thand = new Strophe.TimedHandler(period, handler);
		thand.user = false;
		this.addTimeds.push(thand);
		return thand;
	},

	/** PrivateFunction: _addSysHandler
	 *  _Private_ function to add a system level stanza handler.
	 *
	 *  This function is used to add a Strophe.Handler for the
	 *  library code.  System stanza handlers are allowed to run before
	 *  authentication is complete.
	 *
	 *  Parameters:
	 *	(Function) handler - The callback function.
	 *	(String) ns - The namespace to match.
	 *	(String) name - The stanza name to match.
	 *	(String) type - The stanza type attribute to match.
	 *	(String) id - The stanza id attribute to match.
	 */
	_addSysHandler: function (handler, ns, name, type, id)
	{
		var hand = new Strophe.Handler(handler, ns, name, type, id);
		hand.user = false;
		this.addHandlers.push(hand);
		return hand;
	},

	/** PrivateFunction: _onDisconnectTimeout
	 *  _Private_ timeout handler for handling non-graceful disconnection.
	 *
	 *  If the graceful disconnect process does not complete within the
	 *  time allotted, this handler finishes the disconnect anyway.
	 *
	 *  Returns:
	 *	false to remove the handler.
	 */
	_onDisconnectTimeout: function ()
	{
		Strophe.info("_onDisconnectTimeout was called");

		this._proto._onDisconnectTimeout();

		// actually disconnect
		this._doDisconnect();

		return false;
	},

	/** PrivateFunction: _onIdle
	 *  _Private_ handler to process events during idle cycle.
	 *
	 *  This handler is called every 100ms to fire timed handlers that
	 *  are ready and keep poll requests going.
	 */
	_onIdle: function ()
	{
		var i, thand, since, newList;

		// add timed handlers scheduled for addition
		// NOTE: we add before remove in the case a timed handler is
		// added and then deleted before the next _onIdle() call.
		while (this.addTimeds.length > 0) {
			this.timedHandlers.push(this.addTimeds.pop());
		}

		// remove timed handlers that have been scheduled for deletion
		while (this.removeTimeds.length > 0) {
			thand = this.removeTimeds.pop();
			i = this.timedHandlers.indexOf(thand);
			if (i >= 0) {
				this.timedHandlers.splice(i, 1);
			}
		}

		// call ready timed handlers
		var now = new Date().getTime();
		newList = [];
		for (i = 0; i < this.timedHandlers.length; i++) {
			thand = this.timedHandlers[i];
			if (this.authenticated || !thand.user) {
				since = thand.lastCalled + thand.period;
				if (since - now <= 0) {
					if (thand.run()) {
						newList.push(thand);
					}
				} else {
					newList.push(thand);
				}
			}
		}
		this.timedHandlers = newList;

		clearTimeout(this._idleTimeout);

		this._proto._onIdle();

		// reactivate the timer only if connected
		if (this.connected) {
			this._idleTimeout = setTimeout(this._onIdle.stropheBind(this), 100);
		}
	}
};

/** Class: Strophe.SASLMechanism
 *
 *  encapsulates SASL authentication mechanisms.
 *
 *  User code may override the priority for each mechanism or disable it completely.
 *  See <priority> for information about changing priority and <test> for informatian on
 *  how to disable a mechanism.
 *
 *  By default, all mechanisms are enabled and the priorities are
 *
 *  SCRAM-SHA1 - 40
 *  DIGEST-MD5 - 30
 *  Plain - 20
 */

/**
 * PrivateConstructor: Strophe.SASLMechanism
 * SASL auth mechanism abstraction.
 *
 *  Parameters:
 *	(String) name - SASL Mechanism name.
 *	(Boolean) isClientFirst - If client should send response first without challenge.
 *	(Number) priority - Priority.
 *
 *  Returns:
 *	A new Strophe.SASLMechanism object.
 */
Strophe.SASLMechanism = function(name, isClientFirst, priority) {
  /** PrivateVariable: name
   *  Mechanism name.
   */
  this.name = name;
  /** PrivateVariable: isClientFirst
   *  If client sends response without initial server challenge.
   */
  this.isClientFirst = isClientFirst;
  /** Variable: priority
   *  Determines which <SASLMechanism> is chosen for authentication (Higher is better).
   *  Users may override this to prioritize mechanisms differently.
   *
   *  In the default configuration the priorities are
   *
   *  SCRAM-SHA1 - 40
   *  DIGEST-MD5 - 30
   *  Plain - 20
   *
   *  Example: (This will cause Strophe to choose the mechanism that the server sent first)
   *
   *  > Strophe.SASLMD5.priority = Strophe.SASLSHA1.priority;
   *
   *  See <SASL mechanisms> for a list of available mechanisms.
   *
   */
  this.priority = priority;
};

Strophe.SASLMechanism.prototype = {
  /**
   *  Function: test
   *  Checks if mechanism able to run.
   *  To disable a mechanism, make this return false;
   *
   *  To disable plain authentication run
   *  > Strophe.SASLPlain.test = function() {
   *  >   return false;
   *  > }
   *
   *  See <SASL mechanisms> for a list of available mechanisms.
   *
   *  Parameters:
   *	(Strophe.Connection) connection - Target Connection.
   *
   *  Returns:
   *	(Boolean) If mechanism was able to run.
   */
  /* jshint unused:false */
  test: function(connection) {
	return true;
  },
  /* jshint unused:true */

  /** PrivateFunction: onStart
   *  Called before starting mechanism on some connection.
   *
   *  Parameters:
   *	(Strophe.Connection) connection - Target Connection.
   */
  onStart: function(connection)
  {
	this._connection = connection;
  },

  /** PrivateFunction: onChallenge
   *  Called by protocol implementation on incoming challenge. If client is
   *  first (isClientFirst == true) challenge will be null on the first call.
   *
   *  Parameters:
   *	(Strophe.Connection) connection - Target Connection.
   *	(String) challenge - current challenge to handle.
   *
   *  Returns:
   *	(String) Mechanism response.
   */
  /* jshint unused:false */
  onChallenge: function(connection, challenge) {
	throw new Error("You should implement challenge handling!");
  },
  /* jshint unused:true */

  /** PrivateFunction: onFailure
   *  Protocol informs mechanism implementation about SASL failure.
   */
  onFailure: function() {
	this._connection = null;
  },

  /** PrivateFunction: onSuccess
   *  Protocol informs mechanism implementation about SASL success.
   */
  onSuccess: function() {
	this._connection = null;
  }
};

  /** Constants: SASL mechanisms
   *  Available authentication mechanisms
   *
   *  Strophe.SASLAnonymous - SASL Anonymous authentication.
   *  Strophe.SASLPlain - SASL Plain authentication.
   *  Strophe.SASLMD5 - SASL Digest-MD5 authentication
   *  Strophe.SASLSHA1 - SASL SCRAM-SHA1 authentication
   */

// Building SASL callbacks

/** PrivateConstructor: SASLAnonymous
 *  SASL Anonymous authentication.
 */
Strophe.SASLAnonymous = function() {};

Strophe.SASLAnonymous.prototype = new Strophe.SASLMechanism("ANONYMOUS", false, 10);

Strophe.SASLAnonymous.test = function(connection) {
  return connection.authcid === null;
};

Strophe.Connection.prototype.mechanisms[Strophe.SASLAnonymous.prototype.name] = Strophe.SASLAnonymous;

/** PrivateConstructor: SASLPlain
 *  SASL Plain authentication.
 */
Strophe.SASLPlain = function() {};

Strophe.SASLPlain.prototype = new Strophe.SASLMechanism("PLAIN", true, 20);

Strophe.SASLPlain.test = function(connection) {
  return connection.authcid !== null;
};

Strophe.SASLPlain.prototype.onChallenge = function(connection) {
  var auth_str = connection.authzid;
  auth_str = auth_str + "\u0000";
  auth_str = auth_str + connection.authcid;
  auth_str = auth_str + "\u0000";
  auth_str = auth_str + connection.pass;
  return auth_str;
};

Strophe.Connection.prototype.mechanisms[Strophe.SASLPlain.prototype.name] = Strophe.SASLPlain;

/** PrivateConstructor: SASLSHA1
 *  SASL SCRAM SHA 1 authentication.
 */
Strophe.SASLSHA1 = function() {};

/* TEST:
 * This is a simple example of a SCRAM-SHA-1 authentication exchange
 * when the client doesn't support channel bindings (username 'user' and
 * password 'pencil' are used):
 *
 * C: n,,n=user,r=fyko+d2lbbFgONRv9qkxdawL
 * S: r=fyko+d2lbbFgONRv9qkxdawL3rfcNHYJY1ZVvWVs7j,s=QSXCR+Q6sek8bf92,
 * i=4096
 * C: c=biws,r=fyko+d2lbbFgONRv9qkxdawL3rfcNHYJY1ZVvWVs7j,
 * p=v0X8v3Bz2T0CJGbJQyF0X+HI4Ts=
 * S: v=rmF9pqV8S7suAoZWja4dJRkFsKQ=
 *
 */

Strophe.SASLSHA1.prototype = new Strophe.SASLMechanism("SCRAM-SHA-1", true, 40);

Strophe.SASLSHA1.test = function(connection) {
  return connection.authcid !== null;
};

Strophe.SASLSHA1.prototype.onChallenge = function(connection, challenge, test_cnonce) {
  var cnonce = test_cnonce || MD5.hexdigest(Math.random() * 1234567890);

  var auth_str = "n=" + connection.authcid;
  auth_str += ",r=";
  auth_str += cnonce;

  connection._sasl_data.cnonce = cnonce;
  connection._sasl_data["client-first-message-bare"] = auth_str;

  auth_str = "n,," + auth_str;

  this.onChallenge = function (connection, challenge)
  {
	var nonce, salt, iter, Hi, U, U_old, i, k;
	var clientKey, serverKey, clientSignature;
	var responseText = "c=biws,";
	var authMessage = connection._sasl_data["client-first-message-bare"] + "," +
	  challenge + ",";
	var cnonce = connection._sasl_data.cnonce;
	var attribMatch = /([a-z]+)=([^,]+)(,|$)/;

	while (challenge.match(attribMatch)) {
	  var matches = challenge.match(attribMatch);
	  challenge = challenge.replace(matches[0], "");
	  switch (matches[1]) {
	  case "r":
		nonce = matches[2];
		break;
	  case "s":
		salt = matches[2];
		break;
	  case "i":
		iter = matches[2];
		break;
	  }
	}

	if (nonce.substr(0, cnonce.length) !== cnonce) {
	  connection._sasl_data = {};
	  return connection._sasl_failure_cb();
	}

	responseText += "r=" + nonce;
	authMessage += responseText;

	salt = Base64.decode(salt);
	salt += "\x00\x00\x00\x01";

	Hi = U_old = SHA1.core_hmac_sha1(connection.pass, salt);
	for (i = 1; i < iter; i++) {
	  U = SHA1.core_hmac_sha1(connection.pass, SHA1.binb2str(U_old));
	  for (k = 0; k < 5; k++) {
		Hi[k] ^= U[k];
	  }
	  U_old = U;
	}
	Hi = SHA1.binb2str(Hi);

	clientKey = SHA1.core_hmac_sha1(Hi, "Client Key");
	serverKey = SHA1.str_hmac_sha1(Hi, "Server Key");
	clientSignature = SHA1.core_hmac_sha1(SHA1.str_sha1(SHA1.binb2str(clientKey)), authMessage);
	connection._sasl_data["server-signature"] = SHA1.b64_hmac_sha1(serverKey, authMessage);

	for (k = 0; k < 5; k++) {
	  clientKey[k] ^= clientSignature[k];
	}

	responseText += ",p=" + Base64.encode(SHA1.binb2str(clientKey));

	return responseText;
  }.stropheBind(this);

  return auth_str;
};

Strophe.Connection.prototype.mechanisms[Strophe.SASLSHA1.prototype.name] = Strophe.SASLSHA1;

/** PrivateConstructor: SASLMD5
 *  SASL DIGEST MD5 authentication.
 */
Strophe.SASLMD5 = function() {};

Strophe.SASLMD5.prototype = new Strophe.SASLMechanism("DIGEST-MD5", false, 30);

Strophe.SASLMD5.test = function(connection) {
  return connection.authcid !== null;
};

/** PrivateFunction: _quote
 *  _Private_ utility function to backslash escape and quote strings.
 *
 *  Parameters:
 *	(String) str - The string to be quoted.
 *
 *  Returns:
 *	quoted string
 */
Strophe.SASLMD5.prototype._quote = function (str)
  {
	return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
	//" end string workaround for emacs
  };


Strophe.SASLMD5.prototype.onChallenge = function(connection, challenge, test_cnonce) {
  var attribMatch = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/;
  var cnonce = test_cnonce || MD5.hexdigest("" + (Math.random() * 1234567890));
  var realm = "";
  var host = null;
  var nonce = "";
  var qop = "";
  var matches;

  while (challenge.match(attribMatch)) {
	matches = challenge.match(attribMatch);
	challenge = challenge.replace(matches[0], "");
	matches[2] = matches[2].replace(/^"(.+)"$/, "$1");
	switch (matches[1]) {
	case "realm":
	  realm = matches[2];
	  break;
	case "nonce":
	  nonce = matches[2];
	  break;
	case "qop":
	  qop = matches[2];
	  break;
	case "host":
	  host = matches[2];
	  break;
	}
  }

  var digest_uri = connection.servtype + "/" + connection.domain;
  if (host !== null) {
	digest_uri = digest_uri + "/" + host;
  }

  var A1 = MD5.hash(connection.authcid +
					":" + realm + ":" + this._connection.pass) +
	":" + nonce + ":" + cnonce;
  var A2 = 'AUTHENTICATE:' + digest_uri;

  var responseText = "";
  responseText += 'charset=utf-8,';
  responseText += 'username=' +
	this._quote(connection.authcid) + ',';
  responseText += 'realm=' + this._quote(realm) + ',';
  responseText += 'nonce=' + this._quote(nonce) + ',';
  responseText += 'nc=00000001,';
  responseText += 'cnonce=' + this._quote(cnonce) + ',';
  responseText += 'digest-uri=' + this._quote(digest_uri) + ',';
  responseText += 'response=' + MD5.hexdigest(MD5.hexdigest(A1) + ":" +
											  nonce + ":00000001:" +
											  cnonce + ":auth:" +
											  MD5.hexdigest(A2)) + ",";
  responseText += 'qop=auth';

  this.onChallenge = function ()
  {
	  return "";
  }.stropheBind(this);

  return responseText;
};

Strophe.Connection.prototype.mechanisms[Strophe.SASLMD5.prototype.name] = Strophe.SASLMD5;

return {
	Strophe:		Strophe,
	$build:		 $build,
	$msg:		   $msg,
	$iq:			$iq,
	$pres:		  $pres,
	SHA1:		   SHA1,
	Base64:		 Base64,
	MD5:			MD5
};
}));

/*
	This program is distributed under the terms of the MIT license.
	Please see the LICENSE file for details.

	Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define, window, setTimeout, clearTimeout, XMLHttpRequest, ActiveXObject, Strophe, $build */

(function (root, factory) {
	//if (typeof define === 'function' && define.amd) {
	if (false) {
		define('strophe-bosh', ['strophe-core'], function (core) {
			return factory(
				core.Strophe,
				core.$build
			);
		});
	} else {
		// Browser globals
		return factory(Strophe, $build);
	}
}(this, function (Strophe, $build) {

/** PrivateClass: Strophe.Request
 *  _Private_ helper class that provides a cross implementation abstraction
 *  for a BOSH related XMLHttpRequest.
 *
 *  The Strophe.Request class is used internally to encapsulate BOSH request
 *  information.  It is not meant to be used from user's code.
 */

/** PrivateConstructor: Strophe.Request
 *  Create and initialize a new Strophe.Request object.
 *
 *  Parameters:
 *	(XMLElement) elem - The XML data to be sent in the request.
 *	(Function) func - The function that will be called when the
 *	  XMLHttpRequest readyState changes.
 *	(Integer) rid - The BOSH rid attribute associated with this request.
 *	(Integer) sends - The number of times this same request has been
 *	  sent.
 */
Strophe.Request = function (elem, func, rid, sends)
{
	this.id = ++Strophe._requestId;
	this.xmlData = elem;
	this.data = Strophe.serialize(elem);
	// save original function in case we need to make a new request
	// from this one.
	this.origFunc = func;
	this.func = func;
	this.rid = rid;
	this.date = NaN;
	this.sends = sends || 0;
	this.abort = false;
	this.dead = null;

	this.age = function () {
		if (!this.date) { return 0; }
		var now = new Date();
		return (now - this.date) / 1000;
	};
	this.timeDead = function () {
		if (!this.dead) { return 0; }
		var now = new Date();
		return (now - this.dead) / 1000;
	};
	this.xhr = this._newXHR();
};

Strophe.Request.prototype = {
	/** PrivateFunction: getResponse
	 *  Get a response from the underlying XMLHttpRequest.
	 *
	 *  This function attempts to get a response from the request and checks
	 *  for errors.
	 *
	 *  Throws:
	 *	"parsererror" - A parser error occured.
	 *
	 *  Returns:
	 *	The DOM element tree of the response.
	 */
	getResponse: function ()
	{
		var node = null;
		if (this.xhr.responseXML && this.xhr.responseXML.documentElement) {
			node = this.xhr.responseXML.documentElement;
			if (node.tagName == "parsererror") {
				Strophe.error("invalid response received");
				Strophe.error("responseText: " + this.xhr.responseText);
				Strophe.error("responseXML: " +
							  Strophe.serialize(this.xhr.responseXML));
				throw "parsererror";
			}
		} else if (this.xhr.responseText) {
			Strophe.error("invalid response received");
			Strophe.error("responseText: " + this.xhr.responseText);
			Strophe.error("responseXML: " +
						  Strophe.serialize(this.xhr.responseXML));
		}

		return node;
	},

	/** PrivateFunction: _newXHR
	 *  _Private_ helper function to create XMLHttpRequests.
	 *
	 *  This function creates XMLHttpRequests across all implementations.
	 *
	 *  Returns:
	 *	A new XMLHttpRequest.
	 */
	_newXHR: function ()
	{
		var xhr = null;
		if (window.XMLHttpRequest) {
			xhr = new XMLHttpRequest();
			if (xhr.overrideMimeType) {
				xhr.overrideMimeType("text/xml; charset=utf-8");
			}
		} else if (window.ActiveXObject) {
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		}

		// use Function.bind() to prepend ourselves as an argument
		xhr.onreadystatechange = this.func.stropheBind(null, this);

		return xhr;
	}
};

/** Class: Strophe.Bosh
 *  _Private_ helper class that handles BOSH Connections
 *
 *  The Strophe.Bosh class is used internally by Strophe.Connection
 *  to encapsulate BOSH sessions. It is not meant to be used from user's code.
 */

/** File: bosh.js
 *  A JavaScript library to enable BOSH in Strophejs.
 *
 *  this library uses Bidirectional-streams Over Synchronous HTTP (BOSH)
 *  to emulate a persistent, stateful, two-way connection to an XMPP server.
 *  More information on BOSH can be found in XEP 124.
 */

/** PrivateConstructor: Strophe.Bosh
 *  Create and initialize a Strophe.Bosh object.
 *
 *  Parameters:
 *	(Strophe.Connection) connection - The Strophe.Connection that will use BOSH.
 *
 *  Returns:
 *	A new Strophe.Bosh object.
 */
Strophe.Bosh = function(connection) {
	this._conn = connection;
	/* request id for body tags */
	this.rid = Math.floor(Math.random() * 4294967295);
	/* The current session ID. */
	this.sid = null;

	// default BOSH values
	this.hold = 1;
	this.wait = 60;
	this.window = 5;
	this.errors = 0;

	this._requests = [];
};

Strophe.Bosh.prototype = {
	/** Variable: strip
	 *
	 *  BOSH-Connections will have all stanzas wrapped in a <body> tag when
	 *  passed to <Strophe.Connection.xmlInput> or <Strophe.Connection.xmlOutput>.
	 *  To strip this tag, User code can set <Strophe.Bosh.strip> to "body":
	 *
	 *  > Strophe.Bosh.prototype.strip = "body";
	 *
	 *  This will enable stripping of the body tag in both
	 *  <Strophe.Connection.xmlInput> and <Strophe.Connection.xmlOutput>.
	 */
	strip: null,

	/** PrivateFunction: _buildBody
	 *  _Private_ helper function to generate the <body/> wrapper for BOSH.
	 *
	 *  Returns:
	 *	A Strophe.Builder with a <body/> element.
	 */
	_buildBody: function ()
	{
		var bodyWrap = $build('body', {
			rid: this.rid++,
			xmlns: Strophe.NS.HTTPBIND
		});
		if (this.sid !== null) {
			bodyWrap.attrs({sid: this.sid});
		}
		if (this._conn.options.keepalive) {
			this._cacheSession();
		}
		return bodyWrap;
	},

	/** PrivateFunction: _reset
	 *  Reset the connection.
	 *
	 *  This function is called by the reset function of the Strophe Connection
	 */
	_reset: function ()
	{
		this.rid = Math.floor(Math.random() * 4294967295);
		this.sid = null;
		this.errors = 0;
		window.sessionStorage.removeItem('strophe-bosh-session');
	},

	/** PrivateFunction: _connect
	 *  _Private_ function that initializes the BOSH connection.
	 *
	 *  Creates and sends the Request that initializes the BOSH connection.
	 */
	_connect: function (wait, hold, route)
	{
		this.wait = wait || this.wait;
		this.hold = hold || this.hold;
		this.errors = 0;

		// build the body tag
		var body = this._buildBody().attrs({
			to: this._conn.domain,
			"xml:lang": "en",
			wait: this.wait,
			hold: this.hold,
			content: "text/xml; charset=utf-8",
			ver: "1.6",
			"xmpp:version": "1.0",
			"xmlns:xmpp": Strophe.NS.BOSH
		});

		if(route){
			body.attrs({
				route: route
			});
		}

		var _connect_cb = this._conn._connect_cb;

		this._requests.push(
			new Strophe.Request(body.tree(),
								this._onRequestStateChange.stropheBind(
									this, _connect_cb.stropheBind(this._conn)),
								body.tree().getAttribute("rid")));
		this._throttledRequestHandler();
	},

	/** PrivateFunction: _attach
	 *  Attach to an already created and authenticated BOSH session.
	 *
	 *  This function is provided to allow Strophe to attach to BOSH
	 *  sessions which have been created externally, perhaps by a Web
	 *  application.  This is often used to support auto-login type features
	 *  without putting user credentials into the page.
	 *
	 *  Parameters:
	 *	(String) jid - The full JID that is bound by the session.
	 *	(String) sid - The SID of the BOSH session.
	 *	(String) rid - The current RID of the BOSH session.  This RID
	 *	  will be used by the next request.
	 *	(Function) callback The connect callback function.
	 *	(Integer) wait - The optional HTTPBIND wait value.  This is the
	 *	  time the server will wait before returning an empty result for
	 *	  a request.  The default setting of 60 seconds is recommended.
	 *	  Other settings will require tweaks to the Strophe.TIMEOUT value.
	 *	(Integer) hold - The optional HTTPBIND hold value.  This is the
	 *	  number of connections the server will hold at one time.  This
	 *	  should almost always be set to 1 (the default).
	 *	(Integer) wind - The optional HTTBIND window value.  This is the
	 *	  allowed range of request ids that are valid.  The default is 5.
	 */
	_attach: function (jid, sid, rid, callback, wait, hold, wind)
	{
		this._conn.jid = jid;
		this.sid = sid;
		this.rid = rid;

		this._conn.connect_callback = callback;

		this._conn.domain = Strophe.getDomainFromJid(this._conn.jid);

		this._conn.authenticated = true;
		this._conn.connected = true;

		this.wait = wait || this.wait;
		this.hold = hold || this.hold;
		this.window = wind || this.window;

		this._conn._changeConnectStatus(Strophe.Status.ATTACHED, null);
	},

	/** PrivateFunction: _restore
	 *  Attempt to restore a cached BOSH session
	 *
	 *  Parameters:
	 *	(String) jid - The full JID that is bound by the session.
	 *	  This parameter is optional but recommended, specifically in cases
	 *	  where prebinded BOSH sessions are used where it's important to know
	 *	  that the right session is being restored.
	 *	(Function) callback The connect callback function.
	 *	(Integer) wait - The optional HTTPBIND wait value.  This is the
	 *	  time the server will wait before returning an empty result for
	 *	  a request.  The default setting of 60 seconds is recommended.
	 *	  Other settings will require tweaks to the Strophe.TIMEOUT value.
	 *	(Integer) hold - The optional HTTPBIND hold value.  This is the
	 *	  number of connections the server will hold at one time.  This
	 *	  should almost always be set to 1 (the default).
	 *	(Integer) wind - The optional HTTBIND window value.  This is the
	 *	  allowed range of request ids that are valid.  The default is 5.
	 */
	_restore: function (jid, callback, wait, hold, wind)
	{
		var session = JSON.parse(window.sessionStorage.getItem('strophe-bosh-session'));
		if (typeof session !== "undefined" &&
				   session !== null &&
				   session.rid &&
				   session.sid &&
				   session.jid &&
				   (typeof jid === "undefined" || Strophe.getBareJidFromJid(session.jid) == Strophe.getBareJidFromJid(jid)))
		{
			this._conn.restored = true;
			this._attach(session.jid, session.sid, session.rid, callback, wait, hold, wind);
		} else {
			throw { name: "StropheSessionError", message: "_restore: no restoreable session." };
		}
	},

	/** PrivateFunction: _cacheSession
	 *  _Private_ handler for the beforeunload event.
	 *
	 *  This handler is used to process the Bosh-part of the initial request.
	 *  Parameters:
	 *	(Strophe.Request) bodyWrap - The received stanza.
	 */
	_cacheSession: function ()
	{
		if (this._conn.authenticated) {
			if (this._conn.jid && this.rid && this.sid) {
				window.sessionStorage.setItem('strophe-bosh-session', JSON.stringify({
					'jid': this._conn.jid,
					'rid': this.rid,
					'sid': this.sid
				}));
			}
		} else {
			window.sessionStorage.removeItem('strophe-bosh-session');
		}
	},

	/** PrivateFunction: _connect_cb
	 *  _Private_ handler for initial connection request.
	 *
	 *  This handler is used to process the Bosh-part of the initial request.
	 *  Parameters:
	 *	(Strophe.Request) bodyWrap - The received stanza.
	 */
	_connect_cb: function (bodyWrap)
	{
		var typ = bodyWrap.getAttribute("type");
		var cond, conflict;
		if (typ !== null && typ == "terminate") {
			// an error occurred
			cond = bodyWrap.getAttribute("condition");
			Strophe.error("BOSH-Connection failed: " + cond);
			conflict = bodyWrap.getElementsByTagName("conflict");
			if (cond !== null) {
				if (cond == "remote-stream-error" && conflict.length > 0) {
					cond = "conflict";
				}
				this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, cond);
			} else {
				this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
			}
			this._conn._doDisconnect(cond);
			return Strophe.Status.CONNFAIL;
		}

		// check to make sure we don't overwrite these if _connect_cb is
		// called multiple times in the case of missing stream:features
		if (!this.sid) {
			this.sid = bodyWrap.getAttribute("sid");
		}
		var wind = bodyWrap.getAttribute('requests');
		if (wind) { this.window = parseInt(wind, 10); }
		var hold = bodyWrap.getAttribute('hold');
		if (hold) { this.hold = parseInt(hold, 10); }
		var wait = bodyWrap.getAttribute('wait');
		if (wait) { this.wait = parseInt(wait, 10); }
	},

	/** PrivateFunction: _disconnect
	 *  _Private_ part of Connection.disconnect for Bosh
	 *
	 *  Parameters:
	 *	(Request) pres - This stanza will be sent before disconnecting.
	 */
	_disconnect: function (pres)
	{
		this._sendTerminate(pres);
	},

	/** PrivateFunction: _doDisconnect
	 *  _Private_ function to disconnect.
	 *
	 *  Resets the SID and RID.
	 */
	_doDisconnect: function ()
	{
		this.sid = null;
		this.rid = Math.floor(Math.random() * 4294967295);
		window.sessionStorage.removeItem('strophe-bosh-session');
	},

	/** PrivateFunction: _emptyQueue
	 * _Private_ function to check if the Request queue is empty.
	 *
	 *  Returns:
	 *	True, if there are no Requests queued, False otherwise.
	 */
	_emptyQueue: function ()
	{
		return this._requests.length === 0;
	},

	/** PrivateFunction: _hitError
	 *  _Private_ function to handle the error count.
	 *
	 *  Requests are resent automatically until their error count reaches
	 *  5.  Each time an error is encountered, this function is called to
	 *  increment the count and disconnect if the count is too high.
	 *
	 *  Parameters:
	 *	(Integer) reqStatus - The request status.
	 */
	_hitError: function (reqStatus)
	{
		this.errors++;
		Strophe.warn("request errored, status: " + reqStatus +
					 ", number of errors: " + this.errors);
		if (this.errors > 4) {
			this._conn._onDisconnectTimeout();
		}
	},

	/** PrivateFunction: _no_auth_received
	 *
	 * Called on stream start/restart when no stream:features
	 * has been received and sends a blank poll request.
	 */
	_no_auth_received: function (_callback)
	{
		if (_callback) {
			_callback = _callback.stropheBind(this._conn);
		} else {
			_callback = this._conn._connect_cb.stropheBind(this._conn);
		}
		var body = this._buildBody();
		this._requests.push(
				new Strophe.Request(body.tree(),
					this._onRequestStateChange.stropheBind(
						this, _callback.stropheBind(this._conn)),
					body.tree().getAttribute("rid")));
		this._throttledRequestHandler();
	},

	/** PrivateFunction: _onDisconnectTimeout
	 *  _Private_ timeout handler for handling non-graceful disconnection.
	 *
	 *  Cancels all remaining Requests and clears the queue.
	 */
	_onDisconnectTimeout: function () {
		this._abortAllRequests();
	},

	/** PrivateFunction: _abortAllRequests
	 *  _Private_ helper function that makes sure all pending requests are aborted.
	 */
	_abortAllRequests: function _abortAllRequests() {
		var req;
		while (this._requests.length > 0) {
			req = this._requests.pop();
			req.abort = true;
			req.xhr.abort();
			// jslint complains, but this is fine. setting to empty func
			// is necessary for IE6
			req.xhr.onreadystatechange = function () {}; // jshint ignore:line
		}
	},

	/** PrivateFunction: _onIdle
	 *  _Private_ handler called by Strophe.Connection._onIdle
	 *
	 *  Sends all queued Requests or polls with empty Request if there are none.
	 */
	_onIdle: function () {
		var data = this._conn._data;

		// if no requests are in progress, poll
		if (this._conn.authenticated && this._requests.length === 0 &&
			data.length === 0 && !this._conn.disconnecting) {
			Strophe.info("no requests during idle cycle, sending " +
						 "blank request");
			data.push(null);
		}

		if (this._conn.paused) {
			return;
		}

		if (this._requests.length < 2 && data.length > 0) {
			var body = this._buildBody();
			for (var i = 0; i < data.length; i++) {
				if (data[i] !== null) {
					if (data[i] === "restart") {
						body.attrs({
							to: this._conn.domain,
							"xml:lang": "en",
							"xmpp:restart": "true",
							"xmlns:xmpp": Strophe.NS.BOSH
						});
					} else {
						body.cnode(data[i]).up();
					}
				}
			}
			delete this._conn._data;
			this._conn._data = [];
			this._requests.push(
				new Strophe.Request(body.tree(),
									this._onRequestStateChange.stropheBind( 
										this, this._conn._dataRecv.stropheBind(this._conn)),
									body.tree().getAttribute("rid")));
			this._throttledRequestHandler();
		}

		if (this._requests.length > 0) {
			var time_elapsed = this._requests[0].age();
			if (this._requests[0].dead !== null) {
				if (this._requests[0].timeDead() >
					Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait)) {
					this._throttledRequestHandler();
				}
			}

			if (time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait)) {
				Strophe.warn("Request " +
							 this._requests[0].id +
							 " timed out, over " + Math.floor(Strophe.TIMEOUT * this.wait) +
							 " seconds since last activity");
				this._throttledRequestHandler();
			}
		}
	},

	/** PrivateFunction: _onRequestStateChange
	 *  _Private_ handler for Strophe.Request state changes.
	 *
	 *  This function is called when the XMLHttpRequest readyState changes.
	 *  It contains a lot of error handling logic for the many ways that
	 *  requests can fail, and calls the request callback when requests
	 *  succeed.
	 *
	 *  Parameters:
	 *	(Function) func - The handler for the request.
	 *	(Strophe.Request) req - The request that is changing readyState.
	 */
	_onRequestStateChange: function (func, req)
	{
		Strophe.debug("request id " + req.id +
					  "." + req.sends + " state changed to " +
					  req.xhr.readyState);

		if (req.abort) {
			req.abort = false;
			return;
		}

		// request complete
		var reqStatus;
		if (req.xhr.readyState == 4) {
			reqStatus = 0;
			try {
				reqStatus = req.xhr.status;
			} catch (e) {
				// ignore errors from undefined status attribute.  works
				// around a browser bug
			}

			if (typeof(reqStatus) == "undefined") {
				reqStatus = 0;
			}

			if (this.disconnecting) {
				if (reqStatus >= 400) {
					this._hitError(reqStatus);
					return;
				}
			}

			var reqIs0 = (this._requests[0] == req);
			var reqIs1 = (this._requests[1] == req);

			if ((reqStatus > 0 && reqStatus < 500) || req.sends > 5) {
				// remove from internal queue
				this._removeRequest(req);
				Strophe.debug("request id " +
							  req.id +
							  " should now be removed");
			}

			// request succeeded
			if (reqStatus == 200) {
				// if request 1 finished, or request 0 finished and request
				// 1 is over Strophe.SECONDARY_TIMEOUT seconds old, we need to
				// restart the other - both will be in the first spot, as the
				// completed request has been removed from the queue already
				if (reqIs1 ||
					(reqIs0 && this._requests.length > 0 &&
					 this._requests[0].age() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait))) {
					this._restartRequest(0);
				}
				// call handler
				Strophe.debug("request id " +
							  req.id + "." +
							  req.sends + " got 200");
				func(req);
				this.errors = 0;
			} else {
				Strophe.error("request id " +
							  req.id + "." +
							  req.sends + " error " + reqStatus +
							  " happened");
				if (reqStatus === 0 ||
					(reqStatus >= 400 && reqStatus < 600) ||
					reqStatus >= 12000) {
					this._hitError(reqStatus);
					if (reqStatus >= 400 && reqStatus < 500) {
						this._conn._changeConnectStatus(Strophe.Status.DISCONNECTING, null);
						this._conn._doDisconnect();
					}
				}
			}

			if (!((reqStatus > 0 && reqStatus < 500) ||
				  req.sends > 5)) {
				this._throttledRequestHandler();
			}
		}
	},

	/** PrivateFunction: _processRequest
	 *  _Private_ function to process a request in the queue.
	 *
	 *  This function takes requests off the queue and sends them and
	 *  restarts dead requests.
	 *
	 *  Parameters:
	 *	(Integer) i - The index of the request in the queue.
	 */
	_processRequest: function (i)
	{
		var self = this;
		var req = this._requests[i];
		var reqStatus = -1;

		try {
			if (req.xhr.readyState == 4) {
				reqStatus = req.xhr.status;
			}
		} catch (e) {
			Strophe.error("caught an error in _requests[" + i +
						  "], reqStatus: " + reqStatus);
		}

		if (typeof(reqStatus) == "undefined") {
			reqStatus = -1;
		}

		// make sure we limit the number of retries
		if (req.sends > this._conn.maxRetries) {
			this._conn._onDisconnectTimeout();
			return;
		}

		var time_elapsed = req.age();
		var primaryTimeout = (!isNaN(time_elapsed) &&
							  time_elapsed > Math.floor(Strophe.TIMEOUT * this.wait));
		var secondaryTimeout = (req.dead !== null &&
								req.timeDead() > Math.floor(Strophe.SECONDARY_TIMEOUT * this.wait));
		var requestCompletedWithServerError = (req.xhr.readyState == 4 &&
											   (reqStatus < 1 ||
												reqStatus >= 500));
		if (primaryTimeout || secondaryTimeout ||
			requestCompletedWithServerError) {
			if (secondaryTimeout) {
				Strophe.error("Request " +
							  this._requests[i].id +
							  " timed out (secondary), restarting");
			}
			req.abort = true;
			req.xhr.abort();
			// setting to null fails on IE6, so set to empty function
			req.xhr.onreadystatechange = function () {};
			this._requests[i] = new Strophe.Request(req.xmlData,
													req.origFunc,
													req.rid,
													req.sends);
			req = this._requests[i];
		}

		if (req.xhr.readyState === 0) {
			Strophe.debug("request id " + req.id +
						  "." + req.sends + " posting");

			try {
				req.xhr.open("POST", this._conn.service, this._conn.options.sync ? false : true);
				req.xhr.setRequestHeader && req.xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
			} catch (e2) {
				Strophe.error("XHR open failed.");
				if (!this._conn.connected) {
					this._conn._changeConnectStatus(Strophe.Status.CONNFAIL,
											  "bad-service");
				}
				this._conn.disconnect();
				return;
			}

			// Fires the XHR request -- may be invoked immediately
			// or on a gradually expanding retry window for reconnects
			var sendFunc = function () {
				req.date = new Date();
				if (self._conn.options.customHeaders){
					var headers = self._conn.options.customHeaders;
					for (var header in headers) {
						if (headers.hasOwnProperty(header)) {
							req.xhr.setRequestHeader(header, headers[header]);
						}
					}
				}
				req.xhr.send(req.data);
			};

			// Implement progressive backoff for reconnects --
			// First retry (send == 1) should also be instantaneous
			if (req.sends > 1) {
				// Using a cube of the retry number creates a nicely
				// expanding retry window
				var backoff = Math.min(Math.floor(Strophe.TIMEOUT * this.wait),
									   Math.pow(req.sends, 3)) * 1000;
				setTimeout(sendFunc, backoff);
			} else {
				sendFunc();
			}

			req.sends++;

			if (this._conn.xmlOutput !== Strophe.Connection.prototype.xmlOutput) {
				if (req.xmlData.nodeName === this.strip && req.xmlData.childNodes.length) {
					this._conn.xmlOutput(req.xmlData.childNodes[0]);
				} else {
					this._conn.xmlOutput(req.xmlData);
				}
			}
			if (this._conn.rawOutput !== Strophe.Connection.prototype.rawOutput) {
				this._conn.rawOutput(req.data);
			}
		} else {
			Strophe.debug("_processRequest: " +
						  (i === 0 ? "first" : "second") +
						  " request has readyState of " +
						  req.xhr.readyState);
		}
	},

	/** PrivateFunction: _removeRequest
	 *  _Private_ function to remove a request from the queue.
	 *
	 *  Parameters:
	 *	(Strophe.Request) req - The request to remove.
	 */
	_removeRequest: function (req)
	{
		Strophe.debug("removing request");

		var i;
		for (i = this._requests.length - 1; i >= 0; i--) {
			if (req == this._requests[i]) {
				this._requests.splice(i, 1);
			}
		}

		// IE6 fails on setting to null, so set to empty function
		req.xhr.onreadystatechange = function () {};

		this._throttledRequestHandler();
	},

	/** PrivateFunction: _restartRequest
	 *  _Private_ function to restart a request that is presumed dead.
	 *
	 *  Parameters:
	 *	(Integer) i - The index of the request in the queue.
	 */
	_restartRequest: function (i)
	{
		var req = this._requests[i];
		if (req.dead === null) {
			req.dead = new Date();
		}

		this._processRequest(i);
	},

	/** PrivateFunction: _reqToData
	 * _Private_ function to get a stanza out of a request.
	 *
	 * Tries to extract a stanza out of a Request Object.
	 * When this fails the current connection will be disconnected.
	 *
	 *  Parameters:
	 *	(Object) req - The Request.
	 *
	 *  Returns:
	 *	The stanza that was passed.
	 */
	_reqToData: function (req)
	{
		try {
			return req.getResponse();
		} catch (e) {
			if (e != "parsererror") { throw e; }
			this._conn.disconnect("strophe-parsererror");
		}
	},

	/** PrivateFunction: _sendTerminate
	 *  _Private_ function to send initial disconnect sequence.
	 *
	 *  This is the first step in a graceful disconnect.  It sends
	 *  the BOSH server a terminate body and includes an unavailable
	 *  presence if authentication has completed.
	 */
	_sendTerminate: function (pres)
	{
		Strophe.info("_sendTerminate was called");
		var body = this._buildBody().attrs({type: "terminate"});

		if (pres) {
			body.cnode(pres.tree());
		}

		var req = new Strophe.Request(body.tree(),
									  this._onRequestStateChange.stropheBind(
										  this, this._conn._dataRecv.stropheBind(this._conn)),
									  body.tree().getAttribute("rid"));

		this._requests.push(req);
		this._throttledRequestHandler();
	},

	/** PrivateFunction: _send
	 *  _Private_ part of the Connection.send function for BOSH
	 *
	 * Just triggers the RequestHandler to send the messages that are in the queue
	 */
	_send: function () {
		clearTimeout(this._conn._idleTimeout);
		this._throttledRequestHandler();
		this._conn._idleTimeout = setTimeout(this._conn._onIdle.stropheBind(this._conn), 100);
	},

	/** PrivateFunction: _sendRestart
	 *
	 *  Send an xmpp:restart stanza.
	 */
	_sendRestart: function ()
	{
		this._throttledRequestHandler();
		clearTimeout(this._conn._idleTimeout);
	},

	/** PrivateFunction: _throttledRequestHandler
	 *  _Private_ function to throttle requests to the connection window.
	 *
	 *  This function makes sure we don't send requests so fast that the
	 *  request ids overflow the connection window in the case that one
	 *  request died.
	 */
	_throttledRequestHandler: function ()
	{
		if (!this._requests) {
			Strophe.debug("_throttledRequestHandler called with " +
						  "undefined requests");
		} else {
			Strophe.debug("_throttledRequestHandler called with " +
						  this._requests.length + " requests");
		}

		if (!this._requests || this._requests.length === 0) {
			return;
		}

		if (this._requests.length > 0) {
			this._processRequest(0);
		}

		if (this._requests.length > 1 &&
			Math.abs(this._requests[0].rid -
					 this._requests[1].rid) < this.window) {
			this._processRequest(1);
		}
	}
};
return Strophe;
}));

/*
	This program is distributed under the terms of the MIT license.
	Please see the LICENSE file for details.

	Copyright 2006-2008, OGG, LLC
*/

/* jshint undef: true, unused: true:, noarg: true, latedef: true */
/* global define, window, clearTimeout, WebSocket, DOMParser, Strophe, $build */

(function (root, factory) {
	//if (typeof define === 'function' && define.amd) {
	if (false) {
		define('strophe-websocket', ['strophe-core'], function (core) {
			return factory(
				core.Strophe,
				core.$build
			);
		});
	} else {
		// Browser globals
		return factory(Strophe, $build);
	}
}(this, function (Strophe, $build) {

/** Class: Strophe.WebSocket
 *  _Private_ helper class that handles WebSocket Connections
 *
 *  The Strophe.WebSocket class is used internally by Strophe.Connection
 *  to encapsulate WebSocket sessions. It is not meant to be used from user's code.
 */

/** File: websocket.js
 *  A JavaScript library to enable XMPP over Websocket in Strophejs.
 *
 *  This file implements XMPP over WebSockets for Strophejs.
 *  If a Connection is established with a Websocket url (ws://...)
 *  Strophe will use WebSockets.
 *  For more information on XMPP-over-WebSocket see RFC 7395:
 *  http://tools.ietf.org/html/rfc7395
 *
 *  WebSocket support implemented by Andreas Guth (andreas.guth@rwth-aachen.de)
 */

/** PrivateConstructor: Strophe.Websocket
 *  Create and initialize a Strophe.WebSocket object.
 *  Currently only sets the connection Object.
 *
 *  Parameters:
 *	(Strophe.Connection) connection - The Strophe.Connection that will use WebSockets.
 *
 *  Returns:
 *	A new Strophe.WebSocket object.
 */
Strophe.Websocket = function(connection) {
	this._conn = connection;
	this.strip = "wrapper";

	var service = connection.service;
	if (service.indexOf("ws:") !== 0 && service.indexOf("wss:") !== 0) {
		// If the service is not an absolute URL, assume it is a path and put the absolute
		// URL together from options, current URL and the path.
		var new_service = "";

		if (connection.options.protocol === "ws" && window.location.protocol !== "https:") {
			new_service += "ws";
		} else {
			new_service += "wss";
		}

		new_service += "://" + window.location.host;

		if (service.indexOf("/") !== 0) {
			new_service += window.location.pathname + service;
		} else {
			new_service += service;
		}

		connection.service = new_service;
	}
};

Strophe.Websocket.prototype = {
	/** PrivateFunction: _buildStream
	 *  _Private_ helper function to generate the <stream> start tag for WebSockets
	 *
	 *  Returns:
	 *	A Strophe.Builder with a <stream> element.
	 */
	_buildStream: function ()
	{
		return $build("open", {
			"xmlns": Strophe.NS.FRAMING,
			"to": this._conn.domain,
			"version": '1.0'
		});
	},

	/** PrivateFunction: _check_streamerror
	 * _Private_ checks a message for stream:error
	 *
	 *  Parameters:
	 *	(Strophe.Request) bodyWrap - The received stanza.
	 *	connectstatus - The ConnectStatus that will be set on error.
	 *  Returns:
	 *	 true if there was a streamerror, false otherwise.
	 */
	_check_streamerror: function (bodyWrap, connectstatus) {
		var errors;
		if (bodyWrap.getElementsByTagNameNS) {
			errors = bodyWrap.getElementsByTagNameNS(Strophe.NS.STREAM, "error");
		} else {
			errors = bodyWrap.getElementsByTagName("stream:error");
		}
		if (errors.length === 0) {
			return false;
		}
		var error = errors[0];

		var condition = "";
		var text = "";

		var ns = "urn:ietf:params:xml:ns:xmpp-streams";
		for (var i = 0; i < error.childNodes.length; i++) {
			var e = error.childNodes[i];
			if (e.getAttribute("xmlns") !== ns) {
				break;
			} if (e.nodeName === "text") {
				text = e.textContent;
			} else {
				condition = e.nodeName;
			}
		}

		var errorString = "WebSocket stream error: ";

		if (condition) {
			errorString += condition;
		} else {
			errorString += "unknown";
		}

		if (text) {
			errorString += " - " + condition;
		}

		Strophe.error(errorString);

		// close the connection on stream_error
		this._conn._changeConnectStatus(connectstatus, condition);
		this._conn._doDisconnect();
		return true;
	},

	/** PrivateFunction: _reset
	 *  Reset the connection.
	 *
	 *  This function is called by the reset function of the Strophe Connection.
	 *  Is not needed by WebSockets.
	 */
	_reset: function ()
	{
		return;
	},

	/** PrivateFunction: _connect
	 *  _Private_ function called by Strophe.Connection.connect
	 *
	 *  Creates a WebSocket for a connection and assigns Callbacks to it.
	 *  Does nothing if there already is a WebSocket.
	 */
	_connect: function () {
		// Ensure that there is no open WebSocket from a previous Connection.
		this._closeSocket();

		// Create the new WobSocket
		this.socket = new WebSocket(this._conn.service, "xmpp");
		this.socket.onopen = this._onOpen.stropheBind(this);
		this.socket.onerror = this._onError.stropheBind(this);
		this.socket.onclose = this._onClose.stropheBind(this);
		this.socket.onmessage = this._connect_cb_wrapper.stropheBind(this);
	},

	/** PrivateFunction: _connect_cb
	 *  _Private_ function called by Strophe.Connection._connect_cb
	 *
	 * checks for stream:error
	 *
	 *  Parameters:
	 *	(Strophe.Request) bodyWrap - The received stanza.
	 */
	_connect_cb: function(bodyWrap) {
		var error = this._check_streamerror(bodyWrap, Strophe.Status.CONNFAIL);
		if (error) {
			return Strophe.Status.CONNFAIL;
		}
	},

	/** PrivateFunction: _handleStreamStart
	 * _Private_ function that checks the opening <open /> tag for errors.
	 *
	 * Disconnects if there is an error and returns false, true otherwise.
	 *
	 *  Parameters:
	 *	(Node) message - Stanza containing the <open /> tag.
	 */
	_handleStreamStart: function(message) {
		var error = false;

		// Check for errors in the <open /> tag
		var ns = message.getAttribute("xmlns");
		if (typeof ns !== "string") {
			error = "Missing xmlns in <open />";
		} else if (ns !== Strophe.NS.FRAMING) {
			error = "Wrong xmlns in <open />: " + ns;
		}

		var ver = message.getAttribute("version");
		if (typeof ver !== "string") {
			error = "Missing version in <open />";
		} else if (ver !== "1.0") {
			error = "Wrong version in <open />: " + ver;
		}

		if (error) {
			this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, error);
			this._conn._doDisconnect();
			return false;
		}

		return true;
	},

	/** PrivateFunction: _connect_cb_wrapper
	 * _Private_ function that handles the first connection messages.
	 *
	 * On receiving an opening stream tag this callback replaces itself with the real
	 * message handler. On receiving a stream error the connection is terminated.
	 */
	_connect_cb_wrapper: function(message) {
		if (message.data.indexOf("<open ") === 0 || message.data.indexOf("<?xml") === 0) {
			// Strip the XML Declaration, if there is one
			var data = message.data.replace(/^(<\?.*?\?>\s*)*/, "");
			if (data === '') return;

			var streamStart = new DOMParser().parseFromString(data, "text/xml").documentElement;
			this._conn.xmlInput(streamStart);
			this._conn.rawInput(message.data);

			//_handleStreamSteart will check for XML errors and disconnect on error
			if (this._handleStreamStart(streamStart)) {
				//_connect_cb will check for stream:error and disconnect on error
				this._connect_cb(streamStart);
			}
		} else if (message.data.indexOf("<close ") === 0) { //'<close xmlns="urn:ietf:params:xml:ns:xmpp-framing />') {
			this._conn.rawInput(message.data);
			this._conn.xmlInput(message);
			var see_uri = message.getAttribute("see-other-uri");
			if (see_uri) {
				this._conn._changeConnectStatus(Strophe.Status.REDIRECT, "Received see-other-uri, resetting connection");
				this._conn.reset();
				this._conn.service = see_uri;
				this._connect();
			} else {
				this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "Received closing stream");
				this._conn._doDisconnect();
			}
		} else {
			var string = this._streamWrap(message.data);
			var elem = new DOMParser().parseFromString(string, "text/xml").documentElement;
			this.socket.onmessage = this._onMessage.stropheBind(this);
			this._conn._connect_cb(elem, null, message.data);
		}
	},

	/** PrivateFunction: _disconnect
	 *  _Private_ function called by Strophe.Connection.disconnect
	 *
	 *  Disconnects and sends a last stanza if one is given
	 *
	 *  Parameters:
	 *	(Request) pres - This stanza will be sent before disconnecting.
	 */
	_disconnect: function (pres)
	{
		if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
			if (pres) {
				this._conn.send(pres);
			}
			var close = $build("close", { "xmlns": Strophe.NS.FRAMING });
			this._conn.xmlOutput(close);
			var closeString = Strophe.serialize(close);
			this._conn.rawOutput(closeString);
			try {
				this.socket.send(closeString);
			} catch (e) {
				Strophe.info("Couldn't send <close /> tag.");
			}
		}
		this._conn._doDisconnect();
	},

	/** PrivateFunction: _doDisconnect
	 *  _Private_ function to disconnect.
	 *
	 *  Just closes the Socket for WebSockets
	 */
	_doDisconnect: function ()
	{
		Strophe.info("WebSockets _doDisconnect was called");
		this._closeSocket();
	},

	/** PrivateFunction _streamWrap
	 *  _Private_ helper function to wrap a stanza in a <stream> tag.
	 *  This is used so Strophe can process stanzas from WebSockets like BOSH
	 */
	_streamWrap: function (stanza)
	{
		return "<wrapper>" + stanza + '</wrapper>';
	},


	/** PrivateFunction: _closeSocket
	 *  _Private_ function to close the WebSocket.
	 *
	 *  Closes the socket if it is still open and deletes it
	 */
	_closeSocket: function ()
	{
		if (this.socket) { try {
			this.socket.close();
		} catch (e) {} }
		this.socket = null;
	},

	/** PrivateFunction: _emptyQueue
	 * _Private_ function to check if the message queue is empty.
	 *
	 *  Returns:
	 *	True, because WebSocket messages are send immediately after queueing.
	 */
	_emptyQueue: function ()
	{
		return true;
	},

	/** PrivateFunction: _onClose
	 * _Private_ function to handle websockets closing.
	 *
	 * Nothing to do here for WebSockets
	 */
	_onClose: function() {
		if(this._conn.connected && !this._conn.disconnecting) {
			Strophe.error("Websocket closed unexcectedly");
			this._conn._doDisconnect();
		} else {
			Strophe.info("Websocket closed");
		}
	},

	/** PrivateFunction: _no_auth_received
	 *
	 * Called on stream start/restart when no stream:features
	 * has been received.
	 */
	_no_auth_received: function (_callback)
	{
		Strophe.error("Server did not send any auth methods");
		this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "Server did not send any auth methods");
		if (_callback) {
			_callback = _callback.stropheBind(this._conn);
			_callback();
		}
		this._conn._doDisconnect();
	},

	/** PrivateFunction: _onDisconnectTimeout
	 *  _Private_ timeout handler for handling non-graceful disconnection.
	 *
	 *  This does nothing for WebSockets
	 */
	_onDisconnectTimeout: function () {},

	/** PrivateFunction: _abortAllRequests
	 *  _Private_ helper function that makes sure all pending requests are aborted.
	 */
	_abortAllRequests: function () {},

	/** PrivateFunction: _onError
	 * _Private_ function to handle websockets errors.
	 *
	 * Parameters:
	 * (Object) error - The websocket error.
	 */
	_onError: function(error) {
		Strophe.error("Websocket error " + error);
		this._conn._changeConnectStatus(Strophe.Status.CONNFAIL, "The WebSocket connection could not be established was disconnected.");
		this._disconnect();
	},

	/** PrivateFunction: _onIdle
	 *  _Private_ function called by Strophe.Connection._onIdle
	 *
	 *  sends all queued stanzas
	 */
	_onIdle: function () {
		var data = this._conn._data;
		if (data.length > 0 && !this._conn.paused) {
			for (var i = 0; i < data.length; i++) {
				if (data[i] !== null) {
					var stanza, rawStanza;
					if (data[i] === "restart") {
						stanza = this._buildStream().tree();
					} else {
						stanza = data[i];
					}
					rawStanza = Strophe.serialize(stanza);
					this._conn.xmlOutput(stanza);
					this._conn.rawOutput(rawStanza);
					this.socket.send(rawStanza);
				}
			}
			this._conn._data = [];
		}
	},

	/** PrivateFunction: _onMessage
	 * _Private_ function to handle websockets messages.
	 *
	 * This function parses each of the messages as if they are full documents. [TODO : We may actually want to use a SAX Push parser].
	 *
	 * Since all XMPP traffic starts with "<stream:stream version='1.0' xml:lang='en' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' id='3697395463' from='SERVER'>"
	 * The first stanza will always fail to be parsed...
	 * Addtionnaly, the seconds stanza will always be a <stream:features> with the stream NS defined in the previous stanza... so we need to 'force' the inclusion of the NS in this stanza!
	 *
	 * Parameters:
	 * (string) message - The websocket message.
	 */
	_onMessage: function(message) {
		var elem, data;
		// check for closing stream
		var close = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';
		if (message.data === close) {
			this._conn.rawInput(close);
			this._conn.xmlInput(message);
			if (!this._conn.disconnecting) {
				this._conn._doDisconnect();
			}
			return;
		} else if (message.data.search("<open ") === 0) {
			// This handles stream restarts
			elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;

			if (!this._handleStreamStart(elem)) {
				return;
			}
		} else {
			data = this._streamWrap(message.data);
			elem = new DOMParser().parseFromString(data, "text/xml").documentElement;
		}

		if (this._check_streamerror(elem, Strophe.Status.ERROR)) {
			return;
		}

		//handle unavailable presence stanza before disconnecting
		if (this._conn.disconnecting &&
				elem.firstChild.nodeName === "presence" &&
				elem.firstChild.getAttribute("type") === "unavailable") {
			this._conn.xmlInput(elem);
			this._conn.rawInput(Strophe.serialize(elem));
			// if we are already disconnecting we will ignore the unavailable stanza and
			// wait for the </stream:stream> tag before we close the connection
			return;
		}
		this._conn._dataRecv(elem, message.data);
	},

	/** PrivateFunction: _onOpen
	 * _Private_ function to handle websockets connection setup.
	 *
	 * The opening stream tag is sent here.
	 */
	_onOpen: function() {
		Strophe.info("Websocket open");
		var start = this._buildStream();
		this._conn.xmlOutput(start.tree());

		var startString = Strophe.serialize(start);
		this._conn.rawOutput(startString);
		this.socket.send(startString);
	},

	/** PrivateFunction: _reqToData
	 * _Private_ function to get a stanza out of a request.
	 *
	 * WebSockets don't use requests, so the passed argument is just returned.
	 *
	 *  Parameters:
	 *	(Object) stanza - The stanza.
	 *
	 *  Returns:
	 *	The stanza that was passed.
	 */
	_reqToData: function (stanza)
	{
		return stanza;
	},

	/** PrivateFunction: _send
	 *  _Private_ part of the Connection.send function for WebSocket
	 *
	 * Just flushes the messages that are in the queue
	 */
	_send: function () {
		this._conn.flush();
	},

	/** PrivateFunction: _sendRestart
	 *
	 *  Send an xmpp:restart stanza.
	 */
	_sendRestart: function ()
	{
		clearTimeout(this._conn._idleTimeout);
		this._conn._onIdle.stropheBind(this._conn)();
	}
};
return Strophe;
}));

/* jshint ignore:start */
if (callback) {
	return callback(Strophe, $build, $msg, $iq, $pres);
}


})(function (Strophe, build, msg, iq, pres) {
	window.Strophe = Strophe;
	window.$build = build;
	window.$msg = msg;
	window.$iq = iq;
	window.$pres = pres;
});
/* jshint ignore:end */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.adapter = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
 /* eslint-env node */
'use strict';

// SDP helpers.
var SDPUtils = {};

// Generate an alphanumeric identifier for cname or mids.
// TODO: use UUIDs instead? https://gist.github.com/jed/982883
SDPUtils.generateIdentifier = function() {
  return Math.random().toString(36).substr(2, 10);
};

// The RTCP CNAME used by all peerconnections from the same JS.
SDPUtils.localCName = SDPUtils.generateIdentifier();

// Splits SDP into lines, dealing with both CRLF and LF.
SDPUtils.splitLines = function(blob) {
  return blob.trim().split('\n').map(function(line) {
	return line.trim();
  });
};
// Splits SDP into sessionpart and mediasections. Ensures CRLF.
SDPUtils.splitSections = function(blob) {
  var parts = blob.split('\nm=');
  return parts.map(function(part, index) {
	return (index > 0 ? 'm=' + part : part).trim() + '\r\n';
  });
};

// Returns lines that start with a certain prefix.
SDPUtils.matchPrefix = function(blob, prefix) {
  return SDPUtils.splitLines(blob).filter(function(line) {
	return line.indexOf(prefix) === 0;
  });
};

// Parses an ICE candidate line. Sample input:
// candidate:702786350 2 udp 41819902 8.8.8.8 60769 typ relay raddr 8.8.8.8
// rport 55996"
SDPUtils.parseCandidate = function(line) {
  var parts;
  // Parse both variants.
  if (line.indexOf('a=candidate:') === 0) {
	parts = line.substring(12).split(' ');
  } else {
	parts = line.substring(10).split(' ');
  }

  var candidate = {
	foundation: parts[0],
	component: parts[1],
	protocol: parts[2].toLowerCase(),
	priority: parseInt(parts[3], 10),
	ip: parts[4],
	port: parseInt(parts[5], 10),
	// skip parts[6] == 'typ'
	type: parts[7]
  };

  for (var i = 8; i < parts.length; i += 2) {
	switch (parts[i]) {
	  case 'raddr':
		candidate.relatedAddress = parts[i + 1];
		break;
	  case 'rport':
		candidate.relatedPort = parseInt(parts[i + 1], 10);
		break;
	  case 'tcptype':
		candidate.tcpType = parts[i + 1];
		break;
	  default: // Unknown extensions are silently ignored.
		break;
	}
  }
  return candidate;
};

// Translates a candidate object into SDP candidate attribute.
SDPUtils.writeCandidate = function(candidate) {
  var sdp = [];
  sdp.push(candidate.foundation);
  sdp.push(candidate.component);
  sdp.push(candidate.protocol.toUpperCase());
  sdp.push(candidate.priority);
  sdp.push(candidate.ip);
  sdp.push(candidate.port);

  var type = candidate.type;
  sdp.push('typ');
  sdp.push(type);
  if (type !== 'host' && candidate.relatedAddress &&
	  candidate.relatedPort) {
	sdp.push('raddr');
	sdp.push(candidate.relatedAddress); // was: relAddr
	sdp.push('rport');
	sdp.push(candidate.relatedPort); // was: relPort
  }
  if (candidate.tcpType && candidate.protocol.toLowerCase() === 'tcp') {
	sdp.push('tcptype');
	sdp.push(candidate.tcpType);
  }
  return 'candidate:' + sdp.join(' ');
};

// Parses an rtpmap line, returns RTCRtpCoddecParameters. Sample input:
// a=rtpmap:111 opus/48000/2
SDPUtils.parseRtpMap = function(line) {
  var parts = line.substr(9).split(' ');
  var parsed = {
	payloadType: parseInt(parts.shift(), 10) // was: id
  };

  parts = parts[0].split('/');

  parsed.name = parts[0];
  parsed.clockRate = parseInt(parts[1], 10); // was: clockrate
  // was: channels
  parsed.numChannels = parts.length === 3 ? parseInt(parts[2], 10) : 1;
  return parsed;
};

// Generate an a=rtpmap line from RTCRtpCodecCapability or
// RTCRtpCodecParameters.
SDPUtils.writeRtpMap = function(codec) {
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
	pt = codec.preferredPayloadType;
  }
  return 'a=rtpmap:' + pt + ' ' + codec.name + '/' + codec.clockRate +
	  (codec.numChannels !== 1 ? '/' + codec.numChannels : '') + '\r\n';
};

// Parses an a=extmap line (headerextension from RFC 5285). Sample input:
// a=extmap:2 urn:ietf:params:rtp-hdrext:toffset
SDPUtils.parseExtmap = function(line) {
  var parts = line.substr(9).split(' ');
  return {
	id: parseInt(parts[0], 10),
	uri: parts[1]
  };
};

// Generates a=extmap line from RTCRtpHeaderExtensionParameters or
// RTCRtpHeaderExtension.
SDPUtils.writeExtmap = function(headerExtension) {
  return 'a=extmap:' + (headerExtension.id || headerExtension.preferredId) +
	   ' ' + headerExtension.uri + '\r\n';
};

// Parses an ftmp line, returns dictionary. Sample input:
// a=fmtp:96 vbr=on;cng=on
// Also deals with vbr=on; cng=on
SDPUtils.parseFmtp = function(line) {
  var parsed = {};
  var kv;
  var parts = line.substr(line.indexOf(' ') + 1).split(';');
  for (var j = 0; j < parts.length; j++) {
	kv = parts[j].trim().split('=');
	parsed[kv[0].trim()] = kv[1];
  }
  return parsed;
};

// Generates an a=ftmp line from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeFmtp = function(codec) {
  var line = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
	pt = codec.preferredPayloadType;
  }
  if (codec.parameters && Object.keys(codec.parameters).length) {
	var params = [];
	Object.keys(codec.parameters).forEach(function(param) {
	  params.push(param + '=' + codec.parameters[param]);
	});
	line += 'a=fmtp:' + pt + ' ' + params.join(';') + '\r\n';
  }
  return line;
};

// Parses an rtcp-fb line, returns RTCPRtcpFeedback object. Sample input:
// a=rtcp-fb:98 nack rpsi
SDPUtils.parseRtcpFb = function(line) {
  var parts = line.substr(line.indexOf(' ') + 1).split(' ');
  return {
	type: parts.shift(),
	parameter: parts.join(' ')
  };
};
// Generate a=rtcp-fb lines from RTCRtpCodecCapability or RTCRtpCodecParameters.
SDPUtils.writeRtcpFb = function(codec) {
  var lines = '';
  var pt = codec.payloadType;
  if (codec.preferredPayloadType !== undefined) {
	pt = codec.preferredPayloadType;
  }
  if (codec.rtcpFeedback && codec.rtcpFeedback.length) {
	// FIXME: special handling for trr-int?
	codec.rtcpFeedback.forEach(function(fb) {
	  lines += 'a=rtcp-fb:' + pt + ' ' + fb.type +
	  (fb.parameter && fb.parameter.length ? ' ' + fb.parameter : '') +
		  '\r\n';
	});
  }
  return lines;
};

// Parses an RFC 5576 ssrc media attribute. Sample input:
// a=ssrc:3735928559 cname:something
SDPUtils.parseSsrcMedia = function(line) {
  var sp = line.indexOf(' ');
  var parts = {
	ssrc: parseInt(line.substr(7, sp - 7), 10)
  };
  var colon = line.indexOf(':', sp);
  if (colon > -1) {
	parts.attribute = line.substr(sp + 1, colon - sp - 1);
	parts.value = line.substr(colon + 1);
  } else {
	parts.attribute = line.substr(sp + 1);
  }
  return parts;
};

// Extracts DTLS parameters from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the fingerprint line as input. See also getIceParameters.
SDPUtils.getDtlsParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var fpLine = lines.filter(function(line) {
	return line.indexOf('a=fingerprint:') === 0;
  })[0].substr(14);
  // Note: a=setup line is ignored since we use the 'auto' role.
  var dtlsParameters = {
	role: 'auto',
	fingerprints: [{
	  algorithm: fpLine.split(' ')[0],
	  value: fpLine.split(' ')[1]
	}]
  };
  return dtlsParameters;
};

// Serializes DTLS parameters to SDP.
SDPUtils.writeDtlsParameters = function(params, setupType) {
  var sdp = 'a=setup:' + setupType + '\r\n';
  params.fingerprints.forEach(function(fp) {
	sdp += 'a=fingerprint:' + fp.algorithm + ' ' + fp.value + '\r\n';
  });
  return sdp;
};
// Parses ICE information from SDP media section or sessionpart.
// FIXME: for consistency with other functions this should only
//   get the ice-ufrag and ice-pwd lines as input.
SDPUtils.getIceParameters = function(mediaSection, sessionpart) {
  var lines = SDPUtils.splitLines(mediaSection);
  // Search in session part, too.
  lines = lines.concat(SDPUtils.splitLines(sessionpart));
  var iceParameters = {
	usernameFragment: lines.filter(function(line) {
	  return line.indexOf('a=ice-ufrag:') === 0;
	})[0].substr(12),
	password: lines.filter(function(line) {
	  return line.indexOf('a=ice-pwd:') === 0;
	})[0].substr(10)
  };
  return iceParameters;
};

// Serializes ICE parameters to SDP.
SDPUtils.writeIceParameters = function(params) {
  return 'a=ice-ufrag:' + params.usernameFragment + '\r\n' +
	  'a=ice-pwd:' + params.password + '\r\n';
};

// Parses the SDP media section and returns RTCRtpParameters.
SDPUtils.parseRtpParameters = function(mediaSection) {
  var description = {
	codecs: [],
	headerExtensions: [],
	fecMechanisms: [],
	rtcp: []
  };
  var lines = SDPUtils.splitLines(mediaSection);
  var mline = lines[0].split(' ');
  for (var i = 3; i < mline.length; i++) { // find all codecs from mline[3..]
	var pt = mline[i];
	var rtpmapline = SDPUtils.matchPrefix(
		mediaSection, 'a=rtpmap:' + pt + ' ')[0];
	if (rtpmapline) {
	  var codec = SDPUtils.parseRtpMap(rtpmapline);
	  var fmtps = SDPUtils.matchPrefix(
		  mediaSection, 'a=fmtp:' + pt + ' ');
	  // Only the first a=fmtp:<pt> is considered.
	  codec.parameters = fmtps.length ? SDPUtils.parseFmtp(fmtps[0]) : {};
	  codec.rtcpFeedback = SDPUtils.matchPrefix(
		  mediaSection, 'a=rtcp-fb:' + pt + ' ')
		.map(SDPUtils.parseRtcpFb);
	  description.codecs.push(codec);
	  // parse FEC mechanisms from rtpmap lines.
	  switch (codec.name.toUpperCase()) {
		case 'RED':
		case 'ULPFEC':
		  description.fecMechanisms.push(codec.name.toUpperCase());
		  break;
		default: // only RED and ULPFEC are recognized as FEC mechanisms.
		  break;
	  }
	}
  }
  SDPUtils.matchPrefix(mediaSection, 'a=extmap:').forEach(function(line) {
	description.headerExtensions.push(SDPUtils.parseExtmap(line));
  });
  // FIXME: parse rtcp.
  return description;
};

// Generates parts of the SDP media section describing the capabilities /
// parameters.
SDPUtils.writeRtpDescription = function(kind, caps) {
  var sdp = '';

  // Build the mline.
  sdp += 'm=' + kind + ' ';
  sdp += caps.codecs.length > 0 ? '9' : '0'; // reject if no codecs.
  sdp += ' UDP/TLS/RTP/SAVPF ';
  sdp += caps.codecs.map(function(codec) {
	if (codec.preferredPayloadType !== undefined) {
	  return codec.preferredPayloadType;
	}
	return codec.payloadType;
  }).join(' ') + '\r\n';

  sdp += 'c=IN IP4 0.0.0.0\r\n';
  sdp += 'a=rtcp:9 IN IP4 0.0.0.0\r\n';

  // Add a=rtpmap lines for each codec. Also fmtp and rtcp-fb.
  caps.codecs.forEach(function(codec) {
	sdp += SDPUtils.writeRtpMap(codec);
	sdp += SDPUtils.writeFmtp(codec);
	sdp += SDPUtils.writeRtcpFb(codec);
  });
  // FIXME: add headerExtensions, fecMechanismş and rtcp.
  sdp += 'a=rtcp-mux\r\n';
  return sdp;
};

// Parses the SDP media section and returns an array of
// RTCRtpEncodingParameters.
SDPUtils.parseRtpEncodingParameters = function(mediaSection) {
  var encodingParameters = [];
  var description = SDPUtils.parseRtpParameters(mediaSection);
  var hasRed = description.fecMechanisms.indexOf('RED') !== -1;
  var hasUlpfec = description.fecMechanisms.indexOf('ULPFEC') !== -1;

  // filter a=ssrc:... cname:, ignore PlanB-msid
  var ssrcs = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
  .map(function(line) {
	return SDPUtils.parseSsrcMedia(line);
  })
  .filter(function(parts) {
	return parts.attribute === 'cname';
  });
  var primarySsrc = ssrcs.length > 0 && ssrcs[0].ssrc;
  var secondarySsrc;

  var flows = SDPUtils.matchPrefix(mediaSection, 'a=ssrc-group:FID')
  .map(function(line) {
	var parts = line.split(' ');
	parts.shift();
	return parts.map(function(part) {
	  return parseInt(part, 10);
	});
  });
  if (flows.length > 0 && flows[0].length > 1 && flows[0][0] === primarySsrc) {
	secondarySsrc = flows[0][1];
  }

  description.codecs.forEach(function(codec) {
	if (codec.name.toUpperCase() === 'RTX' && codec.parameters.apt) {
	  var encParam = {
		ssrc: primarySsrc,
		codecPayloadType: parseInt(codec.parameters.apt, 10),
		rtx: {
		  payloadType: codec.payloadType,
		  ssrc: secondarySsrc
		}
	  };
	  encodingParameters.push(encParam);
	  if (hasRed) {
		encParam = JSON.parse(JSON.stringify(encParam));
		encParam.fec = {
		  ssrc: secondarySsrc,
		  mechanism: hasUlpfec ? 'red+ulpfec' : 'red'
		};
		encodingParameters.push(encParam);
	  }
	}
  });
  if (encodingParameters.length === 0 && primarySsrc) {
	encodingParameters.push({
	  ssrc: primarySsrc
	});
  }

  // we support both b=AS and b=TIAS but interpret AS as TIAS.
  var bandwidth = SDPUtils.matchPrefix(mediaSection, 'b=');
  if (bandwidth.length) {
	if (bandwidth[0].indexOf('b=TIAS:') === 0) {
	  bandwidth = parseInt(bandwidth[0].substr(7), 10);
	} else if (bandwidth[0].indexOf('b=AS:') === 0) {
	  bandwidth = parseInt(bandwidth[0].substr(5), 10);
	}
	encodingParameters.forEach(function(params) {
	  params.maxBitrate = bandwidth;
	});
  }
  return encodingParameters;
};

SDPUtils.writeSessionBoilerplate = function() {
  // FIXME: sess-id should be an NTP timestamp.
  return 'v=0\r\n' +
	  'o=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\n' +
	  's=-\r\n' +
	  't=0 0\r\n';
};

SDPUtils.writeMediaSection = function(transceiver, caps, type, stream) {
  var sdp = SDPUtils.writeRtpDescription(transceiver.kind, caps);

  // Map ICE parameters (ufrag, pwd) to SDP.
  sdp += SDPUtils.writeIceParameters(
	  transceiver.iceGatherer.getLocalParameters());

  // Map DTLS parameters to SDP.
  sdp += SDPUtils.writeDtlsParameters(
	  transceiver.dtlsTransport.getLocalParameters(),
	  type === 'offer' ? 'actpass' : 'active');

  sdp += 'a=mid:' + transceiver.mid + '\r\n';

  if (transceiver.rtpSender && transceiver.rtpReceiver) {
	sdp += 'a=sendrecv\r\n';
  } else if (transceiver.rtpSender) {
	sdp += 'a=sendonly\r\n';
  } else if (transceiver.rtpReceiver) {
	sdp += 'a=recvonly\r\n';
  } else {
	sdp += 'a=inactive\r\n';
  }

  // FIXME: for RTX there might be multiple SSRCs. Not implemented in Edge yet.
  if (transceiver.rtpSender) {
	var msid = 'msid:' + stream.id + ' ' +
		transceiver.rtpSender.track.id + '\r\n';
	sdp += 'a=' + msid;
	sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
		' ' + msid;
  }
  // FIXME: this should be written by writeRtpDescription.
  sdp += 'a=ssrc:' + transceiver.sendEncodingParameters[0].ssrc +
	  ' cname:' + SDPUtils.localCName + '\r\n';
  return sdp;
};

// Gets the direction from the mediaSection or the sessionpart.
SDPUtils.getDirection = function(mediaSection, sessionpart) {
  // Look for sendrecv, sendonly, recvonly, inactive, default to sendrecv.
  var lines = SDPUtils.splitLines(mediaSection);
  for (var i = 0; i < lines.length; i++) {
	switch (lines[i]) {
	  case 'a=sendrecv':
	  case 'a=sendonly':
	  case 'a=recvonly':
	  case 'a=inactive':
		return lines[i].substr(2);
	  default:
		// FIXME: What should happen here?
	}
  }
  if (sessionpart) {
	return SDPUtils.getDirection(sessionpart);
  }
  return 'sendrecv';
};

// Expose public methods.
module.exports = SDPUtils;

},{}],2:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */

'use strict';

// Shimming starts here.
(function() {
  // Utils.
  var logging = require('./utils').log;
  var browserDetails = require('./utils').browserDetails;
  // Export to the adapter global object visible in the browser.
  module.exports.browserDetails = browserDetails;
  module.exports.extractVersion = require('./utils').extractVersion;
  module.exports.disableLog = require('./utils').disableLog;

  // Uncomment the line below if you want logging to occur, including logging
  // for the switch statement below. Can also be turned on in the browser via
  // adapter.disableLog(false), but then logging from the switch statement below
  // will not appear.
  // require('./utils').disableLog(false);

  // Browser shims.
  var chromeShim = require('./chrome/chrome_shim') || null;
  var edgeShim = require('./edge/edge_shim') || null;
  var firefoxShim = require('./firefox/firefox_shim') || null;
  var safariShim = require('./safari/safari_shim') || null;

  // Shim browser if found.
  switch (browserDetails.browser) {
	case 'opera': // fallthrough as it uses chrome shims
	case 'chrome':
	  if (!chromeShim || !chromeShim.shimPeerConnection) {
		logging('Chrome shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming chrome.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = chromeShim;

	  chromeShim.shimGetUserMedia();
	  chromeShim.shimMediaStream();
	  chromeShim.shimSourceObject();
	  chromeShim.shimPeerConnection();
	  chromeShim.shimOnTrack();
	  break;
	case 'firefox':
	  if (!firefoxShim || !firefoxShim.shimPeerConnection) {
		logging('Firefox shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming firefox.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = firefoxShim;

	  firefoxShim.shimGetUserMedia();
	  firefoxShim.shimSourceObject();
	  firefoxShim.shimPeerConnection();
	  firefoxShim.shimOnTrack();
	  break;
	case 'edge':
	  if (!edgeShim || !edgeShim.shimPeerConnection) {
		logging('MS edge shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming edge.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = edgeShim;

	  edgeShim.shimGetUserMedia();
	  edgeShim.shimPeerConnection();
	  break;
	case 'safari':
	  if (!safariShim) {
		logging('Safari shim is not included in this adapter release.');
		return;
	  }
	  logging('adapter.js shimming safari.');
	  // Export to the adapter global object visible in the browser.
	  module.exports.browserShim = safariShim;

	  safariShim.shimGetUserMedia();
	  break;
	default:
	  logging('Unsupported browser!');
  }
})();

},{"./chrome/chrome_shim":3,"./edge/edge_shim":5,"./firefox/firefox_shim":7,"./safari/safari_shim":9,"./utils":10}],3:[function(require,module,exports){

/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;
var browserDetails = require('../utils.js').browserDetails;

var chromeShim = {
  shimMediaStream: function() {
	window.MediaStream = window.MediaStream || window.webkitMediaStream;
  },

  shimOnTrack: function() {
	if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
		window.RTCPeerConnection.prototype)) {
	  Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
		get: function() {
		  return this._ontrack;
		},
		set: function(f) {
		  var self = this;
		  if (this._ontrack) {
			this.removeEventListener('track', this._ontrack);
			this.removeEventListener('addstream', this._ontrackpoly);
		  }
		  this.addEventListener('track', this._ontrack = f);
		  this.addEventListener('addstream', this._ontrackpoly = function(e) {
			// onaddstream does not fire when a track is added to an existing
			// stream. But stream.onaddtrack is implemented so we use that.
			e.stream.addEventListener('addtrack', function(te) {
			  var event = new Event('track');
			  event.track = te.track;
			  event.receiver = {track: te.track};
			  event.streams = [e.stream];
			  self.dispatchEvent(event);
			});
			e.stream.getTracks().forEach(function(track) {
			  var event = new Event('track');
			  event.track = track;
			  event.receiver = {track: track};
			  event.streams = [e.stream];
			  this.dispatchEvent(event);
			}.bind(this));
		  }.bind(this));
		}
	  });
	}
  },

  shimSourceObject: function() {
	if (typeof window === 'object') {
	  if (window.HTMLMediaElement &&
		!('srcObject' in window.HTMLMediaElement.prototype)) {
		// Shim the srcObject property, once, when HTMLMediaElement is found.
		Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
		  get: function() {
			return this._srcObject;
		  },
		  set: function(stream) {
			var self = this;
			// Use _srcObject as a private property for this shim
			this._srcObject = stream;
			if (this.src) {
			  URL.revokeObjectURL(this.src);
			}

			if (!stream) {
			  this.src = '';
			  return;
			}
			this.src = URL.createObjectURL(stream);
			// We need to recreate the blob url when a track is added or
			// removed. Doing it manually since we want to avoid a recursion.
			stream.addEventListener('addtrack', function() {
			  if (self.src) {
				URL.revokeObjectURL(self.src);
			  }
			  self.src = URL.createObjectURL(stream);
			});
			stream.addEventListener('removetrack', function() {
			  if (self.src) {
				URL.revokeObjectURL(self.src);
			  }
			  self.src = URL.createObjectURL(stream);
			});
		  }
		});
	  }
	}
  },

  shimPeerConnection: function() {
	// The RTCPeerConnection object.
	window.RTCPeerConnection = function(pcConfig, pcConstraints) {
	  // Translate iceTransportPolicy to iceTransports,
	  // see https://code.google.com/p/webrtc/issues/detail?id=4869
	  logging('PeerConnection');
	  if (pcConfig && pcConfig.iceTransportPolicy) {
		pcConfig.iceTransports = pcConfig.iceTransportPolicy;
	  }

	  var pc = new webkitRTCPeerConnection(pcConfig, pcConstraints);
	  var origGetStats = pc.getStats.bind(pc);
	  pc.getStats = function(selector, successCallback, errorCallback) {
		var self = this;
		var args = arguments;

		// If selector is a function then we are in the old style stats so just
		// pass back the original getStats format to avoid breaking old users.
		if (arguments.length > 0 && typeof selector === 'function') {
		  return origGetStats(selector, successCallback);
		}

		var fixChromeStats_ = function(response) {
		  var standardReport = {};
		  var reports = response.result();
		  reports.forEach(function(report) {
			var standardStats = {
			  id: report.id,
			  timestamp: report.timestamp,
			  type: report.type
			};
			report.names().forEach(function(name) {
			  standardStats[name] = report.stat(name);
			});
			standardReport[standardStats.id] = standardStats;
		  });

		  return standardReport;
		};

		// shim getStats with maplike support
		var makeMapStats = function(stats, legacyStats) {
		  var map = new Map(Object.keys(stats).map(function(key) {
			return[key, stats[key]];
		  }));
		  legacyStats = legacyStats || stats;
		  Object.keys(legacyStats).forEach(function(key) {
			map[key] = legacyStats[key];
		  });
		  return map;
		};

		if (arguments.length >= 2) {
		  var successCallbackWrapper_ = function(response) {
			args[1](makeMapStats(fixChromeStats_(response)));
		  };

		  return origGetStats.apply(this, [successCallbackWrapper_,
			  arguments[0]]);
		}

		// promise-support
		return new Promise(function(resolve, reject) {
		  if (args.length === 1 && typeof selector === 'object') {
			origGetStats.apply(self, [
			  function(response) {
				resolve(makeMapStats(fixChromeStats_(response)));
			  }, reject]);
		  } else {
			// Preserve legacy chrome stats only on legacy access of stats obj
			origGetStats.apply(self, [
			  function(response) {
				resolve(makeMapStats(fixChromeStats_(response),
					response.result()));
			  }, reject]);
		  }
		}).then(successCallback, errorCallback);
	  };

	  return pc;
	};
	window.RTCPeerConnection.prototype = webkitRTCPeerConnection.prototype;

	// wrap static methods. Currently just generateCertificate.
	if (webkitRTCPeerConnection.generateCertificate) {
	  Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
		get: function() {
		  return webkitRTCPeerConnection.generateCertificate;
		}
	  });
	}

	['createOffer', 'createAnswer'].forEach(function(method) {
	  var nativeMethod = webkitRTCPeerConnection.prototype[method];
	  webkitRTCPeerConnection.prototype[method] = function() {
		var self = this;
		if (arguments.length < 1 || (arguments.length === 1 &&
			typeof arguments[0] === 'object')) {
		  var opts = arguments.length === 1 ? arguments[0] : undefined;
		  return new Promise(function(resolve, reject) {
			nativeMethod.apply(self, [resolve, reject, opts]);
		  });
		}
		return nativeMethod.apply(this, arguments);
	  };
	});

	// add promise support -- natively available in Chrome 51
	if (browserDetails.version < 51) {
	  ['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
		  .forEach(function(method) {
			var nativeMethod = webkitRTCPeerConnection.prototype[method];
			webkitRTCPeerConnection.prototype[method] = function() {
			  var args = arguments;
			  var self = this;
			  var promise = new Promise(function(resolve, reject) {
				nativeMethod.apply(self, [args[0], resolve, reject]);
			  });
			  if (args.length < 2) {
				return promise;
			  }
			  return promise.then(function() {
				args[1].apply(null, []);
			  },
			  function(err) {
				if (args.length >= 3) {
				  args[2].apply(null, [err]);
				}
			  });
			};
		  });
	}

	// shim implicit creation of RTCSessionDescription/RTCIceCandidate
	['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
		.forEach(function(method) {
		  var nativeMethod = webkitRTCPeerConnection.prototype[method];
		  webkitRTCPeerConnection.prototype[method] = function() {
			arguments[0] = new ((method === 'addIceCandidate') ?
				RTCIceCandidate : RTCSessionDescription)(arguments[0]);
			return nativeMethod.apply(this, arguments);
		  };
		});

	// support for addIceCandidate(null)
	var nativeAddIceCandidate =
		RTCPeerConnection.prototype.addIceCandidate;
	RTCPeerConnection.prototype.addIceCandidate = function() {
	  if (arguments[0] === null) {
		if (arguments[1]) {
		  arguments[1].apply(null);
		}
		return Promise.resolve();
	  }
	  return nativeAddIceCandidate.apply(this, arguments);
	};
  }
};


// Expose public methods.
module.exports = {
  shimMediaStream: chromeShim.shimMediaStream,
  shimOnTrack: chromeShim.shimOnTrack,
  shimSourceObject: chromeShim.shimSourceObject,
  shimPeerConnection: chromeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils.js":10,"./getusermedia":4}],4:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';
var logging = require('../utils.js').log;

// Expose public methods.
module.exports = function() {
  var constraintsToChrome_ = function(c) {
	if (typeof c !== 'object' || c.mandatory || c.optional) {
	  return c;
	}
	var cc = {};
	Object.keys(c).forEach(function(key) {
	  if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
		return;
	  }
	  var r = (typeof c[key] === 'object') ? c[key] : {ideal: c[key]};
	  if (r.exact !== undefined && typeof r.exact === 'number') {
		r.min = r.max = r.exact;
	  }
	  var oldname_ = function(prefix, name) {
		if (prefix) {
		  return prefix + name.charAt(0).toUpperCase() + name.slice(1);
		}
		return (name === 'deviceId') ? 'sourceId' : name;
	  };
	  if (r.ideal !== undefined) {
		cc.optional = cc.optional || [];
		var oc = {};
		if (typeof r.ideal === 'number') {
		  oc[oldname_('min', key)] = r.ideal;
		  cc.optional.push(oc);
		  oc = {};
		  oc[oldname_('max', key)] = r.ideal;
		  cc.optional.push(oc);
		} else {
		  oc[oldname_('', key)] = r.ideal;
		  cc.optional.push(oc);
		}
	  }
	  if (r.exact !== undefined && typeof r.exact !== 'number') {
		cc.mandatory = cc.mandatory || {};
		cc.mandatory[oldname_('', key)] = r.exact;
	  } else {
		['min', 'max'].forEach(function(mix) {
		  if (r[mix] !== undefined) {
			cc.mandatory = cc.mandatory || {};
			cc.mandatory[oldname_(mix, key)] = r[mix];
		  }
		});
	  }
	});
	if (c.advanced) {
	  cc.optional = (cc.optional || []).concat(c.advanced);
	}
	return cc;
  };

  var shimConstraints_ = function(constraints, func) {
	constraints = JSON.parse(JSON.stringify(constraints));
	if (constraints && constraints.audio) {
	  constraints.audio = constraintsToChrome_(constraints.audio);
	}
	if (constraints && typeof constraints.video === 'object') {
	  // Shim facingMode for mobile, where it defaults to "user".
	  var face = constraints.video.facingMode;
	  face = face && ((typeof face === 'object') ? face : {ideal: face});

	  if ((face && (face.exact === 'user' || face.exact === 'environment' ||
					face.ideal === 'user' || face.ideal === 'environment')) &&
		  !(navigator.mediaDevices.getSupportedConstraints &&
			navigator.mediaDevices.getSupportedConstraints().facingMode)) {
		delete constraints.video.facingMode;
		if (face.exact === 'environment' || face.ideal === 'environment') {
		  // Look for "back" in label, or use last cam (typically back cam).
		  return navigator.mediaDevices.enumerateDevices()
		  .then(function(devices) {
			devices = devices.filter(function(d) {
			  return d.kind === 'videoinput';
			});
			var back = devices.find(function(d) {
			  return d.label.toLowerCase().indexOf('back') !== -1;
			}) || (devices.length && devices[devices.length - 1]);
			if (back) {
			  constraints.video.deviceId = face.exact ? {exact: back.deviceId} :
														{ideal: back.deviceId};
			}
			constraints.video = constraintsToChrome_(constraints.video);
			logging('chrome: ' + JSON.stringify(constraints));
			return func(constraints);
		  });
		}
	  }
	  constraints.video = constraintsToChrome_(constraints.video);
	}
	logging('chrome: ' + JSON.stringify(constraints));
	return func(constraints);
  };

  var shimError_ = function(e) {
	return {
	  name: {
		PermissionDeniedError: 'NotAllowedError',
		ConstraintNotSatisfiedError: 'OverconstrainedError'
	  }[e.name] || e.name,
	  message: e.message,
	  constraint: e.constraintName,
	  toString: function() {
		return this.name + (this.message && ': ') + this.message;
	  }
	};
  };

  var getUserMedia_ = function(constraints, onSuccess, onError) {
	shimConstraints_(constraints, function(c) {
	  navigator.webkitGetUserMedia(c, onSuccess, function(e) {
		onError(shimError_(e));
	  });
	});
  };

  navigator.getUserMedia = getUserMedia_;

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
	return new Promise(function(resolve, reject) {
	  navigator.getUserMedia(constraints, resolve, reject);
	});
  };

  if (!navigator.mediaDevices) {
	navigator.mediaDevices = {
	  getUserMedia: getUserMediaPromise_,
	  enumerateDevices: function() {
		return new Promise(function(resolve) {
		  var kinds = {audio: 'audioinput', video: 'videoinput'};
		  return MediaStreamTrack.getSources(function(devices) {
			resolve(devices.map(function(device) {
			  return {label: device.label,
					  kind: kinds[device.kind],
					  deviceId: device.id,
					  groupId: ''};
			}));
		  });
		});
	  }
	};
  }

  // A shim for getUserMedia method on the mediaDevices object.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (!navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia = function(constraints) {
	  return getUserMediaPromise_(constraints);
	};
  } else {
	// Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
	// function which returns a Promise, it does not accept spec-style
	// constraints.
	var origGetUserMedia = navigator.mediaDevices.getUserMedia.
		bind(navigator.mediaDevices);
	navigator.mediaDevices.getUserMedia = function(cs) {
	  return shimConstraints_(cs, function(c) {
		return origGetUserMedia(c).then(function(stream) {
		  if (c.audio && !stream.getAudioTracks().length ||
			  c.video && !stream.getVideoTracks().length) {
			stream.getTracks().forEach(function(track) {
			  track.stop();
			});
			throw new DOMException('', 'NotFoundError');
		  }
		  return stream;
		}, function(e) {
		  return Promise.reject(shimError_(e));
		});
	  });
	};
  }

  // Dummy devicechange event methods.
  // TODO(KaptenJansson) remove once implemented in Chrome stable.
  if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
	navigator.mediaDevices.addEventListener = function() {
	  logging('Dummy mediaDevices.addEventListener called.');
	};
  }
  if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
	navigator.mediaDevices.removeEventListener = function() {
	  logging('Dummy mediaDevices.removeEventListener called.');
	};
  }
};

},{"../utils.js":10}],5:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var SDPUtils = require('sdp');
var browserDetails = require('../utils').browserDetails;

var edgeShim = {
  shimPeerConnection: function() {
	if (window.RTCIceGatherer) {
	  // ORTC defines an RTCIceCandidate object but no constructor.
	  // Not implemented in Edge.
	  if (!window.RTCIceCandidate) {
		window.RTCIceCandidate = function(args) {
		  return args;
		};
	  }
	  // ORTC does not have a session description object but
	  // other browsers (i.e. Chrome) that will support both PC and ORTC
	  // in the future might have this defined already.
	  if (!window.RTCSessionDescription) {
		window.RTCSessionDescription = function(args) {
		  return args;
		};
	  }
	}

	window.RTCPeerConnection = function(config) {
	  var self = this;

	  var _eventTarget = document.createDocumentFragment();
	  ['addEventListener', 'removeEventListener', 'dispatchEvent']
		  .forEach(function(method) {
			self[method] = _eventTarget[method].bind(_eventTarget);
		  });

	  this.onicecandidate = null;
	  this.onaddstream = null;
	  this.ontrack = null;
	  this.onremovestream = null;
	  this.onsignalingstatechange = null;
	  this.oniceconnectionstatechange = null;
	  this.onnegotiationneeded = null;
	  this.ondatachannel = null;

	  this.localStreams = [];
	  this.remoteStreams = [];
	  this.getLocalStreams = function() {
		return self.localStreams;
	  };
	  this.getRemoteStreams = function() {
		return self.remoteStreams;
	  };

	  this.localDescription = new RTCSessionDescription({
		type: '',
		sdp: ''
	  });
	  this.remoteDescription = new RTCSessionDescription({
		type: '',
		sdp: ''
	  });
	  this.signalingState = 'stable';
	  this.iceConnectionState = 'new';
	  this.iceGatheringState = 'new';

	  this.iceOptions = {
		gatherPolicy: 'all',
		iceServers: []
	  };
	  if (config && config.iceTransportPolicy) {
		switch (config.iceTransportPolicy) {
		  case 'all':
		  case 'relay':
			this.iceOptions.gatherPolicy = config.iceTransportPolicy;
			break;
		  case 'none':
			// FIXME: remove once implementation and spec have added this.
			throw new TypeError('iceTransportPolicy "none" not supported');
		  default:
			// don't set iceTransportPolicy.
			break;
		}
	  }
	  this.usingBundle = config && config.bundlePolicy === 'max-bundle';

	  if (config && config.iceServers) {
		// Edge does not like
		// 1) stun:
		// 2) turn: that does not have all of turn:host:port?transport=udp
		// 3) turn: with ipv6 addresses
		var iceServers = JSON.parse(JSON.stringify(config.iceServers));
		this.iceOptions.iceServers = iceServers.filter(function(server) {
		  if (server && server.urls) {
			var urls = server.urls;
			if (typeof urls === 'string') {
			  urls = [urls];
			}
			urls = urls.filter(function(url) {
			  return (url.indexOf('turn:') === 0 &&
				  url.indexOf('transport=udp') !== -1 &&
				  url.indexOf('turn:[') === -1) ||
				  (url.indexOf('stun:') === 0 &&
					browserDetails.version >= 14393);
			})[0];
			return !!urls;
		  }
		  return false;
		});
	  }
	  this._config = config;

	  // per-track iceGathers, iceTransports, dtlsTransports, rtpSenders, ...
	  // everything that is needed to describe a SDP m-line.
	  this.transceivers = [];

	  // since the iceGatherer is currently created in createOffer but we
	  // must not emit candidates until after setLocalDescription we buffer
	  // them in this array.
	  this._localIceCandidatesBuffer = [];
	};

	window.RTCPeerConnection.prototype._emitBufferedCandidates = function() {
	  var self = this;
	  var sections = SDPUtils.splitSections(self.localDescription.sdp);
	  // FIXME: need to apply ice candidates in a way which is async but
	  // in-order
	  this._localIceCandidatesBuffer.forEach(function(event) {
		var end = !event.candidate || Object.keys(event.candidate).length === 0;
		if (end) {
		  for (var j = 1; j < sections.length; j++) {
			if (sections[j].indexOf('\r\na=end-of-candidates\r\n') === -1) {
			  sections[j] += 'a=end-of-candidates\r\n';
			}
		  }
		} else if (event.candidate.candidate.indexOf('typ endOfCandidates')
			=== -1) {
		  sections[event.candidate.sdpMLineIndex + 1] +=
			  'a=' + event.candidate.candidate + '\r\n';
		}
		self.localDescription.sdp = sections.join('');
		self.dispatchEvent(event);
		if (self.onicecandidate !== null) {
		  self.onicecandidate(event);
		}
		if (!event.candidate && self.iceGatheringState !== 'complete') {
		  var complete = self.transceivers.every(function(transceiver) {
			return transceiver.iceGatherer &&
				transceiver.iceGatherer.state === 'completed';
		  });
		  if (complete) {
			self.iceGatheringState = 'complete';
		  }
		}
	  });
	  this._localIceCandidatesBuffer = [];
	};

	window.RTCPeerConnection.prototype.getConfiguration = function() {
	  return this._config;
	};

	window.RTCPeerConnection.prototype.addStream = function(stream) {
	  // Clone is necessary for local demos mostly, attaching directly
	  // to two different senders does not work (build 10547).
	  this.localStreams.push(stream.clone());
	  this._maybeFireNegotiationNeeded();
	};

	window.RTCPeerConnection.prototype.removeStream = function(stream) {
	  var idx = this.localStreams.indexOf(stream);
	  if (idx > -1) {
		this.localStreams.splice(idx, 1);
		this._maybeFireNegotiationNeeded();
	  }
	};

	window.RTCPeerConnection.prototype.getSenders = function() {
	  return this.transceivers.filter(function(transceiver) {
		return !!transceiver.rtpSender;
	  })
	  .map(function(transceiver) {
		return transceiver.rtpSender;
	  });
	};

	window.RTCPeerConnection.prototype.getReceivers = function() {
	  return this.transceivers.filter(function(transceiver) {
		return !!transceiver.rtpReceiver;
	  })
	  .map(function(transceiver) {
		return transceiver.rtpReceiver;
	  });
	};

	// Determines the intersection of local and remote capabilities.
	window.RTCPeerConnection.prototype._getCommonCapabilities =
		function(localCapabilities, remoteCapabilities) {
		  var commonCapabilities = {
			codecs: [],
			headerExtensions: [],
			fecMechanisms: []
		  };
		  localCapabilities.codecs.forEach(function(lCodec) {
			for (var i = 0; i < remoteCapabilities.codecs.length; i++) {
			  var rCodec = remoteCapabilities.codecs[i];
			  if (lCodec.name.toLowerCase() === rCodec.name.toLowerCase() &&
				  lCodec.clockRate === rCodec.clockRate &&
				  lCodec.numChannels === rCodec.numChannels) {
				// push rCodec so we reply with offerer payload type
				commonCapabilities.codecs.push(rCodec);

				// determine common feedback mechanisms
				rCodec.rtcpFeedback = rCodec.rtcpFeedback.filter(function(fb) {
				  for (var j = 0; j < lCodec.rtcpFeedback.length; j++) {
					if (lCodec.rtcpFeedback[j].type === fb.type &&
						lCodec.rtcpFeedback[j].parameter === fb.parameter) {
					  return true;
					}
				  }
				  return false;
				});
				// FIXME: also need to determine .parameters
				//  see https://github.com/openpeer/ortc/issues/569
				break;
			  }
			}
		  });

		  localCapabilities.headerExtensions
			  .forEach(function(lHeaderExtension) {
				for (var i = 0; i < remoteCapabilities.headerExtensions.length;
					 i++) {
				  var rHeaderExtension = remoteCapabilities.headerExtensions[i];
				  if (lHeaderExtension.uri === rHeaderExtension.uri) {
					commonCapabilities.headerExtensions.push(rHeaderExtension);
					break;
				  }
				}
			  });

		  // FIXME: fecMechanisms
		  return commonCapabilities;
		};

	// Create ICE gatherer, ICE transport and DTLS transport.
	window.RTCPeerConnection.prototype._createIceAndDtlsTransports =
		function(mid, sdpMLineIndex) {
		  var self = this;
		  var iceGatherer = new RTCIceGatherer(self.iceOptions);
		  var iceTransport = new RTCIceTransport(iceGatherer);
		  iceGatherer.onlocalcandidate = function(evt) {
			var event = new Event('icecandidate');
			event.candidate = {sdpMid: mid, sdpMLineIndex: sdpMLineIndex};

			var cand = evt.candidate;
			var end = !cand || Object.keys(cand).length === 0;
			// Edge emits an empty object for RTCIceCandidateComplete‥
			if (end) {
			  // polyfill since RTCIceGatherer.state is not implemented in
			  // Edge 10547 yet.
			  if (iceGatherer.state === undefined) {
				iceGatherer.state = 'completed';
			  }

			  // Emit a candidate with type endOfCandidates to make the samples
			  // work. Edge requires addIceCandidate with this empty candidate
			  // to start checking. The real solution is to signal
			  // end-of-candidates to the other side when getting the null
			  // candidate but some apps (like the samples) don't do that.
			  event.candidate.candidate =
				  'candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates';
			} else {
			  // RTCIceCandidate doesn't have a component, needs to be added
			  cand.component = iceTransport.component === 'RTCP' ? 2 : 1;
			  event.candidate.candidate = SDPUtils.writeCandidate(cand);
			}

			// update local description.
			var sections = SDPUtils.splitSections(self.localDescription.sdp);
			if (event.candidate.candidate.indexOf('typ endOfCandidates')
				=== -1) {
			  sections[event.candidate.sdpMLineIndex + 1] +=
				  'a=' + event.candidate.candidate + '\r\n';
			} else {
			  sections[event.candidate.sdpMLineIndex + 1] +=
				  'a=end-of-candidates\r\n';
			}
			self.localDescription.sdp = sections.join('');

			var complete = self.transceivers.every(function(transceiver) {
			  return transceiver.iceGatherer &&
				  transceiver.iceGatherer.state === 'completed';
			});

			// Emit candidate if localDescription is set.
			// Also emits null candidate when all gatherers are complete.
			switch (self.iceGatheringState) {
			  case 'new':
				self._localIceCandidatesBuffer.push(event);
				if (end && complete) {
				  self._localIceCandidatesBuffer.push(
					  new Event('icecandidate'));
				}
				break;
			  case 'gathering':
				self._emitBufferedCandidates();
				self.dispatchEvent(event);
				if (self.onicecandidate !== null) {
				  self.onicecandidate(event);
				}
				if (complete) {
				  self.dispatchEvent(new Event('icecandidate'));
				  if (self.onicecandidate !== null) {
					self.onicecandidate(new Event('icecandidate'));
				  }
				  self.iceGatheringState = 'complete';
				}
				break;
			  case 'complete':
				// should not happen... currently!
				break;
			  default: // no-op.
				break;
			}
		  };
		  iceTransport.onicestatechange = function() {
			self._updateConnectionState();
		  };

		  var dtlsTransport = new RTCDtlsTransport(iceTransport);
		  dtlsTransport.ondtlsstatechange = function() {
			self._updateConnectionState();
		  };
		  dtlsTransport.onerror = function() {
			// onerror does not set state to failed by itself.
			dtlsTransport.state = 'failed';
			self._updateConnectionState();
		  };

		  return {
			iceGatherer: iceGatherer,
			iceTransport: iceTransport,
			dtlsTransport: dtlsTransport
		  };
		};

	// Start the RTP Sender and Receiver for a transceiver.
	window.RTCPeerConnection.prototype._transceive = function(transceiver,
		send, recv) {
	  var params = this._getCommonCapabilities(transceiver.localCapabilities,
		  transceiver.remoteCapabilities);
	  if (send && transceiver.rtpSender) {
		params.encodings = transceiver.sendEncodingParameters;
		params.rtcp = {
		  cname: SDPUtils.localCName
		};
		if (transceiver.recvEncodingParameters.length) {
		  params.rtcp.ssrc = transceiver.recvEncodingParameters[0].ssrc;
		}
		transceiver.rtpSender.send(params);
	  }
	  if (recv && transceiver.rtpReceiver) {
		// remove RTX field in Edge 14942
		if (transceiver.kind === 'video'
			&& transceiver.recvEncodingParameters) {
		  transceiver.recvEncodingParameters.forEach(function(p) {
			delete p.rtx;
		  });
		}
		params.encodings = transceiver.recvEncodingParameters;
		params.rtcp = {
		  cname: transceiver.cname
		};
		if (transceiver.sendEncodingParameters.length) {
		  params.rtcp.ssrc = transceiver.sendEncodingParameters[0].ssrc;
		}
		transceiver.rtpReceiver.receive(params);
	  }
	};

	window.RTCPeerConnection.prototype.setLocalDescription =
		function(description) {
		  var self = this;
		  var sections;
		  var sessionpart;
		  if (description.type === 'offer') {
			// FIXME: What was the purpose of this empty if statement?
			// if (!this._pendingOffer) {
			// } else {
			if (this._pendingOffer) {
			  // VERY limited support for SDP munging. Limited to:
			  // * changing the order of codecs
			  sections = SDPUtils.splitSections(description.sdp);
			  sessionpart = sections.shift();
			  sections.forEach(function(mediaSection, sdpMLineIndex) {
				var caps = SDPUtils.parseRtpParameters(mediaSection);
				self._pendingOffer[sdpMLineIndex].localCapabilities = caps;
			  });
			  this.transceivers = this._pendingOffer;
			  delete this._pendingOffer;
			}
		  } else if (description.type === 'answer') {
			sections = SDPUtils.splitSections(self.remoteDescription.sdp);
			sessionpart = sections.shift();
			var isIceLite = SDPUtils.matchPrefix(sessionpart,
				'a=ice-lite').length > 0;
			sections.forEach(function(mediaSection, sdpMLineIndex) {
			  var transceiver = self.transceivers[sdpMLineIndex];
			  var iceGatherer = transceiver.iceGatherer;
			  var iceTransport = transceiver.iceTransport;
			  var dtlsTransport = transceiver.dtlsTransport;
			  var localCapabilities = transceiver.localCapabilities;
			  var remoteCapabilities = transceiver.remoteCapabilities;

			  var rejected = mediaSection.split('\n', 1)[0]
				  .split(' ', 2)[1] === '0';

			  if (!rejected && !transceiver.isDatachannel) {
				var remoteIceParameters = SDPUtils.getIceParameters(
					mediaSection, sessionpart);
				if (isIceLite) {
				  var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
				  .map(function(cand) {
					return SDPUtils.parseCandidate(cand);
				  })
				  .filter(function(cand) {
					return cand.component === '1';
				  });
				  // ice-lite only includes host candidates in the SDP so we can
				  // use setRemoteCandidates (which implies an
				  // RTCIceCandidateComplete)
				  if (cands.length) {
					iceTransport.setRemoteCandidates(cands);
				  }
				}
				var remoteDtlsParameters = SDPUtils.getDtlsParameters(
					mediaSection, sessionpart);
				if (isIceLite) {
				  remoteDtlsParameters.role = 'server';
				}

				if (!self.usingBundle || sdpMLineIndex === 0) {
				  iceTransport.start(iceGatherer, remoteIceParameters,
					  isIceLite ? 'controlling' : 'controlled');
				  dtlsTransport.start(remoteDtlsParameters);
				}

				// Calculate intersection of capabilities.
				var params = self._getCommonCapabilities(localCapabilities,
					remoteCapabilities);

				// Start the RTCRtpSender. The RTCRtpReceiver for this
				// transceiver has already been started in setRemoteDescription.
				self._transceive(transceiver,
					params.codecs.length > 0,
					false);
			  }
			});
		  }

		  this.localDescription = {
			type: description.type,
			sdp: description.sdp
		  };
		  switch (description.type) {
			case 'offer':
			  this._updateSignalingState('have-local-offer');
			  break;
			case 'answer':
			  this._updateSignalingState('stable');
			  break;
			default:
			  throw new TypeError('unsupported type "' + description.type +
				  '"');
		  }

		  // If a success callback was provided, emit ICE candidates after it
		  // has been executed. Otherwise, emit callback after the Promise is
		  // resolved.
		  var hasCallback = arguments.length > 1 &&
			typeof arguments[1] === 'function';
		  if (hasCallback) {
			var cb = arguments[1];
			window.setTimeout(function() {
			  cb();
			  if (self.iceGatheringState === 'new') {
				self.iceGatheringState = 'gathering';
			  }
			  self._emitBufferedCandidates();
			}, 0);
		  }
		  var p = Promise.resolve();
		  p.then(function() {
			if (!hasCallback) {
			  if (self.iceGatheringState === 'new') {
				self.iceGatheringState = 'gathering';
			  }
			  // Usually candidates will be emitted earlier.
			  window.setTimeout(self._emitBufferedCandidates.bind(self), 500);
			}
		  });
		  return p;
		};

	window.RTCPeerConnection.prototype.setRemoteDescription =
		function(description) {
		  var self = this;
		  var stream = new MediaStream();
		  var receiverList = [];
		  var sections = SDPUtils.splitSections(description.sdp);
		  var sessionpart = sections.shift();
		  var isIceLite = SDPUtils.matchPrefix(sessionpart,
			  'a=ice-lite').length > 0;
		  this.usingBundle = SDPUtils.matchPrefix(sessionpart,
			  'a=group:BUNDLE ').length > 0;
		  sections.forEach(function(mediaSection, sdpMLineIndex) {
			var lines = SDPUtils.splitLines(mediaSection);
			var mline = lines[0].substr(2).split(' ');
			var kind = mline[0];
			var rejected = mline[1] === '0';
			var direction = SDPUtils.getDirection(mediaSection, sessionpart);

			var mid = SDPUtils.matchPrefix(mediaSection, 'a=mid:');
			if (mid.length) {
			  mid = mid[0].substr(6);
			} else {
			  mid = SDPUtils.generateIdentifier();
			}

			// Reject datachannels which are not implemented yet.
			if (kind === 'application' && mline[2] === 'DTLS/SCTP') {
			  self.transceivers[sdpMLineIndex] = {
				mid: mid,
				isDatachannel: true
			  };
			  return;
			}

			var transceiver;
			var iceGatherer;
			var iceTransport;
			var dtlsTransport;
			var rtpSender;
			var rtpReceiver;
			var sendEncodingParameters;
			var recvEncodingParameters;
			var localCapabilities;

			var track;
			// FIXME: ensure the mediaSection has rtcp-mux set.
			var remoteCapabilities = SDPUtils.parseRtpParameters(mediaSection);
			var remoteIceParameters;
			var remoteDtlsParameters;
			if (!rejected) {
			  remoteIceParameters = SDPUtils.getIceParameters(mediaSection,
				  sessionpart);
			  remoteDtlsParameters = SDPUtils.getDtlsParameters(mediaSection,
				  sessionpart);
			  remoteDtlsParameters.role = 'client';
			}
			recvEncodingParameters =
				SDPUtils.parseRtpEncodingParameters(mediaSection);

			var cname;
			// Gets the first SSRC. Note that with RTX there might be multiple
			// SSRCs.
			var remoteSsrc = SDPUtils.matchPrefix(mediaSection, 'a=ssrc:')
				.map(function(line) {
				  return SDPUtils.parseSsrcMedia(line);
				})
				.filter(function(obj) {
				  return obj.attribute === 'cname';
				})[0];
			if (remoteSsrc) {
			  cname = remoteSsrc.value;
			}

			var isComplete = SDPUtils.matchPrefix(mediaSection,
				'a=end-of-candidates', sessionpart).length > 0;
			var cands = SDPUtils.matchPrefix(mediaSection, 'a=candidate:')
				.map(function(cand) {
				  return SDPUtils.parseCandidate(cand);
				})
				.filter(function(cand) {
				  return cand.component === '1';
				});
			if (description.type === 'offer' && !rejected) {
			  var transports = self.usingBundle && sdpMLineIndex > 0 ? {
				iceGatherer: self.transceivers[0].iceGatherer,
				iceTransport: self.transceivers[0].iceTransport,
				dtlsTransport: self.transceivers[0].dtlsTransport
			  } : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

			  if (isComplete) {
				transports.iceTransport.setRemoteCandidates(cands);
			  }

			  localCapabilities = RTCRtpReceiver.getCapabilities(kind);

			  // filter RTX until additional stuff needed for RTX is implemented
			  // in adapter.js
			  localCapabilities.codecs = localCapabilities.codecs.filter(
				  function(codec) {
					return codec.name !== 'rtx';
				  });

			  sendEncodingParameters = [{
				ssrc: (2 * sdpMLineIndex + 2) * 1001
			  }];

			  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);

			  track = rtpReceiver.track;
			  receiverList.push([track, rtpReceiver]);
			  // FIXME: not correct when there are multiple streams but that is
			  // not currently supported in this shim.
			  stream.addTrack(track);

			  // FIXME: look at direction.
			  if (self.localStreams.length > 0 &&
				  self.localStreams[0].getTracks().length >= sdpMLineIndex) {
				var localTrack;
				if (kind === 'audio') {
				  localTrack = self.localStreams[0].getAudioTracks()[0];
				} else if (kind === 'video') {
				  localTrack = self.localStreams[0].getVideoTracks()[0];
				}
				if (localTrack) {
				  rtpSender = new RTCRtpSender(localTrack,
					  transports.dtlsTransport);
				}
			  }

			  self.transceivers[sdpMLineIndex] = {
				iceGatherer: transports.iceGatherer,
				iceTransport: transports.iceTransport,
				dtlsTransport: transports.dtlsTransport,
				localCapabilities: localCapabilities,
				remoteCapabilities: remoteCapabilities,
				rtpSender: rtpSender,
				rtpReceiver: rtpReceiver,
				kind: kind,
				mid: mid,
				cname: cname,
				sendEncodingParameters: sendEncodingParameters,
				recvEncodingParameters: recvEncodingParameters
			  };
			  // Start the RTCRtpReceiver now. The RTPSender is started in
			  // setLocalDescription.
			  self._transceive(self.transceivers[sdpMLineIndex],
				  false,
				  direction === 'sendrecv' || direction === 'sendonly');
			} else if (description.type === 'answer' && !rejected) {
			  transceiver = self.transceivers[sdpMLineIndex];
			  iceGatherer = transceiver.iceGatherer;
			  iceTransport = transceiver.iceTransport;
			  dtlsTransport = transceiver.dtlsTransport;
			  rtpSender = transceiver.rtpSender;
			  rtpReceiver = transceiver.rtpReceiver;
			  sendEncodingParameters = transceiver.sendEncodingParameters;
			  localCapabilities = transceiver.localCapabilities;

			  self.transceivers[sdpMLineIndex].recvEncodingParameters =
				  recvEncodingParameters;
			  self.transceivers[sdpMLineIndex].remoteCapabilities =
				  remoteCapabilities;
			  self.transceivers[sdpMLineIndex].cname = cname;

			  if ((isIceLite || isComplete) && cands.length) {
				iceTransport.setRemoteCandidates(cands);
			  }
			  if (!self.usingBundle || sdpMLineIndex === 0) {
				iceTransport.start(iceGatherer, remoteIceParameters,
					'controlling');
				dtlsTransport.start(remoteDtlsParameters);
			  }

			  self._transceive(transceiver,
				  direction === 'sendrecv' || direction === 'recvonly',
				  direction === 'sendrecv' || direction === 'sendonly');

			  if (rtpReceiver &&
				  (direction === 'sendrecv' || direction === 'sendonly')) {
				track = rtpReceiver.track;
				receiverList.push([track, rtpReceiver]);
				stream.addTrack(track);
			  } else {
				// FIXME: actually the receiver should be created later.
				delete transceiver.rtpReceiver;
			  }
			}
		  });

		  this.remoteDescription = {
			type: description.type,
			sdp: description.sdp
		  };
		  switch (description.type) {
			case 'offer':
			  this._updateSignalingState('have-remote-offer');
			  break;
			case 'answer':
			  this._updateSignalingState('stable');
			  break;
			default:
			  throw new TypeError('unsupported type "' + description.type +
				  '"');
		  }
		  if (stream.getTracks().length) {
			self.remoteStreams.push(stream);
			window.setTimeout(function() {
			  var event = new Event('addstream');
			  event.stream = stream;
			  self.dispatchEvent(event);
			  if (self.onaddstream !== null) {
				window.setTimeout(function() {
				  self.onaddstream(event);
				}, 0);
			  }

			  receiverList.forEach(function(item) {
				var track = item[0];
				var receiver = item[1];
				var trackEvent = new Event('track');
				trackEvent.track = track;
				trackEvent.receiver = receiver;
				trackEvent.streams = [stream];
				self.dispatchEvent(event);
				if (self.ontrack !== null) {
				  window.setTimeout(function() {
					self.ontrack(trackEvent);
				  }, 0);
				}
			  });
			}, 0);
		  }
		  if (arguments.length > 1 && typeof arguments[1] === 'function') {
			window.setTimeout(arguments[1], 0);
		  }
		  return Promise.resolve();
		};

	window.RTCPeerConnection.prototype.close = function() {
	  this.transceivers.forEach(function(transceiver) {
		/* not yet
		if (transceiver.iceGatherer) {
		  transceiver.iceGatherer.close();
		}
		*/
		if (transceiver.iceTransport) {
		  transceiver.iceTransport.stop();
		}
		if (transceiver.dtlsTransport) {
		  transceiver.dtlsTransport.stop();
		}
		if (transceiver.rtpSender) {
		  transceiver.rtpSender.stop();
		}
		if (transceiver.rtpReceiver) {
		  transceiver.rtpReceiver.stop();
		}
	  });
	  // FIXME: clean up tracks, local streams, remote streams, etc
	  this._updateSignalingState('closed');
	};

	// Update the signaling state.
	window.RTCPeerConnection.prototype._updateSignalingState =
		function(newState) {
		  this.signalingState = newState;
		  var event = new Event('signalingstatechange');
		  this.dispatchEvent(event);
		  if (this.onsignalingstatechange !== null) {
			this.onsignalingstatechange(event);
		  }
		};

	// Determine whether to fire the negotiationneeded event.
	window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded =
		function() {
		  // Fire away (for now).
		  var event = new Event('negotiationneeded');
		  this.dispatchEvent(event);
		  if (this.onnegotiationneeded !== null) {
			this.onnegotiationneeded(event);
		  }
		};

	// Update the connection state.
	window.RTCPeerConnection.prototype._updateConnectionState = function() {
	  var self = this;
	  var newState;
	  var states = {
		'new': 0,
		closed: 0,
		connecting: 0,
		checking: 0,
		connected: 0,
		completed: 0,
		failed: 0
	  };
	  this.transceivers.forEach(function(transceiver) {
		states[transceiver.iceTransport.state]++;
		states[transceiver.dtlsTransport.state]++;
	  });
	  // ICETransport.completed and connected are the same for this purpose.
	  states.connected += states.completed;

	  newState = 'new';
	  if (states.failed > 0) {
		newState = 'failed';
	  } else if (states.connecting > 0 || states.checking > 0) {
		newState = 'connecting';
	  } else if (states.disconnected > 0) {
		newState = 'disconnected';
	  } else if (states['new'] > 0) {		/* fix for ie8 */
		newState = 'new';
	  } else if (states.connected > 0 || states.completed > 0) {
		newState = 'connected';
	  }

	  if (newState !== self.iceConnectionState) {
		self.iceConnectionState = newState;
		var event = new Event('iceconnectionstatechange');
		this.dispatchEvent(event);
		if (this.oniceconnectionstatechange !== null) {
		  this.oniceconnectionstatechange(event);
		}
	  }
	};

	window.RTCPeerConnection.prototype.createOffer = function() {
	  var self = this;
	  if (this._pendingOffer) {
		throw new Error('createOffer called while there is a pending offer.');
	  }
	  var offerOptions;
	  if (arguments.length === 1 && typeof arguments[0] !== 'function') {
		offerOptions = arguments[0];
	  } else if (arguments.length === 3) {
		offerOptions = arguments[2];
	  }

	  var tracks = [];
	  var numAudioTracks = 0;
	  var numVideoTracks = 0;
	  // Default to sendrecv.
	  if (this.localStreams.length) {
		numAudioTracks = this.localStreams[0].getAudioTracks().length;
		numVideoTracks = this.localStreams[0].getVideoTracks().length;
	  }
	  // Determine number of audio and video tracks we need to send/recv.
	  if (offerOptions) {
		// Reject Chrome legacy constraints.
		if (offerOptions.mandatory || offerOptions.optional) {
		  throw new TypeError(
			  'Legacy mandatory/optional constraints not supported.');
		}
		if (offerOptions.offerToReceiveAudio !== undefined) {
		  numAudioTracks = offerOptions.offerToReceiveAudio;
		}
		if (offerOptions.offerToReceiveVideo !== undefined) {
		  numVideoTracks = offerOptions.offerToReceiveVideo;
		}
	  }
	  if (this.localStreams.length) {
		// Push local streams.
		this.localStreams[0].getTracks().forEach(function(track) {
		  tracks.push({
			kind: track.kind,
			track: track,
			wantReceive: track.kind === 'audio' ?
				numAudioTracks > 0 : numVideoTracks > 0
		  });
		  if (track.kind === 'audio') {
			numAudioTracks--;
		  } else if (track.kind === 'video') {
			numVideoTracks--;
		  }
		});
	  }
	  // Create M-lines for recvonly streams.
	  while (numAudioTracks > 0 || numVideoTracks > 0) {
		if (numAudioTracks > 0) {
		  tracks.push({
			kind: 'audio',
			wantReceive: true
		  });
		  numAudioTracks--;
		}
		if (numVideoTracks > 0) {
		  tracks.push({
			kind: 'video',
			wantReceive: true
		  });
		  numVideoTracks--;
		}
	  }

	  var sdp = SDPUtils.writeSessionBoilerplate();
	  var transceivers = [];
	  tracks.forEach(function(mline, sdpMLineIndex) {
		// For each track, create an ice gatherer, ice transport,
		// dtls transport, potentially rtpsender and rtpreceiver.
		var track = mline.track;
		var kind = mline.kind;
		var mid = SDPUtils.generateIdentifier();

		var transports = self.usingBundle && sdpMLineIndex > 0 ? {
		  iceGatherer: transceivers[0].iceGatherer,
		  iceTransport: transceivers[0].iceTransport,
		  dtlsTransport: transceivers[0].dtlsTransport
		} : self._createIceAndDtlsTransports(mid, sdpMLineIndex);

		var localCapabilities = RTCRtpSender.getCapabilities(kind);
		// filter RTX until additional stuff needed for RTX is implemented
		// in adapter.js
		localCapabilities.codecs = localCapabilities.codecs.filter(
			function(codec) {
			  return codec.name !== 'rtx';
			});
		localCapabilities.codecs.forEach(function(codec) {
		  // work around https://bugs.chromium.org/p/webrtc/issues/detail?id=6552
		  // by adding level-asymmetry-allowed=1
		  if (codec.name === 'H264' &&
			  codec.parameters['level-asymmetry-allowed'] === undefined) {
			codec.parameters['level-asymmetry-allowed'] = '1';
		  }
		});

		var rtpSender;
		var rtpReceiver;

		// generate an ssrc now, to be used later in rtpSender.send
		var sendEncodingParameters = [{
		  ssrc: (2 * sdpMLineIndex + 1) * 1001
		}];
		if (track) {
		  rtpSender = new RTCRtpSender(track, transports.dtlsTransport);
		}

		if (mline.wantReceive) {
		  rtpReceiver = new RTCRtpReceiver(transports.dtlsTransport, kind);
		}

		transceivers[sdpMLineIndex] = {
		  iceGatherer: transports.iceGatherer,
		  iceTransport: transports.iceTransport,
		  dtlsTransport: transports.dtlsTransport,
		  localCapabilities: localCapabilities,
		  remoteCapabilities: null,
		  rtpSender: rtpSender,
		  rtpReceiver: rtpReceiver,
		  kind: kind,
		  mid: mid,
		  sendEncodingParameters: sendEncodingParameters,
		  recvEncodingParameters: null
		};
	  });
	  if (this.usingBundle) {
		sdp += 'a=group:BUNDLE ' + transceivers.map(function(t) {
		  return t.mid;
		}).join(' ') + '\r\n';
	  }
	  tracks.forEach(function(mline, sdpMLineIndex) {
		var transceiver = transceivers[sdpMLineIndex];
		sdp += SDPUtils.writeMediaSection(transceiver,
			transceiver.localCapabilities, 'offer', self.localStreams[0]);
	  });

	  this._pendingOffer = transceivers;
	  var desc = new RTCSessionDescription({
		type: 'offer',
		sdp: sdp
	  });
	  if (arguments.length && typeof arguments[0] === 'function') {
		window.setTimeout(arguments[0], 0, desc);
	  }
	  return Promise.resolve(desc);
	};

	window.RTCPeerConnection.prototype.createAnswer = function() {
	  var self = this;

	  var sdp = SDPUtils.writeSessionBoilerplate();
	  if (this.usingBundle) {
		sdp += 'a=group:BUNDLE ' + this.transceivers.map(function(t) {
		  return t.mid;
		}).join(' ') + '\r\n';
	  }
	  this.transceivers.forEach(function(transceiver) {
		if (transceiver.isDatachannel) {
		  sdp += 'm=application 0 DTLS/SCTP 5000\r\n' +
			  'c=IN IP4 0.0.0.0\r\n' +
			  'a=mid:' + transceiver.mid + '\r\n';
		  return;
		}
		// Calculate intersection of capabilities.
		var commonCapabilities = self._getCommonCapabilities(
			transceiver.localCapabilities,
			transceiver.remoteCapabilities);

		sdp += SDPUtils.writeMediaSection(transceiver, commonCapabilities,
			'answer', self.localStreams[0]);
	  });

	  var desc = new RTCSessionDescription({
		type: 'answer',
		sdp: sdp
	  });
	  if (arguments.length && typeof arguments[0] === 'function') {
		window.setTimeout(arguments[0], 0, desc);
	  }
	  return Promise.resolve(desc);
	};

	window.RTCPeerConnection.prototype.addIceCandidate = function(candidate) {
	  if (candidate === null) {
		this.transceivers.forEach(function(transceiver) {
		  transceiver.iceTransport.addRemoteCandidate({});
		});
	  } else {
		var mLineIndex = candidate.sdpMLineIndex;
		if (candidate.sdpMid) {
		  for (var i = 0; i < this.transceivers.length; i++) {
			if (this.transceivers[i].mid === candidate.sdpMid) {
			  mLineIndex = i;
			  break;
			}
		  }
		}
		var transceiver = this.transceivers[mLineIndex];
		if (transceiver) {
		  var cand = Object.keys(candidate.candidate).length > 0 ?
			  SDPUtils.parseCandidate(candidate.candidate) : {};
		  // Ignore Chrome's invalid candidates since Edge does not like them.
		  if (cand.protocol === 'tcp' && (cand.port === 0 || cand.port === 9)) {
			return;
		  }
		  // Ignore RTCP candidates, we assume RTCP-MUX.
		  if (cand.component !== '1') {
			return;
		  }
		  // A dirty hack to make samples work.
		  if (cand.type === 'endOfCandidates') {
			cand = {};
		  }
		  transceiver.iceTransport.addRemoteCandidate(cand);

		  // update the remoteDescription.
		  var sections = SDPUtils.splitSections(this.remoteDescription.sdp);
		  sections[mLineIndex + 1] += (cand.type ? candidate.candidate.trim()
			  : 'a=end-of-candidates') + '\r\n';
		  this.remoteDescription.sdp = sections.join('');
		}
	  }
	  if (arguments.length > 1 && typeof arguments[1] === 'function') {
		window.setTimeout(arguments[1], 0);
	  }
	  return Promise.resolve();
	};

	window.RTCPeerConnection.prototype.getStats = function() {
	  var promises = [];
	  this.transceivers.forEach(function(transceiver) {
		['rtpSender', 'rtpReceiver', 'iceGatherer', 'iceTransport',
			'dtlsTransport'].forEach(function(method) {
			  if (transceiver[method]) {
				promises.push(transceiver[method].getStats());
			  }
			});
	  });
	  var cb = arguments.length > 1 && typeof arguments[1] === 'function' &&
		  arguments[1];
	  return new Promise(function(resolve) {
		// shim getStats with maplike support
		var results = new Map();
		Promise.all(promises).then(function(res) {
		  res.forEach(function(result) {
			Object.keys(result).forEach(function(id) {
			  results.set(id, result[id]);
			  results[id] = result[id];
			});
		  });
		  if (cb) {
			window.setTimeout(cb, 0, results);
		  }
		  resolve(results);
		});
	  });
	};
  }
};

// Expose public methods.
module.exports = {
  shimPeerConnection: edgeShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":10,"./getusermedia":6,"sdp":1}],6:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
	return {
	  name: {PermissionDeniedError: 'NotAllowedError'}[e.name] || e.name,
	  message: e.message,
	  constraint: e.constraint,
	  toString: function() {
		return this.name;
	  }
	};
  };

  // getUserMedia error shim.
  var origGetUserMedia = navigator.mediaDevices.getUserMedia.
	  bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = function(c) {
	return origGetUserMedia(c)['catch'](function(e) {		/* fix for ie8 */
	  return Promise.reject(shimError_(e));
	});
  };
};

},{}],7:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var browserDetails = require('../utils').browserDetails;

var firefoxShim = {
  shimOnTrack: function() {
	if (typeof window === 'object' && window.RTCPeerConnection && !('ontrack' in
		window.RTCPeerConnection.prototype)) {
	  Object.defineProperty(window.RTCPeerConnection.prototype, 'ontrack', {
		get: function() {
		  return this._ontrack;
		},
		set: function(f) {
		  if (this._ontrack) {
			this.removeEventListener('track', this._ontrack);
			this.removeEventListener('addstream', this._ontrackpoly);
		  }
		  this.addEventListener('track', this._ontrack = f);
		  this.addEventListener('addstream', this._ontrackpoly = function(e) {
			e.stream.getTracks().forEach(function(track) {
			  var event = new Event('track');
			  event.track = track;
			  event.receiver = {track: track};
			  event.streams = [e.stream];
			  this.dispatchEvent(event);
			}.bind(this));
		  }.bind(this));
		}
	  });
	}
  },

  shimSourceObject: function() {
	// Firefox has supported mozSrcObject since FF22, unprefixed in 42.
	if (typeof window === 'object') {
	  if (window.HTMLMediaElement &&
		!('srcObject' in window.HTMLMediaElement.prototype)) {
		// Shim the srcObject property, once, when HTMLMediaElement is found.
		Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
		  get: function() {
			return this.mozSrcObject;
		  },
		  set: function(stream) {
			this.mozSrcObject = stream;
		  }
		});
	  }
	}
  },

  shimPeerConnection: function() {
	if (typeof window !== 'object' || !(window.RTCPeerConnection ||
		window.mozRTCPeerConnection)) {
	  return; // probably media.peerconnection.enabled=false in about:config
	}
	// The RTCPeerConnection object.
	if (!window.RTCPeerConnection) {
	  window.RTCPeerConnection = function(pcConfig, pcConstraints) {
		if (browserDetails.version < 38) {
		  // .urls is not supported in FF < 38.
		  // create RTCIceServers with a single url.
		  if (pcConfig && pcConfig.iceServers) {
			var newIceServers = [];
			for (var i = 0; i < pcConfig.iceServers.length; i++) {
			  var server = pcConfig.iceServers[i];
			  if (server.hasOwnProperty('urls')) {
				for (var j = 0; j < server.urls.length; j++) {
				  var newServer = {
					url: server.urls[j]
				  };
				  if (server.urls[j].indexOf('turn') === 0) {
					newServer.username = server.username;
					newServer.credential = server.credential;
				  }
				  newIceServers.push(newServer);
				}
			  } else {
				newIceServers.push(pcConfig.iceServers[i]);
			  }
			}
			pcConfig.iceServers = newIceServers;
		  }
		}
		return new mozRTCPeerConnection(pcConfig, pcConstraints);
	  };
	  window.RTCPeerConnection.prototype = mozRTCPeerConnection.prototype;

	  // wrap static methods. Currently just generateCertificate.
	  if (mozRTCPeerConnection.generateCertificate) {
		Object.defineProperty(window.RTCPeerConnection, 'generateCertificate', {
		  get: function() {
			return mozRTCPeerConnection.generateCertificate;
		  }
		});
	  }

	  window.RTCSessionDescription = mozRTCSessionDescription;
	  window.RTCIceCandidate = mozRTCIceCandidate;
	}

	// shim away need for obsolete RTCIceCandidate/RTCSessionDescription.
	['setLocalDescription', 'setRemoteDescription', 'addIceCandidate']
		.forEach(function(method) {
		  var nativeMethod = RTCPeerConnection.prototype[method];
		  RTCPeerConnection.prototype[method] = function() {
			arguments[0] = new ((method === 'addIceCandidate') ?
				RTCIceCandidate : RTCSessionDescription)(arguments[0]);
			return nativeMethod.apply(this, arguments);
		  };
		});

	// support for addIceCandidate(null)
	var nativeAddIceCandidate =
		RTCPeerConnection.prototype.addIceCandidate;
	RTCPeerConnection.prototype.addIceCandidate = function() {
	  if (arguments[0] === null) {
		if (arguments[1]) {
		  arguments[1].apply(null);
		}
		return Promise.resolve();
	  }
	  return nativeAddIceCandidate.apply(this, arguments);
	};

	// shim getStats with maplike support
	var makeMapStats = function(stats) {
	  var map = new Map();
	  Object.keys(stats).forEach(function(key) {
		map.set(key, stats[key]);
		map[key] = stats[key];
	  });
	  return map;
	};

	var nativeGetStats = RTCPeerConnection.prototype.getStats;
	RTCPeerConnection.prototype.getStats = function(selector, onSucc, onErr) {
	  return nativeGetStats.apply(this, [selector || null])
		.then(function(stats) {
		  return makeMapStats(stats);
		})
		.then(onSucc, onErr);
	};
  }
};

// Expose public methods.
module.exports = {
  shimOnTrack: firefoxShim.shimOnTrack,
  shimSourceObject: firefoxShim.shimSourceObject,
  shimPeerConnection: firefoxShim.shimPeerConnection,
  shimGetUserMedia: require('./getusermedia')
};

},{"../utils":10,"./getusermedia":8}],8:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logging = require('../utils').log;
var browserDetails = require('../utils').browserDetails;

// Expose public methods.
module.exports = function() {
  var shimError_ = function(e) {
	return {
	  name: {
		SecurityError: 'NotAllowedError',
		PermissionDeniedError: 'NotAllowedError'
	  }[e.name] || e.name,
	  message: {
		'The operation is insecure.': 'The request is not allowed by the ' +
		'user agent or the platform in the current context.'
	  }[e.message] || e.message,
	  constraint: e.constraint,
	  toString: function() {
		return this.name + (this.message && ': ') + this.message;
	  }
	};
  };

  // getUserMedia constraints shim.
  var getUserMedia_ = function(constraints, onSuccess, onError) {
	var constraintsToFF37_ = function(c) {
	  if (typeof c !== 'object' || c.require) {
		return c;
	  }
	  var require = [];
	  Object.keys(c).forEach(function(key) {
		if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
		  return;
		}
		var r = c[key] = (typeof c[key] === 'object') ?
			c[key] : {ideal: c[key]};
		if (r.min !== undefined ||
			r.max !== undefined || r.exact !== undefined) {
		  require.push(key);
		}
		if (r.exact !== undefined) {
		  if (typeof r.exact === 'number') {
			r. min = r.max = r.exact;
		  } else {
			c[key] = r.exact;
		  }
		  delete r.exact;
		}
		if (r.ideal !== undefined) {
		  c.advanced = c.advanced || [];
		  var oc = {};
		  if (typeof r.ideal === 'number') {
			oc[key] = {min: r.ideal, max: r.ideal};
		  } else {
			oc[key] = r.ideal;
		  }
		  c.advanced.push(oc);
		  delete r.ideal;
		  if (!Object.keys(r).length) {
			delete c[key];
		  }
		}
	  });
	  if (require.length) {
		c.require = require;
	  }
	  return c;
	};
	constraints = JSON.parse(JSON.stringify(constraints));
	if (browserDetails.version < 38) {
	  logging('spec: ' + JSON.stringify(constraints));
	  if (constraints.audio) {
		constraints.audio = constraintsToFF37_(constraints.audio);
	  }
	  if (constraints.video) {
		constraints.video = constraintsToFF37_(constraints.video);
	  }
	  logging('ff37: ' + JSON.stringify(constraints));
	}
	return navigator.mozGetUserMedia(constraints, onSuccess, function(e) {
	  onError(shimError_(e));
	});
  };

  // Returns the result of getUserMedia as a Promise.
  var getUserMediaPromise_ = function(constraints) {
	return new Promise(function(resolve, reject) {
	  getUserMedia_(constraints, resolve, reject);
	});
  };

  // Shim for mediaDevices on older versions.
  if (!navigator.mediaDevices) {
	navigator.mediaDevices = {getUserMedia: getUserMediaPromise_,
	  addEventListener: function() { },
	  removeEventListener: function() { }
	};
  }
  navigator.mediaDevices.enumerateDevices =
	  navigator.mediaDevices.enumerateDevices || function() {
		return new Promise(function(resolve) {
		  var infos = [
			{kind: 'audioinput', deviceId: 'default', label: '', groupId: ''},
			{kind: 'videoinput', deviceId: 'default', label: '', groupId: ''}
		  ];
		  resolve(infos);
		});
	  };

  if (browserDetails.version < 41) {
	// Work around http://bugzil.la/1169665
	var orgEnumerateDevices =
		navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
	navigator.mediaDevices.enumerateDevices = function() {
	  return orgEnumerateDevices().then(undefined, function(e) {
		if (e.name === 'NotFoundError') {
		  return [];
		}
		throw e;
	  });
	};
  }
  if (browserDetails.version < 49) {
	var origGetUserMedia = navigator.mediaDevices.getUserMedia.
		bind(navigator.mediaDevices);
	navigator.mediaDevices.getUserMedia = function(c) {
	  return origGetUserMedia(c).then(function(stream) {
		// Work around https://bugzil.la/802326
		if (c.audio && !stream.getAudioTracks().length ||
			c.video && !stream.getVideoTracks().length) {
		  stream.getTracks().forEach(function(track) {
			track.stop();
		  });
		  throw new DOMException('The object can not be found here.',
								 'NotFoundError');
		}
		return stream;
	  }, function(e) {
		return Promise.reject(shimError_(e));
	  });
	};
  }
  navigator.getUserMedia = function(constraints, onSuccess, onError) {
	if (browserDetails.version < 44) {
	  return getUserMedia_(constraints, onSuccess, onError);
	}
	// Replace Firefox 44+'s deprecation warning with unprefixed version.
	console.warn('navigator.getUserMedia has been replaced by ' +
				 'navigator.mediaDevices.getUserMedia');
	navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
  };
};

},{"../utils":10}],9:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
'use strict';
var safariShim = {
  // TODO: DrAlex, should be here, double check against LayoutTests
  // shimOnTrack: function() { },

  // TODO: once the back-end for the mac port is done, add.
  // TODO: check for webkitGTK+
  // shimPeerConnection: function() { },

  shimGetUserMedia: function() {
	navigator.getUserMedia = navigator.webkitGetUserMedia;
  }
};

// Expose public methods.
module.exports = {
  shimGetUserMedia: safariShim.shimGetUserMedia
  // TODO
  // shimOnTrack: safariShim.shimOnTrack,
  // shimPeerConnection: safariShim.shimPeerConnection
};

},{}],10:[function(require,module,exports){
/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
 /* eslint-env node */
'use strict';

var logDisabled_ = true;

// Utility methods.
var utils = {
  disableLog: function(bool) {
	if (typeof bool !== 'boolean') {
	  return new Error('Argument type: ' + typeof bool +
		  '. Please use a boolean.');
	}
	logDisabled_ = bool;
	return (bool) ? 'adapter.js logging disabled' :
		'adapter.js logging enabled';
  },

  log: function() {
	if (typeof window === 'object') {
	  if (logDisabled_) {
		return;
	  }
	  if (typeof console !== 'undefined' && typeof console.log === 'function') {
		console.log.apply(console, arguments);
	  }
	}
  },

  /**
   * Extract browser version out of the provided user agent string.
   *
   * @param {!string} uastring userAgent string.
   * @param {!string} expr Regular expression used as match criteria.
   * @param {!number} pos position in the version string to be returned.
   * @return {!number} browser version.
   */
  extractVersion: function(uastring, expr, pos) {
	var match = uastring.match(expr);
	return match && match.length >= pos && parseInt(match[pos], 10);
  },

  /**
   * Browser detector.
   *
   * @return {object} result containing browser and version
   *	 properties.
   */
  detectBrowser: function() {
	// Returned result object.
	var result = {};
	result.browser = null;
	result.version = null;

	// Fail early if it's not a browser
	if (typeof window === 'undefined' || !window.navigator) {
	  result.browser = 'Not a browser.';
	  return result;
	}

	// Firefox.
	if (navigator.mozGetUserMedia) {
	  result.browser = 'firefox';
	  result.version = this.extractVersion(navigator.userAgent,
		  /Firefox\/([0-9]+)\./, 1);

	// all webkit-based browsers
	} else if (navigator.webkitGetUserMedia) {
	  // Chrome, Chromium, Webview, Opera, all use the chrome shim for now
	  if (window.webkitRTCPeerConnection) {
		result.browser = 'chrome';
		result.version = this.extractVersion(navigator.userAgent,
		  /Chrom(e|ium)\/([0-9]+)\./, 2);

	  // Safari or unknown webkit-based
	  // for the time being Safari has support for MediaStreams but not webRTC
	  } else {
		// Safari UA substrings of interest for reference:
		// - webkit version:		   AppleWebKit/602.1.25 (also used in Op,Cr)
		// - safari UI version:		Version/9.0.3 (unique to Safari)
		// - safari UI webkit version: Safari/601.4.4 (also used in Op,Cr)
		//
		// if the webkit version and safari UI webkit versions are equals,
		// ... this is a stable version.
		//
		// only the internal webkit version is important today to know if
		// media streams are supported
		//
		if (navigator.userAgent.match(/Version\/(\d+).(\d+)/)) {
		  result.browser = 'safari';
		  result.version = this.extractVersion(navigator.userAgent,
			/AppleWebKit\/([0-9]+)\./, 1);

		// unknown webkit-based browser
		} else {
		  result.browser = 'Unsupported webkit-based browser ' +
			  'with GUM support but no WebRTC support.';
		  return result;
		}
	  }

	// Edge.
	} else if (navigator.mediaDevices &&
		navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
	  result.browser = 'edge';
	  result.version = this.extractVersion(navigator.userAgent,
		  /Edge\/(\d+).(\d+)$/, 2);

	// Default fallthrough: not supported.
	} else {
	  result.browser = 'Not a supported browser.';
	  return result;
	}

	return result;
  }
};

// Export.
module.exports = {
  log: utils.log,
  disableLog: utils.disableLog,
  browserDetails: utils.detectBrowser(),
  extractVersion: utils.extractVersion
};

},{}]},{},[2])(2)
});
/**
 * git do not control webim.config.js
 * everyone should copy webim.config.js.demo to webim.config.js
 * and have their own configs.
 * In this way , others won't be influenced by this config while git pull.
 *
 */
var WebIM = {};
WebIM.config = {
    /*
     * XMPP server
     */
    // xmppURL: 'im-api.easemob.com',
    /*
     * Backend REST API URL
     */
    // apiURL: (location.protocol === 'https:' ? 'https:' : 'http:') + '//a1.easemob.com',
    /*
     * Application AppKey
     */
    // appkey: 'easemob-demo#chatdemoui',
    /*
     * Whether to use wss
     * @parameter {Boolean} true or false
     */
    // https: false,
    /*
     * isMultiLoginSessions
     * true: A visitor can sign in to multiple webpages and receive messages at all the webpages.
     * false: A visitor can sign in to only one webpage and receive messages at the webpage.
     */
    // isMultiLoginSessions: false,
    /*
     * Set to auto sign-in
     */
    isAutoLogin: true,
    /**
     * Whether to use window.doQuery()
     * @parameter {Boolean} true or false
     */
    isWindowSDK: false,
    /**
     * isSandBox=true:  xmppURL: 'im-api.sandbox.easemob.com',  apiURL: '//a1.sdb.easemob.com',
     * isSandBox=false: xmppURL: 'im-api.easemob.com',          apiURL: '//a1.easemob.com',
     * @parameter {Boolean} true or false
     */
    isSandBox: false,
    /**
     * Whether to console.log in strophe.log()
     * @parameter {Boolean} true or false
     */
    isDebug: false,
    /**
     * will auto connect the xmpp server autoReconnectNumMax times in background when client is offline.
     * won't auto connect if autoReconnectNumMax=0.
     */
    autoReconnectNumMax: 2,
    /**
     * the interval secons between each atuo reconnectting.
     * works only if autoReconnectMaxNum >= 2.
     */
    autoReconnectInterval: 2,
    /**
     * webrtc supports WebKit and https only
     */
    isWebRTC: /WebKit/.test(navigator.userAgent) && /^https\:$/.test(window.location.protocol),
    /**
     * while http access,use ip directly,instead of ServerName,avoiding DNS problem.
     */
    isHttpDNS: false
};

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(230);


/***/ },

/***/ 223:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	;
	(function () {

	    var EMPTYFN = function EMPTYFN() {};
	    var _code = __webpack_require__(224).code;
	    var WEBIM_FILESIZE_LIMIT = 10485760;

	    var _createStandardXHR = function _createStandardXHR() {
	        try {
	            return new window.XMLHttpRequest();
	        } catch (e) {
	            return false;
	        }
	    };

	    var _createActiveXHR = function _createActiveXHR() {
	        try {
	            return new window.ActiveXObject('Microsoft.XMLHTTP');
	        } catch (e) {
	            return false;
	        }
	    };

	    var _xmlrequest = function _xmlrequest(crossDomain) {
	        crossDomain = crossDomain || true;
	        var temp = _createStandardXHR() || _createActiveXHR();

	        if ('withCredentials' in temp) {
	            return temp;
	        }
	        if (!crossDomain) {
	            return temp;
	        }
	        if (typeof window.XDomainRequest === 'undefined') {
	            return temp;
	        }
	        var xhr = new XDomainRequest();
	        xhr.readyState = 0;
	        xhr.status = 100;
	        xhr.onreadystatechange = EMPTYFN;
	        xhr.onload = function () {
	            xhr.readyState = 4;
	            xhr.status = 200;

	            var xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
	            xmlDoc.async = 'false';
	            xmlDoc.loadXML(xhr.responseText);
	            xhr.responseXML = xmlDoc;
	            xhr.response = xhr.responseText;
	            xhr.onreadystatechange();
	        };
	        xhr.ontimeout = xhr.onerror = function () {
	            xhr.readyState = 4;
	            xhr.status = 500;
	            xhr.onreadystatechange();
	        };
	        return xhr;
	    };

	    var _hasFlash = function () {
	        if ('ActiveXObject' in window) {
	            try {
	                return new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
	            } catch (ex) {
	                return 0;
	            }
	        } else {
	            if (navigator.plugins && navigator.plugins.length > 0) {
	                return navigator.plugins['Shockwave Flash'];
	            }
	        }
	        return 0;
	    }();

	    var _tmpUtilXHR = _xmlrequest(),
	        _hasFormData = typeof FormData !== 'undefined',
	        _hasBlob = typeof Blob !== 'undefined',
	        _isCanSetRequestHeader = _tmpUtilXHR.setRequestHeader || false,
	        _hasOverrideMimeType = _tmpUtilXHR.overrideMimeType || false,
	        _isCanUploadFileAsync = _isCanSetRequestHeader && _hasFormData,
	        _isCanUploadFile = _isCanUploadFileAsync || _hasFlash,
	        _isCanDownLoadFile = _isCanSetRequestHeader && (_hasBlob || _hasOverrideMimeType);

	    if (!Object.keys) {
	        Object.keys = function () {
	            'use strict';

	            var hasOwnProperty = Object.prototype.hasOwnProperty,
	                hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
	                dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
	                dontEnumsLength = dontEnums.length;

	            return function (obj) {
	                if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' && (typeof obj !== 'function' || obj === null)) {
	                    throw new TypeError('Object.keys called on non-object');
	                }

	                var result = [],
	                    prop,
	                    i;

	                for (prop in obj) {
	                    if (hasOwnProperty.call(obj, prop)) {
	                        result.push(prop);
	                    }
	                }

	                if (hasDontEnumBug) {
	                    for (i = 0; i < dontEnumsLength; i++) {
	                        if (hasOwnProperty.call(obj, dontEnums[i])) {
	                            result.push(dontEnums[i]);
	                        }
	                    }
	                }
	                return result;
	            };
	        }();
	    }

	    var utils = {
	        hasFormData: _hasFormData,

	        hasBlob: _hasBlob,

	        emptyfn: EMPTYFN,

	        isCanSetRequestHeader: _isCanSetRequestHeader,

	        hasOverrideMimeType: _hasOverrideMimeType,

	        isCanUploadFileAsync: _isCanUploadFileAsync,

	        isCanUploadFile: _isCanUploadFile,

	        isCanDownLoadFile: _isCanDownLoadFile,

	        isSupportWss: function () {
	            var notSupportList = [
	            //1: QQ browser X5 core
	            /MQQBrowser[\/]5([.]\d+)?\sTBS/

	            //2: etc.
	            //...
	            ];

	            if (!window.WebSocket) {
	                return false;
	            }

	            var ua = window.navigator.userAgent;
	            for (var i = 0, l = notSupportList.length; i < l; i++) {
	                if (notSupportList[i].test(ua)) {
	                    return false;
	                }
	            }
	            return true;
	        }(),

	        getIEVersion: function () {
	            var ua = navigator.userAgent,
	                matches,
	                tridentMap = { '4': 8, '5': 9, '6': 10, '7': 11 };

	            matches = ua.match(/MSIE (\d+)/i);

	            if (matches && matches[1]) {
	                return +matches[1];
	            }
	            matches = ua.match(/Trident\/(\d+)/i);
	            if (matches && matches[1]) {
	                return tridentMap[matches[1]] || null;
	            }
	            return null;
	        }(),

	        stringify: function stringify(json) {
	            if (typeof JSON !== 'undefined' && JSON.stringify) {
	                return JSON.stringify(json);
	            } else {
	                var s = '',
	                    arr = [];

	                var iterate = function iterate(json) {
	                    var isArr = false;

	                    if (Object.prototype.toString.call(json) === '[object Array]') {
	                        arr.push(']', '[');
	                        isArr = true;
	                    } else if (Object.prototype.toString.call(json) === '[object Object]') {
	                        arr.push('}', '{');
	                    }

	                    for (var o in json) {
	                        if (Object.prototype.toString.call(json[o]) === '[object Null]') {
	                            json[o] = 'null';
	                        } else if (Object.prototype.toString.call(json[o]) === '[object Undefined]') {
	                            json[o] = 'undefined';
	                        }

	                        if (json[o] && _typeof(json[o]) === 'object') {
	                            s += ',' + (isArr ? '' : '"' + o + '":' + (isArr ? '"' : '')) + iterate(json[o]) + '';
	                        } else {
	                            s += ',"' + (isArr ? '' : o + '":"') + json[o] + '"';
	                        }
	                    }

	                    if (s != '') {
	                        s = s.slice(1);
	                    }

	                    return arr.pop() + s + arr.pop();
	                };
	                return iterate(json);
	            }
	        },
	        login: function login(options) {
	            var options = options || {};
	            var suc = options.success || EMPTYFN;
	            var err = options.error || EMPTYFN;

	            var appKey = options.appKey || '';
	            var devInfos = appKey.split('#');
	            if (devInfos.length !== 2) {
	                err({
	                    type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	                });
	                return false;
	            }

	            var orgName = devInfos[0];
	            var appName = devInfos[1];
	            var https = https || options.https;
	            var user = options.user || '';
	            var pwd = options.pwd || '';

	            var apiUrl = options.apiUrl;

	            var loginJson = {
	                grant_type: 'password',
	                username: user,
	                password: pwd,
	                timestamp: +new Date()
	            };
	            var loginfo = utils.stringify(loginJson);

	            var options = {
	                url: apiUrl + '/' + orgName + '/' + appName + '/token',
	                dataType: 'json',
	                data: loginfo,
	                success: suc,
	                error: err
	            };
	            return utils.ajax(options);
	        },

	        getFileUrl: function getFileUrl(fileInputId) {
	            var uri = {
	                url: '',
	                filename: '',
	                filetype: '',
	                data: ''
	            };

	            var fileObj = typeof fileInputId === 'string' ? document.getElementById(fileInputId) : fileInputId;

	            if (!utils.isCanUploadFileAsync || !fileObj) {
	                return uri;
	            }
	            try {
	                if (window.URL.createObjectURL) {
	                    var fileItems = fileObj.files;
	                    if (fileItems.length > 0) {
	                        var u = fileItems.item(0);
	                        uri.data = u;
	                        uri.url = window.URL.createObjectURL(u);
	                        uri.filename = u.name || '';
	                    }
	                } else {
	                    // IE
	                    var u = document.getElementById(fileInputId).value;
	                    uri.url = u;
	                    var pos1 = u.lastIndexOf('/');
	                    var pos2 = u.lastIndexOf('\\');
	                    var pos = Math.max(pos1, pos2);
	                    if (pos < 0) uri.filename = u;else uri.filename = u.substring(pos + 1);
	                }
	                var index = uri.filename.lastIndexOf('.');
	                if (index != -1) {
	                    uri.filetype = uri.filename.substring(index + 1).toLowerCase();
	                }
	                return uri;
	            } catch (e) {
	                throw e;
	            }
	        },

	        getFileSize: function getFileSize(file) {
	            var fileSize = 0;
	            if (file) {
	                if (file.files) {
	                    if (file.files.length > 0) {
	                        fileSize = file.files[0].size;
	                    }
	                } else if (file.select && 'ActiveXObject' in window) {
	                    file.select();
	                    var fileobject = new ActiveXObject('Scripting.FileSystemObject');
	                    var file = fileobject.GetFile(file.value);
	                    fileSize = file.Size;
	                }
	            }
	            console.log('fileSize: ', fileSize);
	            if (fileSize > 10000000) {
	                return false;
	            }
	            var kb = Math.round(fileSize / 1000);
	            if (kb < 1000) {
	                fileSize = kb + ' KB';
	            } else if (kb >= 1000) {
	                var mb = kb / 1000;
	                if (mb < 1000) {
	                    fileSize = mb.toFixed(1) + ' MB';
	                } else {
	                    var gb = mb / 1000;
	                    fileSize = gb.toFixed(1) + ' GB';
	                }
	            }
	            return fileSize;
	        },

	        hasFlash: _hasFlash,

	        trim: function trim(str) {

	            str = typeof str === 'string' ? str : '';

	            return str.trim ? str.trim() : str.replace(/^\s|\s$/g, '');
	        },

	        parseEmoji: function parseEmoji(msg) {
	            if (typeof WebIM.Emoji === 'undefined' || typeof WebIM.Emoji.map === 'undefined') {
	                return msg;
	            } else {
	                var emoji = WebIM.Emoji,
	                    reg = null;

	                for (var face in emoji.map) {
	                    if (emoji.map.hasOwnProperty(face)) {
	                        while (msg.indexOf(face) > -1) {
	                            msg = msg.replace(face, '<img class="emoji" src="' + emoji.path + emoji.map[face] + '" />');
	                        }
	                    }
	                }
	                return msg;
	            }
	        },

	        parseLink: function parseLink(msg) {

	            var reg = /(https?\:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(\:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/gm;

	            msg = msg.replace(reg, function (v) {

	                var prefix = /^https?/gm.test(v);

	                return "<a href='" + (prefix ? v : '//' + v) + "' target='_blank'>" + v + "</a>";
	            });

	            return msg;
	        },

	        parseJSON: function parseJSON(data) {

	            if (window.JSON && window.JSON.parse) {
	                return window.JSON.parse(data + '');
	            }

	            var requireNonComma,
	                depth = null,
	                str = utils.trim(data + '');

	            return str && !utils.trim(str.replace(/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g, function (token, comma, open, close) {

	                if (requireNonComma && comma) {
	                    depth = 0;
	                }

	                if (depth === 0) {
	                    return token;
	                }

	                requireNonComma = open || comma;
	                depth += !close - !open;
	                return '';
	            })) ? Function('return ' + str)() : Function('Invalid JSON: ' + data)();
	        },

	        parseUploadResponse: function parseUploadResponse(response) {
	            return response.indexOf('callback') > -1 ? //lte ie9
	            response.slice(9, -1) : response;
	        },

	        parseDownloadResponse: function parseDownloadResponse(response) {
	            return response && response.type && response.type === 'application/json' || 0 > Object.prototype.toString.call(response).indexOf('Blob') ? this.url + '?token=' : window.URL.createObjectURL(response);
	        },

	        uploadFile: function uploadFile(options) {
	            var options = options || {};
	            options.onFileUploadProgress = options.onFileUploadProgress || EMPTYFN;
	            options.onFileUploadComplete = options.onFileUploadComplete || EMPTYFN;
	            options.onFileUploadError = options.onFileUploadError || EMPTYFN;
	            options.onFileUploadCanceled = options.onFileUploadCanceled || EMPTYFN;

	            var acc = options.accessToken || this.context.accessToken;
	            if (!acc) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_NO_LOGIN,
	                    id: options.id
	                });
	                return;
	            }

	            var orgName, appName, devInfos;
	            var appKey = options.appKey || this.context.appKey || '';

	            if (appKey) {
	                devInfos = appKey.split('#');
	                orgName = devInfos[0];
	                appName = devInfos[1];
	            }

	            if (!orgName && !appName) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id
	                });
	                return;
	            }

	            var apiUrl = options.apiUrl;
	            var uploadUrl = apiUrl + '/' + orgName + '/' + appName + '/chatfiles';

	            if (!utils.isCanUploadFileAsync) {
	                if (utils.hasFlash && typeof options.flashUpload === 'function') {
	                    options.flashUpload && options.flashUpload(uploadUrl, options);
	                } else {
	                    options.onFileUploadError({
	                        type: _code.WEBIM_UPLOADFILE_BROWSER_ERROR,
	                        id: options.id
	                    });
	                }
	                return;
	            }

	            var fileSize = options.file.data ? options.file.data.size : undefined;
	            if (fileSize > WEBIM_FILESIZE_LIMIT) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id
	                });
	                return;
	            } else if (fileSize <= 0) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id
	                });
	                return;
	            }

	            var xhr = utils.xmlrequest();
	            var onError = function onError(e) {
	                options.onFileUploadError({
	                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                    id: options.id,
	                    xhr: xhr
	                });
	            };
	            if (xhr.upload) {
	                xhr.upload.addEventListener('progress', options.onFileUploadProgress, false);
	            }
	            if (xhr.addEventListener) {
	                xhr.addEventListener('abort', options.onFileUploadCanceled, false);
	                xhr.addEventListener('load', function (e) {
	                    try {
	                        var json = utils.parseJSON(xhr.responseText);
	                        try {
	                            options.onFileUploadComplete(json);
	                        } catch (e) {
	                            options.onFileUploadError({
	                                type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	                                data: e
	                            });
	                        }
	                    } catch (e) {
	                        options.onFileUploadError({
	                            type: _code.WEBIM_UPLOADFILE_ERROR,
	                            data: xhr.responseText,
	                            id: options.id,
	                            xhr: xhr
	                        });
	                    }
	                }, false);
	                xhr.addEventListener('error', onError, false);
	            } else if (xhr.onreadystatechange) {
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (ajax.status === 200) {
	                            try {
	                                var json = utils.parseJSON(xhr.responseText);
	                                options.onFileUploadComplete(json);
	                            } catch (e) {
	                                options.onFileUploadError({
	                                    type: _code.WEBIM_UPLOADFILE_ERROR,
	                                    data: xhr.responseText,
	                                    id: options.id,
	                                    xhr: xhr
	                                });
	                            }
	                        } else {
	                            options.onFileUploadError({
	                                type: _code.WEBIM_UPLOADFILE_ERROR,
	                                data: xhr.responseText,
	                                id: options.id,
	                                xhr: xhr
	                            });
	                        }
	                    } else {
	                        xhr.abort();
	                        options.onFileUploadCanceled();
	                    }
	                };
	            }

	            xhr.open('POST', uploadUrl);

	            xhr.setRequestHeader('restrict-access', 'true');
	            xhr.setRequestHeader('Accept', '*/*'); // Android QQ browser has some problem with this attribute.
	            xhr.setRequestHeader('Authorization', 'Bearer ' + acc);

	            var formData = new FormData();
	            formData.append('file', options.file.data);
	            xhr.send(formData);
	        },

	        download: function download(options) {
	            options.onFileDownloadComplete = options.onFileDownloadComplete || EMPTYFN;
	            options.onFileDownloadError = options.onFileDownloadError || EMPTYFN;

	            var accessToken = options.accessToken || this.context.accessToken;
	            if (!accessToken) {
	                options.onFileDownloadError({
	                    type: _code.WEBIM_DOWNLOADFILE_NO_LOGIN,
	                    id: options.id
	                });
	                return;
	            }

	            var onError = function onError(e) {
	                options.onFileDownloadError({
	                    type: _code.WEBIM_DOWNLOADFILE_ERROR,
	                    id: options.id,
	                    xhr: xhr
	                });
	            };

	            if (!utils.isCanDownLoadFile) {
	                options.onFileDownloadComplete();
	                return;
	            }
	            var xhr = utils.xmlrequest();
	            if ('addEventListener' in xhr) {
	                xhr.addEventListener('load', function (e) {
	                    options.onFileDownloadComplete(xhr.response, xhr);
	                }, false);
	                xhr.addEventListener('error', onError, false);
	            } else if ('onreadystatechange' in xhr) {
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (ajax.status === 200) {
	                            options.onFileDownloadComplete(xhr.response, xhr);
	                        } else {
	                            options.onFileDownloadError({
	                                type: _code.WEBIM_DOWNLOADFILE_ERROR,
	                                id: options.id,
	                                xhr: xhr
	                            });
	                        }
	                    } else {
	                        xhr.abort();
	                        options.onFileDownloadError({
	                            type: _code.WEBIM_DOWNLOADFILE_ERROR,
	                            id: options.id,
	                            xhr: xhr
	                        });
	                    }
	                };
	            }

	            var method = options.method || 'GET';
	            var resType = options.responseType || 'blob';
	            var mimeType = options.mimeType || 'text/plain; charset=x-user-defined';
	            xhr.open(method, options.url);
	            if (typeof Blob !== 'undefined') {
	                xhr.responseType = resType;
	            } else {
	                xhr.overrideMimeType(mimeType);
	            }

	            var innerHeaer = {
	                'X-Requested-With': 'XMLHttpRequest',
	                'Accept': 'application/octet-stream',
	                'share-secret': options.secret,
	                'Authorization': 'Bearer ' + accessToken
	            };
	            var headers = options.headers || {};
	            for (var key in headers) {
	                innerHeaer[key] = headers[key];
	            }
	            for (var key in innerHeaer) {
	                if (innerHeaer[key]) {
	                    xhr.setRequestHeader(key, innerHeaer[key]);
	                }
	            }
	            xhr.send(null);
	        },

	        parseTextMessage: function parseTextMessage(message, faces) {
	            if (typeof message !== 'string') {
	                return;
	            }

	            if (Object.prototype.toString.call(faces) !== '[object Object]') {
	                return {
	                    isemoji: false,
	                    body: [{
	                        type: 'txt',
	                        data: message
	                    }]
	                };
	            }

	            var receiveMsg = message;
	            var emessage = [];
	            var expr = /\[[^[\]]{2,3}\]/mg;
	            var emoji = receiveMsg.match(expr);

	            if (!emoji || emoji.length < 1) {
	                return {
	                    isemoji: false,
	                    body: [{
	                        type: 'txt',
	                        data: message
	                    }]
	                };
	            }
	            var isemoji = false;
	            for (var i = 0; i < emoji.length; i++) {
	                var tmsg = receiveMsg.substring(0, receiveMsg.indexOf(emoji[i])),
	                    existEmoji = WebIM.Emoji.map[emoji[i]];

	                if (tmsg) {
	                    emessage.push({
	                        type: 'txt',
	                        data: tmsg
	                    });
	                }
	                if (!existEmoji) {
	                    emessage.push({
	                        type: 'txt',
	                        data: emoji[i]
	                    });
	                    continue;
	                }
	                var emojiStr = WebIM.Emoji.map ? WebIM.Emoji.path + existEmoji : null;

	                if (emojiStr) {
	                    isemoji = true;
	                    emessage.push({
	                        type: 'emoji',
	                        data: emojiStr
	                    });
	                } else {
	                    emessage.push({
	                        type: 'txt',
	                        data: emoji[i]
	                    });
	                }
	                var restMsgIndex = receiveMsg.indexOf(emoji[i]) + emoji[i].length;
	                receiveMsg = receiveMsg.substring(restMsgIndex);
	            }
	            if (receiveMsg) {
	                emessage.push({
	                    type: 'txt',
	                    data: receiveMsg
	                });
	            }
	            if (isemoji) {
	                return {
	                    isemoji: isemoji,
	                    body: emessage
	                };
	            }
	            return {
	                isemoji: false,
	                body: [{
	                    type: 'txt',
	                    data: message
	                }]
	            };
	        },

	        xmlrequest: _xmlrequest,

	        getXmlFirstChild: function getXmlFirstChild(data, tagName) {
	            var children = data.getElementsByTagName(tagName);
	            if (children.length == 0) {
	                return null;
	            } else {
	                return children[0];
	            }
	        },
	        ajax: function ajax(options) {
	            var dataType = options.dataType || 'text';
	            var suc = options.success || EMPTYFN;
	            var error = options.error || EMPTYFN;
	            var xhr = utils.xmlrequest();

	            xhr.onreadystatechange = function () {
	                if (xhr.readyState === 4) {
	                    var status = xhr.status || 0;
	                    if (status === 200) {
	                        try {
	                            switch (dataType) {
	                                case 'text':
	                                    suc(xhr.responseText);
	                                    return;
	                                case 'json':
	                                    var json = utils.parseJSON(xhr.responseText);
	                                    suc(json, xhr);
	                                    return;
	                                case 'xml':
	                                    if (xhr.responseXML && xhr.responseXML.documentElement) {
	                                        suc(xhr.responseXML.documentElement, xhr);
	                                    } else {
	                                        error({
	                                            type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                                            data: xhr.responseText
	                                        });
	                                    }
	                                    return;
	                            }
	                            suc(xhr.response || xhr.responseText, xhr);
	                        } catch (e) {
	                            error({
	                                type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                                data: e
	                            });
	                        }
	                        return;
	                    } else {
	                        error({
	                            type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                            data: xhr.responseText
	                        });
	                        return;
	                    }
	                }
	                if (xhr.readyState === 0) {
	                    error({
	                        type: _code.WEBIM_CONNCTION_AJAX_ERROR,
	                        data: xhr.responseText
	                    });
	                }
	            };

	            if (options.responseType) {
	                if (xhr.responseType) {
	                    xhr.responseType = options.responseType;
	                }
	            }
	            if (options.mimeType) {
	                if (utils.hasOverrideMimeType) {
	                    xhr.overrideMimeType(options.mimeType);
	                }
	            }

	            var type = options.type || 'POST',
	                data = options.data || null,
	                tempData = '';

	            if (type.toLowerCase() === 'get' && data) {
	                for (var o in data) {
	                    if (data.hasOwnProperty(o)) {
	                        tempData += o + '=' + data[o] + '&';
	                    }
	                }
	                tempData = tempData ? tempData.slice(0, -1) : tempData;
	                options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
	                data = null;
	                tempData = null;
	            }
	            xhr.open(type, options.url);

	            if (utils.isCanSetRequestHeader) {
	                var headers = options.headers || {};
	                for (var key in headers) {
	                    if (headers.hasOwnProperty(key)) {
	                        xhr.setRequestHeader(key, headers[key]);
	                    }
	                }
	            }

	            xhr.send(data);
	            return xhr;
	        },
	        ts: function ts() {
	            var d = new Date();
	            var Hours = d.getHours(); //获取当前小时数(0-23)
	            var Minutes = d.getMinutes(); //获取当前分钟数(0-59)
	            var Seconds = d.getSeconds(); //获取当前秒数(0-59)
	            var Milliseconds = d.getMilliseconds(); //获取当前毫秒
	            return (Hours < 10 ? "0" + Hours : Hours) + ':' + (Minutes < 10 ? "0" + Minutes : Minutes) + ':' + (Seconds < 10 ? "0" + Seconds : Seconds) + ':' + Milliseconds + ' ';
	        },

	        getObjectKey: function getObjectKey(obj, val) {
	            for (var key in obj) {
	                if (obj[key] == val) {
	                    return key;
	                }
	            }
	            return '';
	        }

	    };

	    exports.utils = utils;
	})();

/***/ },

/***/ 224:
/***/ function(module, exports) {

	"use strict";

	;
	(function () {

	    exports.code = {
	        WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR: 0,
	        WEBIM_CONNCTION_OPEN_ERROR: 1,
	        WEBIM_CONNCTION_AUTH_ERROR: 2,
	        WEBIM_CONNCTION_OPEN_USERGRID_ERROR: 3,
	        WEBIM_CONNCTION_ATTACH_ERROR: 4,
	        WEBIM_CONNCTION_ATTACH_USERGRID_ERROR: 5,
	        WEBIM_CONNCTION_REOPEN_ERROR: 6,
	        WEBIM_CONNCTION_SERVER_CLOSE_ERROR: 7, //7: client-side network offline (net::ERR_INTERNET_DISCONNECTED)
	        WEBIM_CONNCTION_SERVER_ERROR: 8, //8: offline by multi login
	        WEBIM_CONNCTION_IQ_ERROR: 9,

	        WEBIM_CONNCTION_PING_ERROR: 10,
	        WEBIM_CONNCTION_NOTIFYVERSION_ERROR: 11,
	        WEBIM_CONNCTION_GETROSTER_ERROR: 12,
	        WEBIM_CONNCTION_CROSSDOMAIN_ERROR: 13,
	        WEBIM_CONNCTION_LISTENING_OUTOF_MAXRETRIES: 14,
	        WEBIM_CONNCTION_RECEIVEMSG_CONTENTERROR: 15,
	        WEBIM_CONNCTION_DISCONNECTED: 16, //16: server-side close the websocket connection
	        WEBIM_CONNCTION_AJAX_ERROR: 17,
	        WEBIM_CONNCTION_JOINROOM_ERROR: 18,
	        WEBIM_CONNCTION_GETROOM_ERROR: 19,

	        WEBIM_CONNCTION_GETROOMINFO_ERROR: 20,
	        WEBIM_CONNCTION_GETROOMMEMBER_ERROR: 21,
	        WEBIM_CONNCTION_GETROOMOCCUPANTS_ERROR: 22,
	        WEBIM_CONNCTION_LOAD_CHATROOM_ERROR: 23,
	        WEBIM_CONNCTION_NOT_SUPPORT_CHATROOM_ERROR: 24,
	        WEBIM_CONNCTION_JOINCHATROOM_ERROR: 25,
	        WEBIM_CONNCTION_QUITCHATROOM_ERROR: 26,
	        WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR: 27,
	        WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR: 28,
	        WEBIM_CONNCTION_SESSIONID_NOT_ASSIGN_ERROR: 29,

	        WEBIM_CONNCTION_RID_NOT_ASSIGN_ERROR: 30,
	        WEBIM_CONNCTION_CALLBACK_INNER_ERROR: 31,
	        WEBIM_CONNCTION_CLIENT_OFFLINE: 32, //32: client offline
	        WEBIM_CONNCTION_CLIENT_LOGOUT: 33, //33: client logout
	        WEBIM_CONNCTION_CLIENT_TOO_MUCH_ERROR: 34, // Over amount of the tabs a user opened in the same browser
	        WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP: 35,
	        WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP: 36,
	        WEBIM_CONNECTION_ACCEPT_JOIN_GROUP: 37,
	        WEBIM_CONNECTION_DECLINE_JOIN_GROUP: 38,
	        WEBIM_CONNECTION_CLOSED: 39,

	        WEBIM_UPLOADFILE_BROWSER_ERROR: 100,
	        WEBIM_UPLOADFILE_ERROR: 101,
	        WEBIM_UPLOADFILE_NO_LOGIN: 102,
	        WEBIM_UPLOADFILE_NO_FILE: 103,

	        WEBIM_DOWNLOADFILE_ERROR: 200,
	        WEBIM_DOWNLOADFILE_NO_LOGIN: 201,
	        WEBIM_DOWNLOADFILE_BROWSER_ERROR: 202,

	        WEBIM_MESSAGE_REC_TEXT: 300,
	        WEBIM_MESSAGE_REC_TEXT_ERROR: 301,
	        WEBIM_MESSAGE_REC_EMOTION: 302,
	        WEBIM_MESSAGE_REC_PHOTO: 303,
	        WEBIM_MESSAGE_REC_AUDIO: 304,
	        WEBIM_MESSAGE_REC_AUDIO_FILE: 305,
	        WEBIM_MESSAGE_REC_VEDIO: 306,
	        WEBIM_MESSAGE_REC_VEDIO_FILE: 307,
	        WEBIM_MESSAGE_REC_FILE: 308,
	        WEBIM_MESSAGE_SED_TEXT: 309,
	        WEBIM_MESSAGE_SED_EMOTION: 310,
	        WEBIM_MESSAGE_SED_PHOTO: 311,
	        WEBIM_MESSAGE_SED_AUDIO: 312,
	        WEBIM_MESSAGE_SED_AUDIO_FILE: 313,
	        WEBIM_MESSAGE_SED_VEDIO: 314,
	        WEBIM_MESSAGE_SED_VEDIO_FILE: 315,
	        WEBIM_MESSAGE_SED_FILE: 316,
	        WEBIM_MESSAGE_SED_ERROR: 317,

	        STATUS_INIT: 400,
	        STATUS_DOLOGIN_USERGRID: 401,
	        STATUS_DOLOGIN_IM: 402,
	        STATUS_OPENED: 403,
	        STATUS_CLOSING: 404,
	        STATUS_CLOSED: 405,
	        STATUS_ERROR: 406
	    };
	})();

/***/ },

/***/ 230:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(231);

/***/ },

/***/ 231:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _version = '1.4.2';
	var _code = __webpack_require__(224).code;
	var _utils = __webpack_require__(223).utils;
	var _msg = __webpack_require__(232);
	var _message = _msg._msg;
	var _msgHash = {};
	var Queue = __webpack_require__(233).Queue;

	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

	if (window.XDomainRequest) {
	    XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
	    XDomainRequest.prototype.send = function () {
	        XDomainRequest.prototype.oldsend.apply(this, arguments);
	        this.readyState = 2;
	    };
	}

	Strophe.Request.prototype._newXHR = function () {
	    var xhr = _utils.xmlrequest(true);
	    if (xhr.overrideMimeType) {
	        xhr.overrideMimeType('text/xml');
	    }
	    // use Function.bind() to prepend ourselves as an argument
	    xhr.onreadystatechange = this.func.bind(null, this);
	    return xhr;
	};

	Strophe.Websocket.prototype._closeSocket = function () {
	    if (this.socket) {
	        var me = this;
	        setTimeout(function () {
	            try {
	                me.socket.close();
	            } catch (e) {}
	        }, 0);
	    } else {
	        this.socket = null;
	    }
	};

	/**
	 *
	 * Strophe.Websocket has a bug while logout:
	 * 1.send: <presence xmlns='jabber:client' type='unavailable'/> is ok;
	 * 2.send: <close xmlns='urn:ietf:params:xml:ns:xmpp-framing'/> will cause a problem,log as follows:
	 * WebSocket connection to 'ws://im-api.easemob.com/ws/' failed: Data frame received after close_connect @ strophe.js:5292connect @ strophe.js:2491_login @ websdk-1.1.2.js:278suc @ websdk-1.1.2.js:636xhr.onreadystatechange @ websdk-1.1.2.js:2582
	 * 3 "Websocket error [object Event]"
	 * _changeConnectStatus
	 * onError Object {type: 7, msg: "The WebSocket connection could not be established or was disconnected.", reconnect: true}
	 *
	 * this will trigger socket.onError, therefore _doDisconnect again.
	 * Fix it by overide  _onMessage
	 */
	Strophe.Websocket.prototype._onMessage = function (message) {
	    WebIM && WebIM.config.isDebug && console.log(WebIM.utils.ts() + 'recv:', message.data);
	    var elem, data;
	    // check for closing stream
	    // var close = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';
	    // if (message.data === close) {
	    //     this._conn.rawInput(close);
	    //     this._conn.xmlInput(message);
	    //     if (!this._conn.disconnecting) {
	    //         this._conn._doDisconnect();
	    //     }
	    //     return;
	    //
	    // send and receive close xml: <close xmlns='urn:ietf:params:xml:ns:xmpp-framing'/>
	    // so we can't judge whether message.data equals close by === simply.
	    if (message.data.indexOf("<close ") === 0) {
	        elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;
	        var see_uri = elem.getAttribute("see-other-uri");
	        if (see_uri) {
	            this._conn._changeConnectStatus(Strophe.Status.REDIRECT, "Received see-other-uri, resetting connection");
	            this._conn.reset();
	            this._conn.service = see_uri;
	            this._connect();
	        } else {
	            // if (!this._conn.disconnecting) {
	            this._conn._doDisconnect("receive <close> from server");
	            // }
	        }
	        return;
	    } else if (message.data.search("<open ") === 0) {
	        // This handles stream restarts
	        elem = new DOMParser().parseFromString(message.data, "text/xml").documentElement;
	        if (!this._handleStreamStart(elem)) {
	            return;
	        }
	    } else {
	        data = this._streamWrap(message.data);
	        elem = new DOMParser().parseFromString(data, "text/xml").documentElement;
	    }

	    if (this._check_streamerror(elem, Strophe.Status.ERROR)) {
	        return;
	    }

	    //handle unavailable presence stanza before disconnecting
	    if (this._conn.disconnecting && elem.firstChild.nodeName === "presence" && elem.firstChild.getAttribute("type") === "unavailable") {
	        this._conn.xmlInput(elem);
	        this._conn.rawInput(Strophe.serialize(elem));
	        // if we are already disconnecting we will ignore the unavailable stanza and
	        // wait for the </stream:stream> tag before we close the connection
	        return;
	    }
	    this._conn._dataRecv(elem, message.data);
	};

	var _listenNetwork = function _listenNetwork(onlineCallback, offlineCallback) {

	    if (window.addEventListener) {
	        window.addEventListener('online', onlineCallback);
	        window.addEventListener('offline', offlineCallback);
	    } else if (window.attachEvent) {
	        if (document.body) {
	            document.body.attachEvent('ononline', onlineCallback);
	            document.body.attachEvent('onoffline', offlineCallback);
	        } else {
	            window.attachEvent('load', function () {
	                document.body.attachEvent('ononline', onlineCallback);
	                document.body.attachEvent('onoffline', offlineCallback);
	            });
	        }
	    } else {
	        /*var onlineTmp = window.ononline;
	         var offlineTmp = window.onoffline;
	          window.attachEvent('ononline', function () {
	         try {
	         typeof onlineTmp === 'function' && onlineTmp();
	         } catch ( e ) {}
	         onlineCallback();
	         });
	         window.attachEvent('onoffline', function () {
	         try {
	         typeof offlineTmp === 'function' && offlineTmp();
	         } catch ( e ) {}
	         offlineCallback();
	         });*/
	    }
	};

	var _parseRoom = function _parseRoom(result) {
	    var rooms = [];
	    var items = result.getElementsByTagName('item');
	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var roomJid = item.getAttribute('jid');
	            var tmp = roomJid.split('@')[0];
	            var room = {
	                jid: roomJid,
	                name: item.getAttribute('name'),
	                roomId: tmp.split('_')[1]
	            };
	            rooms.push(room);
	        }
	    }
	    return rooms;
	};

	var _parseRoomOccupants = function _parseRoomOccupants(result) {
	    var occupants = [];
	    var items = result.getElementsByTagName('item');
	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var room = {
	                jid: item.getAttribute('jid'),
	                name: item.getAttribute('name')
	            };
	            occupants.push(room);
	        }
	    }
	    return occupants;
	};

	var _parseResponseMessage = function _parseResponseMessage(msginfo) {
	    var parseMsgData = { errorMsg: true, data: [] };

	    var msgBodies = msginfo.getElementsByTagName('body');
	    if (msgBodies) {
	        for (var i = 0; i < msgBodies.length; i++) {
	            var msgBody = msgBodies[i];
	            var childNodes = msgBody.childNodes;
	            if (childNodes && childNodes.length > 0) {
	                var childNode = msgBody.childNodes[0];
	                if (childNode.nodeType == Strophe.ElementType.TEXT) {
	                    var jsondata = childNode.wholeText || childNode.nodeValue;
	                    jsondata = jsondata.replace('\n', '<br>');
	                    try {
	                        var data = eval('(' + jsondata + ')');
	                        parseMsgData.errorMsg = false;
	                        parseMsgData.data = [data];
	                    } catch (e) {}
	                }
	            }
	        }

	        var delayTags = msginfo.getElementsByTagName('delay');
	        if (delayTags && delayTags.length > 0) {
	            var delayTag = delayTags[0];
	            var delayMsgTime = delayTag.getAttribute('stamp');
	            if (delayMsgTime) {
	                parseMsgData.delayTimeStamp = delayMsgTime;
	            }
	        }
	    } else {
	        var childrens = msginfo.childNodes;
	        if (childrens && childrens.length > 0) {
	            var child = msginfo.childNodes[0];
	            if (child.nodeType == Strophe.ElementType.TEXT) {
	                try {
	                    var data = eval('(' + child.nodeValue + ')');
	                    parseMsgData.errorMsg = false;
	                    parseMsgData.data = [data];
	                } catch (e) {}
	            }
	        }
	    }
	    return parseMsgData;
	};

	var _parseNameFromJidFn = function _parseNameFromJidFn(jid, domain) {
	    domain = domain || '';
	    var tempstr = jid;
	    var findex = tempstr.indexOf('_');

	    if (findex !== -1) {
	        tempstr = tempstr.substring(findex + 1);
	    }
	    var atindex = tempstr.indexOf('@' + domain);
	    if (atindex !== -1) {
	        tempstr = tempstr.substring(0, atindex);
	    }
	    return tempstr;
	};

	var _parseFriend = function _parseFriend(queryTag, conn, from) {
	    var rouster = [];
	    var items = queryTag.getElementsByTagName('item');
	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var jid = item.getAttribute('jid');
	            if (!jid) {
	                continue;
	            }
	            var subscription = item.getAttribute('subscription');
	            var friend = {
	                subscription: subscription,
	                jid: jid
	            };
	            var ask = item.getAttribute('ask');
	            if (ask) {
	                friend.ask = ask;
	            }
	            var name = item.getAttribute('name');
	            if (name) {
	                friend.name = name;
	            } else {
	                var n = _parseNameFromJidFn(jid);
	                friend.name = n;
	            }
	            var groups = [];
	            Strophe.forEachChild(item, 'group', function (group) {
	                groups.push(Strophe.getText(group));
	            });
	            friend.groups = groups;
	            rouster.push(friend);
	            // B同意之后 -> B订阅A
	            if (conn && subscription == 'from') {
	                conn.subscribe({
	                    toJid: jid
	                });
	            }

	            if (conn && subscription == 'to') {
	                conn.subscribed({
	                    toJid: jid
	                });
	            }
	        }
	    }
	    return rouster;
	};

	var _login = function _login(options, conn) {
	    var accessToken = options.access_token || '';
	    if (accessToken == '') {
	        var loginfo = _utils.stringify(options);
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_OPEN_USERGRID_ERROR,
	            data: options
	        });
	        return;
	    }
	    conn.context.accessToken = options.access_token;
	    conn.context.accessTokenExpires = options.expires_in;
	    var stropheConn = null;
	    if (conn.isOpening() && conn.context.stropheConn) {
	        stropheConn = conn.context.stropheConn;
	    } else if (conn.isOpened() && conn.context.stropheConn) {
	        // return;
	        stropheConn = conn.getStrophe();
	    } else {
	        stropheConn = conn.getStrophe();
	    }
	    var callback = function callback(status, msg) {
	        _loginCallback(status, msg, conn);
	    };

	    conn.context.stropheConn = stropheConn;
	    if (conn.route) {
	        stropheConn.connect(conn.context.jid, '$t$' + accessToken, callback, conn.wait, conn.hold, conn.route);
	    } else {
	        stropheConn.connect(conn.context.jid, '$t$' + accessToken, callback, conn.wait, conn.hold);
	    }
	};

	var _parseMessageType = function _parseMessageType(msginfo) {
	    var msgtype = 'normal';
	    var receiveinfo = msginfo.getElementsByTagName('received');
	    if (receiveinfo && receiveinfo.length > 0 && receiveinfo[0].namespaceURI === 'urn:xmpp:receipts') {
	        msgtype = 'received';
	    } else {
	        var inviteinfo = msginfo.getElementsByTagName('invite');
	        if (inviteinfo && inviteinfo.length > 0) {
	            msgtype = 'invite';
	        }
	    }
	    return msgtype;
	};

	var _handleMessageQueue = function _handleMessageQueue(conn) {
	    for (var i in _msgHash) {
	        if (_msgHash.hasOwnProperty(i)) {
	            _msgHash[i].send(conn);
	        }
	    }
	};

	var _loginCallback = function _loginCallback(status, msg, conn) {
	    var conflict, error;

	    if (msg === 'conflict') {
	        conflict = true;
	    }

	    if (status == Strophe.Status.CONNFAIL) {
	        //client offline, ping/pong timeout, server quit, server offline
	        error = {
	            type: _code.WEBIM_CONNCTION_SERVER_CLOSE_ERROR,
	            msg: msg,
	            reconnect: true
	        };

	        conflict && (error.conflict = true);
	        conn.onError(error);
	    } else if (status == Strophe.Status.ATTACHED || status == Strophe.Status.CONNECTED) {
	        // client should limit the speed of sending ack messages  up to 5/s
	        conn.autoReconnectNumTotal = 0;
	        conn.intervalId = setInterval(function () {
	            conn.handelSendQueue();
	        }, 200);
	        var handleMessage = function handleMessage(msginfo) {
	            var type = _parseMessageType(msginfo);

	            if ('received' === type) {
	                conn.handleReceivedMessage(msginfo);
	                return true;
	            } else if ('invite' === type) {
	                conn.handleInviteMessage(msginfo);
	                return true;
	            } else {
	                conn.handleMessage(msginfo);
	                return true;
	            }
	        };
	        var handlePresence = function handlePresence(msginfo) {
	            conn.handlePresence(msginfo);
	            return true;
	        };
	        var handlePing = function handlePing(msginfo) {
	            conn.handlePing(msginfo);
	            return true;
	        };
	        var handleIqRoster = function handleIqRoster(msginfo) {
	            conn.handleIqRoster(msginfo);
	            return true;
	        };
	        var handleIqPrivacy = function handleIqPrivacy(msginfo) {
	            conn.handleIqPrivacy(msginfo);
	            return true;
	        };
	        var handleIq = function handleIq(msginfo) {
	            conn.handleIq(msginfo);
	            return true;
	        };

	        conn.addHandler(handleMessage, null, 'message', null, null, null);
	        conn.addHandler(handlePresence, null, 'presence', null, null, null);
	        conn.addHandler(handlePing, 'urn:xmpp:ping', 'iq', 'get', null, null);
	        conn.addHandler(handleIqRoster, 'jabber:iq:roster', 'iq', 'set', null, null);
	        conn.addHandler(handleIqPrivacy, 'jabber:iq:privacy', 'iq', 'set', null, null);
	        conn.addHandler(handleIq, null, 'iq', null, null, null);

	        conn.context.status = _code.STATUS_OPENED;

	        var supportRecMessage = [_code.WEBIM_MESSAGE_REC_TEXT, _code.WEBIM_MESSAGE_REC_EMOJI];

	        if (_utils.isCanDownLoadFile) {
	            supportRecMessage.push(_code.WEBIM_MESSAGE_REC_PHOTO);
	            supportRecMessage.push(_code.WEBIM_MESSAGE_REC_AUDIO_FILE);
	        }
	        var supportSedMessage = [_code.WEBIM_MESSAGE_SED_TEXT];
	        if (_utils.isCanUploadFile) {
	            supportSedMessage.push(_code.WEBIM_MESSAGE_REC_PHOTO);
	            supportSedMessage.push(_code.WEBIM_MESSAGE_REC_AUDIO_FILE);
	        }
	        conn.notifyVersion();
	        conn.retry && _handleMessageQueue(conn);
	        conn.heartBeat();
	        conn.isAutoLogin && conn.setPresence();
	        conn.onOpened({
	            canReceive: supportRecMessage,
	            canSend: supportSedMessage,
	            accessToken: conn.context.accessToken
	        });
	    } else if (status == Strophe.Status.DISCONNECTING) {
	        if (conn.isOpened()) {
	            conn.stopHeartBeat();
	            conn.context.status = _code.STATUS_CLOSING;

	            error = {
	                type: _code.WEBIM_CONNCTION_SERVER_CLOSE_ERROR,
	                msg: msg,
	                reconnect: true
	            };

	            conflict && (error.conflict = true);
	            conn.onError(error);
	        }
	    } else if (status == Strophe.Status.DISCONNECTED) {
	        if (conn.isOpened()) {
	            if (conn.autoReconnectNumTotal < conn.autoReconnectNumMax) {
	                conn.reconnect();
	                return;
	            } else {
	                error = {
	                    type: _code.WEBIM_CONNCTION_DISCONNECTED
	                };
	                conn.onError(error);
	            }
	        }
	        conn.context.status = _code.STATUS_CLOSED;
	        conn.clear();
	        conn.onClosed();
	    } else if (status == Strophe.Status.AUTHFAIL) {
	        error = {
	            type: _code.WEBIM_CONNCTION_AUTH_ERROR
	        };

	        conflict && (error.conflict = true);
	        conn.onError(error);
	        conn.clear();
	    } else if (status == Strophe.Status.ERROR) {
	        conn.context.status = _code.STATUS_ERROR;
	        error = {
	            type: _code.WEBIM_CONNCTION_SERVER_ERROR
	        };

	        conflict && (error.conflict = true);
	        conn.onError(error);
	    }
	    conn.context.status_now = status;
	};

	var _getJid = function _getJid(options, conn) {
	    var jid = options.toJid || '';

	    if (jid === '') {
	        var appKey = conn.context.appKey || '';
	        var toJid = appKey + '_' + options.to + '@' + conn.domain;

	        if (options.resource) {
	            toJid = toJid + '/' + options.resource;
	        }
	        jid = toJid;
	    }
	    return jid;
	};

	var _getJidByName = function _getJidByName(name, conn) {
	    var options = {
	        to: name
	    };
	    return _getJid(options, conn);
	};

	var _validCheck = function _validCheck(options, conn) {
	    options = options || {};

	    if (options.user == '') {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }

	    var user = options.user + '' || '';
	    var appKey = options.appKey || '';
	    var devInfos = appKey.split('#');

	    if (devInfos.length !== 2) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }
	    var orgName = devInfos[0];
	    var appName = devInfos[1];

	    if (!orgName) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }
	    if (!appName) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return false;
	    }

	    var jid = appKey + '_' + user.toLowerCase() + '@' + conn.domain,
	        resource = options.resource || 'webim';

	    if (conn.isMultiLoginSessions) {
	        resource += user + new Date().getTime() + Math.floor(Math.random().toFixed(6) * 1000000);
	    }
	    conn.context.jid = jid + '/' + resource;
	    /*jid: {appkey}_{username}@domain/resource*/
	    conn.context.userId = user;
	    conn.context.appKey = appKey;
	    conn.context.appName = appName;
	    conn.context.orgName = orgName;

	    return true;
	};

	var _getXmppUrl = function _getXmppUrl(baseUrl, https) {
	    if (/^(ws|http)s?:\/\/?/.test(baseUrl)) {
	        return baseUrl;
	    }

	    var url = {
	        prefix: 'http',
	        base: '://' + baseUrl,
	        suffix: '/http-bind/'
	    };

	    if (https && _utils.isSupportWss) {
	        url.prefix = 'wss';
	        url.suffix = '/ws/';
	    } else {
	        if (https) {
	            url.prefix = 'https';
	        } else if (window.WebSocket) {
	            url.prefix = 'ws';
	            url.suffix = '/ws/';
	        }
	    }

	    return url.prefix + url.base + url.suffix;
	};

	//class
	var connection = function connection(options) {
	    if (!this instanceof connection) {
	        return new connection(options);
	    }

	    var options = options || {};

	    this.isHttpDNS = options.isHttpDNS || false;
	    this.isMultiLoginSessions = options.isMultiLoginSessions || false;
	    this.wait = options.wait || 30;
	    this.retry = options.retry || false;
	    this.https = options.https || location.protocol === 'https:';
	    this.url = _getXmppUrl(options.url, this.https);
	    this.hold = options.hold || 1;
	    this.route = options.route || null;
	    this.domain = options.domain || 'easemob.com';
	    this.inactivity = options.inactivity || 30;
	    this.heartBeatWait = options.heartBeatWait || 4500;
	    this.maxRetries = options.maxRetries || 5;
	    this.isAutoLogin = options.isAutoLogin === false ? false : true;
	    this.pollingTime = options.pollingTime || 800;
	    this.stropheConn = false;
	    this.autoReconnectNumMax = options.autoReconnectNumMax || 0;
	    this.autoReconnectNumTotal = 0;
	    this.autoReconnectInterval = options.autoReconnectInterval || 0;
	    this.context = { status: _code.STATUS_INIT };
	    this.sendQueue = new Queue(); //instead of sending message immediately,cache them in this queue
	    this.intervalId = null; //clearInterval return value
	    this.apiUrl = options.apiUrl || '';
	    this.isWindowSDK = options.isWindowSDK || false;

	    this.dnsArr = ['https://rs.easemob.com', 'https://rsbak.easemob.com', 'http://182.92.174.78', 'http://112.126.66.111']; //http dns server hosts
	    this.dnsIndex = 0; //the dns ip used in dnsArr currently
	    this.dnsTotal = this.dnsArr.length; //max number of getting dns retries
	    this.restHosts = null; //rest server ips
	    this.restIndex = 0; //the rest ip used in restHosts currently
	    this.restTotal = 0; //max number of getting rest token retries
	    this.xmppHosts = null; //xmpp server ips
	    this.xmppIndex = 0; //the xmpp ip used in xmppHosts currently
	    this.xmppTotal = 0; //max number of creating xmpp server connection(ws/bosh) retries
	};

	connection.prototype.registerUser = function (options) {
	    if (location.protocol != 'https:' && this.isHttpDNS) {
	        this.dnsIndex = 0;
	        this.getHttpDNS(options, 'signup');
	    } else {
	        this.signup(options);
	    }
	};

	connection.prototype.handelSendQueue = function () {
	    var options = this.sendQueue.pop();
	    if (options !== null) {
	        this.sendReceiptsMessage(options);
	    }
	};
	connection.prototype.listen = function (options) {
	    this.onOpened = options.onOpened || _utils.emptyfn;
	    this.onClosed = options.onClosed || _utils.emptyfn;
	    this.onTextMessage = options.onTextMessage || _utils.emptyfn;
	    this.onEmojiMessage = options.onEmojiMessage || _utils.emptyfn;
	    this.onPictureMessage = options.onPictureMessage || _utils.emptyfn;
	    this.onAudioMessage = options.onAudioMessage || _utils.emptyfn;
	    this.onVideoMessage = options.onVideoMessage || _utils.emptyfn;
	    this.onFileMessage = options.onFileMessage || _utils.emptyfn;
	    this.onLocationMessage = options.onLocationMessage || _utils.emptyfn;
	    this.onCmdMessage = options.onCmdMessage || _utils.emptyfn;
	    this.onPresence = options.onPresence || _utils.emptyfn;
	    this.onRoster = options.onRoster || _utils.emptyfn;
	    this.onError = options.onError || _utils.emptyfn;
	    this.onReceivedMessage = options.onReceivedMessage || _utils.emptyfn;
	    this.onInviteMessage = options.onInviteMessage || _utils.emptyfn;
	    this.onOffline = options.onOffline || _utils.emptyfn;
	    this.onOnline = options.onOnline || _utils.emptyfn;
	    this.onConfirmPop = options.onConfirmPop || _utils.emptyfn;
	    //for WindowSDK start
	    this.onUpdateMyGroupList = options.onUpdateMyGroupList || _utils.emptyfn;
	    this.onUpdateMyRoster = options.onUpdateMyRoster || _utils.emptyfn;
	    //for WindowSDK end
	    this.onBlacklistUpdate = options.onBlacklistUpdate || _utils.emptyfn;

	    _listenNetwork(this.onOnline, this.onOffline);
	};

	connection.prototype.heartBeat = function () {
	    var me = this;
	    //IE8: strophe auto switch from ws to BOSH, need heartbeat
	    var isNeed = !/^ws|wss/.test(me.url) || /mobile/.test(navigator.userAgent);

	    if (this.heartBeatID || !isNeed) {
	        return;
	    }

	    var options = {
	        toJid: this.domain,
	        type: 'normal'
	    };
	    this.heartBeatID = setInterval(function () {
	        me.ping(options);
	    }, this.heartBeatWait);
	};

	connection.prototype.stopHeartBeat = function () {
	    if (typeof this.heartBeatID == "number") {
	        this.heartBeatID = clearInterval(this.heartBeatID);
	    }
	};

	connection.prototype.sendReceiptsMessage = function (options) {
	    var dom = $msg({
	        from: this.context.jid || '',
	        to: this.domain,
	        id: options.id || ''
	    }).c('received', {
	        xmlns: 'urn:xmpp:receipts',
	        id: options.id || ''
	    });
	    this.sendCommand(dom.tree());
	};

	connection.prototype.cacheReceiptsMessage = function (options) {
	    this.sendQueue.push(options);
	};

	connection.prototype.getStrophe = function () {
	    if (location.protocol != 'https:' && this.isHttpDNS) {
	        //TODO: try this.xmppTotal times on fail
	        var url = '';
	        var host = this.xmppHosts[this.xmppIndex];
	        var domain = _utils.getXmlFirstChild(host, 'domain');
	        var ip = _utils.getXmlFirstChild(host, 'ip');
	        if (ip) {
	            url = ip.textContent;
	            var port = _utils.getXmlFirstChild(host, 'port');
	            if (port.textContent != '80') {
	                url += ':' + port.textContent;
	            }
	        } else {
	            url = domain.textContent;
	        }

	        if (url != '') {
	            var parter = /(.+\/\/).+(\/.+)/;
	            this.url = this.url.replace(parter, "$1" + url + "$2");
	        }
	    }

	    var stropheConn = new Strophe.Connection(this.url, {
	        inactivity: this.inactivity,
	        maxRetries: this.maxRetries,
	        pollingTime: this.pollingTime
	    });
	    return stropheConn;
	};
	connection.prototype.getHostsByTag = function (data, tagName) {
	    var tag = _utils.getXmlFirstChild(data, tagName);
	    if (!tag) {
	        console.log(tagName + ' hosts error');
	        return null;
	    }
	    var hosts = tag.getElementsByTagName('hosts');
	    if (hosts.length == 0) {
	        console.log(tagName + ' hosts error2');
	        return null;
	    }
	    return hosts[0].getElementsByTagName('host');
	};
	connection.prototype.getRestFromHttpDNS = function (options, type) {
	    if (this.restIndex > this.restTotal) {
	        console.log('rest hosts all tried,quit');
	        return;
	    }
	    var url = '';
	    var host = this.restHosts[this.restIndex];
	    var domain = _utils.getXmlFirstChild(host, 'domain');
	    var ip = _utils.getXmlFirstChild(host, 'ip');
	    if (ip) {
	        var port = _utils.getXmlFirstChild(host, 'port');
	        url = (location.protocol === 'https:' ? 'https:' : 'http:') + '//' + ip.textContent + ':' + port.textContent;
	    } else {
	        url = (location.protocol === 'https:' ? 'https:' : 'http:') + '//' + domain.textContent;
	    }

	    if (url != '') {
	        this.apiUrl = url;
	        options.apiUrl = url;
	    }

	    if (type == 'login') {
	        this.login(options);
	    } else {
	        this.signup(options);
	    }
	};

	connection.prototype.getHttpDNS = function (options, type) {
	    if (this.restHosts) {
	        this.getRestFromHttpDNS(options, type);
	        return;
	    }
	    var self = this;
	    var suc = function suc(data, xhr) {
	        data = new DOMParser().parseFromString(data, "text/xml").documentElement;
	        //get rest ips
	        var restHosts = self.getHostsByTag(data, 'rest');
	        if (!restHosts) {
	            console.log('rest hosts error3');
	            return;
	        }
	        self.restHosts = restHosts;
	        self.restTotal = restHosts.length;

	        //get xmpp ips
	        var xmppHosts = self.getHostsByTag(data, 'xmpp');
	        if (!xmppHosts) {
	            console.log('xmpp hosts error3');
	            return;
	        }
	        self.xmppHosts = xmppHosts;
	        self.xmppTotal = xmppHosts.length;

	        self.getRestFromHttpDNS(options, type);
	    };
	    var error = function error(res, xhr, msg) {

	        console.log('getHttpDNS error', res, msg);
	        self.dnsIndex++;
	        if (self.dnsIndex < self.dnsTotal) {
	            self.getHttpDNS(options, type);
	        }
	    };
	    var options2 = {
	        url: this.dnsArr[this.dnsIndex] + '/easemob/server.xml',
	        dataType: 'text',
	        type: 'GET',

	        // url: 'http://www.easemob.com/easemob/server.xml',
	        // dataType: 'xml',
	        data: { app_key: encodeURIComponent(options.appKey) },
	        success: suc || _utils.emptyfn,
	        error: error || _utils.emptyfn
	    };
	    _utils.ajax(options2);
	};

	connection.prototype.signup = function (options) {
	    var self = this;
	    var orgName = options.orgName || '';
	    var appName = options.appName || '';
	    var appKey = options.appKey || '';
	    var suc = options.success || EMPTYFN;
	    var err = options.error || EMPTYFN;

	    if (!orgName && !appName && appKey) {
	        var devInfos = appKey.split('#');
	        if (devInfos.length === 2) {
	            orgName = devInfos[0];
	            appName = devInfos[1];
	        }
	    }
	    if (!orgName && !appName) {
	        err({
	            type: _code.WEBIM_CONNCTION_APPKEY_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var error = function error(res, xhr, msg) {
	        if (location.protocol != 'https:' && self.isHttpDNS) {
	            if (self.restIndex + 1 < self.restTotal) {
	                self.restIndex++;
	                self.getRestFromHttpDNS(options, 'signup');
	                return;
	            }
	        }
	        self.clear();
	        err(res);
	    };
	    var https = options.https || https;
	    var apiUrl = options.apiUrl;
	    var restUrl = apiUrl + '/' + orgName + '/' + appName + '/users';

	    var userjson = {
	        username: options.username,
	        password: options.password,
	        nickname: options.nickname || ''
	    };

	    var userinfo = _utils.stringify(userjson);
	    var options2 = {
	        url: restUrl,
	        dataType: 'json',
	        data: userinfo,
	        success: suc,
	        error: error
	    };
	    _utils.ajax(options2);
	};

	connection.prototype.open = function (options) {
	    if (location.protocol != 'https:' && this.isHttpDNS) {
	        this.dnsIndex = 0;
	        this.getHttpDNS(options, 'login');
	    } else {
	        this.login(options);
	    }
	};

	connection.prototype.login = function (options) {
	    var pass = _validCheck(options, this);

	    if (!pass) {
	        return;
	    }

	    var conn = this;

	    if (conn.isOpened()) {
	        return;
	    }

	    if (options.accessToken) {
	        options.access_token = options.accessToken;
	        _login(options, conn);
	    } else {
	        var apiUrl = options.apiUrl;
	        var userId = this.context.userId;
	        var pwd = options.pwd || '';
	        var appName = this.context.appName;
	        var orgName = this.context.orgName;

	        var suc = function suc(data, xhr) {
	            conn.context.status = _code.STATUS_DOLOGIN_IM;
	            conn.context.restTokenData = data;
	            _login(data, conn);
	        };
	        var error = function error(res, xhr, msg) {
	            if (location.protocol != 'https:' && conn.isHttpDNS) {
	                if (conn.restIndex + 1 < conn.restTotal) {
	                    conn.restIndex++;
	                    conn.getRestFromHttpDNS(options, 'login');
	                    return;
	                }
	            }
	            conn.clear();
	            if (res.error && res.error_description) {
	                conn.onError({
	                    type: _code.WEBIM_CONNCTION_OPEN_USERGRID_ERROR,
	                    data: res,
	                    xhr: xhr
	                });
	            } else {
	                conn.onError({
	                    type: _code.WEBIM_CONNCTION_OPEN_ERROR,
	                    data: res,
	                    xhr: xhr
	                });
	            }
	        };

	        this.context.status = _code.STATUS_DOLOGIN_USERGRID;

	        var loginJson = {
	            grant_type: 'password',
	            username: userId,
	            password: pwd,
	            timestamp: +new Date()
	        };
	        var loginfo = _utils.stringify(loginJson);

	        var options2 = {
	            url: apiUrl + '/' + orgName + '/' + appName + '/token',
	            dataType: 'json',
	            data: loginfo,
	            success: suc || _utils.emptyfn,
	            error: error || _utils.emptyfn
	        };
	        _utils.ajax(options2);
	    }
	};

	// attach to xmpp server for BOSH
	connection.prototype.attach = function (options) {
	    var pass = _validCheck(options, this);

	    if (!pass) {
	        return;
	    }

	    options = options || {};

	    var accessToken = options.accessToken || '';
	    if (accessToken == '') {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var sid = options.sid || '';
	    if (sid === '') {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_SESSIONID_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var rid = options.rid || '';
	    if (rid === '') {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_RID_NOT_ASSIGN_ERROR
	        });
	        return;
	    }

	    var stropheConn = this.getStrophe();

	    this.context.accessToken = accessToken;
	    this.context.stropheConn = stropheConn;
	    this.context.status = _code.STATUS_DOLOGIN_IM;

	    var conn = this;
	    var callback = function callback(status, msg) {
	        _loginCallback(status, msg, conn);
	    };

	    var jid = this.context.jid;
	    var wait = this.wait;
	    var hold = this.hold;
	    var wind = this.wind || 5;
	    stropheConn.attach(jid, sid, rid, callback, wait, hold, wind);
	};

	connection.prototype.close = function (reason) {
	    this.stopHeartBeat();

	    var status = this.context.status;
	    if (status == _code.STATUS_INIT) {
	        return;
	    }

	    if (this.isClosed() || this.isClosing()) {
	        return;
	    }

	    this.context.status = _code.STATUS_CLOSING;
	    this.context.stropheConn.disconnect(reason);
	};

	connection.prototype.addHandler = function (handler, ns, name, type, id, from, options) {
	    this.context.stropheConn.addHandler(handler, ns, name, type, id, from, options);
	};

	connection.prototype.notifyVersion = function (suc, fail) {
	    var jid = _getJid({}, this);
	    var dom = $iq({
	        from: this.context.jid || '',
	        to: this.domain,
	        type: 'result'
	    }).c('query', { xmlns: 'jabber:iq:version' }).c('name').t('easemob').up().c('version').t(_version).up().c('os').t('webim');

	    var suc = suc || _utils.emptyfn;
	    var error = fail || this.onError;
	    var failFn = function failFn(ele) {
	        error({
	            type: _code.WEBIM_CONNCTION_NOTIFYVERSION_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(dom.tree(), suc, failFn);
	    return;
	};

	// handle all types of presence message
	connection.prototype.handlePresence = function (msginfo) {
	    if (this.isClosed()) {
	        return;
	    }
	    var from = msginfo.getAttribute('from') || '';
	    var to = msginfo.getAttribute('to') || '';
	    var type = msginfo.getAttribute('type') || '';
	    var presence_type = msginfo.getAttribute('presence_type') || '';
	    var fromUser = _parseNameFromJidFn(from);
	    var toUser = _parseNameFromJidFn(to);
	    var info = {
	        from: fromUser,
	        to: toUser,
	        fromJid: from,
	        toJid: to,
	        type: type,
	        chatroom: msginfo.getElementsByTagName('roomtype').length ? true : false
	    };

	    var showTags = msginfo.getElementsByTagName('show');
	    if (showTags && showTags.length > 0) {
	        var showTag = showTags[0];
	        info.show = Strophe.getText(showTag);
	    }
	    var statusTags = msginfo.getElementsByTagName('status');
	    if (statusTags && statusTags.length > 0) {
	        var statusTag = statusTags[0];
	        info.status = Strophe.getText(statusTag);
	        info.code = statusTag.getAttribute('code');
	    }

	    var priorityTags = msginfo.getElementsByTagName('priority');
	    if (priorityTags && priorityTags.length > 0) {
	        var priorityTag = priorityTags[0];
	        info.priority = Strophe.getText(priorityTag);
	    }

	    var error = msginfo.getElementsByTagName('error');
	    if (error && error.length > 0) {
	        var error = error[0];
	        info.error = {
	            code: error.getAttribute('code')
	        };
	    }

	    var destroy = msginfo.getElementsByTagName('destroy');
	    if (destroy && destroy.length > 0) {
	        var destroy = destroy[0];
	        info.destroy = true;

	        var reason = destroy.getElementsByTagName('reason');
	        if (reason && reason.length > 0) {
	            info.reason = Strophe.getText(reason[0]);
	        }
	    }

	    // <item affiliation="member" jid="easemob-demo#chatdemoui_lwz2@easemob.com" role="none">
	    //     <actor nick="liuwz"/>
	    // </item>
	    // one record once a time
	    // kick info: actor / member
	    var members = msginfo.getElementsByTagName('item');
	    if (members && members.length > 0) {
	        var member = members[0];
	        var role = member.getAttribute('role');
	        var jid = member.getAttribute('jid');
	        // dismissed by group
	        if (role == 'none' && jid) {
	            var kickedMember = _parseNameFromJidFn(jid);
	            var actor = member.getElementsByTagName('actor')[0];
	            var actorNick = actor.getAttribute('nick');
	            info.actor = actorNick;
	            info.kicked = kickedMember;
	        }
	        // Service Acknowledges Room Creation `createGroupACK`
	        if (role == 'moderator' && info.code == '201') {
	            // info.type = 'createGroupACK';
	            info.type = 'joinPublicGroupSuccess';
	        }
	    }

	    // from message : apply to join group
	    // <message from="easemob-demo#chatdemoui_lwz4@easemob.com/mobile" id="259151681747419640" to="easemob-demo#chatdemoui_liuwz@easemob.com" xmlns="jabber:client">
	    //     <x xmlns="http://jabber.org/protocol/muc#user">
	    //         <apply from="easemob-demo#chatdemoui_lwz4@easemob.com" to="easemob-demo#chatdemoui_1477733677560@conference.easemob.com" toNick="lwzlwzlwz">
	    //             <reason>qwe</reason>
	    //         </apply>
	    //     </x>
	    // </message>
	    var apply = msginfo.getElementsByTagName('apply');
	    if (apply && apply.length > 0) {
	        apply = apply[0];
	        var toNick = apply.getAttribute('toNick');
	        var groupJid = apply.getAttribute('to');
	        var userJid = apply.getAttribute('from');
	        var groupName = _parseNameFromJidFn(groupJid);
	        var userName = _parseNameFromJidFn(userJid);
	        info.toNick = toNick;
	        info.groupName = groupName;
	        info.type = 'joinGroupNotifications';
	        var reason = apply.getElementsByTagName('reason');
	        if (reason && reason.length > 0) {
	            info.reason = Strophe.getText(reason[0]);
	        }
	    }

	    if (info.chatroom) {
	        // diff the
	        info.presence_type = presence_type;
	        info.original_type = info.type;
	        var reflectUser = from.slice(from.lastIndexOf('/') + 1);

	        if (reflectUser === this.context.userId) {
	            if (info.type === '' && !info.code) {
	                info.type = 'joinChatRoomSuccess';
	            } else if (presence_type === 'unavailable' || info.type === 'unavailable') {
	                if (!info.status) {
	                    // logout successfully.
	                    info.type = 'leaveChatRoom';
	                } else if (info.code == 110) {
	                    // logout or dismissied by admin.
	                    info.type = 'leaveChatRoom';
	                } else if (info.error && info.error.code == 406) {
	                    // The chat room is full.
	                    info.type = 'reachChatRoomCapacity';
	                }
	            }
	        }
	    } else {
	        info.presence_type = presence_type;
	        info.original_type = type;

	        if (/subscribe/.test(info.type)) {
	            //subscribe | subscribed | unsubscribe | unsubscribed
	        } else if (type == "" && !info.status && !info.error) {
	            info.type = 'joinPublicGroupSuccess';
	        } else if (presence_type === 'unavailable' || type === 'unavailable') {
	            // There is no roomtype when a chat room is deleted.
	            if (info.destroy) {
	                // Group or Chat room Deleted.
	                info.type = 'deleteGroupChat';
	            } else if (info.code == 307 || info.code == 321) {
	                // Dismissed by group.
	                info.type = 'leaveGroup';
	            }
	        }
	    }
	    this.onPresence(info, msginfo);
	};

	connection.prototype.handlePing = function (e) {
	    if (this.isClosed()) {
	        return;
	    }
	    var id = e.getAttribute('id');
	    var from = e.getAttribute('from');
	    var to = e.getAttribute('to');
	    var dom = $iq({
	        from: to,
	        to: from,
	        id: id,
	        type: 'result'
	    });
	    this.sendCommand(dom.tree());
	};

	connection.prototype.handleIq = function (iq) {
	    return true;
	};

	connection.prototype.handleIqPrivacy = function (msginfo) {
	    var list = msginfo.getElementsByTagName('list');
	    if (list.length == 0) {
	        return;
	    }
	    this.getBlacklist();
	};

	connection.prototype.handleIqRoster = function (e) {
	    var id = e.getAttribute('id');
	    var from = e.getAttribute('from') || '';
	    var name = _parseNameFromJidFn(from);
	    var curJid = this.context.jid;
	    var curUser = this.context.userId;

	    var iqresult = $iq({ type: 'result', id: id, from: curJid });
	    this.sendCommand(iqresult.tree());

	    var msgBodies = e.getElementsByTagName('query');
	    if (msgBodies && msgBodies.length > 0) {
	        var queryTag = msgBodies[0];
	        var rouster = _parseFriend(queryTag, this, from);
	        this.onRoster(rouster);
	    }
	    return true;
	};

	connection.prototype.handleMessage = function (msginfo) {
	    var self = this;
	    if (this.isClosed()) {
	        return;
	    }

	    var id = msginfo.getAttribute('id') || '';

	    // cache ack into sendQueue first , handelSendQueue will do the send thing with the speed of  5/s
	    this.cacheReceiptsMessage({
	        id: id
	    });
	    var parseMsgData = _parseResponseMessage(msginfo);
	    if (parseMsgData.errorMsg) {
	        this.handlePresence(msginfo);
	        return;
	    }
	    // send error
	    var error = msginfo.getElementsByTagName('error');
	    var errorCode = '';
	    var errorText = '';
	    var errorBool = false;
	    if (error.length > 0) {
	        errorBool = true;
	        errorCode = error[0].getAttribute('code');
	        var textDOM = error[0].getElementsByTagName('text');
	        errorText = textDOM[0].textContent || textDOM[0].text;
	        log('handle error', errorCode, errorText);
	    }

	    var msgDatas = parseMsgData.data;
	    for (var i in msgDatas) {
	        if (!msgDatas.hasOwnProperty(i)) {
	            continue;
	        }
	        var msg = msgDatas[i];
	        if (!msg.from || !msg.to) {
	            continue;
	        }

	        var from = (msg.from + '').toLowerCase();
	        var too = (msg.to + '').toLowerCase();
	        var extmsg = msg.ext || {};
	        var chattype = '';
	        var typeEl = msginfo.getElementsByTagName('roomtype');
	        if (typeEl.length) {
	            chattype = typeEl[0].getAttribute('type') || 'chat';
	        } else {
	            chattype = msginfo.getAttribute('type') || 'chat';
	        }

	        var msgBodies = msg.bodies;
	        if (!msgBodies || msgBodies.length == 0) {
	            continue;
	        }
	        var msgBody = msg.bodies[0];
	        var type = msgBody.type;

	        try {
	            switch (type) {
	                case 'txt':
	                    var receiveMsg = msgBody.msg;
	                    var emojibody = _utils.parseTextMessage(receiveMsg, WebIM.Emoji);
	                    if (emojibody.isemoji) {
	                        var msg = {
	                            id: id,
	                            type: chattype,
	                            from: from,
	                            to: too,
	                            delay: parseMsgData.delayTimeStamp,
	                            data: emojibody.body,
	                            ext: extmsg
	                        };
	                        !msg.delay && delete msg.delay;
	                        msg.error = errorBool;
	                        msg.errorText = errorText;
	                        msg.errorCode = errorCode;
	                        this.onEmojiMessage(msg);
	                    } else {
	                        var msg = {
	                            id: id,
	                            type: chattype,
	                            from: from,
	                            to: too,
	                            delay: parseMsgData.delayTimeStamp,
	                            data: receiveMsg,
	                            ext: extmsg
	                        };
	                        !msg.delay && delete msg.delay;
	                        msg.error = errorBool;
	                        msg.errorText = errorText;
	                        msg.errorCode = errorCode;
	                        this.onTextMessage(msg);
	                    }
	                    break;
	                case 'img':
	                    var rwidth = 0;
	                    var rheight = 0;
	                    if (msgBody.size) {
	                        rwidth = msgBody.size.width;
	                        rheight = msgBody.size.height;
	                    }
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        thumb: msgBody.thumb,
	                        thumb_secret: msgBody.thumb_secret,
	                        file_length: msgBody.file_length || '',
	                        width: rwidth,
	                        height: rheight,
	                        filetype: msgBody.filetype || '',
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onPictureMessage(msg);
	                    break;
	                case 'audio':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        length: msgBody.length || '',
	                        file_length: msgBody.file_length || '',
	                        filetype: msgBody.filetype || '',
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onAudioMessage(msg);
	                    break;
	                case 'file':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        file_length: msgBody.file_length,
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onFileMessage(msg);
	                    break;
	                case 'loc':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,
	                        addr: msgBody.addr,
	                        lat: msgBody.lat,
	                        lng: msgBody.lng,
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onLocationMessage(msg);
	                    break;
	                case 'video':
	                    var msg = {
	                        id: id,
	                        type: chattype,
	                        from: from,
	                        to: too,

	                        url: location.protocol != 'https:' && self.isHttpDNS ? self.apiUrl + msgBody.url.substr(msgBody.url.indexOf("/", 9)) : msgBody.url,
	                        secret: msgBody.secret,
	                        filename: msgBody.filename,
	                        file_length: msgBody.file_length,
	                        accessToken: this.context.accessToken || '',
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onVideoMessage(msg);
	                    break;
	                case 'cmd':
	                    var msg = {
	                        id: id,
	                        from: from,
	                        to: too,
	                        action: msgBody.action,
	                        ext: extmsg,
	                        delay: parseMsgData.delayTimeStamp
	                    };
	                    !msg.delay && delete msg.delay;
	                    msg.error = errorBool;
	                    msg.errorText = errorText;
	                    msg.errorCode = errorCode;
	                    this.onCmdMessage(msg);
	                    break;
	            }
	            ;
	        } catch (e) {
	            this.onError({
	                type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	                data: e
	            });
	        }
	    }
	};

	connection.prototype.handleReceivedMessage = function (message) {
	    try {
	        this.onReceivedMessage(message);
	    } catch (e) {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	            data: e
	        });
	    }

	    var rcv = message.getElementsByTagName('received'),
	        id,
	        mid;

	    if (rcv.length > 0) {
	        if (rcv[0].childNodes && rcv[0].childNodes.length > 0) {
	            id = rcv[0].childNodes[0].nodeValue;
	        } else {
	            id = rcv[0].innerHTML || rcv[0].innerText;
	        }
	        mid = rcv[0].getAttribute('mid');
	    }

	    if (_msgHash[id]) {
	        try {
	            _msgHash[id].msg.success instanceof Function && _msgHash[id].msg.success(id, mid);
	        } catch (e) {
	            this.onError({
	                type: _code.WEBIM_CONNCTION_CALLBACK_INNER_ERROR,
	                data: e
	            });
	        }
	        delete _msgHash[id];
	    }
	};

	connection.prototype.handleInviteMessage = function (message) {
	    var form = null;
	    var invitemsg = message.getElementsByTagName('invite');
	    var reasonDom = message.getElementsByTagName('reason')[0];
	    var reasonMsg = reasonDom.textContent;
	    var id = message.getAttribute('id') || '';
	    this.sendReceiptsMessage({
	        id: id
	    });

	    if (invitemsg && invitemsg.length > 0) {
	        var fromJid = invitemsg[0].getAttribute('from');
	        form = _parseNameFromJidFn(fromJid);
	    }
	    var xmsg = message.getElementsByTagName('x');
	    var roomid = null;
	    if (xmsg && xmsg.length > 0) {
	        for (var i = 0; i < xmsg.length; i++) {
	            if ('jabber:x:conference' === xmsg[i].namespaceURI) {
	                var roomjid = xmsg[i].getAttribute('jid');
	                roomid = _parseNameFromJidFn(roomjid);
	            }
	        }
	    }
	    this.onInviteMessage({
	        type: 'invite',
	        from: form,
	        roomid: roomid,
	        reason: reasonMsg
	    });
	};

	connection.prototype.sendCommand = function (dom, id) {
	    if (this.isOpened()) {
	        this.context.stropheConn.send(dom);
	    } else {
	        this.onError({
	            type: _code.WEBIM_CONNCTION_DISCONNECTED,
	            reconnect: true
	        });
	    }
	};

	connection.prototype.getUniqueId = function (prefix) {
	    var cdate = new Date();
	    var offdate = new Date(2010, 1, 1);
	    var offset = cdate.getTime() - offdate.getTime();
	    var hexd = parseInt(offset).toString(16);

	    if (typeof prefix === 'string' || typeof prefix === 'number') {
	        return prefix + '_' + hexd;
	    } else {
	        return 'WEBIM_' + hexd;
	    }
	};

	connection.prototype.send = function (message) {
	    var self = this;
	    if (this.isWindowSDK) {
	        WebIM.doQuery('{"type":"sendMessage","to":"' + message.to + '","message_type":"' + message.type + '","msg":"' + encodeURI(message.msg) + '","chatType":"' + message.chatType + '"}', function (response) {}, function (code, msg) {
	            var message = {
	                data: {
	                    data: "send"
	                },
	                type: _code.WEBIM_MESSAGE_SED_ERROR
	            };
	            self.onError(message);
	        });
	    } else {
	        if (Object.prototype.toString.call(message) === '[object Object]') {
	            var appKey = this.context.appKey || '';
	            var toJid = appKey + '_' + message.to + '@' + this.domain;

	            if (message.group) {
	                toJid = appKey + '_' + message.to + '@conference.' + this.domain;
	            }
	            if (message.resource) {
	                toJid = toJid + '/' + message.resource;
	            }

	            message.toJid = toJid;
	            message.id = message.id || this.getUniqueId();
	            _msgHash[message.id] = new _message(message);
	            _msgHash[message.id].send(this);
	        } else if (typeof message === 'string') {
	            _msgHash[message] && _msgHash[message].send(this);
	        }
	    }
	};

	connection.prototype.addRoster = function (options) {
	    var jid = _getJid(options, this);
	    var name = options.name || '';
	    var groups = options.groups || '';

	    var iq = $iq({ type: 'set' });
	    iq.c('query', { xmlns: 'jabber:iq:roster' });
	    iq.c('item', { jid: jid, name: name });

	    if (groups) {
	        for (var i = 0; i < groups.length; i++) {
	            iq.c('group').t(groups[i]).up();
	        }
	    }
	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || _utils.emptyfn;
	    this.context.stropheConn.sendIQ(iq.tree(), suc, error);
	};

	connection.prototype.removeRoster = function (options) {
	    var jid = _getJid(options, this);
	    var iq = $iq({ type: 'set' }).c('query', { xmlns: 'jabber:iq:roster' }).c('item', {
	        jid: jid,
	        subscription: 'remove'
	    });

	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || _utils.emptyfn;
	    this.context.stropheConn.sendIQ(iq, suc, error);
	};

	connection.prototype.getRoster = function (options) {
	    var conn = this;
	    var dom = $iq({
	        type: 'get'
	    }).c('query', { xmlns: 'jabber:iq:roster' });

	    var options = options || {};
	    var suc = options.success || this.onRoster;
	    var completeFn = function completeFn(ele) {
	        var rouster = [];
	        var msgBodies = ele.getElementsByTagName('query');
	        if (msgBodies && msgBodies.length > 0) {
	            var queryTag = msgBodies[0];
	            rouster = _parseFriend(queryTag);
	        }
	        suc(rouster, ele);
	    };
	    var error = options.error || this.onError;
	    var failFn = function failFn(ele) {
	        error({
	            type: _code.WEBIM_CONNCTION_GETROSTER_ERROR,
	            data: ele
	        });
	    };
	    if (this.isOpened()) {
	        this.context.stropheConn.sendIQ(dom.tree(), completeFn, failFn);
	    } else {
	        error({
	            type: _code.WEBIM_CONNCTION_DISCONNECTED
	        });
	    }
	};

	connection.prototype.subscribe = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'subscribe' });
	    if (options.message) {
	        pres.c('status').t(options.message).up();
	    }
	    if (options.nick) {
	        pres.c('nick', { 'xmlns': 'http://jabber.org/protocol/nick' }).t(options.nick);
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.subscribed = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'subscribed' });

	    if (options.message) {
	        pres.c('status').t(options.message).up();
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.unsubscribe = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'unsubscribe' });

	    if (options.message) {
	        pres.c('status').t(options.message);
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.unsubscribed = function (options) {
	    var jid = _getJid(options, this);
	    var pres = $pres({ to: jid, type: 'unsubscribed' });

	    if (options.message) {
	        pres.c('status').t(options.message).up();
	    }
	    this.sendCommand(pres.tree());
	};

	connection.prototype.joinPublicGroup = function (options) {
	    var roomJid = this.context.appKey + '_' + options.roomId + '@conference.' + this.domain;
	    var room_nick = roomJid + '/' + this.context.userId;
	    var suc = options.success || _utils.emptyfn;
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_JOINROOM_ERROR,
	            data: ele
	        });
	    };
	    var iq = $pres({
	        from: this.context.jid,
	        to: room_nick
	    }).c('x', { xmlns: Strophe.NS.MUC });

	    this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
	};

	connection.prototype.listRooms = function (options) {
	    var iq = $iq({
	        to: options.server || 'conference.' + this.domain,
	        from: this.context.jid,
	        type: 'get'
	    }).c('query', { xmlns: Strophe.NS.DISCO_ITEMS });

	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || this.onError;
	    var completeFn = function completeFn(result) {
	        var rooms = [];
	        rooms = _parseRoom(result);
	        try {
	            suc(rooms);
	        } catch (e) {
	            error({
	                type: _code.WEBIM_CONNCTION_GETROOM_ERROR,
	                data: e
	            });
	        }
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOM_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
	};

	connection.prototype.queryRoomMember = function (options) {
	    var domain = this.domain;
	    var members = [];
	    var iq = $iq({
	        to: this.context.appKey + '_' + options.roomId + '@conference.' + this.domain,
	        type: 'get'
	    }).c('query', { xmlns: Strophe.NS.MUC + '#admin' }).c('item', { affiliation: 'member' });

	    var suc = options.success || _utils.emptyfn;
	    var completeFn = function completeFn(result) {
	        var items = result.getElementsByTagName('item');

	        if (items) {
	            for (var i = 0; i < items.length; i++) {
	                var item = items[i];
	                var mem = {
	                    jid: item.getAttribute('jid'),
	                    affiliation: 'member'
	                };
	                members.push(mem);
	            }
	        }
	        suc(members);
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOMMEMBER_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
	};

	connection.prototype.queryRoomInfo = function (options) {
	    var domain = this.domain;
	    var iq = $iq({
	        to: this.context.appKey + '_' + options.roomId + '@conference.' + domain,
	        type: 'get'
	    }).c('query', { xmlns: Strophe.NS.DISCO_INFO });

	    var suc = options.success || _utils.emptyfn;
	    var members = [];

	    var completeFn = function completeFn(result) {
	        var settings = '';
	        var features = result.getElementsByTagName('feature');
	        if (features) {
	            settings = features[1].getAttribute('var') + '|' + features[3].getAttribute('var') + '|' + features[4].getAttribute('var');
	        }
	        switch (settings) {
	            case 'muc_public|muc_membersonly|muc_notallowinvites':
	                settings = 'PUBLIC_JOIN_APPROVAL';
	                break;
	            case 'muc_public|muc_open|muc_notallowinvites':
	                settings = 'PUBLIC_JOIN_OPEN';
	                break;
	            case 'muc_hidden|muc_membersonly|muc_allowinvites':
	                settings = 'PRIVATE_MEMBER_INVITE';
	                break;
	            case 'muc_hidden|muc_membersonly|muc_notallowinvites':
	                settings = 'PRIVATE_OWNER_INVITE';
	                break;
	        }
	        var owner = '';
	        var fields = result.getElementsByTagName('field');
	        var fieldValues = {};
	        if (fields) {
	            for (var i = 0; i < fields.length; i++) {
	                var field = fields[i];
	                var fieldVar = field.getAttribute('var');
	                var fieldSimplify = fieldVar.split('_')[1];
	                switch (fieldVar) {
	                    case 'muc#roominfo_occupants':
	                    case 'muc#roominfo_maxusers':
	                    case 'muc#roominfo_affiliations':
	                    case 'muc#roominfo_description':
	                        fieldValues[fieldSimplify] = field.textContent || field.text || '';
	                        break;
	                    case 'muc#roominfo_owner':
	                        var mem = {
	                            jid: (field.textContent || field.text) + '@' + domain,
	                            affiliation: 'owner'
	                        };
	                        members.push(mem);
	                        fieldValues[fieldSimplify] = field.textContent || field.text;
	                        break;
	                }

	                // if (field.getAttribute('label') === 'owner') {
	                //     var mem = {
	                //         jid: (field.textContent || field.text) + '@' + domain
	                //         , affiliation: 'owner'
	                //     };
	                //     members.push(mem);
	                //     break;
	                // }
	            }
	            fieldValues['name'] = result.getElementsByTagName('identity')[0].getAttribute('name');
	        }
	        log(settings, members, fieldValues);
	        suc(settings, members, fieldValues);
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOMINFO_ERROR,
	            data: ele
	        });
	    };
	    this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
	};

	connection.prototype.queryRoomOccupants = function (options) {
	    var suc = options.success || _utils.emptyfn;
	    var completeFn = function completeFn(result) {
	        var occupants = [];
	        occupants = _parseRoomOccupants(result);
	        suc(occupants);
	    };
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_GETROOMOCCUPANTS_ERROR,
	            data: ele
	        });
	    };
	    var attrs = {
	        xmlns: Strophe.NS.DISCO_ITEMS
	    };
	    var info = $iq({
	        from: this.context.jid,
	        to: this.context.appKey + '_' + options.roomId + '@conference.' + this.domain,
	        type: 'get'
	    }).c('query', attrs);
	    this.context.stropheConn.sendIQ(info.tree(), completeFn, errorFn);
	};

	connection.prototype.setUserSig = function (desc) {
	    var dom = $pres({ xmlns: 'jabber:client' });
	    desc = desc || '';
	    dom.c('status').t(desc);
	    this.sendCommand(dom.tree());
	};

	connection.prototype.setPresence = function (type, status) {
	    var dom = $pres({ xmlns: 'jabber:client' });
	    if (type) {
	        if (status) {
	            dom.c('show').t(type);
	            dom.up().c('status').t(status);
	        } else {
	            dom.c('show').t(type);
	        }
	    }
	    this.sendCommand(dom.tree());
	};

	connection.prototype.getPresence = function () {
	    var dom = $pres({ xmlns: 'jabber:client' });
	    var conn = this;
	    this.sendCommand(dom.tree());
	};

	connection.prototype.ping = function (options) {
	    var options = options || {};
	    var jid = _getJid(options, this);

	    var dom = $iq({
	        from: this.context.jid || '',
	        to: jid,
	        type: 'get'
	    }).c('ping', { xmlns: 'urn:xmpp:ping' });

	    var suc = options.success || _utils.emptyfn;
	    var error = options.error || this.onError;
	    var failFn = function failFn(ele) {
	        error({
	            type: _code.WEBIM_CONNCTION_PING_ERROR,
	            data: ele
	        });
	    };
	    if (this.isOpened()) {
	        this.context.stropheConn.sendIQ(dom.tree(), suc, failFn);
	    } else {
	        error({
	            type: _code.WEBIM_CONNCTION_DISCONNECTED
	        });
	    }
	    return;
	};

	connection.prototype.isOpened = function () {
	    return this.context.status == _code.STATUS_OPENED;
	};

	connection.prototype.isOpening = function () {
	    var status = this.context.status;
	    return status == _code.STATUS_DOLOGIN_USERGRID || status == _code.STATUS_DOLOGIN_IM;
	};

	connection.prototype.isClosing = function () {
	    return this.context.status == _code.STATUS_CLOSING;
	};

	connection.prototype.isClosed = function () {
	    return this.context.status == _code.STATUS_CLOSED;
	};

	connection.prototype.clear = function () {
	    var key = this.context.appKey;
	    if (this.errorType != _code.WEBIM_CONNCTION_DISCONNECTED) {
	        this.context = {
	            status: _code.STATUS_INIT,
	            appKey: key
	        };
	    }
	    if (this.intervalId) {
	        clearInterval(this.intervalId);
	    }
	    this.restIndex = 0;
	    this.xmppIndex = 0;

	    if (this.errorType == _code.WEBIM_CONNCTION_CLIENT_LOGOUT || this.errorType == -1) {
	        var message = {
	            data: {
	                data: "clear"
	            },
	            type: _code.WEBIM_CONNCTION_CLIENT_LOGOUT
	        };
	        this.onError(message);
	    }
	};

	connection.prototype.getChatRooms = function (options) {

	    if (!_utils.isCanSetRequestHeader) {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_NOT_SUPPORT_CHATROOM_ERROR
	        });
	        return;
	    }

	    var conn = this,
	        token = options.accessToken || this.context.accessToken;

	    if (token) {
	        var apiUrl = options.apiUrl;
	        var appName = this.context.appName;
	        var orgName = this.context.orgName;

	        if (!appName || !orgName) {
	            conn.onError({
	                type: _code.WEBIM_CONNCTION_AUTH_ERROR
	            });
	            return;
	        }

	        var suc = function suc(data, xhr) {
	            typeof options.success === 'function' && options.success(data);
	        };

	        var error = function error(res, xhr, msg) {
	            if (res.error && res.error_description) {
	                conn.onError({
	                    type: _code.WEBIM_CONNCTION_LOAD_CHATROOM_ERROR,
	                    msg: res.error_description,
	                    data: res,
	                    xhr: xhr
	                });
	            }
	        };

	        var pageInfo = {
	            pagenum: parseInt(options.pagenum) || 1,
	            pagesize: parseInt(options.pagesize) || 20
	        };

	        var opts = {
	            url: apiUrl + '/' + orgName + '/' + appName + '/chatrooms',
	            dataType: 'json',
	            type: 'GET',
	            headers: { 'Authorization': 'Bearer ' + token },
	            data: pageInfo,
	            success: suc || _utils.emptyfn,
	            error: error || _utils.emptyfn
	        };
	        _utils.ajax(opts);
	    } else {
	        conn.onError({
	            type: _code.WEBIM_CONNCTION_TOKEN_NOT_ASSIGN_ERROR
	        });
	    }
	};

	connection.prototype.joinChatRoom = function (options) {
	    var roomJid = this.context.appKey + '_' + options.roomId + '@conference.' + this.domain;
	    var room_nick = roomJid + '/' + this.context.userId;
	    var suc = options.success || _utils.emptyfn;
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_JOINCHATROOM_ERROR,
	            data: ele
	        });
	    };

	    var iq = $pres({
	        from: this.context.jid,
	        to: room_nick
	    }).c('x', { xmlns: Strophe.NS.MUC + '#user' }).c('item', { affiliation: 'member', role: 'participant' }).up().up().c('roomtype', { xmlns: 'easemob:x:roomtype', type: 'chatroom' });

	    this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
	};

	connection.prototype.quitChatRoom = function (options) {
	    var roomJid = this.context.appKey + '_' + options.roomId + '@conference.' + this.domain;
	    var room_nick = roomJid + '/' + this.context.userId;
	    var suc = options.success || _utils.emptyfn;
	    var err = options.error || _utils.emptyfn;
	    var errorFn = function errorFn(ele) {
	        err({
	            type: _code.WEBIM_CONNCTION_QUITCHATROOM_ERROR,
	            data: ele
	        });
	    };
	    var iq = $pres({
	        from: this.context.jid,
	        to: room_nick,
	        type: 'unavailable'
	    }).c('x', { xmlns: Strophe.NS.MUC + '#user' }).c('item', { affiliation: 'none', role: 'none' }).up().up().c('roomtype', { xmlns: 'easemob:x:roomtype', type: 'chatroom' });

	    this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
	};

	connection.prototype._onReceiveInviteFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var self = this;
	    var options = {
	        title: "Group invitation",
	        msg: info.user + " invites you to join into group:" + info.group_id,
	        agree: function agree() {
	            WebIM.doQuery('{"type":"acceptInvitationFromGroup","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "acceptInvitationFromGroup error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP
	                };
	                self.onError(message);
	            });
	        },
	        reject: function reject() {
	            WebIM.doQuery('{"type":"declineInvitationFromGroup","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "declineInvitationFromGroup error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP
	                };
	                self.onError(message);
	            });
	        }
	    };

	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveInviteAcceptionFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group invitation response",
	        msg: info.user + " agreed to join into group:" + info.group_id,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveInviteDeclineFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group invitation response",
	        msg: info.user + " rejected to join into group:" + info.group_id,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onAutoAcceptInvitationFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group invitation",
	        msg: "You had joined into the group:" + info.group_name + " automatically.Inviter:" + info.user,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onLeaveGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group notification",
	        msg: "You have been out of the group:" + info.group_id + ".Reason:" + info.msg,
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveJoinGroupApplication = function (info) {
	    info = eval('(' + info + ')');
	    var self = this;
	    var options = {
	        title: "Group join application",
	        msg: info.user + " applys to join into group:" + info.group_id,
	        agree: function agree() {
	            WebIM.doQuery('{"type":"acceptJoinGroupApplication","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "acceptJoinGroupApplication error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_ACCEPT_JOIN_GROUP
	                };
	                self.onError(message);
	            });
	        },
	        reject: function reject() {
	            WebIM.doQuery('{"type":"declineJoinGroupApplication","id":"' + info.group_id + '","user":"' + info.user + '"}', function (response) {}, function (code, msg) {
	                var message = {
	                    data: {
	                        data: "declineJoinGroupApplication error:" + msg
	                    },
	                    type: _code.WEBIM_CONNECTION_DECLINE_JOIN_GROUP
	                };
	                self.onError(message);
	            });
	        }
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveAcceptionFromGroup = function (info) {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group notification",
	        msg: "You had joined into the group:" + info.group_name + ".",
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onReceiveRejectionFromGroup = function () {
	    info = eval('(' + info + ')');
	    var options = {
	        title: "Group notification",
	        msg: "You have been rejected to join into the group:" + info.group_name + ".",
	        agree: function agree() {}
	    };
	    this.onConfirmPop(options);
	};
	connection.prototype._onUpdateMyGroupList = function (options) {
	    this.onUpdateMyGroupList(options);
	};
	connection.prototype._onUpdateMyRoster = function (options) {
	    this.onUpdateMyRoster(options);
	};
	connection.prototype.reconnect = function () {
	    console.log('reconnect');
	    var that = this;
	    setTimeout(function () {
	        _login(that.context.restTokenData, that);
	    }, (this.autoReconnectNumTotal == 0 ? 0 : this.autoReconnectInterval) * 1000);
	    this.autoReconnectNumTotal++;
	};

	connection.prototype.closed = function () {
	    var message = {
	        data: {
	            data: "Closed error"
	        },
	        type: _code.WEBIM_CONNECTION_CLOSED
	    };
	    this.onError(message);
	};

	// used for blacklist
	function _parsePrivacy(iq) {
	    var list = [];
	    var items = iq.getElementsByTagName('item');

	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var jid = item.getAttribute('value');
	            var order = item.getAttribute('order');
	            var type = item.getAttribute('type');
	            if (!jid) {
	                continue;
	            }
	            var n = _parseNameFromJidFn(jid);
	            list[n] = {
	                type: type,
	                order: order,
	                jid: jid,
	                name: n
	            };
	        }
	    }
	    return list;
	};

	// used for blacklist
	connection.prototype.getBlacklist = function (options) {
	    options = options || {};
	    var iq = $iq({ type: 'get' });
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var me = this;

	    iq.c('query', { xmlns: 'jabber:iq:privacy' }).c('list', { name: 'special' });

	    this.context.stropheConn.sendIQ(iq.tree(), function (iq) {
	        me.onBlacklistUpdate(_parsePrivacy(iq));
	        sucFn();
	    }, function () {
	        me.onBlacklistUpdate([]);
	        errFn();
	    });
	};

	// used for blacklist
	connection.prototype.addToBlackList = function (options) {
	    var iq = $iq({ type: 'set' });
	    var blacklist = options.list || {};
	    var type = options.type || 'jid';
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var piece = iq.c('query', { xmlns: 'jabber:iq:privacy' }).c('list', { name: 'special' });

	    var keys = Object.keys(blacklist);
	    var len = keys.length;
	    var order = 2;

	    for (var i = 0; i < len; i++) {
	        var item = blacklist[keys[i]];
	        var type = item.type || 'jid';
	        var jid = item.jid;

	        piece = piece.c('item', { action: 'deny', order: order++, type: type, value: jid }).c('message');
	        if (i !== len - 1) {
	            piece = piece.up().up();
	        }
	    }

	    // log('addToBlackList', blacklist, piece.tree());
	    this.context.stropheConn.sendIQ(piece.tree(), sucFn, errFn);
	};

	// used for blacklist
	connection.prototype.removeFromBlackList = function (options) {

	    var iq = $iq({ type: 'set' });
	    var blacklist = options.list || {};
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var piece = iq.c('query', { xmlns: 'jabber:iq:privacy' }).c('list', { name: 'special' });

	    var keys = Object.keys(blacklist);
	    var len = keys.length;

	    for (var i = 0; i < len; i++) {
	        var item = blacklist[keys[i]];
	        var type = item.type || 'jid';
	        var jid = item.jid;
	        var order = item.order;

	        piece = piece.c('item', { action: 'deny', order: order, type: type, value: jid }).c('message');
	        if (i !== len - 1) {
	            piece = piece.up().up();
	        }
	    }

	    // log('removeFromBlackList', blacklist, piece.tree());
	    this.context.stropheConn.sendIQ(piece.tree(), sucFn, errFn);
	};

	connection.prototype._getGroupJid = function (to) {
	    var appKey = this.context.appKey || '';
	    return appKey + '_' + to + '@conference.' + this.domain;
	};

	// used for blacklist
	connection.prototype.addToGroupBlackList = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var jid = _getJid(options, this);
	    var affiliation = 'admin'; //options.affiliation || 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'outcast',
	        jid: jid
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), sucFn, errFn);
	};

	function _parseGroupBlacklist(iq) {
	    var list = {};
	    var items = iq.getElementsByTagName('item');

	    if (items) {
	        for (var i = 0; i < items.length; i++) {
	            var item = items[i];
	            var jid = item.getAttribute('jid');
	            var affiliation = item.getAttribute('affiliation');
	            var nick = item.getAttribute('nick');
	            if (!jid) {
	                continue;
	            }
	            var n = _parseNameFromJidFn(jid);
	            list[n] = {
	                jid: jid,
	                affiliation: affiliation,
	                nick: nick,
	                name: n
	            };
	        }
	    }
	    return list;
	}

	// used for blacklist
	connection.prototype.getGroupBlacklist = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // var jid = _getJid(options, this);
	    var affiliation = 'admin'; //options.affiliation || 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'get', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'outcast'
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        log('getGroupBlackList');
	        sucFn(_parseGroupBlacklist(msginfo));
	    }, function () {
	        errFn();
	    });
	};

	// used for blacklist
	connection.prototype.removeGroupMemberFromBlacklist = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    var jid = _getJid(options, this);
	    var affiliation = 'admin'; //options.affiliation || 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'member',
	        jid: jid
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        sucFn();
	    }, function () {
	        errFn();
	    });
	};

	/**
	 * changeGroupSubject 修改群名称
	 *
	 * @param options
	 */
	// <iq to='easemob-demo#chatdemoui_roomid@conference.easemob.com' type='set' id='3940489311' xmlns='jabber:client'>
	//     <query xmlns='http://jabber.org/protocol/muc#owner'>
	//         <x type='submit' xmlns='jabber:x:data'>
	//             <field var='FORM_TYPE'><value>http://jabber.org/protocol/muc#roomconfig</value></field>
	//             <field var='muc#roomconfig_roomname'><value>Room Name</value></field>
	//         </x>
	//     </query>
	// </iq>
	connection.prototype.changeGroupSubject = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // must be `owner`
	    var affiliation = 'owner';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('x', { type: 'submit', xmlns: 'jabber:x:data' }).c('field', { 'var': 'FORM_TYPE' }).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up().c('field', { 'var': 'muc#roomconfig_roomname' }).c('value').t(options.subject).up().up().c('field', { 'var': 'muc#roomconfig_roomdesc' }).c('value').t(options.description);

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        sucFn();
	    }, function () {
	        errFn();
	    });
	};

	/**
	 * destroyGroup 删除群组
	 *
	 * @param options
	 */
	// <iq id="9BEF5D20-841A-4048-B33A-F3F871120E58" to="easemob-demo#chatdemoui_1477462231499@conference.easemob.com" type="set">
	//     <query xmlns="http://jabber.org/protocol/muc#owner">
	//         <destroy>
	//             <reason>xxx destory group yyy</reason>
	//         </destroy>
	//     </query>
	// </iq>
	connection.prototype.destroyGroup = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // must be `owner`
	    var affiliation = 'owner';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('destroy').c('reason').t(options.reason || '');

	    this.context.stropheConn.sendIQ(iq.tree(), function (msginfo) {
	        sucFn();
	    }, function () {
	        errFn();
	    });
	};

	/**
	 * leaveGroupBySelf 主动离开群组
	 *
	 * @param options
	 */
	// <iq id="5CD33172-7B62-41B7-98BC-CE6EF840C4F6_easemob_occupants_change_affiliation" to="easemob-demo#chatdemoui_1477481609392@conference.easemob.com" type="set">
	//     <query xmlns="http://jabber.org/protocol/muc#admin">
	//         <item affiliation="none" jid="easemob-demo#chatdemoui_lwz2@easemob.com"/>
	//     </query>
	// </iq>
	connection.prototype.leaveGroupBySelf = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;

	    // must be `owner`
	    var jid = _getJid(options, this);
	    var affiliation = 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });

	    iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation }).c('item', {
	        affiliation: 'none',
	        jid: jid
	    });

	    this.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	        sucFn(msgInfo);
	    }, function (errInfo) {
	        errFn(errInfo);
	    });
	};

	/**
	 * leaveGroup 被踢出群组
	 *
	 * @param options
	 */
	// <iq id="9fb25cf4-1183-43c9-961e-9df70e300de4:sendIQ" to="easemob-demo#chatdemoui_1477481597120@conference.easemob.com" type="set" xmlns="jabber:client">
	//     <query xmlns="http://jabber.org/protocol/muc#admin">
	//         <item affiliation="none" jid="easemob-demo#chatdemoui_lwz4@easemob.com"/>
	//         <item jid="easemob-demo#chatdemoui_lwz4@easemob.com" role="none"/>
	//         <item affiliation="none" jid="easemob-demo#chatdemoui_lwz2@easemob.com"/>
	//         <item jid="easemob-demo#chatdemoui_lwz2@easemob.com" role="none"/>
	//     </query>
	// </iq>
	connection.prototype.leaveGroup = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var list = options.list || [];
	    var affiliation = 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });
	    var piece = iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation });
	    var keys = Object.keys(list);
	    var len = keys.length;

	    for (var i = 0; i < len; i++) {
	        var name = list[keys[i]];
	        var jid = _getJidByName(name, this);

	        piece = piece.c('item', {
	            affiliation: 'none',
	            jid: jid
	        }).up().c('item', {
	            role: 'none',
	            jid: jid
	        }).up();
	    }

	    this.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	        sucFn(msgInfo);
	    }, function (errInfo) {
	        errFn(errInfo);
	    });
	};

	/**
	 * addGroupMembers 添加群组成员
	 *
	 * @param options

	 Attention the sequence: message first (每个成员单独发一条message), iq second (多个成员可以合成一条iq发)
	 <!-- 添加成员通知：send -->
	 <message to='easemob-demo#chatdemoui_1477482739698@conference.easemob.com'>
	 <x xmlns='http://jabber.org/protocol/muc#user'>
	 <invite to='easemob-demo#chatdemoui_lwz2@easemob.com'>
	 <reason>liuwz invite you to join group '谢谢'</reason>
	 </invite>
	 </x>
	 </message>
	 <!-- 添加成员：send -->
	 <iq id='09DFB1E5-C939-4C43-B5A7-8000DA0E3B73_easemob_occupants_change_affiliation' to='easemob-demo#chatdemoui_1477482739698@conference.easemob.com' type='set'>
	 <query xmlns='http://jabber.org/protocol/muc#admin'>
	 <item affiliation='member' jid='easemob-demo#chatdemoui_lwz2@easemob.com'/>
	 </query>
	 </iq>
	 */

	connection.prototype.addGroupMembers = function (options) {
	    var sucFn = options.success || _utils.emptyfn;
	    var errFn = options.error || _utils.emptyfn;
	    var list = options.list || [];
	    var affiliation = 'admin';
	    var to = this._getGroupJid(options.roomId);
	    var iq = $iq({ type: 'set', to: to });
	    var piece = iq.c('query', { xmlns: 'http://jabber.org/protocol/muc#' + affiliation });
	    var len = list.length;

	    for (var i = 0; i < len; i++) {

	        var name = list[i];
	        var jid = _getJidByName(name, this);

	        piece = piece.c('item', {
	            affiliation: 'member',
	            jid: jid
	        }).up();

	        var dom = $msg({
	            to: to
	        }).c('x', {
	            xmlns: 'http://jabber.org/protocol/muc#user'
	        }).c('invite', {
	            to: jid
	        }).c('reason').t(options.reason || '');

	        this.sendCommand(dom.tree());
	    }

	    this.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	        sucFn(msgInfo);
	    }, function (errInfo) {
	        errFn(errInfo);
	    });
	};

	/**
	 * acceptInviteFromGroup 接受加入申请
	 *
	 * @param options
	 */
	connection.prototype.acceptInviteFromGroup = function (options) {
	    options.success = function () {
	        // then send sendAcceptInviteMessage
	        // connection.prototype.sendAcceptInviteMessage(optoins);
	    };
	    this.addGroupMembers(options);
	};

	/**
	 * rejectInviteFromGroup 拒绝入群申请
	 *
	 * throw request for now 暂时不处理，直接丢弃
	 *
	 <message to='easemob-demo#chatdemoui_mt002@easemob.com' from='easmeob-demo#chatdemoui_mt001@easemob.com' id='B83B7210-BCFF-4DEE-AB28-B9FE5579C1E2'>
	 <x xmlns='http://jabber.org/protocol/muc#user'>
	 <apply to='easemob-demo#chatdemoui_groupid1@conference.easemob.com' from='easmeob-demo#chatdemoui_mt001@easemob.com' toNick='llllll'>
	 <reason>reject</reason>
	 </apply>
	 </x>
	 </message>
	 *
	 * @param options
	 */
	connection.prototype.rejectInviteFromGroup = function (options) {
	    // var from = _getJidByName(options.from, this);
	    // var dom = $msg({
	    //     from: from,
	    //     to: _getJidByName(options.to, this)
	    // }).c('x', {
	    //     xmlns: 'http://jabber.org/protocol/muc#user'
	    // }).c('apply', {
	    //     from: from,
	    //     to: this._getGroupJid(options.groupId),
	    //     toNick: options.groupName
	    // }).c('reason').t(options.reason || '');
	    //
	    // this.sendCommand(dom.tree());
	};

	/**
	 * createGroup 创建群组
	 *
	 * 1. 创建申请 -> 得到房主身份
	 * 2. 获取房主信息 -> 得到房间form
	 * 3. 完善房间form -> 创建成功
	 * 4. 添加房间成员
	 * 5. 消息通知成员
	 * @param options
	 */
	connection.prototype.createGroup = function (options) {
	    var roomId = +new Date();
	    var toRoom = this._getGroupJid(roomId);
	    var to = toRoom + '/' + this.context.userId;

	    var pres = $pres({ to: to }).c('x', { xmlns: 'http://jabber.org/protocol/muc' }).up().c('create', { xmlns: 'http://jabber.org/protocol/muc' }).up();
	    // .c('c', {
	    //     hash: 'sha-1',
	    //     node: 'https://github.com/robbiehanson/XMPPFramework',
	    //     ver: 'k6gP4Ua5m4uu9YorAG0LRXM+kZY=',
	    //     xmlns: 'http://jabber.org/protocol/caps'
	    // }).up();

	    // createGroupACK
	    this.sendCommand(pres.tree());

	    var me = this;
	    // timeout hack for create group async
	    setTimeout(function () {
	        // Creating a Reserved Room
	        var iq = $iq({ type: 'get', to: toRoom }).c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' });

	        // Strophe.info('step 1 ----------');
	        // Strophe.info(options);
	        me.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	            // log(msgInfo);

	            // for ie hack
	            if ('setAttribute' in msgInfo) {
	                // Strophe.info('step 3 ----------');
	                var x = msgInfo.getElementsByTagName('x')[0];
	                x.setAttribute('type', 'submit');
	            } else {
	                // Strophe.info('step 4 ----------');
	                Strophe.forEachChild(msgInfo, 'x', function (field) {
	                    field.setAttribute('type', 'submit');
	                });
	            }

	            // var rcv = msgInfo.getElementsByTagName('x');
	            // var v;
	            // if (rcv.length > 0) {
	            //     if (rcv[0].childNodes && rcv[0].childNodes.length > 0) {
	            //         v = rcv[0].childNodes[0].nodeValue;
	            //     } else {
	            //         v = rcv[0].innerHTML || rcv[0].innerText
	            //     }
	            //     mid = rcv[0].getAttribute('mid');
	            // }
	            Strophe.info('step 5 ----------');
	            Strophe.forEachChild(x, 'field', function (field) {
	                var fieldVar = field.getAttribute('var');
	                var valueDom = field.getElementsByTagName('value')[0];
	                Strophe.info(fieldVar);
	                switch (fieldVar) {
	                    case 'muc#roomconfig_roomname':
	                        _setText(valueDom, options.subject || '');
	                        break;
	                    case 'muc#roomconfig_roomdesc':
	                        _setText(valueDom, options.description || '');
	                        break;
	                    case 'muc#roomconfig_publicroom':
	                        // public 1
	                        _setText(valueDom, +options.optionsPublic);
	                        break;
	                    case 'muc#roomconfig_membersonly':
	                        _setText(valueDom, +options.optionsMembersOnly);
	                        break;
	                    case 'muc#roomconfig_moderatedroom':
	                        _setText(valueDom, +options.optionsModerate);
	                        break;
	                    case 'muc#roomconfig_persistentroom':
	                        _setText(valueDom, 1);
	                        break;
	                    case 'muc#roomconfig_allowinvites':
	                        _setText(valueDom, +options.optionsAllowInvites);
	                        break;
	                    case 'muc#roomconfig_allowvisitornickchange':
	                        _setText(valueDom, 0);
	                        break;
	                    case 'muc#roomconfig_allowvisitorstatus':
	                        _setText(valueDom, 0);
	                        break;
	                    case 'allow_private_messages':
	                        _setText(valueDom, 0);
	                        break;
	                    case 'allow_private_messages_from_visitors':
	                        _setText(valueDom, 'nobody');
	                        break;
	                    default:
	                        break;
	                }
	                // log(valueDom);
	            });

	            var iq = $iq({ to: toRoom, type: 'set' }).c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' }).cnode(x);

	            // log(iq.tree());

	            me.context.stropheConn.sendIQ(iq.tree(), function (msgInfo) {
	                // sucFn(msgInfo);

	                me.addGroupMembers({
	                    list: options.members,
	                    roomId: roomId
	                });
	            }, function (errInfo) {
	                // errFn(errInfo);
	            });
	            // sucFn(msgInfo);
	        }, function (errInfo) {
	            // errFn(errInfo);
	        });
	    }, 1000);
	};

	function _setText(valueDom, v) {
	    if ('textContent' in valueDom) {
	        valueDom.textContent = v;
	    } else if ('text' in valueDom) {
	        valueDom.text = v;
	    } else {
	        // Strophe.info('_setText 4 ----------');
	        // valueDom.innerHTML = v;
	    }
	}

	var WebIM = window.WebIM || {};
	WebIM.connection = connection;
	WebIM.utils = _utils;
	WebIM.statusCode = _code;
	WebIM.message = _msg.message;
	WebIM.doQuery = function (str, suc, fail) {
	    if (typeof window.cefQuery === 'undefined') {
	        return;
	    }
	    window.cefQuery({
	        request: str,
	        persistent: false,
	        onSuccess: suc,
	        onFailure: fail
	    });
	};

	module.exports = WebIM;

	if (false) {
	    module.hot.accept();
	}

/***/ },

/***/ 232:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	;(function () {
	    'use strict';

	    var _utils = __webpack_require__(223).utils;
	    var Message = function Message(type, id) {
	        if (!this instanceof Message) {
	            return new Message(type);
	        }

	        this._msg = {};

	        if (typeof Message[type] === 'function') {
	            Message[type].prototype.setGroup = this.setGroup;
	            this._msg = new Message[type](id);
	        }
	        return this._msg;
	    };
	    Message.prototype.setGroup = function (group) {
	        this.body.group = group;
	    };

	    /*
	     * text message
	     */
	    Message.txt = function (id) {
	        this.id = id;
	        this.type = 'txt';
	        this.body = {};
	    };
	    Message.txt.prototype.set = function (opt) {
	        this.value = opt.msg;
	        this.body = {
	            id: this.id,
	            to: opt.to,
	            msg: this.value,
	            type: this.type,
	            roomType: opt.roomType,
	            ext: opt.ext || {},
	            success: opt.success,
	            fail: opt.fail
	        };

	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * cmd message
	     */
	    Message.cmd = function (id) {
	        this.id = id;
	        this.type = 'cmd';
	        this.body = {};
	    };
	    Message.cmd.prototype.set = function (opt) {
	        this.value = '';

	        this.body = {
	            to: opt.to,
	            action: opt.action,
	            msg: this.value,
	            type: this.type,
	            roomType: opt.roomType,
	            ext: opt.ext || {},
	            success: opt.success
	        };
	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * loc message
	     */
	    Message.location = function (id) {
	        this.id = id;
	        this.type = 'loc';
	        this.body = {};
	    };
	    Message.location.prototype.set = function (opt) {
	        this.body = {
	            to: opt.to,
	            type: this.type,
	            roomType: opt.roomType,
	            addr: opt.addr,
	            lat: opt.lat,
	            lng: opt.lng,
	            ext: opt.ext || {}
	        };
	    };

	    /*
	     * img message
	     */
	    Message.img = function (id) {
	        this.id = id;
	        this.type = 'img';
	        this.body = {};
	    };
	    Message.img.prototype.set = function (opt) {
	        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

	        this.value = opt.file;

	        this.body = {
	            id: this.id,
	            file: this.value,
	            apiUrl: opt.apiUrl,
	            to: opt.to,
	            type: this.type,
	            ext: opt.ext || {},
	            roomType: opt.roomType,
	            onFileUploadError: opt.onFileUploadError,
	            onFileUploadComplete: opt.onFileUploadComplete,
	            success: opt.success,
	            fail: opt.fail,
	            flashUpload: opt.flashUpload,
	            width: opt.width,
	            height: opt.height,
	            body: opt.body,
	            uploadError: opt.uploadError,
	            uploadComplete: opt.uploadComplete
	        };

	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * audio message
	     */
	    Message.audio = function (id) {
	        this.id = id;
	        this.type = 'audio';
	        this.body = {};
	    };
	    Message.audio.prototype.set = function (opt) {
	        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

	        this.value = opt.file;
	        this.filename = opt.filename || this.value.filename;

	        this.body = {
	            id: this.id,
	            file: this.value,
	            filename: this.filename,
	            apiUrl: opt.apiUrl,
	            to: opt.to,
	            type: this.type,
	            ext: opt.ext || {},
	            length: opt.length || 0,
	            roomType: opt.roomType,
	            file_length: opt.file_length,
	            onFileUploadError: opt.onFileUploadError,
	            onFileUploadComplete: opt.onFileUploadComplete,
	            success: opt.success,
	            fail: opt.fail,
	            flashUpload: opt.flashUpload,
	            body: opt.body
	        };
	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * file message
	     */
	    Message.file = function (id) {
	        this.id = id;
	        this.type = 'file';
	        this.body = {};
	    };
	    Message.file.prototype.set = function (opt) {
	        opt.file = opt.file || _utils.getFileUrl(opt.fileInputId);

	        this.value = opt.file;
	        this.filename = opt.filename || this.value.filename;

	        this.body = {
	            id: this.id,
	            file: this.value,
	            filename: this.filename,
	            apiUrl: opt.apiUrl,
	            to: opt.to,
	            type: this.type,
	            ext: opt.ext || {},
	            roomType: opt.roomType,
	            onFileUploadError: opt.onFileUploadError,
	            onFileUploadComplete: opt.onFileUploadComplete,
	            success: opt.success,
	            fail: opt.fail,
	            flashUpload: opt.flashUpload,
	            body: opt.body
	        };
	        !opt.roomType && delete this.body.roomType;
	    };

	    /*
	     * video message
	     */
	    Message.video = function (id) {};
	    Message.video.prototype.set = function (opt) {};

	    var _Message = function _Message(message) {

	        if (!this instanceof _Message) {
	            return new _Message(message, conn);
	        }

	        this.msg = message;
	    };

	    _Message.prototype.send = function (conn) {
	        var me = this;

	        var _send = function _send(message) {

	            message.ext = message.ext || {};
	            message.ext.weichat = message.ext.weichat || {};
	            message.ext.weichat.originType = message.ext.weichat.originType || 'webim';

	            var json = {
	                from: conn.context.userId || '',
	                to: message.to,
	                bodies: [message.body],
	                ext: message.ext || {}
	            };

	            var jsonstr = _utils.stringify(json);
	            var dom = $msg({
	                type: message.group || 'chat',
	                to: message.toJid,
	                id: message.id,
	                xmlns: 'jabber:client'
	            }).c('body').t(jsonstr);

	            if (message.roomType) {
	                dom.up().c('roomtype', { xmlns: 'easemob:x:roomtype', type: 'chatroom' });
	            }

	            setTimeout(function () {
	                if (typeof _msgHash !== 'undefined' && _msgHash[message.id]) {
	                    _msgHash[message.id].msg.fail instanceof Function && _msgHash[message.id].msg.fail(message.id);
	                }
	            }, 60000);
	            conn.sendCommand(dom.tree(), message.id);
	        };

	        if (me.msg.file) {
	            if (me.msg.body && me.msg.body.url) {
	                // Only send msg
	                _send(me.msg);
	                return;
	            }
	            var _tmpComplete = me.msg.onFileUploadComplete;
	            var _complete = function _complete(data) {

	                if (data.entities[0]['file-metadata']) {
	                    var file_len = data.entities[0]['file-metadata']['content-length'];
	                    me.msg.file_length = file_len;
	                    me.msg.filetype = data.entities[0]['file-metadata']['content-type'];
	                    if (file_len > 204800) {
	                        me.msg.thumbnail = true;
	                    }
	                }

	                me.msg.body = {
	                    type: me.msg.type || 'file',

	                    url: (location.protocol != 'https:' && conn.isHttpDNS ? conn.apiUrl + data.uri.substr(data.uri.indexOf("/", 9)) : data.uri) + '/' + data.entities[0]['uuid'],
	                    secret: data.entities[0]['share-secret'],
	                    filename: me.msg.file.filename || me.msg.filename,
	                    size: {
	                        width: me.msg.width || 0,
	                        height: me.msg.height || 0
	                    },
	                    length: me.msg.length || 0,
	                    file_length: me.msg.file_length || 0,
	                    filetype: me.msg.filetype
	                };
	                _send(me.msg);
	                _tmpComplete instanceof Function && _tmpComplete(data, me.msg.id);
	            };

	            me.msg.onFileUploadComplete = _complete;
	            _utils.uploadFile.call(conn, me.msg);
	        } else {
	            me.msg.body = {
	                type: me.msg.type === 'chat' ? 'txt' : me.msg.type,
	                msg: me.msg.msg
	            };
	            if (me.msg.type === 'cmd') {
	                me.msg.body.action = me.msg.action;
	            } else if (me.msg.type === 'loc') {
	                me.msg.body.addr = me.msg.addr;
	                me.msg.body.lat = me.msg.lat;
	                me.msg.body.lng = me.msg.lng;
	            }

	            _send(me.msg);
	        }
	    };

	    exports._msg = _Message;
	    exports.message = Message;
	})();

/***/ },

/***/ 233:
/***/ function(module, exports) {

	"use strict";

	;(function () {
	    function Array_h(length) {
	        this.array = length === undefined ? [] : new Array(length);
	    }

	    Array_h.prototype = {
	        /**
	         * 返回数组长度
	         *
	         * @return {Number} length [数组长度]
	         */
	        length: function length() {
	            return this.array.length;
	        },

	        at: function at(index) {
	            return this.array[index];
	        },

	        set: function set(index, obj) {
	            this.array[index] = obj;
	        },

	        /**
	         * 向数组的末尾添加一个或多个元素，并返回新的长度。
	         *
	         * @param  {*} obj [description]
	         * @return {Number} length [新数组的长度]
	         */
	        push: function push(obj) {
	            return this.array.push(obj);
	        },

	        /**
	         * 返回数组中选定的元素
	         *
	         * @param  {Number} start [开始索引值]
	         * @param  {Number} end [结束索引值]
	         * @return {Array} newArray  [新的数组]
	         */
	        slice: function slice(start, end) {
	            return this.array = this.array.slice(start, end);
	        },

	        concat: function concat(array) {
	            this.array = this.array.concat(array);
	        },

	        remove: function remove(index, count) {
	            count = count === undefined ? 1 : count;
	            this.array.splice(index, count);
	        },

	        join: function join(separator) {
	            return this.array.join(separator);
	        },

	        clear: function clear() {
	            this.array.length = 0;
	        }
	    };

	    /**
	     * 先进先出队列 (First Input First Output)
	     *
	     * 一种先进先出的数据缓存器
	     */
	    var Queue = function Queue() {
	        this._array_h = new Array_h();
	    };

	    Queue.prototype = {
	        _index: 0,

	        /**
	         * 排队
	         *
	         * @param  {Object} obj [description]
	         * @return {[type]}     [description]
	         */
	        push: function push(obj) {
	            this._array_h.push(obj);
	        },

	        /**
	         * 出队
	         *
	         * @return {Object} [description]
	         */
	        pop: function pop() {
	            var ret = null;
	            if (this._array_h.length()) {
	                ret = this._array_h.at(this._index);
	                if (++this._index * 2 >= this._array_h.length()) {
	                    this._array_h.slice(this._index);
	                    this._index = 0;
	                }
	            }
	            return ret;
	        },

	        /**
	         * 返回队列中头部(即最新添加的)的动态对象
	         *
	         * @return {Object} [description]
	         */
	        head: function head() {
	            var ret = null,
	                len = this._array_h.length();
	            if (len) {
	                ret = this._array_h.at(len - 1);
	            }
	            return ret;
	        },

	        /**
	         * 返回队列中尾部(即最早添加的)的动态对象
	         *
	         * @return {Object} [description]
	         */
	        tail: function tail() {
	            var ret = null,
	                len = this._array_h.length();
	            if (len) {
	                ret = this._array_h.at(this._index);
	            }
	            return ret;
	        },

	        /**
	         * 返回数据队列长度
	         *
	         * @return {Number} [description]
	         */
	        length: function length() {
	            return this._array_h.length() - this._index;
	        },

	        /**
	         * 队列是否为空
	         *
	         * @return {Boolean} [description]
	         */
	        empty: function empty() {
	            return this._array_h.length() === 0;
	        },

	        clear: function clear() {
	            this._array_h.clear();
	        }
	    };
	    exports.Queue = Queue;
	})();

/***/ }

/******/ });
/**************************************************************************
***							 Easemob WebIm Js SDK					***
***							 v1.1.1								  ***
**************************************************************************/
/**
 * Module1: Utility
 * Module2: EmMessage
 * Module3: Message
 * Module4: Connection
 */

;(function ( window, undefined ) {

	if ( typeof Strophe === 'undefined' ) {
		throw 'need Strophe';
	}

	var Easemob = Easemob || {};
	Easemob.im = Easemob.im || {};
	Easemob.im.version = "1.1.1";

	var https = location.protocol === 'https:';

	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

	Strophe.Websocket.prototype._closeSocket = function () {
		var me = this;
		if ( me.socket ) {
			setTimeout(function () {
				try {
					me.socket.close();
				} catch ( e ) {}
			}, 0);
		} else {
			me.socket = null;
		}
	}

	/**
	 * Module1: Utility
	 */
	var Utils = (function () {
		
		var _createStandardXHR = function () {
			try {
				return new window.XMLHttpRequest();
			} catch ( e ) {
				return false;
			}
		};
		
		var _createActiveXHR = function () {
			try {
				return new window.ActiveXObject( "Microsoft.XMLHTTP" );
			} catch ( e ) {
				return false;
			}
		};
// todo 尽早去除旧的sdk
// 此处代码与新sdk共存时在IE8 会堆栈溢出
		// if ( window.XDomainRequest ) {
		// 	XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
		// 	XDomainRequest.prototype.send = function () {
		// 		XDomainRequest.prototype.oldsend.apply(this, arguments);
		// 		this.readyState = 2;
		// 	};
		// }

		Strophe.Request.prototype._newXHR = function () {
			var xhr =  Utils.xmlrequest(true);
			if ( xhr.overrideMimeType ) {
				xhr.overrideMimeType("text/xml");
			}
			xhr.onreadystatechange = this.func.stropheBind(null, this);
			return xhr;
		};

		var _xmlrequest = function ( crossDomain ) {
			crossDomain = crossDomain || true;
			var temp = _createStandardXHR () || _createActiveXHR();

			if ( "withCredentials" in temp ) {
				return temp;
			}
			if ( !crossDomain ) {
				return temp;
			}
			if ( typeof window.XDomainRequest === 'undefined' ) {
				return temp;
			}
			var xhr = new XDomainRequest();
			xhr.readyState = 0;
			xhr.status = 100;
			xhr.onreadystatechange = EMPTYFN;
			xhr.onload = function () {
				xhr.readyState = 4;
				xhr.status = 200;

				var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xhr.responseText);
				xhr.responseXML = xmlDoc;
				xhr.response = xhr.responseText;
				xhr.onreadystatechange();
			};
			xhr.ontimeout = xhr.onerror = function () {
				xhr.readyState = 4;
				xhr.status = 500;
				xhr.onreadystatechange();
			};
			return xhr;
		};

		var _hasFlash = (function () {
			if ( 'ActiveXObject' in window ) {
				try {
					return new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				} catch ( ex ) {
					return 0;
				}
			} else {
				if ( navigator.plugins && navigator.plugins.length > 0 ) {
					return navigator.plugins["Shockwave Flash"];
				}
			}
			return 0;
		}());

		var _tmpUtilXHR  = _xmlrequest(),
			_hasFormData = typeof FormData !== 'undefined',
			_hasBlob = typeof Blob !== 'undefined',
			_isCanSetRequestHeader = _tmpUtilXHR.setRequestHeader || false,
			_hasOverrideMimeType = _tmpUtilXHR.overrideMimeType || false,
			_isCanUploadFileAsync = _isCanSetRequestHeader && _hasFormData,
			_isCanUploadFile = _isCanUploadFileAsync || _hasFlash,
			_isCanDownLoadFile = _isCanSetRequestHeader && (_hasBlob || _hasOverrideMimeType);

		return {
			hasFormData: _hasFormData

			, hasBlob: _hasBlob

			, isCanSetRequestHeader: _isCanSetRequestHeader

			, hasOverrideMimeType: _hasOverrideMimeType

			, isCanUploadFileAsync: _isCanUploadFileAsync

			, isCanUploadFile: _isCanUploadFile

			, isCanDownLoadFile: _isCanDownLoadFile

			, isSupportWss: (function () {
				var notSupportList = [
					//1:qq broswser X5 core
					/MQQBrowser[\/]5([.]\d+)?\sTBS/

					//2:etc.
					//...
				];

				if ( !window.WebSocket ) {
					return false;
				}

				var ua = window.navigator.userAgent;
				for ( var i = 0, l = notSupportList.length; i < l; i++ ) {
					if ( notSupportList[i].test(ua) ) {
						return false;
					}
				}
				return true; 
			}())

			, stringify: function ( json ) {
				if ( typeof JSON !== 'undefined' && JSON.stringify ) {
					return JSON.stringify(json);
				} else {
					var s = '',
						arr = [];

					var iterate = function ( json ) {
						var isArr = false;

						if ( Object.prototype.toString.call(json) === '[object Array]' ) {
							arr.push(']', '[');
							isArr = true;
						} else if ( Object.prototype.toString.call(json) === '[object Object]' ) {
							arr.push('}', '{');
						}

						for ( var o in json ) {
							if ( Object.prototype.toString.call(json[o]) === '[object Null]' ) {
								json[o] = 'null';
							} else if ( Object.prototype.toString.call(json[o]) === '[object Undefined]' ) {
								json[o] = 'undefined';
							}

							if ( json[o] && typeof json[o] === 'object' ) {
								s += ',' + (isArr ? '' : '"' + o + '":' + (isArr ? '"' : '')) + iterate(json[o]) + '';
							} else {
								s += ',"' + (isArr ? '' : o + '":"') + json[o] + '"';
							}
						}
				
						if ( s != '' ) {
							s = s.slice(1);
						}

						return arr.pop() + s + arr.pop();
					}
					return iterate(json);
				}
			}

			, registerUser: function ( options ) {
				var orgName = options.orgName || '';
				var appName = options.appName || '';
				var appKey = options.appKey || '';

				if ( !orgName && !appName && appKey ) {
					var devInfos = appKey.split('#');
					if ( devInfos.length === 2 ) {
						orgName = devInfos[0];
						appName = devInfos[1];
					}
				}
				if ( !orgName && !appName ) {
					options.error({
						type: EASEMOB_IM_RESISTERUSER_ERROR
						, msg: '没有指定开发者信息'
					});
					return;
				}

				var https = options.https || https;
				var apiUrl = options.apiUrl || (https ? 'https' : 'http') + '://a1.easemob.com';
				var restUrl = apiUrl + '/' + orgName + '/' + appName + '/users';

				var userjson = {
					username: options.username
					, password: options.password
					, nickname: options.nickname || ''
				};

				var userinfo = Utils.stringify(userjson);
				var options = {
					url: restUrl
					, dataType: 'json'
					, data: userinfo
					, success: options.success || EMPTYFN
					, error: options.error || EMPTYFN
				};
				return Utils.ajax(options);
			}

			, login2UserGrid: function ( options ) {
				options = options || {};

				var appKey = options.appKey || '';
				var devInfos = appKey.split('#');
				if ( devInfos.length !== 2 ) {
					error({
						type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
						, msg: '请指定正确的开发者信息(appKey)'
					});
					return false;
				}

				var orgName = devInfos[0];
				var appName = devInfos[1];
				if ( !orgName ) {
					error({
						type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
						, msg: '请指定正确的开发者信息(appKey)'
					});
					return false;
				}
				if ( !appName ) {
					error({
						type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
						, msg: '请指定正确的开发者信息(appKey)'
					});
					return false;
				}

				var https = https || options.https;
				var suc = options.success || EMPTYFN;
				var error = options.error || EMPTYFN;
				var user = options.user || '';
				var pwd = options.pwd || '';

				var apiUrl = options.apiUrl || (https ? 'https' : 'http') + '://a1.easemob.com';

				var loginJson = {
					grant_type: 'password'
					, username: user
					, password: pwd
				};
				var loginfo = Utils.stringify(loginJson);

				var options = {
					url: apiUrl + "/" + orgName + "/" + appName + "/token"
					, dataType: 'json'
					, data: loginfo
					, success: suc || EMPTYFN
					, error: error || EMPTYFN
				};
				return Utils.ajax(options);
			}
			, getFileUrl: function ( fileInputId ) {
				var uri = {
					url: ''
					, filename: ''
					, filetype: ''
					, data: ''
				};

				var fileObj = document.getElementById(fileInputId);

				if ( !Utils.isCanUploadFileAsync || !fileObj ) {
					return uri;
				}

				if ( window.URL.createObjectURL ) {
					var fileItems = fileObj.files;
					if (fileItems.length > 0) {
						var u = fileItems.item(0);
						uri.data = u;
						uri.url = window.URL.createObjectURL(u);
						uri.filename = u.name || '';
					}
				} else { // IE
					var u = document.getElementById(fileInputId).value;
					uri.url = u;
					var pos1 = u.lastIndexOf('/');
					var pos2 = u.lastIndexOf('\\');
					var pos = Math.max(pos1, pos2)
					if (pos < 0)
						uri.filename = u;
					else
						uri.filename = u.substring(pos + 1);
				}
				var index = uri.filename.lastIndexOf(".");
				if ( index != -1 ) {
					uri.filetype = uri.filename.substring(index+1).toLowerCase();
				}
				return uri;
			}

			, getFileSizeFn: function ( fileInputId ) {
				var file = document.getElementById(fileInputId)
				var fileSize = 0;
				if ( file ) {
					if ( file.files ) {
						if ( file.files.length > 0 ) {
							fileSize = file.files[0].size;
						}
					} else if ( file.select && 'ActiveXObject' in window ) {
						file.select();
						var fileobject = new ActiveXObject ("Scripting.FileSystemObject");
						var file = fileobject.GetFile (file.value);
						fileSize = file.Size;
					}
				}
				return fileSize;
			}

			, hasFlash: _hasFlash

			, trim: function ( str ) {

				str = typeof str === 'string' ? str : '';

				return str.trim
					? str.trim()
					: str.replace(/^\s|\s$/g, '');
			}

			, parseEmotions: function ( msg ) {
				if ( typeof Easemob.im.EMOTIONS === 'undefined' || typeof Easemob.im.EMOTIONS.map === 'undefined' ) {
					return msg;
				} else {
					var emotion = Easemob.im.EMOTIONS,
						reg = null;

					for ( var face in emotion.map ) {
						if ( emotion.map.hasOwnProperty(face) ) {
							while ( msg.indexOf(face) > -1 ) {
								msg = msg.replace(face, '<img class="em-emotion" src="' + emotion.path + emotion.map[face] + '" alt="表情">');
							}
						}
					}
					return msg;
				}
			}

			, parseLink: function ( msg ) {
				var reg = /(https?\:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(\:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/gm;

				msg = msg.replace(reg, function ( v ) {

					var prefix = /^https?/gm.test(v);

					return "<a href='" 
						+ (prefix ? v : '//' + v)
						+ "' target='_blank'>" 
						+ v
						+ "</a>";

				});

				return msg;
			}

			, parseJSON: function ( data ) {

				if ( window.JSON && window.JSON.parse ) {
					return window.JSON.parse(data + "");
				}

				var requireNonComma,
					depth = null,
					str = Utils.trim(data + "");

				return str && !Utils.trim(
					str.replace(/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g
					, function ( token, comma, open, close ) {

						if ( requireNonComma && comma ) {
							depth = 0;
						}

						if ( depth === 0 ) {
							return token;
						}

						requireNonComma = open || comma;
						depth += !close - !open;
						return "";
					})
				)
				? (Function("return " + str))()
				: (Function("Invalid JSON: " + data))();
			}
			
			, parseUploadResponse: function ( response ) {
				return response.indexOf('callback') > -1 ? //lte ie9
					response.slice(9, -1) : response;
			}
			
			, parseDownloadResponse: function ( response ) {
				return ((response && response.type && response.type === 'application/json') 
					|| 0 > Object.prototype.toString.call(response).indexOf('Blob')) ? 
						this.url+'?token=' : window.URL.createObjectURL(response);
			}
			, uploadFile: function ( options ) {
				options = options || {};
				options.onFileUploadProgress = options.onFileUploadProgress || EMPTYFN;
				options.onFileUploadComplete = options.onFileUploadComplete || EMPTYFN;
				options.onFileUploadError = options.onFileUploadError || EMPTYFN;
				options.onFileUploadCanceled = options.onFileUploadCanceled || EMPTYFN;
				var acc = options.accessToken || this.context.accessToken;
				if (!acc) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_NO_LOGIN
						, msg: '用户未登录到usergrid服务器,无法使用文件上传功能'
						, id: options.id
					});
					return;
				}

				orgName = options.orgName || this.context.orgName || '';
				appName = options.appName || this.context.appName || '';
				appKey = options.appKey || this.context.appKey || '';
				if(!orgName && !appName && appKey){
					var devInfos = appKey.split('#');
					if(devInfos.length==2){
						orgName = devInfos[0];
						appName = devInfos[1];
					}
				}
				if ( !orgName && !appName ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '没有指定开发者信息'
						, id: options.id
					});
					return;
				}

				var apiUrl = options.apiUrl || 'http://a1.easemob.com';
				var uploadUrl = apiUrl + '/' + orgName + '/' + appName + '/chatfiles';

				if ( !Utils.isCanUploadFileAsync ) {
					if ( Utils.hasFlash && typeof options.flashUpload === 'function' ) {
						options.flashUpload && options.flashUpload(uploadUrl, options); 
					} else {
						this.onError({
							type : EASEMOB_IM_UPLOADFILE_BROWSER_ERROR
							, msg : '当前浏览器不支持异步上传！'
						});
					}
					return;
				}

				var fileSize = options.file.data ? options.file.data.size : undefined;
				if ( fileSize > EASEMOB_IM_FILESIZE_LIMIT ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '上传文件超过服务器大小限制（10M）'
						, id: options.id
					});
					return ;
				} else if ( fileSize <= 0 ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '上传文件大小为0'
						, id: options.id
					});
					return ;
				}

				var xhr = Utils.xmlrequest();
				var onError = function ( e ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '上传文件失败'
						, id: options.id
						, xhr: xhr
					});
				}
				if ( xhr.upload ) {
					xhr.upload.addEventListener("progress",options.onFileUploadProgress, false);
				}
				if ( xhr.addEventListener ) {
					xhr.addEventListener("abort", options.onFileUploadCanceled, false);
					xhr.addEventListener("load", function ( e ) {
						try {
							var json = Utils.parseJSON(xhr.responseText);
							options.onFileUploadComplete(json);
						} catch ( e ) {
							options.onFileUploadError({
								type: EASEMOB_IM_UPLOADFILE_ERROR
								, msg: '上传文件失败,服务端返回值值不正确'
								, data: xhr.responseText
								, id: options.id
								, xhr: xhr
							});
						}
					}, false);
					xhr.addEventListener("error", onError, false);
				} else if ( xhr.onreadystatechange ) {
					xhr.onreadystatechange = function () {
						if ( xhr.readyState === 4 ) {
							if ( ajax.status === 200 ) {
								try {
									var json = Utils.parseJSON(xhr.responseText);
									options.onFileUploadComplete(json);
								} catch ( e ) {
									options.onFileUploadError({
										type: EASEMOB_IM_UPLOADFILE_ERROR
										, msg: '上传文件失败,服务端返回值不正确'
										, data: xhr.responseText
										, id: options.id
										, xhr: xhr
									});
								}
							} else {
								options.onFileUploadError({
									type: EASEMOB_IM_UPLOADFILE_ERROR
									, msg: '上传文件失败,服务端返回异常'
									, data: xhr.responseText
									, id: options.id
									, xhr: xhr
								});
							}
						} else {
							xhr.abort();
							options.onFileUploadCanceled();
						}
					}
				}

				xhr.open("POST", uploadUrl);

				xhr.setRequestHeader('restrict-access', 'true');
				xhr.setRequestHeader('Accept', '*/*');//android qq browser has some problem at this attr
				xhr.setRequestHeader('Authorization', 'Bearer ' + acc);

				var formData = new FormData();
				formData.append("file", options.file.data);
				xhr.send(formData);
			}

			, downloadFn: function ( options ) {
				options.onFileDownloadComplete = options.onFileDownloadComplete || EMPTYFN;
				options.onFileDownloadError = options.onFileDownloadError || EMPTYFN;
				
				var accessToken = options.accessToken || '';
				if ( !accessToken ) {
					options.onFileDownloadError({
						type: EASEMOB_IM_DOWNLOADFILE_NO_LOGIN
						, msg: '用户未登录到usergrid服务器,无法使用文件下载功能'
						, id: options.id
					});
					return;
				}

				var onError = function ( e ) {
					options.onFileDownloadError({
						type: EASEMOB_IM_DOWNLOADFILE_ERROR
						, msg: '下载文件失败'
						, id: options.id
						, xhr: xhr
					});
				}
				if ( !Utils.isCanDownLoadFile ) {
					options.onFileDownloadComplete();
					return;
				}
				var xhr = Utils.xmlrequest();
				if ( "addEventListener" in xhr ) {
					xhr.addEventListener("load", function ( e ) {
						options.onFileDownloadComplete(xhr.response,xhr);
					}, false);
					xhr.addEventListener("error", onError, false);
				} else if ( "onreadystatechange" in xhr ) {
					xhr.onreadystatechange = function () {
						if ( xhr.readyState === 4 ) {
							if ( ajax.status === 200 ) {
								options.onFileDownloadComplete(xhr.response,xhr);
							} else {
								options.onFileDownloadError({
									type: EASEMOB_IM_DOWNLOADFILE_ERROR
									, msg: '下载文件失败,服务端返回异常'
									, id: options.id
									, xhr: xhr
								});
							}
						} else {
							xhr.abort();
							options.onFileDownloadError({
								type: EASEMOB_IM_DOWNLOADFILE_ERROR
								, msg: '错误的下载状态,退出下载'
								, id: options.id
								, xhr: xhr
							});
						}
					}
				}

				var method = options.method || 'GET';
				var resType = options.responseType || 'blob';
				var mimeType = options.mimeType || "text/plain; charset=x-user-defined";
				xhr.open(method, options.url);
				if ( typeof Blob !== 'undefined' ) {
					xhr.responseType = resType;
				} else {
					xhr.overrideMimeType(mimeType);
				}

				var innerHeaer = {
					'X-Requested-With': 'XMLHttpRequest'
					, 'Accept': 'application/octet-stream'
					, 'share-secret': options.secret
					, 'Authorization': 'Bearer ' + accessToken
				};
				var headers = options.headers || {};
				for ( var key in headers ) {
					innerHeaer[key] = headers[key];
				}
				for ( var key in innerHeaer ) {
					if ( innerHeaer[key] ) {
						xhr.setRequestHeader(key, innerHeaer[key]);
					}
				}
				xhr.send(null);
			}

			, parseTextMessage: function ( message, faces ) {
				if ( typeof message !== 'string' ) {
					conn.onError({
						type: EASEMOB_IM_MESSAGE_REC_TEXT_ERROR
						, msg: '不合法的消息内容格式，请检查发送消息内容！'
					});
					return;
				}
				if ( Object.prototype.toString.call(faces) !== '[object Object]' ) {
					return {
						isemotion: false
						, body: [
							{
								type: "txt"
								, data: message
							}
						]
					};
				}

				var receiveMsg = message;
				var emessage = [];
				var expr = /\[[^[\]]{2,3}\]/mg;
				var emotions = receiveMsg.match(expr);

				if ( !emotions || emotions.length < 1 ){
					return {
						isemotion: false
						, body: [
							{
								type: "txt"
								, data: message
							}
						]
					};
				}
				var isemotion = false;
				for ( var i = 0; i < emotions.length; i++ ) {
					var tmsg = receiveMsg.substring(0, receiveMsg.indexOf(emotions[i])),
						existEmotion = Easemob.im.EMOTIONS.map[emotions[i]];

					if ( tmsg ) {
						emessage.push({
							type: "txt"
							, data: tmsg
						});
					}
					if ( !existEmotion ) {
						emessage.push({
							type: "txt"
							, data: emotions[i]
						});
						continue;
					}
					var emotion = Easemob.im.EMOTIONS.map ? Easemob.im.EMOTIONS.path + existEmotion : null;

					if ( emotion ) {
						isemotion = true;
						emessage.push({
							type: 'emotion'
							, data: emotion
						});
					} else {
						emessage.push({
							type: 'txt'
							, data: emotions[i]
						});
					}
					var restMsgIndex = receiveMsg.indexOf(emotions[i]) + emotions[i].length;
					receiveMsg = receiveMsg.substring(restMsgIndex);
				}
				if ( receiveMsg ) {
					emessage.push({
						type: 'txt'
						, data: receiveMsg
					});
				}
				if ( isemotion ) {
					return {
						isemotion: isemotion
						, body: emessage
					};
				}
				return {
					isemotion: false
					, body: [
						{
							type: "txt"
							, data: message
						}
					]
				};
			}

			, xmlrequest: _xmlrequest

			, ajax: function ( options ) {
				var dataType = options.dataType || 'text';
				var suc = options.success || EMPTYFN;
				var error = options.error || EMPTYFN;
				var xhr = Utils.xmlrequest();

				xhr.onreadystatechange = function () {
					if ( xhr.readyState === 4 ) {
						var status = xhr.status || 0;
						if ( status === 200 ) {
							if ( dataType === 'text' ) {
								suc(xhr.responseText,xhr);
								return;
							}
							if ( dataType === 'json' ) {
								try {
									var json = Utils.parseJSON(xhr.responseText);
									suc(json,xhr);
								} catch ( e ) {
									error(xhr.responseText,xhr,"错误的数据,无法转换为json");
								}
								return;
							}
							if ( dataType === 'xml' ) {
								if ( xhr.responseXML && xhr.responseXML.documentElement ) {
									suc(xhr.responseXML.documentElement,xhr);
								} else {
									error(xhr.responseText,xhr,"浏览器不支持ajax返回xml对象");
								}
								return;
							}
							suc(xhr.response || xhr.responseText,xhr);
							return;
						} else {
							if ( dataType === 'json' ) {
								try {
									var json = Utils.parseJSON(xhr.responseText);
									error(json,xhr,"服务器返回错误信息");
								} catch ( e ) {
									error(xhr.responseText,xhr,"服务器返回错误信息");
								}
								return;
							}
							if ( dataType === 'xml' ) {
								if ( xhr.responseXML && xhr.responseXML.documentElement ) {
									error(xhr.responseXML.documentElement,xhr,"服务器返回错误信息");
								} else {
									error(xhr.responseText,xhr,"服务器返回错误信息");
								}
								return;
							}
							error(xhr.responseText,xhr,"服务器返回错误信息");
							return;
						}
					}
					if ( xhr.readyState === 0 ) {
						error(xhr.responseText,xhr,"服务器异常");
					}
				};

				if ( options.responseType ) {
					if ( xhr.responseType ) {
						xhr.responseType = options.responseType;
					} else {
						error('', xhr, "当前浏览器不支持设置响应类型");
						return null;
					}
				}
				if ( options.mimeType ) {
					if ( Utils.hasOverrideMimeType ) {
						xhr.overrideMimeType(options.mimeType);
					} else {
						error('', xhr, "当前浏览器不支持设置mimeType");
						return null;
					}
				}

				var type = options.type || "POST",
					data = options.data || null,
					tempData = '';

				if ( type.toLowerCase() === 'get' && data ) {
					for ( var o in data ) {
						if ( data.hasOwnProperty(o) ) {
							tempData += o + '=' + data[o] + '&';
						}
					}
					tempData = tempData ? tempData.slice(0, -1) : tempData;
					options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
					data = null, tempData = null;
				}
				xhr.open(type, options.url);

				if ( Utils.isCanSetRequestHeader ) {
					var headers = options.headers || {};
					for ( var key in headers ) {
						if ( headers.hasOwnProperty(key) ) {
							xhr.setRequestHeader(key, headers[key]);
						}
					}
				}

				xhr.send(data);
				return xhr;
			}
		};
	}());



	/**
	 * Module2: EmMessage: Various types of messages
	 */
	var EmMessage = function ( type, id ) {
		if ( !this instanceof EmMessage ) {
			return new EmMessage(type);
		}

		this._msg = {};

		if ( typeof EmMessage[type] === 'function' ) {
			EmMessage[type].prototype.setGroup = this.setGroup;
			this._msg = new EmMessage[type](id);
		}
		return this._msg;
	}
	EmMessage.prototype.setGroup = function ( group ) {
		this.body.group = group;
	}



	/**
	 *  Module3: Message
	 */
	var _msgHash = {};
	var Message = function ( message ) {

		if( !this instanceof Message ) {
			return new Message(message, conn);
		}
		
		this.msg = message;
	}

	Message.prototype.send = function ( conn ) {
		var me = this;

		var _send = function ( message ) {

			message.ext = message.ext || {};
			message.ext.weichat = message.ext.weichat || {};
			message.ext.weichat.originType = message.ext.weichat.originType || 'webim';

			var json = {
				from: conn.context.userId || ''
				, to: message.to
				, bodies: [message.body]
				, ext: message.ext || {}
			};

			var jsonstr = Utils.stringify(json);
			var dom = $msg({
				type: message.group || 'chat'
				, to: message.toJid
				, id: message.id
				, xmlns: "jabber:client"
			}).c("body").t(jsonstr);

			if ( message.roomType ) {
				dom.up().c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });
			}

			setTimeout(function () {
				if ( _msgHash[message.id] ) {
					_msgHash[message.id].msg.fail instanceof Function 
					&& _msgHash[message.id].msg.fail(message.id);
				}
			}, 60000);
			conn.sendCommand(dom.tree(), message.id);
		}


		if ( me.msg.file ) {
			if ( me.msg.body && me.msg.body.url ) {//only send msg
				_send(me.msg);
				return;
			}
			var _tmpComplete = me.msg.onFileUploadComplete;
			var _complete = function ( data ) {

				if ( data.entities[0]['file-metadata'] ) {
					var file_len = data.entities[0]['file-metadata']['content-length'];
					me.msg.file_length = file_len;
					me.msg.filetype = data.entities[0]['file-metadata']['content-type'];
					if ( file_len > 204800 ) {
						me.msg.thumbnail = true;
					}
				}
				
				me.msg.body = {
					type: me.msg.type || 'file'
					, url: data.uri + '/' + data.entities[0]['uuid']
					, secret: data.entities[0]['share-secret']
					, filename: me.msg.file.filename || me.msg.filename
					, size: {
						width: me.msg.width || 0
						, height: me.msg.height || 0
					}
					, length: me.msg.file_length || 0
					, file_length: me.msg.file_length || 0
					, filetype: me.msg.filetype
				}

				_send(me.msg);
				_tmpComplete instanceof Function && _tmpComplete(data, me.msg.id);
			};

			me.msg.onFileUploadComplete = _complete;
			Utils.uploadFile.call(conn, me.msg);
		} else {
			me.msg.body = {
				type: me.msg.type === 'chat' ? 'txt' : me.msg.type
				, msg: me.msg.msg 
			};
			if ( me.msg.type === 'cmd' ) {
				me.msg.body.action = me.msg.action;
			} else if ( me.msg.type === 'loc' ) {
				me.msg.body.addr = me.msg.addr;
				me.msg.body.lat = me.msg.lat;
				me.msg.body.lng = me.msg.lng;
			}

			_send(me.msg);
		}
	}
		
	

	/*
	 * Module4: Connection
	 */
	var Connection = (function () {

		var _networkSt;
		var _listenNetwork = function ( onlineCallback, offlineCallback ) {

			if ( window.addEventListener ) {
				window.addEventListener('online', onlineCallback);
				window.addEventListener('offline', offlineCallback);

			} else if ( window.attachEvent ) {
				if ( document.body ) {
					document.body.attachEvent('onoffline', offlineCallback);
					document.body.attachEvent('onoffline', offlineCallback);
				} else {
					window.attachEvent('load', function () {
						document.body.attachEvent('onoffline', offlineCallback);
						document.body.attachEvent('onoffline', offlineCallback);
					});
				}
			} else {
				/*var onlineTmp = window.ononline;
				var offlineTmp = window.onoffline;

				window.attachEvent('ononline', function () {
					try {
						typeof onlineTmp === 'function' && onlineTmp();
					} catch ( e ) {}
					onlineCallback();
				});
				window.attachEvent('onoffline', function () {
					try {
						typeof offlineTmp === 'function' && offlineTmp();
					} catch ( e ) {}
					offlineCallback();
				});*/
			}
		};

		var _parseRoomFn = function ( result ) {
			var rooms = [];
			var items = result.getElementsByTagName("item");
			if ( items ) {
				for ( var i = 0; i < items.length; i++ ) {
					var item = items[i];
					var roomJid = item.getAttribute('jid');
					var tmp = roomJid.split("@")[0];
					var room = {
						jid: roomJid
						, name: item.getAttribute('name')
						, roomId: tmp.split('_')[1]
					};
					rooms.push(room);
				}
			}
			return rooms;
		}
			
		var _parseRoomOccupantsFn = function ( result ) {
			var occupants = [];
			var items = result.getElementsByTagName("item");
			if ( items ) {
				for ( var i = 0; i < items.length; i++ ) {
					var item = items[i];
					var room = {
						jid: item.getAttribute('jid')
						, name: item.getAttribute('name')
					};
					occupants.push(room);
				}
			}
			return occupants;
		}

		var _parseResponseMessage = function ( msginfo ) {
			var parseMsgData = { errorMsg: true, data: [] };

			var msgBodies = msginfo.getElementsByTagName("body");
			if ( msgBodies ) {
				for ( var i = 0; i < msgBodies.length; i++ ) {
					var msgBody = msgBodies[i];
					var childNodes = msgBody.childNodes;
					if ( childNodes && childNodes.length > 0 ) {
						var childNode = msgBody.childNodes[0];
						if ( childNode.nodeType == Strophe.ElementType.TEXT ) {
							var jsondata = childNode.wholeText ||childNode.nodeValue;
							jsondata = jsondata.replace('\n','<br>');
							try {
								var data = eval("(" + jsondata + ")");
								parseMsgData.errorMsg = false;
								parseMsgData.data = [data];
							} catch ( e ) {}
						}
					}
				}

				var delayTags = msginfo.getElementsByTagName("delay");
				if ( delayTags && delayTags.length > 0 ) {
					var delayTag = delayTags[0];
					var delayMsgTime = delayTag.getAttribute("stamp");
					if ( delayMsgTime ) {
						parseMsgData.delayTimeStamp = delayMsgTime;
					}
				}
			} else {
				var childrens = msginfo.childNodes;
				if ( childrens && childrens.length>0 ) {
					var child = msginfo.childNodes[0];
					if ( child.nodeType == Strophe.ElementType.TEXT ) {
						try {
							var data = eval("("+child.nodeValue+")");
							parseMsgData.errorMsg = false;
							parseMsgData.data = [data];
						} catch ( e ) {}
					}
				}
			}
			return parseMsgData;
		}

		var _parseNameFromJidFn = function ( jid, domain ) {
			domain = domain || "";
			var tempstr = jid;
			var findex = tempstr.indexOf("_");

			if ( findex !== -1 ) {
				tempstr = tempstr.substring(findex+1);
			}
			var atindex = tempstr.indexOf("@" + domain);
			if ( atindex !== -1 ) {
				tempstr = tempstr.substring(0,atindex);
			}
			return tempstr;
		}

		var _parseFriendFn = function ( queryTag ) {
			var rouster = [];
			var items = queryTag.getElementsByTagName("item");
			if ( items ) {
				for( var i = 0; i < items.length; i++ ) {
					var item = items[i];
					var jid = item.getAttribute('jid');
					if ( !jid ) {
						continue;
					}
					var subscription = item.getAttribute('subscription');
					var friend = {
						subscription: subscription
						, jid: jid
					};
					var ask = item.getAttribute('ask');
					if ( ask ) {
						friend.ask = ask;
					}
					var name = item.getAttribute('name');
					if ( name ) {
						friend.name = name;
					} else {
						var n = _parseNameFromJidFn(jid);
						friend.name = n;
					}
					var groups = [];
					Strophe.forEachChild(item, 'group',function ( group ) {
						groups.push(Strophe.getText(group));
					});
					friend.groups = groups;
					rouster.push(friend);
				}
			}
			return rouster;
		}

		var _dologin2IM = function ( options, conn ) {
			var accessToken = options.access_token || '';
			if ( accessToken == '' ) {
				var loginfo = Utils.stringify(options);
				conn.onError({
					type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
					, msg: "登录失败," + loginfo
					, data: options
					, xhr: xhr
				});
				return;
			}
			conn.context.accessToken = options.access_token;
			conn.context.accessTokenExpires = options.expires_in;
			var stropheConn = null;
			if ( conn.isOpening() && conn.context.stropheConn ) {
				stropheConn = conn.context.stropheConn;
			} else if ( conn.isOpened() && conn.context.stropheConn ) {
				return;
			} else {
				stropheConn = new Strophe.Connection(conn.url, {
					inactivity: conn.inactivity
					, maxRetries: conn.maxRetries
					, pollingTime: conn.pollingTime
				});
			}

			var callback = function ( status, msg ) {
				_login2ImCallback(status,msg,conn);
			};

			conn.context.stropheConn = stropheConn;
			if ( conn.route ) {
				stropheConn.connect(conn.context.jid,"$t$" + accessToken,callback,conn.wait,conn.hold,conn.route);
			} else {
				stropheConn.connect(conn.context.jid,"$t$" + accessToken,callback,conn.wait,conn.hold);
			}
		};

		var _parseMessageType = function ( msginfo ) {
			var msgtype = 'normal';
			var receiveinfo = msginfo.getElementsByTagName("received");
			if ( receiveinfo && receiveinfo.length > 0 && receiveinfo[0].namespaceURI === "urn:xmpp:receipts" ) {
				msgtype = 'received';
			} else {
				var inviteinfo =  msginfo.getElementsByTagName("invite");
				if ( inviteinfo && inviteinfo.length > 0 ) {
					msgtype = 'invite';
				}
			}
			return msgtype;
		};

		var _handleQueueMessage = function ( conn ) {
			for ( var i in _msgHash ) {
				if ( _msgHash.hasOwnProperty(i) ) {
					_msgHash[i].send(conn);
				}
			}
		};

		var _login2ImCallback = function ( status, msg, conn ) {
			if ( status == Strophe.Status.CONNFAIL ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR
					, msg: msg
					, reconnect: true
				});
			} else if ( status == Strophe.Status.ATTACHED || status == Strophe.Status.CONNECTED ) {
				var handleMessage = function ( msginfo ) {
					var type = _parseMessageType(msginfo);

					if ( 'received' === type ) {
						conn.handleReceivedMessage(msginfo);
						return true;
					} else if ( 'invite' === type ) {
						conn.handleInviteMessage(msginfo);
						return true;
					} else {
						conn.handleMessage(msginfo);
						return true;
					}
				};
				var handlePresence = function ( msginfo ) {
					conn.handlePresence(msginfo);
					return true;
				};
				var handlePing = function ( msginfo ) {
					conn.handlePing(msginfo);
					return true;
				};
				var handleIq = function ( msginfo ) {
					conn.handleIq(msginfo);
					return true;
				};

				conn.addHandler(handleMessage, null, 'message', null, null,  null);
				conn.addHandler(handlePresence, null, 'presence', null, null,  null);
				conn.addHandler(handlePing, "urn:xmpp:ping", 'iq', "get", null,  null);
				conn.addHandler(handleIq, "jabber:iq:roster", 'iq', "set", null,  null);

				conn.context.status = STATUS_OPENED;

				var supportRecMessage = [
				   EASEMOB_IM_MESSAGE_REC_TEXT,
				   EASEMOB_IM_MESSAGE_REC_EMOTION ];

				if ( Utils.isCanDownLoadFile ) {
					supportRecMessage.push(EASEMOB_IM_MESSAGE_REC_PHOTO);
					supportRecMessage.push(EASEMOB_IM_MESSAGE_REC_AUDIO_FILE);
				}
				var supportSedMessage = [ EASEMOB_IM_MESSAGE_SED_TEXT ];
				if ( Utils.isCanUploadFile ) {
					supportSedMessage.push(EASEMOB_IM_MESSAGE_REC_PHOTO);
					supportSedMessage.push(EASEMOB_IM_MESSAGE_REC_AUDIO_FILE);
				}
				conn.notifyVersion();
				conn.retry && _handleQueueMessage(conn);
				conn.onOpened({
					canReceive: supportRecMessage
					, canSend: supportSedMessage
					, accessToken: conn.context.accessToken
				});
				conn.heartBeat();
			} else if ( status == Strophe.Status.DISCONNECTING ) {
				if ( conn.isOpened() ) {// 不是主动关闭
					conn.stopHeartBeat();
					conn.context.status = STATUS_CLOSING;
					conn.onError({
						type: EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR
						, msg: msg
						, reconnect: true
					});
				}
			} else if ( status == Strophe.Status.DISCONNECTED ) {
				conn.context.status = STATUS_CLOSED;
				conn.clear();
				conn.onClosed();
			} else if ( status == Strophe.Status.AUTHFAIL ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_AUTH_ERROR
					, msg: '登录失败,请输入正确的用户名和密码'
				});
				conn.clear();
			} else if ( status == Strophe.Status.ERROR ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_SERVER_ERROR
					, msg: msg || '服务器异常'
				});
			}
		};

		var _getJid = function ( options, conn ) {
			var jid = options.toJid || '';

			if ( jid === '' ) {
				var appKey = conn.context.appKey || '';
				var toJid = appKey + "_" + options.to + "@" + conn.domain;

				if ( options.resource ) {
					toJid = toJid + "/" + options.resource;
				}
				jid = toJid;
			}
			return jid;
		};

		var _innerCheck = function ( options, conn ) {
			options = options || {};

			if ( options.user == '' ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_USER_NOT_ASSIGN_ERROR
					, msg: '未指定用户'
				});
				return false;
			}

			var user = options.user || '';
			var appKey = options.appKey || '';
			var devInfos = appKey.split('#');

			if ( devInfos.length !== 2 ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_OPEN_ERROR
					, msg: '请指定正确的开发者信息(appKey)'
				});
				return false;
			}
			var orgName = devInfos[0];
			var appName = devInfos[1];

			if ( !orgName ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_OPEN_ERROR
					, msg: '请指定正确的开发者信息(appKey)'
				});
				return false;
			}
			if ( !appName ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_OPEN_ERROR
					, msg: '请指定正确的开发者信息(appKey)'
				});
				return false;
			}
			
			var jid = appKey + "_" + user.toLowerCase() + "@" + conn.domain,
				resource = options.resource || 'webim';

			if ( conn.multiResources ) {
				resource += user + new Date().getTime() + Math.floor(Math.random().toFixed(6) * 1000000);
			}

			conn.context.jid = jid + '/' + resource;/*jid: {appkey}_{username}@domain/resource*/
			conn.context.userId = user;
			conn.context.appKey = appKey;
			conn.context.appName = appName;
			conn.context.orgName = orgName;
			
			return true;
		}

		var _getXmppUrl = function ( baseUrl, https ) {
			if ( /^(ws|http)s?:\/\/?/.test(baseUrl) ) {
				return baseUrl;
			}

			var url = {
				prefix: 'http',
				base: '://' + (baseUrl || 'im-api.easemob.com'),
				suffix: '/http-bind/'
			};

			if ( https && Utils.isSupportWss ) {
				url.prefix = 'wss';
				url.suffix = '/ws/';
			} else {
				if ( https ) {
					url.prefix = 'https';
				} else if ( window.WebSocket ) {
					url.prefix = 'ws';
					url.suffix = '/ws/';
				}   
			}

			return url.prefix + url.base + url.suffix;
		};

		//class
		var connection = function ( options ) {
			if ( !this instanceof Connection ) {
				return new Connection(options);
			}

			var options = options || {};

			this.multiResources = options.multiResources || false;
			this.wait = options.wait || 30;
			this.retry = options.retry || false;
			this.https = options.https || https;
			this.url = _getXmppUrl(options.url, this.https);
			this.hold = options.hold || 1;
			this.route = options.route || null;
			this.domain = options.domain || "easemob.com";
			this.inactivity = options.inactivity || 30;
			this.heartBeatWait = options.heartBeatWait || 60000;
			this.maxRetries = options.maxRetries || 5;
			this.pollingTime = options.pollingTime || 800;
			this.stropheConn = false;
			this.context = { status: STATUS_INIT };
		};

		connection.prototype.listen = function ( options ) {
			options.url && (this.url = _getXmppUrl(options.url, this.https));//just compatible
			this.onOpened = options.onOpened || EMPTYFN;
			this.onClosed = options.onClosed || EMPTYFN;
			this.onTextMessage = options.onTextMessage || EMPTYFN;
			this.onEmotionMessage = options.onEmotionMessage || EMPTYFN;
			this.onPictureMessage = options.onPictureMessage || EMPTYFN;
			this.onAudioMessage = options.onAudioMessage || EMPTYFN;
			this.onVideoMessage = options.onVideoMessage || EMPTYFN;
			this.onFileMessage = options.onFileMessage || EMPTYFN;
			this.onLocationMessage = options.onLocationMessage || EMPTYFN;
			this.onCmdMessage = options.onCmdMessage || EMPTYFN;
			this.onPresence = options.onPresence || EMPTYFN;
			this.onRoster = options.onRoster || EMPTYFN;
			this.onError = options.onError || EMPTYFN;
			this.onReceivedMessage = options.onReceivedMessage || EMPTYFN;
			this.onInviteMessage = options.onInviteMessage || EMPTYFN;
			this.onOffline = options.onOffline || EMPTYFN;
			this.onOnline = options.onOnline || EMPTYFN;

			_listenNetwork(this.onOnline, this.onOffline);
		}

		connection.prototype.heartBeat = function () {
			var me = this;

			if ( me.heartBeatID ) {
				return;
			}

			var options = {
				to : me.domain,
				type : "normal"
			};
			me.heartBeatID = setInterval(function () {
				me.sendHeartBeatMessage(options);
			}, me.heartBeatWait);
		};

		connection.prototype.sendHeartBeatMessage = function ( options ) {
			var json = {},
				jsonstr = Utils.stringify(json),
				dom = $msg({
					to : options.to,
					type : options.type,
					id : this.getUniqueId(),
					xmlns : "jabber:client"
				}).c("body").t(jsonstr);

			this.sendCommand(dom.tree());
		};

		connection.prototype.stopHeartBeat = function () {
			this.heartBeatID = clearInterval(this.heartBeatID);
		};


		connection.prototype.sendReceiptsMessage = function ( options ) {
			var dom = $msg({
				from: this.context.jid || ''
				, to: "easemob.com"
				, id: options.id || ''
			}).c("received",{
				xmlns: "urn:xmpp:receipts"
				, id: options.id || ''
			});
			this.sendCommand(dom.tree());
		};

		connection.prototype.open = function ( options ) {
			var pass = _innerCheck(options,this);

			if ( !pass ) {
				return;
			}
			
			var conn = this;

			if ( conn.isOpening() || conn.isOpened() ) {
				return;
			}

			if ( options.accessToken ) {
				options.access_token = options.accessToken;
				_dologin2IM(options,conn);
			} else {
				var apiUrl = options.apiUrl || (this.https ? 'https' : 'http') + '://a1.easemob.com';
				var userId = this.context.userId;
				var pwd = options.pwd || '';
				var appName = this.context.appName;
				var orgName = this.context.orgName;

				var suc = function ( data, xhr ) {
					conn.context.status = STATUS_DOLOGIN_IM;
					_dologin2IM(data,conn);
				};
				var error = function ( res, xhr, msg ) {
					conn.clear();
					if ( res.error && res.error_description ) {
						conn.onError({
							type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
							, msg: "登录失败,"+res.error_description
							, data: res
							, xhr: xhr
						});
					} else {
						conn.onError({
							type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
							, msg: "登录失败"
							, data: res
							, xhr: xhr
						});
					}
				};
				this.context.status = STATUS_DOLOGIN_USERGRID;

				var loginJson = {
					grant_type: 'password'
					, username: userId
					, password: pwd
				};
				var loginfo = Utils.stringify(loginJson);

				var options = {
					url: apiUrl + "/" + orgName + "/" + appName + "/token"
					, dataType: 'json'
					, data: loginfo
					, success: suc || EMPTYFN
					, error: error || EMPTYFN
				};
				Utils.ajax(options);
			}

		};

		connection.prototype.attach = function ( options ) {
			var pass = _innerCheck(options, this);

			if ( !pass ) {
				return;
			}

			options = options || {};

			var accessToken = options.accessToken || '';
			if ( accessToken == '' ) {
				this.onError({
					type: EASEMOB_IM_CONNCTION_ATTACH_USERGRID_ERROR
					, msg: '未指定用户的accessToken'
				});
				return;
			}

			var sid = options.sid || '';
			if ( sid === '') {
				this.onError({
					type: EASEMOB_IM_CONNCTION_ATTACH_ERROR
					, msg: '未指定用户的会话信息'
				});
				return;
			}

			var rid = options.rid || '';
			if ( rid === '') {
				this.onError({
					type: EASEMOB_IM_CONNCTION_ATTACH_ERROR
					, msg: '未指定用户的消息id'
				});
				return;
			}

			var stropheConn = new Strophe.Connection(this.url, {
				inactivity: this.inactivity,
				maxRetries: this.maxRetries,
				pollingTime: this.pollingTime
			});

			this.context.accessToken = accessToken;
			this.context.stropheConn = stropheConn;
			this.context.status = STATUS_DOLOGIN_IM;

			var conn = this;
			var callback = function ( status, msg ) {
				_login2ImCallback(status,msg,conn);
			};

			var jid = this.context.jid;
			var wait = this.wait;
			var hold = this.hold;
			var wind = this.wind || 5;
			stropheConn.attach(jid, sid, rid, callback, wait, hold, wind);
		};

		connection.prototype.close = function () {
			var status = this.context.status;
			if ( status == STATUS_INIT ) {
				return;
			}

			if ( this.isClosed() || this.isClosing() ) {
				return;
			}
			this.stopHeartBeat();
			this.context.status = STATUS_CLOSING;
			this.context.stropheConn.disconnect();
		};

		// see stropheConn.addHandler
		connection.prototype.addHandler = function ( handler, ns, name, type, id, from, options ) {
			this.context.stropheConn.addHandler(handler, ns, name, type, id, from, options);
		};

		connection.prototype.notifyVersion = function ( suc, fail ) {
			var jid = _getJid({},this);
			var dom = $iq({
				from: this.context.jid || ''
				, to: this.domain
				, type: "result"
			})
			.c("query", { xmlns: "jabber:iq:version" })
			.c("name")
			.t("easemob")
			.up()
			.c("version")
			.t(Easemob.im.version)
			.up()
			.c("os")
			.t("webim");

			suc = suc || EMPTYFN;
			error = fail || this.onError;
			var failFn = function ( ele ) {
				error({
					type: EASEMOB_IM_CONNCTION_NOTIFYVERSION_ERROR
					, msg: '发送版本信息给服务器时失败'
					, data: ele
				});
			};
			this.context.stropheConn.sendIQ(dom.tree(), suc, failFn);
			return;
		};

		connection.prototype.handlePresence = function ( msginfo ) {
			if ( this.isClosed() ) {
				return;
			}
			//TODO: maybe we need add precense ack?
			//var id = msginfo.getAttribute('id') || '';
			//this.sendReceiptsMessage({
			//	id: id
			//});

			var from = msginfo.getAttribute('from') || '';
			var to = msginfo.getAttribute('to') || '';
			var type = msginfo.getAttribute('type') || '';
			var presence_type = msginfo.getAttribute('presence_type') || '';
			var fromUser = _parseNameFromJidFn(from);
			var toUser = _parseNameFromJidFn(to);
			var info = {
				from: fromUser
				, to: toUser
				, fromJid: from
				, toJid: to
				, type: type
				, chatroom: msginfo.getElementsByTagName('roomtype').length ? true : false
			};

			var showTags = msginfo.getElementsByTagName("show");
			if ( showTags && showTags.length > 0 ) {
				var showTag = showTags[0];
				info.show = Strophe.getText(showTag);
			}
			var statusTags = msginfo.getElementsByTagName("status");
			if ( statusTags && statusTags.length > 0 ) {
				var statusTag = statusTags[0];
				info.status = Strophe.getText(statusTag);
				info.code = statusTag.getAttribute('code');
			}

			var priorityTags = msginfo.getElementsByTagName("priority");
			if ( priorityTags && priorityTags.length > 0 ) {
				var priorityTag = priorityTags[0];
				info.priority  = Strophe.getText(priorityTag);
			}

			var error = msginfo.getElementsByTagName("error");
			if ( error && error.length > 0 ) {
				var error = error[0];
				info.error = {
					code: error.getAttribute('code')
				};
			}

			var destroy = msginfo.getElementsByTagName("destroy");
			if ( destroy && destroy.length > 0 ) {
				var destroy = destroy[0];
				info.destroy = true;

				var reason = destroy.getElementsByTagName("reason");
				if ( reason && reason.length > 0 ) {
					info.reason = Strophe.getText(reason[0]);
				}
			}

			if ( info.chatroom ) {
				var reflectUser = from.slice(from.lastIndexOf('/') + 1);

				if ( reflectUser === this.context.userId ) {
					if ( info.type === '' && !info.code ) {
						info.type = 'joinChatRoomSuccess';
					} else if ( presence_type === 'unavailable' || info.type === 'unavailable' ) {
						if ( !info.status ) {//web正常退出
							info.type = 'leaveChatRoom';
						} else if ( info.code == 110 ) {//app先退或被管理员踢
							info.type = 'leaveChatRoom';
						} else if ( info.error && info.error.code == 406 ) {//聊天室人已满，无法加入
							info.type = 'joinChatRoomFailed';
						}
					}
				}
			} else if ( presence_type === 'unavailable' || type === 'unavailable' ) {//聊天室被删除没有roomtype, 需要区分群组被踢和解散
				if ( info.destroy ) {//群组和聊天室被删除
					info.type = 'deleteGroupChat';
				} else if ( info.code == 307 || info.code == 321 ) {//群组被踢
					info.type = 'leaveGroup';
				}
			}
			
			this.onPresence(info,msginfo);
		};

		connection.prototype.handlePing = function ( e ) {
			if ( this.isClosed() ) {
				return;
			}
			var id = e.getAttribute('id');
			var from = e.getAttribute('from');
			var to = e.getAttribute('to');
			var dom = $iq({
				from: to
				, to: from
				, id: id
				, type: 'result'
			});
			this.sendCommand(dom.tree());
		};

		connection.prototype.handleIq = function ( e ) {
			var id = e.getAttribute('id');
			var from = e.getAttribute('from') || '';
			var name = _parseNameFromJidFn(from);
			var curJid = this.context.jid;
			var curUser = this.context.userId;

			/*if ( !from || from === curJid ) {
				return true;
			}*/

			var iqresult = $iq({ type: 'result', id: id, from: curJid });
			this.sendCommand(iqresult.tree());

			var msgBodies = e.getElementsByTagName("query");
			if ( msgBodies&&msgBodies.length > 0 ) {
				var queryTag = msgBodies[0];
				var rouster = _parseFriendFn(queryTag);
				this.onRoster(rouster);
			}
			return true;
		};

		connection.prototype.handleMessage = function ( msginfo ) {
			if ( this.isClosed() ) {
				return;
			}

			var id = msginfo.getAttribute('id') || '';
			this.sendReceiptsMessage({
				id: id
			});
			var parseMsgData = _parseResponseMessage(msginfo);
			if ( parseMsgData.errorMsg ) {
				this.handlePresence(msginfo);
				return;
			}
			var msgDatas = parseMsgData.data;
			for ( var i in msgDatas ) {
				if ( !msgDatas.hasOwnProperty(i) ) {
					continue;
				}
				var msg = msgDatas[i];
				if ( !msg.from || !msg.to ) {
					continue;
				}

				var from = msg.from.toLowerCase();
				var too = msg.to.toLowerCase();
				var extmsg = msg.ext || {};
				var chattype = '';
				var typeEl = msginfo.getElementsByTagName("roomtype");
				if ( typeEl.length ) {
					chattype = typeEl[0].getAttribute('type') || 'chat';
				} else {
					chattype = msginfo.getAttribute('type') || 'chat';
				}
				
				var msgBodies = msg.bodies;
				if ( !msgBodies || msgBodies.length == 0 ) {
					continue;
				}
				var msgBody = msg.bodies[0];
				var type = msgBody.type;
				if ( "txt" === type ) {
					var receiveMsg = msgBody.msg;
					var emotionsbody = Utils.parseTextMessage(receiveMsg, Easemob.im.EMOTIONS);
					if ( emotionsbody.isemotion ) {
						this.onEmotionMessage({
							id: id
							, type: chattype
							, from: from
							, to: too
							, delay: parseMsgData.delayTimeStamp
							, data: emotionsbody.body
							, ext: extmsg
						});
					} else {
						this.onTextMessage({
							id: id
							, type: chattype
							, from: from
							, to: too
							, delay: parseMsgData.delayTimeStamp
							, data: receiveMsg
							, ext: extmsg
						});
					}
				} else if ( "img" === type ) {
					var rwidth = 0;
					var rheight = 0;
					if ( msgBody.size ) {
						rwidth = msgBody.size.width;
						rheight = msgBody.size.height;
					}
					var msg = {
						id: id
						, type: chattype
						, from: from
						, to: too
						, url: msgBody.url
						, secret: msgBody.secret
						, filename: msgBody.filename
						, thumb: msgBody.thumb
						, thumb_secret: msgBody.thumb_secret
						, file_length: msgBody.file_length || ''
						, width: rwidth
						, height: rheight
						, filetype: msgBody.filetype || ''
						, accessToken: this.context.accessToken || ''
						, ext: extmsg
						, delay: parseMsgData.delayTimeStamp
					};
					this.onPictureMessage(msg);
				} else if ( "audio" === type ) {
					this.onAudioMessage({
						id: id
						, type: chattype
						, from: from
						, to: too
						, url: msgBody.url
						, secret: msgBody.secret
						, filename: msgBody.filename
						, length: msgBody.length || ''
						, file_length: msgBody.file_length || ''
						, filetype: msgBody.filetype || ''
						, accessToken: this.context.accessToken || ''
						, ext: extmsg
						, delay: parseMsgData.delayTimeStamp
					});
				} else if ( "file" === type ) {
					this.onFileMessage({
						id: id
						, type: chattype
						, from: from
						, to: too
						, url: msgBody.url
						, secret: msgBody.secret
						, filename: msgBody.filename
						, file_length: msgBody.file_length
						, accessToken: this.context.accessToken || ''
						, ext: extmsg
						, delay: parseMsgData.delayTimeStamp
					});
				} else if ( "loc" === type ) {
					this.onLocationMessage({
						id: id
						, type: chattype
						, from: from
						, to: too
						, addr: msgBody.addr
						, lat: msgBody.lat
						, lng: msgBody.lng
						, ext: extmsg
						, delay: parseMsgData.delayTimeStamp
					});
				} else if ( "video" === type ) {
					this.onVideoMessage({
						id: id
						, type: chattype
						, from: from
						, to: too
						, url: msgBody.url
						, secret: msgBody.secret
						, filename: msgBody.filename
						, file_length: msgBody.file_length
						, accessToken: this.context.accessToken || ''
						, ext: extmsg
						, delay: parseMsgData.delayTimeStamp
					});
				} else if ( "cmd" === type ) {
					this.onCmdMessage({
						id: id
						, from: from
						, to: too
						, action: msgBody.action
						, ext: extmsg
						, delay: parseMsgData.delayTimeStamp
					});
				}
			}
		};

		connection.prototype.handleReceivedMessage = function ( message ) {
			this.onReceivedMessage(message);

			var rcv = message.getElementsByTagName('received'),
				id,
				mid;

			if ( rcv.length > 0 ) {
				if ( rcv[0].childNodes && rcv[0].childNodes.length > 0 ) {
					id = rcv[0].childNodes[0].nodeValue;
				} else {
					id = rcv[0].innerHTML || rcv[0].innerText;
				}
				mid = rcv[0].getAttribute('mid');
			}
			
			if ( _msgHash[id] ) {
				_msgHash[id].msg.success instanceof Function && _msgHash[id].msg.success(id, mid);
				delete _msgHash[id];
			}
		};

		connection.prototype.handleInviteMessage = function ( message ) {
			var form = null;
			var invitemsg = message.getElementsByTagName('invite');
			var id = message.getAttribute('id') || '';
			this.sendReceiptsMessage({
				id: id
			});

			if ( invitemsg && invitemsg.length > 0 ) {
				var fromJid = invitemsg[0].getAttribute('from');
				form = _parseNameFromJidFn(fromJid);
			}
			var xmsg = message.getElementsByTagName('x');
			var roomid = null;
			if ( xmsg && xmsg.length > 0 ) {
				for ( var i = 0; i < xmsg.length; i++ ) {
					if ( 'jabber:x:conference' === xmsg[i].namespaceURI ) {
						var roomjid = xmsg[i].getAttribute('jid');
						roomid = _parseNameFromJidFn(roomjid);
					}
				}
			}
			this.onInviteMessage({
				type: 'invite'
				, from: form
				, roomid: roomid
			});
		};

		connection.prototype.sendCommand = function ( dom, id ) {
			if ( this.isOpened() ) {
				this.context.stropheConn.send(dom);
			} else {
				this.onError({
					type : EASEMOB_IM_CONNCTION_OPEN_ERROR,
					msg : '连接还未建立,请先登录或等待登录处理完毕'
					, reconnect: true
				});
			}
		};

		connection.prototype.getUniqueId = function ( prefix ) {
			var cdate = new Date();
			var offdate = new Date(2010,1,1);
			var offset = cdate.getTime()-offdate.getTime();
			var hexd = parseInt(offset).toString(16);

			if ( typeof prefix === 'string' || typeof prefix === 'number' ) {
				return prefix + '_' + hexd;
			} else {
				return 'WEBIM_' + hexd;
			}
		};
		
		connection.prototype.send = function ( message ) {
			if ( Object.prototype.toString.call(message) === '[object Object]' ) {
				var appKey = this.context.appKey || '';
				var toJid = appKey + "_" + message.to + "@" + this.domain;

				if ( message.group ) {
					toJid = appKey + "_" + message.to + '@conference.' + this.domain;
				}
				if ( message.resource ) {
					toJid = toJid + "/" + message.resource;
				}

				message.toJid = toJid;
				message.id = message.id || this.getUniqueId();
				_msgHash[message.id] = new Message(message);
				_msgHash[message.id].send(this);
			} else if ( typeof message === 'string' ) {
				_msgHash[message] && _msgHash[message].send(this);
			}
		}

		connection.prototype.addRoster = function ( options ) {
			var jid = _getJid(options, this);
			var name = options.name || '';
			var groups = options.groups || '';

			var iq = $iq({type: 'set'});
			iq.c("query", {xmlns:'jabber:iq:roster'});
			iq.c("item", {jid: jid, name: name});

			if ( groups ) {
				for ( var i = 0; i < groups.length; i++ ) {
					iq.c('group').t(groups[i]).up();
				}
			}
			var suc = options.success || EMPTYFN;
			var error = options.error || EMPTYFN;
			this.context.stropheConn.sendIQ(iq.tree(),suc,error);
		};

		connection.prototype.removeRoster = function ( options ) {
			var jid = _getJid(options,this);
			var iq = $iq({ type: 'set' }).c('query', { xmlns: "jabber:iq:roster" }).c('item', { jid: jid, subscription: "remove" });

			var suc = options.success || EMPTYFN;
			var error = options.error || EMPTYFN;
			this.context.stropheConn.sendIQ(iq,suc,error);
		};

		connection.prototype.getRoster = function ( options ) {
			var conn = this;
			var dom  = $iq({
				type: 'get'
			}).c('query', { xmlns: 'jabber:iq:roster' });

			options = options || {};
			suc = options.success || this.onRoster;
			var completeFn = function ( ele ) {
				var rouster = [];
				var msgBodies = ele.getElementsByTagName("query");
				if ( msgBodies&&msgBodies.length > 0 ) {
					var queryTag = msgBodies[0];
					rouster = _parseFriendFn(queryTag);
				}
				suc(rouster,ele);
			};
			error = options.error || this.onError;
			var failFn = function ( ele ) {
				error({
					type: EASEMOB_IM_CONNCTION_GETROSTER_ERROR
					, msg: '获取联系人信息失败'
					, data: ele
				});
			};
			if ( this.isOpened() ) {
				this.context.stropheConn.sendIQ(dom.tree(),completeFn,failFn);
			} else {
				error({
					type: EASEMOB_IM_CONNCTION_OPEN_ERROR
					, msg: '连接还未建立,请先登录或等待登录处理完毕'
				});
			}
		};

		connection.prototype.subscribe = function ( options ) {
			var jid = _getJid(options, this);
			var pres = $pres({ to: jid, type: "subscribe" });
			if ( options.message ) {
				pres.c("status").t(options.message).up();
			}
			if ( options.nick ) {
				pres.c('nick', { 'xmlns': "http://jabber.org/protocol/nick" }).t(options.nick);
			}
			this.sendCommand(pres.tree());
		};

		connection.prototype.subscribed = function ( options ) {
			var jid = _getJid(options,this);
			var pres = $pres({to: jid, type: "subscribed"});

			if ( options.message ) {
				pres.c("status").t(options.message).up();
			}
			this.sendCommand(pres.tree());
		};

		connection.prototype.unsubscribe = function ( options ) {
			var jid = _getJid(options,this);
			var pres = $pres({to: jid, type: "unsubscribe"});

			if ( options.message ) {
				pres.c("status").t(options.message);
			}
			this.sendCommand(pres.tree());
		};

		connection.prototype.unsubscribed = function ( options ) {
			var jid = _getJid(options,this);
			var pres = $pres({ to: jid, type: "unsubscribed" });

			if ( options.message ) {
				pres.c("status").t(options.message).up();
			}
			this.sendCommand(pres.tree());
		 };

		connection.prototype.createRoom = function ( options ) {
			var suc =options.success || EMPTYFN;
			var err =  options.error || EMPTYFN;
			var roomiq;

			roomiq = $iq({
				to: options.rooomName,
				type: "set"
			})
			.c("query", { xmlns: Strophe.NS.MUC_OWNER })
			.c("x", { xmlns: "jabber:x:data", type: "submit" });

			return this.context.stropheConn.sendIQ(roomiq.tree(), suc, err);
		};

		connection.prototype.join = function ( options ) {
			var roomJid = this.context.appKey + "_" + options.roomId + '@conference.' + this.domain;
			var room_nick = roomJid + "/" + this.context.userId;
			var suc = options.success || EMPTYFN;
			var err = options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_JOINROOM_ERROR
					, msg: '加入房间失败'
					, data: ele
				});
			};
			var iq = $pres({
				from: this.context.jid,
				to: room_nick
			})
			.c("x", { xmlns: Strophe.NS.MUC });

			this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
		};

		connection.prototype.listRooms = function ( options ) {
			var iq = $iq({
			  to: options.server||'conference.' + this.domain,
			  from: this.context.jid,
			  type: "get"
			})
			.c("query", { xmlns: Strophe.NS.DISCO_ITEMS });

			var suc =options.success || EMPTYFN;
			var completeFn = function ( result ) {
				var rooms = [];
				rooms = _parseRoomFn(result);
				suc(rooms);
			}
			var err =  options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_GETROOM_ERROR
					, msg: '获取群组列表失败'
					, data: ele
				});
			}
			this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
		};

		connection.prototype.queryRoomMember = function ( options ) {
			var domain = this.domain;
			var members = [];
			var iq= $iq({
			  to: this.context.appKey + "_" + options.roomId + '@conference.' + this.domain
			  , type: 'get'
			})
			.c('query', { xmlns: Strophe.NS.MUC+'#admin' })
			.c('item', { affiliation: 'member' });

			var suc =options.success || EMPTYFN;
			var completeFn = function ( result ) {
				var items = result.getElementsByTagName('item');

				if ( items ) {
					for ( var i = 0; i < items.length; i++ ) {
						var item = items[i];
						var mem = {
							jid: item.getAttribute('jid')
							, affiliation: 'member'
						};
						members.push(mem);
					}
				}
				suc(members);
			};
			var err =  options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_GETROOMMEMBER_ERROR
					, msg: '获取群组成员列表失败'
					, data: ele
				});
			};
			this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
		};

		connection.prototype.queryRoomInfo = function ( options ) {
			var domain = this.domain;
			var iq= $iq({
			  to:  this.context.appKey+"_"+options.roomId+'@conference.' + domain,
			  type: "get"
			}).c("query", { xmlns: Strophe.NS.DISCO_INFO });

			var suc =options.success || EMPTYFN;
			var members = [];
			var completeFn = function ( result ) {
				var fields = result.getElementsByTagName('field');
				if ( fields ) {
					for ( var i = 0; i < fields.length; i++ ) {
						var field = fields[i];
						if ( field.getAttribute('label') === 'owner' ) {
							var mem = {
								jid: (field.textContent || field.text) + "@" + domain
								, affiliation: 'owner'
							};
							members.push(mem);
						}
					}
				}
				suc(members);
			};
			var err =  options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_GETROOMINFO_ERROR
					, msg: '获取群组信息失败'
					, data: ele
				});
			};
			this.context.stropheConn.sendIQ(iq.tree(), completeFn, errorFn);
		};

		connection.prototype.queryRoomOccupants = function ( options ) {
			var suc =options.success || EMPTYFN;
			var completeFn = function ( result ) {
				var occupants = [];
				occupants = _parseRoomOccupantsFn(result);
				suc(occupants);
			}
			var err =  options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_GETROOMOCCUPANTS_ERROR
					, msg: '获取群组出席者列表失败'
					, data: ele
				});
			};
			var attrs = {
			  xmlns: Strophe.NS.DISCO_ITEMS
			};
			var info = $iq({
			  from: this.context.jid
			  , to: this.context.appKey + "_" + options.roomId + '@conference.' + this.domain
			  , type: 'get'
			}).c('query', attrs);
			this.context.stropheConn.sendIQ(info.tree(), completeFn, errorFn);
		};

		connection.prototype.setUserSig = function ( desc ) {
			var dom = $pres({ xmlns: 'jabber:client' });
			desc = desc || "";
			dom.c("status").t(desc);
			this.sendCommand(dom.tree());
		};

		connection.prototype.setPresence = function ( type, status ) {
			var dom = $pres({ xmlns: 'jabber:client' });
			if ( type ) {
				if ( status ) {
					dom.c("show").t(type);
					dom.up().c("status").t(status);
				} else {
					dom.c("show").t(type);
				}
			}
			this.sendCommand(dom.tree());
		};

		connection.prototype.getPresence = function () {
			var dom = $pres({ xmlns: 'jabber:client' });
			var conn = this;
			this.sendCommand(dom.tree());
		};

		connection.prototype.ping = function ( options ) {
			options = options || {};
			var jid = _getJid(options,this);

			var dom = $iq({
				from: this.context.jid || ''
				, to: jid
				, type: "get"
			}).c("ping", { xmlns: "urn:xmpp:ping" });

			suc = options.success || EMPTYFN;
			error = options.error || this.onError;
			var failFn = function ( ele ) {
				error({
					type: EASEMOB_IM_CONNCTION_PING_ERROR
					, msg: 'ping失败'
					, data: ele
				});
			};
			if ( this.isOpened() ) {
				this.context.stropheConn.sendIQ(dom.tree(),suc,failFn);
			} else {
				error({
					type: EASEMOB_IM_CONNCTION_OPEN_ERROR
					, msg: '连接还未建立,请先登录或等待登录处理完毕'
				});
			}
			return;
		};

		connection.prototype.isOpened = function () {
			return this.context.status == STATUS_OPENED;
		};

		connection.prototype.isOpening = function () {
			var status = this.context.status;
			return status == STATUS_DOLOGIN_USERGRID || status == STATUS_DOLOGIN_IM;
		};

		connection.prototype.isClosing = function () {
			return this.context.status == STATUS_CLOSING;
		};

		connection.prototype.isClosed = function () {
			return this.context.status == STATUS_CLOSED;
		};

		connection.prototype.clear = function () {
			var key = this.context.appKey;
			this.context = {
				status: STATUS_INIT
				, appKey: key
			};
		};

		//rooms list
		connection.prototype.getChatRooms = function ( options ) {

			if ( !Utils.isCanSetRequestHeader ) {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_AUTH_ERROR
					, msg: "当前浏览器不支持聊天室功能"
				});
				return;
			}

			var conn = this,
				token = options.accessToken || this.context.accessToken;

			if ( token ) {
				var apiUrl = options.apiUrl || (this.https ? 'https' : 'http') + '://a1.easemob.com';
				var appName = this.context.appName;
				var orgName = this.context.orgName;

				if ( !appName || !orgName ) {
					conn.onError({
						type: EASEMOB_IM_CONNCTION_AUTH_ERROR
						, msg: "token无效"
						, data: null 
					});
					return;
				}

				var suc = function ( data, xhr ) {
					typeof options.success === 'function' && options.success(data);
				};

				var error = function ( res, xhr, msg ) {
					if ( res.error && res.error_description ) {
						conn.onError({
							type: EASEMOB_IM_LOAD_CHATROOM_ERROR
							, msg: "获取聊天室失败," + res.error_description
							, data: res
							, xhr: xhr
						});
					}
				};

				var opts = {
					url: apiUrl + "/" + orgName + "/" + appName + "/chatrooms"
					, dataType: 'json'
					, type: 'get'
					, headers: {Authorization: 'Bearer ' + token}
					, success: suc || EMPTYFN
					, error: error || EMPTYFN
				};
				Utils.ajax(opts);
			} else {
				conn.onError({
					type: EASEMOB_IM_CONNCTION_AUTH_ERROR
					, msg: "token无效"
					, data: null 
				});			   
			}

		};

		connection.prototype.joinChatRoom = function ( options ) {
			var roomJid = this.context.appKey + "_" + options.roomId + '@conference.' + this.domain;
			var room_nick = roomJid + "/" + this.context.userId;
			var suc = options.success || EMPTYFN;
			var err = options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_JOINROOM_ERROR
					, msg: '加入聊天室失败'
					, data: ele
				});
			};

			var iq = $pres({
				from: this.context.jid,
				to: room_nick
			})
			.c("x", { xmlns: Strophe.NS.MUC + '#user' })
			.c('item', { affiliation: 'member', role: 'participant' })
			.up().up()
			.c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });

			this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
		};

		connection.prototype.quitChatRoom = function ( options ) {
			var roomJid = this.context.appKey + "_" + options.roomId + '@conference.' + this.domain;
			var room_nick = roomJid + "/" + this.context.userId;
			var suc = options.success || EMPTYFN;
			var err = options.error || EMPTYFN;
			var errorFn = function ( ele ) {
				err({
					type: EASEMOB_IM_CONNCTION_JOINROOM_ERROR
					, msg: '退出房间失败'
					, data: ele
				});
			};
			var iq = $pres({
				from: this.context.jid,
				to: room_nick,
				type: 'unavailable'
			})
			.c("x", { xmlns: Strophe.NS.MUC + '#user' })
			.c('item', { affiliation: 'none', role: 'none' })
			.up().up()
			.c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });

			this.context.stropheConn.sendIQ(iq.tree(), suc, errorFn);
		};

		return connection;
	}());



	/*
	 * CONST	 
	*/
	var EMPTYFN = function() {};

	tempIndex = 0;
	EASEMOB_IM_CONNCTION_USER_NOT_ASSIGN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_OPEN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_AUTH_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_ATTACH_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_ATTACH_USERGRID_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_REOPEN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_SERVER_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_IQ_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_PING_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_NOTIFYVERSION_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROSTER_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_CROSSDOMAIN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_LISTENING_OUTOF_MAXRETRIES = tempIndex++;
	EASEMOB_IM_CONNCTION_RECEIVEMSG_CONTENTERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_JOINROOM_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOM_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOMINFO_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOMMEMBER_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOMOCCUPANTS_ERROR = tempIndex++;
	
	EASEMOB_IM_UPLOADFILE_BROWSER_ERROR = tempIndex++;
	EASEMOB_IM_UPLOADFILE_ERROR = tempIndex++;
	EASEMOB_IM_UPLOADFILE_NO_LOGIN = tempIndex++;
	EASEMOB_IM_UPLOADFILE_NO_FILE = tempIndex++;
	EASEMOB_IM_DOWNLOADFILE_ERROR = tempIndex++;
	EASEMOB_IM_DOWNLOADFILE_NO_LOGIN = tempIndex++;
	EASEMOB_IM_DOWNLOADFILE_BROWSER_ERROR = tempIndex++;

	EASEMOB_IM_RESISTERUSER_ERROR = tempIndex++;

	EASEMOB_IM_LOAD_CHATROOM_ERROR = tempIndex++;
	EASEMOB_IM_JOIN_CHATROOM_ERROR = tempIndex++;
	EASEMOB_IM_QUIT_CHATROOM_ERROR = tempIndex++;

	tempIndex = 0;
	EASEMOB_IM_MESSAGE_REC_TEXT = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_TEXT_ERROR = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_EMOTION = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_PHOTO = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_AUDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_AUDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_VEDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_VEDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_FILE = tempIndex++;

	EASEMOB_IM_MESSAGE_SED_TEXT = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_EMOTION = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_PHOTO = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_AUDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_AUDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_VEDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_VEDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_FILE = tempIndex++;
	EASEMOB_IM_FILESIZE_LIMIT = 10485760;


	tempIndex = 0;
	var STATUS_INIT = tempIndex++;
	var STATUS_DOLOGIN_USERGRID = tempIndex++;
	var STATUS_DOLOGIN_IM = tempIndex++;
	var STATUS_OPENED = tempIndex++;
	var STATUS_CLOSING = tempIndex++;
	var STATUS_CLOSED = tempIndex++;

	delete tempIndex;


	Easemob.im.Connection = Connection;
	Easemob.im.EmMessage = EmMessage;
	Easemob.im.Helper = Easemob.im.Utils = Utils;
	window.Easemob = Easemob;

}(window, undefined));

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(228);


/***/ },

/***/ 228:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var Util = __webpack_require__(230);
	var Call = __webpack_require__(231);

	window.WebIM = typeof WebIM !== 'undefined' ? WebIM : {};
	WebIM.WebRTC = WebIM.WebRTC || {};
	WebIM.WebRTC.Call = Call;
	WebIM.WebRTC.Util = Util;

	if (( false ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
	    module.exports = WebIM.WebRTC;
	} else if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return WebIM.WebRTC;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}

	/**
	 * 判断是否支持pranswer
	 */
	if (/Chrome/.test(navigator.userAgent)) {
	    WebIM.WebRTC.supportPRAnswer = navigator.userAgent.split("Chrome/")[1].split(".")[0] >= 50 ? true : false;
	}

	//WebIM.WebRTC.supportPRAnswer = false;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(229)(module)))

/***/ },

/***/ 229:
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },

/***/ 230:
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/*
	 * ! Math.uuid.js (v1.4) http://www.broofa.com mailto:robert@broofa.com
	 * 
	 * Copyright (c) 2010 Robert Kieffer Dual licensed under the MIT and GPL
	 * licenses.
	 */

	/*
	 * Generate a random uuid.
	 * 
	 * USAGE: Math.uuid(length, radix) length - the desired number of characters
	 * radix - the number of allowable values for each character.
	 * 
	 * EXAMPLES: // No arguments - returns RFC4122, version 4 ID >>> Math.uuid()
	 * "92329D39-6F5C-4520-ABFC-AAB64544E172" // One argument - returns ID of the
	 * specified length >>> Math.uuid(15) // 15 character ID (default base=62)
	 * "VcydxgltxrVZSTV" // Two arguments - returns ID of the specified length, and
	 * radix. (Radix must be <= 62) >>> Math.uuid(8, 2) // 8 character ID (base=2)
	 * "01001010" >>> Math.uuid(8, 10) // 8 character ID (base=10) "47473046" >>>
	 * Math.uuid(8, 16) // 8 character ID (base=16) "098F4D35"
	 */
	(function () {
	    // Private array of chars to use
	    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

	    Math.uuid = function (len, radix) {
	        var chars = CHARS,
	            uuid = [],
	            i;
	        radix = radix || chars.length;

	        if (len) {
	            // Compact form
	            for (i = 0; i < len; i++) {
	                uuid[i] = chars[0 | Math.random() * radix];
	            }
	        } else {
	            // rfc4122, version 4 form
	            var r;

	            // rfc4122 requires these characters
	            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	            uuid[14] = '4';

	            // Fill in random data. At i==19 set the high bits of clock sequence
	            // as
	            // per rfc4122, sec. 4.1.5
	            for (i = 0; i < 36; i++) {
	                if (!uuid[i]) {
	                    r = 0 | Math.random() * 16;
	                    uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
	                }
	            }
	        }

	        return uuid.join('');
	    };

	    // A more performant, but slightly bulkier, RFC4122v4 solution. We boost
	    // performance
	    // by minimizing calls to random()
	    Math.uuidFast = function () {
	        var chars = CHARS,
	            uuid = new Array(36),
	            rnd = 0,
	            r;
	        for (var i = 0; i < 36; i++) {
	            if (i == 8 || i == 13 || i == 18 || i == 23) {
	                uuid[i] = '-';
	            } else if (i == 14) {
	                uuid[i] = '4';
	            } else {
	                if (rnd <= 0x02) rnd = 0x2000000 + Math.random() * 0x1000000 | 0;
	                r = rnd & 0xf;
	                rnd = rnd >> 4;
	                uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
	            }
	        }
	        return uuid.join('');
	    };

	    // A more compact, but less performant, RFC4122v4 solution:
	    Math.uuidCompact = function () {
	        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	            var r = Math.random() * 16 | 0,
	                v = c == 'x' ? r : r & 0x3 | 0x8;
	            return v.toString(16);
	        });
	    };
	})();

	/**
	 * Util
	 *
	 * @constructor
	 */
	function Util() {}

	/**
	 * Function Logger
	 *
	 * @constructor
	 */
	var Logger = function Logger() {
	    var self = this;

	    var LogLevel = {
	        TRACE: 0,
	        DEBUG: 1,
	        INFO: 2,
	        WARN: 3,
	        ERROR: 4,
	        FATAL: 5
	    };

	    var LogLevelName = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

	    this.log = function () {
	        var level = arguments[0];

	        level = arguments[0] = '[' + LogLevelName[level] + '] ';

	        var text = arguments[1];

	        if (WebIM && WebIM.config && WebIM.config.isDebug) {
	            console.log.apply(console, arguments);
	        }
	    };

	    function callLog(level, args) {
	        var _args = [];

	        _args.push(level);

	        for (var i in args) {
	            _args.push(args[i]);
	        }

	        self.log.apply(self, _args);
	    };

	    this.trace = function () {
	        this.log && callLog(LogLevel.TRACE, arguments);
	    };

	    this.debug = function () {
	        this.log && callLog(LogLevel.DEBUG, arguments);
	    };

	    this.info = function () {
	        this.log && callLog(LogLevel.INFO, arguments);
	    };

	    this.warn = function () {
	        this.log && callLog(LogLevel.WARN, arguments);
	    };

	    this.error = function () {
	        this.log && callLog(LogLevel.ERROR, arguments);
	    };

	    this.fatal = function () {
	        this.log && callLog(LogLevel.FATAL, arguments);
	    };
	};

	Util.prototype.logger = new Logger();

	/**
	 * parse json
	 *
	 * @param jsonString
	 */
	Util.prototype.parseJSON = function (jsonString) {
	    return JSON.parse(jsonString);
	};

	/**
	 * json to string
	 *
	 * @type {Util.stringifyJSON}
	 */
	var stringifyJSON = Util.prototype.stringifyJSON = function (jsonObj) {
	    return JSON.stringify(jsonObj);
	};

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var fnToString = hasOwn.toString;

	var ObjectFunctionString = fnToString.call(Object);

	/**
	 * check object type
	 *
	 * @type {Util.isPlainObject}
	 */
	var isPlainObject = Util.prototype.isPlainObject = function (obj) {
	    var proto, Ctor;

	    // Detect obvious negatives
	    // Use toString instead of jQuery.type to catch host objects
	    if (!obj || toString.call(obj) !== "[object Object]") {
	        return false;
	    }

	    proto = Object.getPrototypeOf(obj);

	    // Objects with no prototype (e.g., `Object.create( null )`) are plain
	    if (!proto) {
	        return true;
	    }

	    // Objects with prototype are plain iff they were constructed by a
	    // global Object function
	    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
	    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
	};

	Util.prototype.isArray = Array.isArray;

	/**
	 * check empty object
	 *
	 * @param obj
	 * @returns {boolean}
	 */
	Util.prototype.isEmptyObject = function (obj) {
	    var name;
	    for (name in obj) {
	        return false;
	    }
	    return true;
	};

	Util.prototype.type = function (obj) {
	    if (obj == null) {
	        return obj + "";
	    }
	    return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
	};

	/**
	 * Function extend
	 *
	 * @returns {*|{}}
	 */
	Util.prototype.extend = function () {
	    var self = this;
	    var options,
	        name,
	        src,
	        copy,
	        copyIsArray,
	        clone,
	        target = arguments[0] || {},
	        i = 1,
	        length = arguments.length,
	        deep = false;

	    // Handle a deep copy situation
	    if (typeof target === "boolean") {
	        deep = target;

	        // Skip the boolean and the target
	        target = arguments[i] || {};
	        i++;
	    }

	    // Handle case when target is a string or something (possible in deep
	    // copy)
	    if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== "object" && !self.isFunction(target)) {
	        target = {};
	    }

	    // Extend self itself if only one argument is passed
	    if (i === length) {
	        target = this;
	        i--;
	    }

	    for (; i < length; i++) {

	        // Only deal with non-null/undefined values
	        if ((options = arguments[i]) != null) {

	            // Extend the base object
	            for (name in options) {
	                src = target[name];
	                copy = options[name];

	                // Prevent never-ending loop
	                if (target === copy) {
	                    continue;
	                }

	                // Recurse if we're merging plain objects or arrays
	                if (deep && copy && (self.isPlainObject(copy) || (copyIsArray = self.isArray(copy)))) {

	                    if (copyIsArray) {
	                        copyIsArray = false;
	                        clone = src && self.isArray(src) ? src : [];
	                    } else {
	                        clone = src && self.isPlainObject(src) ? src : {};
	                    }

	                    // Never move original objects, clone them
	                    target[name] = self.extend(deep, clone, copy);

	                    // Don't bring in undefined values
	                } else if (copy !== undefined) {
	                    target[name] = copy;
	                }
	            }
	        }
	    }

	    // Return the modified object
	    return target;
	};

	/**
	 * get local cache
	 *
	 * @memberOf tool
	 * @name hasLocalData
	 * @param key{string}
	 *            localStorage的key值
	 * @return boolean
	 */
	Util.prototype.hasLocalStorage = function (key) {
	    // null -> localStorage.removeItem时
	    // '{}' -> collection.models.destroy时
	    if (localStorage.getItem(key) == null || localStorage.getItem(key) == '{}') {
	        return false;
	    }
	    return true;
	};

	Util.prototype.toggleClass = function (node, className) {
	    if (node.hasClass(className)) {
	        node.removeClass(className);
	        return;
	    }
	    node.addClass(className);
	};

	/**
	 * set cookie
	 *
	 * @param name{String}
	 *
	 * @param value{String}
	 *
	 * @param hour{Number}
	 *
	 * @return void
	 */
	Util.prototype.setCookie = function (name, value, hour) {
	    var exp = new Date();
	    exp.setTime(exp.getTime() + hour * 60 * 60 * 1000);
	    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
	};

	/**
	 * read cookie
	 *
	 * @param name(String)
	 *            cookie key
	 * @return cookie value
	 * @memberOf Tool
	 */
	Util.prototype.getCookie = function (name) {
	    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
	    if (arr != null) {
	        return unescape(arr[2]);
	    }
	    return null;
	};

	/**
	 * query parameter from url
	 *
	 * @name parseURL
	 * @memberof C.Tools
	 * @param {string}
	 *
	 * @return {string}
	 * @type function
	 * @public
	 */
	Util.prototype.parseURL = function (name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	    var r = window.location.search.substr(1).match(reg);
	    if (r != null) {
	        return unescape(r[2]);
	    }
	    return null;
	};

	module.exports = new Util();

/***/ },

/***/ 231:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Util = __webpack_require__(230);
	var RTCIQHandler = __webpack_require__(232);
	var API = __webpack_require__(233);
	var WebRTC = __webpack_require__(234);
	var CommonPattern = __webpack_require__(235);

	var RouteTo = API.RouteTo;
	var Api = API.Api;
	var _logger = Util.logger;

	var _Call = {
	    api: null,
	    caller: '',
	    connection: null,

	    pattern: null,

	    listener: {
	        onAcceptCall: function onAcceptCall(from, options) {},

	        onRinging: function onRinging(caller) {},

	        onTermCall: function onTermCall() {},

	        onIceConnectionStateChange: function onIceConnectionStateChange(iceState) {}
	    },

	    mediaStreamConstaints: {
	        audio: true,
	        video: true
	    },

	    init: function init() {
	        var self = this;

	        if (typeof self.connection === "undefined") {
	            throw "Caller need a instance of Easemob.im.Connection";
	        }

	        self.api = self.api || new Api({
	            imConnection: self.connection,

	            rtcHandler: new RTCIQHandler({
	                imConnection: self.connection
	            })
	        });

	        self.api.onInitC = function () {
	            self._onInitC.apply(self, arguments);
	        }, self.api.onIceConnectionStateChange = function () {
	            self.listener.onIceConnectionStateChange.apply(self, arguments);
	        };
	    },

	    makeVideoCall: function makeVideoCall(callee, accessSid) {

	        var mediaStreamConstaints = {};
	        Util.extend(mediaStreamConstaints, this.mediaStreamConstaints);

	        this.call(callee, mediaStreamConstaints, accessSid);
	    },

	    makeVoiceCall: function makeVoiceCall(callee, accessSid) {
	        var self = this;

	        var mediaStreamConstaints = {};
	        Util.extend(mediaStreamConstaints, self.mediaStreamConstaints);
	        self.mediaStreamConstaints.video = false;

	        self.call(callee, mediaStreamConstaints, accessSid);
	    },

	    acceptCall: function acceptCall() {
	        var self = this;
	        self.pattern.accept();
	    },

	    endCall: function endCall(callee) {
	        var self = this;
	        self.caller = '';
	        self.pattern.termCall();
	    },

	    call: function call(callee, mediaStreamConstaints, accessSid) {
	        var self = this;
	        this.callee = this.api.jid(callee);

	        var rt = new RouteTo({
	            rtKey: "",
	            sid: accessSid,

	            success: function success(result) {
	                _logger.debug("iq to server success", result);
	            },
	            fail: function fail(error) {
	                _logger.debug("iq to server error", error);
	                self.onError(error);
	            }
	        });

	        this.api.reqP2P(rt, mediaStreamConstaints.video ? 1 : 0, mediaStreamConstaints.audio ? 1 : 0, this.api.jid(callee), function (from, rtcOptions) {
	            if (rtcOptions.online == "0") {
	                self.listener.onError({ message: "callee is not online!" });
	                return;
	            }
	            self._onGotServerP2PConfig(from, rtcOptions);
	            self.pattern.initC(self.mediaStreamConstaints, accessSid);
	        });
	    },

	    _onInitC: function _onInitC(from, options, rtkey, tsxId, fromSid) {
	        var self = this;

	        self.callee = from;
	        self._rtcCfg = options.rtcCfg;
	        self._WebRTCCfg = options.WebRTC;

	        self.sessId = options.sessId;
	        self.rtcId = options.rtcId;

	        self.switchPattern();
	        self.pattern._onInitC(from, options, rtkey, tsxId, fromSid);
	    },

	    _onGotServerP2PConfig: function _onGotServerP2PConfig(from, rtcOptions) {
	        var self = this;

	        if (rtcOptions.result == 0) {
	            self._p2pConfig = rtcOptions;
	            self._rtcCfg = rtcOptions.rtcCfg;
	            self._rtcCfg2 = rtcOptions.rtcCfg2;

	            self.sessId = rtcOptions.sessId;
	            self.rtcId = "Channel_webIM";

	            self._rtKey = self._rtkey = rtcOptions.rtKey || rtcOptions.rtkey;
	            self._rtFlag = self._rtflag = rtcOptions.rtFlag || rtcOptions.rtflag;

	            self._WebRTCCfg = rtcOptions.WebRTC;
	            self.admtok = rtcOptions.admtok;
	            self.tkt = rtcOptions.tkt;

	            self.switchPattern();
	        } else {
	            //
	        }
	    },

	    switchPattern: function switchPattern() {
	        var self = this;

	        !self._WebRTCCfg && (self.pattern = new CommonPattern({
	            callee: self.callee,

	            _p2pConfig: self._p2pConfig,
	            _rtcCfg: self._rtcCfg,
	            _rtcCfg2: self._rtcCfg2,

	            _rtKey: self._rtKey || self._rtkey,
	            _rtFlag: self._rtFlag || self._rtflag,

	            _sessId: self.sessId,
	            _rtcId: self.rtcId,

	            webRtc: new WebRTC({
	                onGotLocalStream: self.listener.onGotLocalStream,
	                onGotRemoteStream: self.listener.onGotRemoteStream,
	                onError: self.listener.onError
	            }),

	            api: self.api,

	            onAcceptCall: self.listener && self.listener.onAcceptCall || function () {},
	            onRinging: self.listener && self.listener.onRinging || function () {},
	            onTermCall: self.listener && self.listener.onTermCall || function () {}
	        }));
	    }
	};

	module.exports = function (initConfigs) {
	    Util.extend(true, this, _Call, initConfigs || {});

	    this.init();
	};

/***/ },

/***/ 232:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * IQ Message，IM -> CMServer --> IM
	 */

	var _util = __webpack_require__(230);
	var _logger = _util.logger;
	var API = __webpack_require__(233);
	var RouteTo = API.RouteTo;

	var CONFERENCE_XMLNS = "urn:xmpp:media-conference";

	var _RtcHandler = {
	    _apiCallbacks: {},

	    imConnection: null,

	    _connectedSid: '',

	    init: function init() {
	        var self = this;

	        var _conn = self.imConnection;

	        var handleConferenceIQ;

	        _conn.addHandler = function (handler, ns, name, type, id, from, options) {
	            if (typeof handleConferenceIQ !== 'function') {

	                handleConferenceIQ = function handleConferenceIQ(msginfo) {
	                    try {
	                        self.handleRtcMessage(msginfo);
	                    } catch (error) {
	                        _logger.error(error.stack || error);
	                        throw error;
	                    }

	                    return true;
	                };
	                _conn.addHandler(handleConferenceIQ, CONFERENCE_XMLNS, 'iq', "set", null, null);
	                _conn.addHandler(handleConferenceIQ, CONFERENCE_XMLNS, 'iq', "get", null, null);
	            }

	            _conn.context.stropheConn.addHandler(handler, ns, name, type, id, from, options);
	        };
	    },

	    handleRtcMessage: function handleRtcMessage(msginfo) {
	        var self = this;

	        var id = msginfo.getAttribute('id');
	        var from = msginfo.getAttribute('from') || '';

	        // remove resource
	        from.lastIndexOf("/") >= 0 && (from = from.substring(0, from.lastIndexOf("/")));

	        var rtkey = msginfo.getElementsByTagName('rtkey')[0].innerHTML;

	        var fromSessionId = msginfo.getElementsByTagName('sid')[0].innerHTML;

	        (self._fromSessionID || (self._fromSessionID = {}))[from] = fromSessionId;

	        var contentTags = msginfo.getElementsByTagName('content');

	        var streamType = msginfo.getElementsByTagName('stream_type')[0].innerHTML; //VOICE, VIDEO

	        var contentString = contentTags[0].innerHTML;

	        var content = _util.parseJSON(contentString);

	        var rtcOptions = content;
	        var tsxId = content.tsxId;

	        self.ctx = content.ctx;

	        _logger.debug("Recv [op = " + rtcOptions.op + "] [tsxId=" + tsxId + "]\r\n json :", msginfo);

	        //if a->b already, c->a/b should be termiated with 'busy' reason
	        if (from.indexOf("@") >= 0) {
	            if (self._connectedSid == '' && rtcOptions.op == 102) {
	                self._connectedSid = fromSessionId;
	            } else {
	                if (self._connectedSid != fromSessionId) {
	                    //onInitC
	                    if (rtcOptions.op == 102) {
	                        var rt = new RouteTo({
	                            to: from,
	                            rtKey: rtkey,
	                            sid: fromSessionId,
	                            success: function success(result) {
	                                _logger.debug("iq to server success", result);
	                            },
	                            fail: function fail(error) {
	                                _logger.debug("iq to server error", error);
	                                self.onError(error);
	                            }
	                        });

	                        var options = {
	                            data: {
	                                op: 107,
	                                sessId: rtcOptions.sessId,
	                                rtcId: rtcOptions.rtcId,
	                                reason: 'busy'

	                            },
	                            reason: 'busy'
	                        };
	                        self.sendRtcMessage(rt, options);
	                    }
	                    return;
	                }
	            }
	        }

	        //onTermC
	        if (rtcOptions.op == 107) {
	            self._connectedSid = '';
	            self._fromSessionID = {};
	        }

	        if (rtcOptions.sdp) {
	            if (typeof rtcOptions.sdp === 'string') {
	                rtcOptions.sdp = _util.parseJSON(rtcOptions.sdp);
	            }
	            rtcOptions.sdp.type && (rtcOptions.sdp.type = rtcOptions.sdp.type.toLowerCase());
	        }
	        if (rtcOptions.cands) {
	            if (typeof rtcOptions.cands === 'string') {
	                rtcOptions.cands = _util.parseJSON(rtcOptions.cands);
	            }

	            for (var i = 0; i < rtcOptions.cands.length; i++) {
	                typeof rtcOptions.cands[i] === 'string' && (rtcOptions.cands[i] = _util.parseJSON(rtcOptions.cands[i]));

	                rtcOptions.cands[i].sdpMLineIndex = rtcOptions.cands[i].mlineindex;
	                rtcOptions.cands[i].sdpMid = rtcOptions.cands[i].mid;

	                delete rtcOptions.cands[i].mlineindex;
	                delete rtcOptions.cands[i].mid;
	            }
	        }

	        rtcOptions.rtcCfg && typeof rtcOptions.rtcCfg === 'string' && (rtcOptions.rtcCfg = _util.parseJSON(rtcOptions.rtcCfg));
	        rtcOptions.rtcCfg2 && typeof rtcOptions.rtcCfg2 === 'string' && (rtcOptions.rtcCfg2 = _util.parseJSON(rtcOptions.rtcCfg2));
	        rtcOptions.WebRTC && typeof rtcOptions.WebRTC === 'string' && (rtcOptions.WebRTC = _util.parseJSON(rtcOptions.WebRTC));

	        if (tsxId && self._apiCallbacks[tsxId]) {
	            try {
	                self._apiCallbacks[tsxId].callback && self._apiCallbacks[tsxId].callback(from, rtcOptions);
	            } catch (err) {
	                throw err;
	            } finally {
	                delete self._apiCallbacks[tsxId];
	            }
	        } else {
	            self.onRecvRtcMessage(from, rtcOptions, rtkey, tsxId, fromSessionId);
	        }

	        return true;
	    },

	    onRecvRtcMessage: function onRecvRtcMessage(from, rtcOptions, rtkey, tsxId, fromSessionId) {
	        _logger.debug(' form : ' + from + " \r\n json :" + _util.stringifyJSON(rtcJSON));
	    },

	    convertRtcOptions: function convertRtcOptions(options) {
	        var sdp = options.data.sdp;
	        if (sdp) {
	            var _sdp = {
	                type: sdp.type,
	                sdp: sdp.sdp
	            };

	            sdp = _sdp;

	            sdp.type = sdp.type.toUpperCase();
	            sdp = _util.stringifyJSON(sdp);

	            options.data.sdp = sdp;
	        }

	        var cands = options.data.cands;

	        if (cands) {
	            if (_util.isArray(cands)) {} else {
	                var _cands = [];
	                _cands.push(cands);
	                cands = _cands;
	            }

	            for (var i in cands) {
	                if (cands[i] instanceof RTCIceCandidate) {
	                    var _cand = {
	                        type: "candidate",
	                        candidate: cands[i].candidate,
	                        mlineindex: cands[i].sdpMLineIndex,
	                        mid: cands[i].sdpMid
	                    };

	                    cands[i] = _util.stringifyJSON(_cand);
	                }
	            }

	            options.data.cands = cands;
	        } else {
	            // options.data.cands = [];
	        }

	        var rtcCfg = options.data.rtcCfg;
	        if (rtcCfg) {
	            typeof rtcCfg !== 'string' && (options.data.rtcCfg = _util.stringifyJSON(rtcCfg));
	        }

	        var _webrtc = options.data.WebRTC;
	        if (_webrtc) {
	            typeof _webrtc !== 'string' && (options.data.WebRTC = _util.stringifyJSON(_webrtc));
	        }
	    },

	    /**
	     * rt: { id: , to: , rtKey: , rtflag: , sid: , tsxId: , type: , }
	     *
	     * rtcOptions: { data : { op : 'reqP2P', video : 1, audio : 1, peer :
	     * curChatUserId, //appKey + "_" + curChatUserId + "@" + this.domain, } }
	     *
	     */
	    sendRtcMessage: function sendRtcMessage(rt, options, callback) {
	        var self = this;

	        var _conn = self.imConnection;

	        var tsxId = rt.tsxId || _conn.getUniqueId();

	        var to = rt.to || _conn.domain;

	        var sid = rt.sid || self._fromSessionID && self._fromSessionID[to];
	        //sid = sid || ((self._fromSessionID || (self._fromSessionID = {}))[to] = _conn.getUniqueId("CONFR_"));
	        sid = sid || _conn.getUniqueId("CONFR_");
	        (self._fromSessionID || (self._fromSessionID = {}))[to] = sid;

	        if (to.indexOf("@") >= 0) {
	            if (self._connectedSid == '' && options.data.op == 102) {
	                self._connectedSid = sid;
	            }
	        }
	        var rtKey = rt.rtKey || rt.rtkey;
	        // rtKey && delete rt.rtKey;
	        rtKey || (rtKey = "");

	        var rtflag = rt.rtflag;
	        // rtflag && delete rt.rtflag;
	        rtflag || (rtflag = 1);

	        options.data || (options.data = {});
	        options.data.tsxId = tsxId;

	        self.ctx && (options.data.ctx = self.ctx);
	        self.convertRtcOptions(options);

	        var streamType = "VIDEO"; //VOICE, VIDEO

	        var id = rt.id || _conn.getUniqueId("CONFR_");
	        var iq = $iq({
	            // xmlns: CONFERENCE_XMLNS,
	            id: id,
	            to: to,
	            from: _conn.context.jid,
	            type: rt.type || "get"
	        }).c("query", {
	            xmlns: CONFERENCE_XMLNS
	        }).c("MediaReqExt").c('rtkey').t(rtKey).up().c('rtflag').t(rtflag).up().c('stream_type').t(streamType).up().c('sid').t(sid).up().c('content').t(_util.stringifyJSON(options.data));

	        if (options.data.op == 107 && options.reason) {
	            iq.up().c('reaseon').t(options.reason);
	        }
	        _logger.debug("Send [op = " + options.data.op + "] : \r\n", iq.tree());

	        callback && (self._apiCallbacks[tsxId] = {
	            callback: callback
	        });

	        var completeFn = function (result) {
	            rt.success(result);
	        } || function (result) {
	            _logger.debug("send result. op:" + options.data.op + ".", result);
	        };

	        var errFn = function (ele) {
	            rt.fail(ele);
	        } || function (ele) {
	            _logger.debug(ele);
	        };

	        _conn.context.stropheConn.sendIQ(iq.tree(), completeFn, errFn);

	        //onTermC
	        if (options.data.op == 107 && self._connectedSid) {
	            if (!rt.sid || self._connectedSid == rt.sid) {
	                self._connectedSid = '';
	                self._fromSessionID = {};
	            }
	        }
	    }
	};

	var RTCIQHandler = function RTCIQHandler(initConfigs) {
	    _util.extend(true, this, _RtcHandler, initConfigs || {});

	    this.init();
	};
	module.exports = RTCIQHandler;

/***/ },

/***/ 233:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * API
	 */
	var _util = __webpack_require__(230);
	var _logger = _util.logger;

	var _RouteTo = {
	    // to : null,
	    // rtKey: null,
	    rtFlag: 1,

	    success: function success(result) {},
	    fail: function fail(error) {}
	};

	var RouteTo = function RouteTo(extendCfg) {
	    if (this instanceof RouteTo) {
	        var self = this;
	        _util.extend(true, self, _RouteTo, extendCfg || {});
	    } else {
	        var sub = function sub(extendCfg) {
	            var self = this;
	            _util.extend(true, self, extendCfg || {});
	        };

	        _util.extend(true, sub.prototype, _RouteTo, extendCfg || {});

	        return sub;
	    }
	};
	exports.RouteTo = RouteTo;

	var _clazz = {
	    imConnection: null,
	    // webRtc: null,

	    rtcHandler: null,

	    events: {
	        '0': 'onReqP2P',
	        '1': 'onNewCfr',
	        '2': 'onDelCfr',
	        '3': 'onReqTkt',

	        '100': 'onPing',
	        '101': 'onPong',
	        '102': 'onInitC',
	        '103': 'onReqC',
	        '104': 'onAcptC',
	        '105': 'onTcklC',
	        '106': 'onAnsC',
	        '107': 'onTermC',

	        // '200' : 'onEnter',
	        // '201' : 'onExit',
	        // '202' : 'onInvite',
	        // '203' : 'onGetMems',

	        // '205' : 'onSubC',
	        // '206' : 'onUsubC',

	        '300': 'onEvEnter',
	        '301': 'onEvExit',
	        '302': 'onEvPub',
	        '303': 'onEvUnpub',
	        '304': 'onEvMems',
	        '204': 'onEvClose',

	        'onServerError': 'onServerError'
	    },

	    register: function register(listener) {
	        if ((typeof listener === 'undefined' ? 'undefined' : _typeof(listener)) === "object") {
	            for (var event in listener) {
	                this.bind(event, listener[event]);
	            }
	        }
	    },

	    bind: function bind(event, func) {
	        var self = this;

	        var onFunc;
	        if (onFunc = self.events[event]) {
	            self[onFunc] = func;
	        } else {
	            onFunc = self.events[event] = 'on_' + event;
	            self[onFunc] = func;
	        }
	    },

	    jid: function jid(shortUserName) {
	        if (/^.+#.+_.+@.+$/g.test(shortUserName)) {
	            return shortUserName;
	        }
	        // if (shortUserName.indexOf(this.imConnection.context.appKey) >= 0) {
	        //     return shortUserName;
	        // }
	        return this.imConnection.context.appKey + "_" + shortUserName + "@" + this.imConnection.domain;
	    },

	    /**
	     * ReqP2P 0
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param video
	     *            1 0
	     * @param audio
	     *            1 0
	     * @param peer
	     *
	     */
	    reqP2P: function reqP2P(rt, video, audio, peer, callback) {
	        _logger.debug("req p2p ...");

	        var rtcOptions = {
	            data: {
	                op: 0,
	                video: video,
	                audio: audio,
	                peer: peer // appKey + "_" + curChatUserId + "@" + this.domain,
	            }
	        };

	        this.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * NewCfr 1
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param reqTkt
	     *            1 null
	     * @param password
	     *            string null
	     *
	     */
	    newCfr: function newCfr(rt, reqTkt, password, callback) {
	        _logger.debug("newCfr ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 1
	            }
	        };

	        reqTkt && (rtcOptions.data.reqTkt = reqTkt);
	        password && (rtcOptions.data.password = password);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * Enter 200
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param reqMembers !=
	     *            0 members
	     * @param tkt
	     * @param nonce
	     * @param digest
	     *
	     */
	    enter: function enter(rt, WebRTCId, reqMembers, tkt, nonce, digest, callback) {
	        _logger.debug("enter ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 200
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        reqMembers && (rtcOptions.data.reqMembers = reqMembers);
	        tkt && (rtcOptions.data.tkt = tkt);
	        nonce && (rtcOptions.data.nonce = nonce);
	        digest && (rtcOptions.data.digest = digest);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * Ping 100
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     *
	     */
	    ping: function ping(rt, sessId, callback) {
	        _logger.debug("ping ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 100
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * ReqTkt 3
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    reqTkt: function reqTkt(rt, WebRTCId, callback) {
	        _logger.debug("reqTkt ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 3
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * InitC 102
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param tkt
	     * @param sessId
	     * @param rtcId
	     * @param pubS
	     *            {name: streamName, video:1, audio:1, type: 0}
	     * @param subS
	     *            {memId: , rtcId: }
	     * @param sdp
	     *            sdp:sdpstring
	     * @param cands [ ]
	     *
	     */
	    initC: function initC(rt, WebRTCId, tkt, sessId, rtcId, pubS, subS, sdp, cands, rtcCfg, WebRTC, callback) {
	        _logger.debug("initC ...");

	        var rtcOptions = {
	            data: {
	                op: 102
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        tkt && (rtcOptions.data.tkt = tkt);
	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        pubS && (rtcOptions.data.pubS = pubS);
	        subS && (rtcOptions.data.subS = subS);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);
	        rtcCfg && (rtcOptions.data.rtcCfg = rtcCfg);
	        WebRTC && (rtcOptions.data.WebRTC = WebRTC);

	        this.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * TcklC 105
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param cands
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    tcklC: function tcklC(rt, sessId, rtcId, sdp, cands, callback) {
	        _logger.debug("tcklC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 105
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * AnsC 106
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param sdp
	     * @param cands
	     *
	     */
	    ansC: function ansC(rt, sessId, rtcId, sdp, cands, callback) {
	        _logger.debug("ansC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 106
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * AcptC 104
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param sdp
	     * @param ans
	     *            1
	     *
	     */
	    acptC: function acptC(rt, sessId, rtcId, sdp, cands, ans, callback) {
	        _logger.debug("acptC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 104
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        sdp && (rtcOptions.data.sdp = sdp);
	        cands && (rtcOptions.data.cands = cands);
	        ans && (rtcOptions.data.ans = ans);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * GetMems 203
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param sessId
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    getMems: function getMems(rt, WebRTCId, sessId, callback) {
	        _logger.debug("getMems ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 203
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        sessId && (rtcOptions.data.sessId = sessId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * SubC 205
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param subS
	     *            {memId:m001, rtcId:r001}
	     *
	     */
	    subC: function subC(rt, sessId, rtcId, subS, callback) {
	        _logger.debug("subC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 205
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        subS && (rtcOptions.data.subS = subS);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * UsubC 206
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     *
	     */
	    usubC: function usubC(rt, sessId, rtcId, callback) {
	        _logger.debug("usubC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 206
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * TermC 107
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param sessId
	     * @param rtcId
	     * @param reason
	     *               "ok"      -> 'HANGUP'     "success" -> 'HANGUP'   "timeout"          -> 'NORESPONSE'
	     *               "decline" -> 'REJECT'     "busy"    -> 'BUSY'     "failed-transport" -> 'FAIL'
	     *
	     */
	    termC: function termC(rt, sessId, rtcId, reason, callback) {
	        _logger.debug("termC ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 107
	            }
	        };

	        sessId && (rtcOptions.data.sessId = sessId);
	        rtcId && (rtcOptions.data.rtcId = rtcId);
	        reason && (rtcOptions.reason = reason);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * Exit 201
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param sessId
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    exit: function exit(rt, WebRTCId, sessId, callback) {
	        _logger.debug("exit ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 201
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        sessId && (rtcOptions.data.sessId = sessId);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    },

	    /**
	     * DelCfr 2
	     *
	     * @param rt
	     *            {to: , rtKey: , rtflag: , success(result), fail(error)}
	     *
	     * @param callback(from, rtcOptions)
	     *
	     *
	     * @param WebRTCId
	     * @param admtok
	     * @param success(from,
	     *            rtcOptions)
	     *
	     */
	    delCfr: function delCfr(rt, WebRTCId, admtok, callback) {
	        _logger.debug("delCfr ...");

	        var self = this;

	        var rtcOptions = {
	            data: {
	                op: 2
	            }
	        };

	        WebRTCId && (rtcOptions.data.WebRTCId = WebRTCId);
	        admtok && (rtcOptions.data.admtok = admtok);

	        self.rtcHandler.sendRtcMessage(rt, rtcOptions, callback);
	    }
	};

	exports.Api = function (initConfigs) {
	    var self = this;

	    _util.extend(true, this, _clazz, initConfigs || {});

	    function _onRecvRtcMessage(from, rtcOptions, rtkey, tsxId, fromSessionId) {
	        if (rtcOptions.result != 0 && self['onServerError']) {
	            self['onServerError'].call(self, from, rtcOptions, rtkey, tsxId, fromSessionId);
	        } else {
	            var onFunction;

	            if (self.events[rtcOptions.op] && (onFunction = self[self.events[rtcOptions.op]])) {
	                onFunction.call(self, from, rtcOptions, rtkey, tsxId, fromSessionId);
	            } else {
	                _logger.info("can not handle(recvRtcMessage) the op: " + rtcOptions.op, rtcOptions);
	            }
	        }
	    }

	    this.rtcHandler.onRecvRtcMessage = _onRecvRtcMessage;
	};

/***/ },

/***/ 234:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * WebRTC
	 *
	 *                              A                   |                                       B
	 *                                                  |
	 *   1.createMedia:got streamA                      | 1.createMedia:got streamB
	 *   2.new RTCPeerConnection: APeerConnection       | 2.new RTCPeerConnection: BPeerConnection
	 *   3.APeerConnection.createOffer:got offerA       |
	 *      APeerConnection.setLocalDescription(offerA) |
	 *      send offerA ---> ---> ---> --->        ---> |
	 *                                                  | ---> 3.got offerA | offerA = new RTCSessionDescription(offerA);
	 *                                                  | BPeerConnection.setRemoteDescription(offerA)
	 *                                                  |
	 *                                                  |
	 *                                                  | 4.BPeerConnection.createAnswer: got answerB
	 *                                                  | BPeerConnection.setLocalDescription(answerB)
	 *                                                  | <---- send answerB
	 *                                                  | 5.got answerB <--- <--- <--- <---
	 *                                                  | answerB = new RTCSessionDescription(answerB)
	 *                                                  |
	 * APeerConnection.setRemoteDescription(answerB)    |
	 *                                                  |
	 * 6.got candidateA ---> --->  ---> --->            | ---> got candidateA
	 *                                                  | BPeerConnection.addIceCandidate(new RTCIceCandidate(candidateA))
	 *                                                  |
	 *                                                  |
	 *                                                  | got candidateB <--- <--- <--- <---
	 *                                                  | <--- 6.got candidateB APeerConnection.addIceCandidate(candidateB)
	 *                                                  |
	 *                                                  |
	 *                                                  | 7. APeerConnection.addStream(streamA)
	 *                                                  | 7.BPeerConnection.addStream(streamB)
	 *                                                  |
	 *                              streamA >>>>>>>>>>> |  <<<<< see A
	 *                              seeB <<<<<<<<<<<    | <<<<< streamB
	 *                                                  |
	 *
	 */
	var _util = __webpack_require__(230);
	var _logger = _util.logger;

	var _SDPSection = {
	    headerSection: null,

	    audioSection: null,
	    videoSection: null,

	    _parseHeaderSection: function _parseHeaderSection(sdp) {
	        var index = sdp.indexOf('m=audio');
	        if (index >= 0) {
	            return sdp.slice(0, index);
	        }

	        index = sdp.indexOf('m=video');
	        if (index >= 0) {
	            return sdp.slice(0, index);
	        }

	        return sdp;
	    },

	    _parseAudioSection: function _parseAudioSection(sdp) {
	        var index = sdp.indexOf('m=audio');
	        if (index >= 0) {
	            var endIndex = sdp.indexOf('m=video');
	            return sdp.slice(index, endIndex < 0 ? sdp.length : endIndex);
	        }
	    },

	    _parseVideoSection: function _parseVideoSection(sdp) {
	        var index = sdp.indexOf('m=video');
	        if (index >= 0) {
	            return sdp.slice(index);
	        }
	    },

	    spiltSection: function spiltSection(sdp) {
	        var self = this;

	        self.headerSection = self._parseHeaderSection(sdp);
	        self.audioSection = self._parseAudioSection(sdp);
	        self.videoSection = self._parseVideoSection(sdp);
	    },

	    removeSSRC: function removeSSRC(section) {
	        var arr = [];

	        var _arr = section.split(/a=ssrc:[^\n]+/g);
	        for (var i = 0; i < _arr.length; i++) {
	            _arr[i] != '\n' && arr.push(_arr[i]);
	        }
	        // arr.push('');

	        return arr.join('\n');
	    },

	    updateHeaderMsidSemantic: function updateHeaderMsidSemantic(wms) {

	        var self = this;

	        var line = "a=msid-semantic: WMS " + wms;

	        var _arr = self.headerSection.split(/a=msid\-semantic: WMS.*/g);
	        var arr = [];
	        switch (_arr.length) {
	            case 1:
	                arr.push(_arr[0]);
	                break;
	            case 2:
	                arr.push(_arr[0]);
	                arr.push(line);
	                arr.push('\n');
	                break;
	            case 3:
	                arr.push(_arr[0]);
	                arr.push(line);
	                arr.push('\n');
	                arr.push(_arr[2]);
	                arr.push('\n');
	                break;
	        }

	        return self.headerSection = arr.join('');
	    },

	    updateAudioSSRCSection: function updateAudioSSRCSection(ssrc, cname, msid, label) {
	        var self = this;

	        self.audioSection && (self.audioSection = self.removeSSRC(self.audioSection) + self.ssrcSection(ssrc, cname, msid, label));
	    },

	    updateVideoSSRCSection: function updateVideoSSRCSection(ssrc, cname, msid, label) {
	        var self = this;

	        self.videoSection && (self.videoSection = self.removeSSRC(self.videoSection) + self.ssrcSection(ssrc, cname, msid, label));
	    },

	    getUpdatedSDP: function getUpdatedSDP() {
	        var self = this;

	        var sdp = "";

	        self.headerSection && (sdp += self.headerSection);
	        self.audioSection && (sdp += self.audioSection);
	        self.videoSection && (sdp += self.videoSection);

	        return sdp;
	    },

	    parseMsidSemantic: function parseMsidSemantic(header) {
	        var self = this;

	        var regexp = /a=msid\-semantic: WMS (\S+)/ig;
	        var arr = self._parseLine(header, regexp);

	        arr && arr.length == 2 && (self.msidSemantic = {
	            line: arr[0],
	            WMS: arr[1]
	        });

	        return self.msidSemantic;
	    },

	    ssrcSection: function ssrcSection(ssrc, cname, msid, label) {
	        var lines = ['a=ssrc:' + ssrc + ' cname:' + cname, 'a=ssrc:' + ssrc + ' msid:' + msid + ' ' + label, 'a=ssrc:' + ssrc + ' mslabel:' + msid, 'a=ssrc:' + ssrc + ' label:' + label, ''];

	        return lines.join('\n');
	    },

	    parseSSRC: function parseSSRC(section) {
	        var self = this;

	        var regexp = new RegExp("a=(ssrc):(\\d+) (\\S+):(\\S+)", "ig");

	        var arr = self._parseLine(section, regexp);
	        if (arr) {
	            var ssrc = {
	                lines: [],
	                updateSSRCSection: self.ssrcSection
	            };

	            for (var i = 0; i < arr.length; i++) {
	                var e = arr[i];
	                if (e.indexOf("a=ssrc") >= 0) {
	                    ssrc.lines.push(e);
	                } else {
	                    switch (e) {
	                        case 'ssrc':
	                        case 'cname':
	                        case 'msid':
	                        case 'mslabel':
	                        case 'label':
	                            ssrc[e] = arr[++i];
	                    }
	                }
	            }

	            return ssrc;
	        }
	    },

	    _parseLine: function _parseLine(str, regexp) {
	        var arr = [];

	        var _arr;
	        while ((_arr = regexp.exec(str)) != null) {
	            for (var i = 0; i < _arr.length; i++) {
	                arr.push(_arr[i]);
	            }
	        }

	        if (arr.length > 0) {
	            return arr;
	        }
	    }
	};

	var SDPSection = function SDPSection(sdp) {
	    _util.extend(this, _SDPSection);
	    this.spiltSection(sdp);
	};

	/**
	 * Abstract
	 */
	var _WebRTC = {
	    mediaStreamConstaints: {
	        audio: true,
	        video: true
	    },

	    localStream: null,
	    rtcPeerConnection: null,

	    offerOptions: {
	        offerToReceiveAudio: 1,
	        offerToReceiveVideo: 1
	    },

	    createMedia: function createMedia(constaints, onGotStream) {
	        var self = this;

	        if (constaints && typeof constaints === "function") {
	            onGotStream = constaints;
	            constaints = null;
	        }

	        _logger.debug('[WebRTC-API] begin create media ......');

	        function gotStream(stream) {
	            _logger.debug('[WebRTC-API] got local stream');

	            self.localStream = stream;

	            var videoTracks = self.localStream.getVideoTracks();
	            var audioTracks = self.localStream.getAudioTracks();

	            if (videoTracks.length > 0) {
	                _logger.debug('[WebRTC-API] Using video device: ' + videoTracks[0].label);
	            }
	            if (audioTracks.length > 0) {
	                _logger.debug('[WebRTC-API] Using audio device: ' + audioTracks[0].label);
	            }

	            onGotStream ? onGotStream(self, stream) : self.onGotStream(stream);
	        }

	        return navigator.mediaDevices.getUserMedia(constaints
	        	|| self.mediaStreamConstaints)
	        		.then(gotStream)
	        		.then(self.onCreateMedia)
	        		['catch'](function (e) {
			            _logger.debug('[WebRTC-API] getUserMedia() error: ', e);
			            self.onError(e);
			        });
	    },

	    setLocalVideoSrcObject: function setLocalVideoSrcObject(stream) {
	        this.onGotLocalStream(stream);
	        _logger.debug('[WebRTC-API] you can see yourself !');
	    },

	    createRtcPeerConnection: function createRtcPeerConnection(iceServerConfig) {
	        _logger.debug('[WebRTC-API] begin create RtcPeerConnection ......');

	        var self = this;

	        // if (iceServerConfig && iceServerConfig.iceServers) {
	        // } else {
	        //     iceServerConfig = null;
	        // }

	        if (iceServerConfig) {
	            //reduce icecandidate number:add default value
	            !iceServerConfig.iceServers && (iceServerConfig.iceServers = []);

	            iceServerConfig.rtcpMuxPolicy = "require";
	            iceServerConfig.bundlePolicy = "max-bundle";

	            //iceServerConfig.iceTransportPolicy = 'relay';
	            if (iceServerConfig.relayOnly) {
	                iceServerConfig.iceTransportPolicy = 'relay';
	            }
	        } else {
	            iceServerConfig = null;
	        }
	        _logger.debug('[WebRTC-API] RtcPeerConnection config:', iceServerConfig);

	        self.startTime = window.performance.now();

	        var rtcPeerConnection = self.rtcPeerConnection = new RTCPeerConnection(iceServerConfig);
	        _logger.debug('[WebRTC-API] Created local peer connection object', rtcPeerConnection);

	        rtcPeerConnection.onicecandidate = function (event) {
	            //reduce icecandidate number: don't deal with tcp, udp only
	            if (event.type == "icecandidate" && (event.candidate == null || / tcp /.test(event.candidate.candidate))) {
	                return;
	            }
	            self.onIceCandidate(event);
	        };

	        rtcPeerConnection.onicestatechange = function (event) {
	            self.onIceStateChange(event);
	        };

	        rtcPeerConnection.oniceconnectionstatechange = function (event) {
	            self.onIceStateChange(event);
	        };

	        rtcPeerConnection.onaddstream = function (event) {
	            self._onGotRemoteStream(event);
	        };
	    },

	    _uploadLocalStream: function _uploadLocalStream() {
	        this.rtcPeerConnection.addStream(this.localStream);
	        _logger.debug('[WebRTC-API] Added local stream to RtcPeerConnection');
	    },

	    createOffer: function createOffer(onCreateOfferSuccess, onCreateOfferError) {
	        var self = this;

	        self._uploadLocalStream();

	        _logger.debug('[WebRTC-API] createOffer start...');

	        return self.rtcPeerConnection.createOffer(self.offerOptions).then(function (desc) {
	            self.offerDescription = desc;

	            _logger.debug('[WebRTC-API] Offer '); //_logger.debug('from \n' + desc.sdp);
	            _logger.debug('[WebRTC-API] setLocalDescription start');

	            self.rtcPeerConnection.setLocalDescription(desc).then(self.onSetLocalSessionDescriptionSuccess, self.onSetSessionDescriptionError).then(function () {
	                (onCreateOfferSuccess || self.onCreateOfferSuccess)(desc);
	            });
	        }, onCreateOfferError || self.onCreateSessionDescriptionError);
	    },

	    createPRAnswer: function createPRAnswer(onCreatePRAnswerSuccess, onCreatePRAnswerError) {
	        var self = this;

	        _logger.info(' createPRAnswer start');
	        // Since the 'remote' side has no media stream we need
	        // to pass in the right constraints in order for it to
	        // accept the incoming offer of audio and video.
	        return self.rtcPeerConnection.createAnswer().then(function (desc) {
	            _logger.debug('[WebRTC-API] _____________PRAnswer '); //_logger.debug('from :\n' + desc.sdp);

	            desc.type = "pranswer";
	            desc.sdp = desc.sdp.replace(/a=recvonly/g, 'a=inactive');

	            self.prAnswerDescription = desc;

	            _logger.debug('[WebRTC-API] inactive PRAnswer '); //_logger.debug('from :\n' + desc.sdp);
	            _logger.debug('[WebRTC-API] setLocalDescription start');

	            self.rtcPeerConnection.setLocalDescription(desc).then(self.onSetLocalSuccess, self.onSetSessionDescriptionError).then(function () {
	                var sdpSection = new SDPSection(desc.sdp);
	                sdpSection.updateHeaderMsidSemantic("MS_0000");
	                sdpSection.updateAudioSSRCSection(1000, "CHROME0000", "MS_0000", "LABEL_AUDIO_1000");
	                sdpSection.updateVideoSSRCSection(2000, "CHROME0000", "MS_0000", "LABEL_VIDEO_2000");

	                desc.sdp = sdpSection.getUpdatedSDP();

	                _logger.debug('[WebRTC-API] Send PRAnswer '); //_logger.debug('from :\n' + desc.sdp);

	                (onCreatePRAnswerSuccess || self.onCreatePRAnswerSuccess)(desc);
	            });
	        }, onCreatePRAnswerError || self.onCreateSessionDescriptionError);
	    },

	    createAnswer: function createAnswer(onCreateAnswerSuccess, onCreateAnswerError) {
	        var self = this;

	        self._uploadLocalStream();

	        _logger.info('[WebRTC-API] createAnswer start');
	        // Since the 'remote' side has no media stream we need
	        // to pass in the right constraints in order for it to
	        // accept the incoming offer of audio and video.
	        return self.rtcPeerConnection.createAnswer().then(function (desc) {
	            _logger.debug('[WebRTC-API] _____________________Answer '); //_logger.debug('from :\n' + desc.sdp);

	            desc.type = 'answer';

	            var sdpSection = new SDPSection(desc.sdp);
	            var ms = sdpSection.parseMsidSemantic(sdpSection.headerSection);

	            var audioSSRC = sdpSection.parseSSRC(sdpSection.audioSection);
	            var videoSSRC = sdpSection.parseSSRC(sdpSection.videoSection);

	            sdpSection.updateAudioSSRCSection(1000, "CHROME0000", ms.WMS, audioSSRC.label);
	            sdpSection.updateVideoSSRCSection(2000, "CHROME0000", ms.WMS, videoSSRC.label);
	            // mslabel cname


	            desc.sdp = sdpSection.getUpdatedSDP();

	            self.answerDescription = desc;

	            _logger.debug('[WebRTC-API] Answer '); //_logger.debug('from :\n' + desc.sdp);
	            _logger.debug('[WebRTC-API] setLocalDescription start');

	            self.rtcPeerConnection.setLocalDescription(desc).then(self.onSetLocalSuccess, self.onSetSessionDescriptionError).then(function () {
	                var sdpSection = new SDPSection(desc.sdp);
	                sdpSection.updateHeaderMsidSemantic("MS_0000");
	                sdpSection.updateAudioSSRCSection(1000, "CHROME0000", "MS_0000", "LABEL_AUDIO_1000");
	                sdpSection.updateVideoSSRCSection(2000, "CHROME0000", "MS_0000", "LABEL_VIDEO_2000");

	                desc.sdp = sdpSection.getUpdatedSDP();

	                _logger.debug('[WebRTC-API] Send Answer '); //_logger.debug('from :\n' + desc.sdp);

	                (onCreateAnswerSuccess || self.onCreateAnswerSuccess)(desc);
	            });
	        }, onCreateAnswerError || self.onCreateSessionDescriptionError);
	    },

	    close: function close() {
	        var self = this;
	        try {
	            self.rtcPeerConnection && self.rtcPeerConnection.close();
	        } catch (e) {}

	        if (self.localStream) {
	            self.localStream.getTracks().forEach(function (track) {
	                track.stop();
	            });
	        }
	        self.localStream = null;
	    },

	    addIceCandidate: function addIceCandidate(candidate) {
	        var self = this;

	        if (!self.rtcPeerConnection) {
	            return;
	        }

	        _logger.debug('[WebRTC-API] Add ICE candidate: \n', candidate);

	        var _cands = _util.isArray(candidate) ? candidate : [];
	        !_util.isArray(candidate) && _cands.push(candidate);

	        for (var i = 0; i < _cands.length; i++) {
	            candidate = _cands[i];

	            self.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(self.onAddIceCandidateSuccess, self.onAddIceCandidateError);
	        }
	    },

	    setRemoteDescription: function setRemoteDescription(desc) {
	        var self = this;

	        _logger.debug('[WebRTC-API] setRemoteDescription start. ');

	        desc = new RTCSessionDescription(desc);

	        return self.rtcPeerConnection.setRemoteDescription(desc).then(self.onSetRemoteSuccess, self.onSetSessionDescriptionError);
	    },

	    iceConnectionState: function iceConnectionState() {
	        var self = this;

	        return self.rtcPeerConnection.iceConnectionState;
	    },

	    onCreateMedia: function onCreateMedia() {
	        _logger.debug('[WebRTC-API] media created.');
	    },

	    _onGotRemoteStream: function _onGotRemoteStream(event) {
	        _logger.debug('[WebRTC-API] onGotRemoteStream.', event);

	        this.onGotRemoteStream(event.stream);
	        _logger.debug('[WebRTC-API] received remote stream, you will see the other.');
	    },

	    onGotStream: function onGotStream(stream) {
	        _logger.debug('[WebRTC-API] on got a local stream');
	    },

	    onSetRemoteSuccess: function onSetRemoteSuccess() {
	        _logger.info('[WebRTC-API] onSetRemoteSuccess complete');
	    },

	    onSetLocalSuccess: function onSetLocalSuccess() {
	        _logger.info('[WebRTC-API] setLocalDescription complete');
	    },

	    onAddIceCandidateSuccess: function onAddIceCandidateSuccess() {
	        _logger.debug('[WebRTC-API] addIceCandidate success');
	    },

	    onAddIceCandidateError: function onAddIceCandidateError(error) {
	        _logger.debug('[WebRTC-API] failed to add ICE Candidate: ' + error.toString());
	    },

	    onIceCandidate: function onIceCandidate(event) {
	        _logger.debug('[WebRTC-API] onIceCandidate : ICE candidate: \n' + event.candidate);
	    },

	    onIceStateChange: function onIceStateChange(event) {
	        _logger.debug('[WebRTC-API] onIceStateChange : ICE state change event: ', event);
	    },

	    onCreateSessionDescriptionError: function onCreateSessionDescriptionError(error) {
	        _logger.error('[WebRTC-API] Failed to create session description: ' + error.toString());
	    },

	    onCreateOfferSuccess: function onCreateOfferSuccess(desc) {
	        _logger.debug('[WebRTC-API] create offer success');
	    },

	    onCreatePRAnswerSuccess: function onCreatePRAnswerSuccess(desc) {
	        _logger.debug('[WebRTC-API] create answer success');
	    },

	    onCreateAnswerSuccess: function onCreateAnswerSuccess(desc) {
	        _logger.debug('[WebRTC-API] create answer success');
	    },

	    onSetSessionDescriptionError: function onSetSessionDescriptionError(error) {
	        _logger.error('[WebRTC-API] onSetSessionDescriptionError : Failed to set session description: ' + error.toString());
	    },

	    onSetLocalSessionDescriptionSuccess: function onSetLocalSessionDescriptionSuccess() {
	        _logger.debug('[WebRTC-API] onSetLocalSessionDescriptionSuccess : setLocalDescription complete');
	    }

	};

	module.exports = function (initConfigs) {
	    _util.extend(true, this, _WebRTC, initConfigs || {});
	};

/***/ },

/***/ 235:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * P2P
	 */
	var _util = __webpack_require__(230);
	var RouteTo = __webpack_require__(233).RouteTo;
	var _logger = _util.logger;

	var P2PRouteTo = RouteTo({
	    success: function success(result) {
	        _logger.debug("iq to server success", result);
	    },
	    fail: function fail(error) {
	        _logger.debug("iq to server error", error);
	    }
	});

	var CommonPattern = {
	    _pingIntervalId: null,
	    _p2pConfig: null,
	    _rtcCfg: null,
	    _rtcCfg2: null,
	    _rtKey: null,
	    _rtFlag: null,

	    webRtc: null,
	    api: null,

	    callee: null,

	    consult: false,

	    init: function init() {
	        var self = this;

	        self.api.onPing = function () {
	            self._onPing.apply(self, arguments);
	        };
	        self.api.onTcklC = function () {
	            self._onTcklC.apply(self, arguments);
	        };
	        self.api.onAcptC = function () {
	            self._onAcptC.apply(self, arguments);
	        };
	        self.api.onAnsC = function () {
	            self._onAnsC.apply(self, arguments);
	        };
	        self.api.onTermC = function () {
	            self._onTermC.apply(self, arguments);
	        };
	        self.webRtc.onIceCandidate = function () {
	            self._onIceCandidate.apply(self, arguments);
	        };
	        self.webRtc.onIceStateChange = function () {
	            self._onIceStateChange.apply(self, arguments);
	        };
	    },

	    _ping: function _ping() {
	        var self = this;

	        function ping() {
	            var rt = new P2PRouteTo({
	                to: self.callee,
	                rtKey: self._rtKey
	            });

	            self.api.ping(rt, self._sessId, function (from, rtcOptions) {
	                _logger.debug("ping result", rtcOptions);
	            });
	        }

	        self._pingIntervalId = window.setInterval(ping, 59000);
	    },

	    _onPing: function _onPing(from, options, rtkey, tsxId, fromSid) {
	        _logger.debug('_onPing from', fromSid);
	    },

	    initC: function initC(mediaStreamConstaints, accessSid) {
	        var self = this;
	        self.sid = accessSid;

	        self.createLocalMedia(mediaStreamConstaints);
	    },

	    createLocalMedia: function createLocalMedia(mediaStreamConstaints) {
	        var self = this;

	        self.consult = false;

	        this.webRtc.createMedia(mediaStreamConstaints, function (webrtc, stream) {
	            webrtc.setLocalVideoSrcObject(stream);

	            self.webRtc.createRtcPeerConnection(self._rtcCfg);

	            self.webRtc.createOffer(function (offer) {
	                self._onGotWebRtcOffer(offer);

	                self._onHandShake();
	            });
	        });
	    },

	    _onGotWebRtcOffer: function _onGotWebRtcOffer(offer) {
	        var self = this;

	        var rt = new P2PRouteTo({
	            sid: self.sid,
	            to: self.callee,
	            rtKey: self._rtKey
	        });

	        self.api.initC(rt, null, null, self._sessId, self._rtcId, null, null, offer, null, self._rtcCfg2, null, function (from, rtcOptions) {
	            _logger.debug("initc result", rtcOptions);
	        });

	        self._ping();
	    },

	    _onAcptC: function _onAcptC(from, options) {
	        var self = this;

	        if (options.ans && options.ans == 1) {
	            _logger.info("[WebRTC-API] _onAcptC : 104, ans = 1, it is a answer. will onAcceptCall");
	            self.onAcceptCall(from, options);
	            self._onAnsC(from, options);
	        }
	        if (!WebIM.WebRTC.supportPRAnswer) {
	            _logger.info("[WebRTC-API] _onAcptC : not supported pranswer. drop it. will onAcceptCall");
	            self.onAcceptCall(from, options);
	        } else {
	            _logger.info("[WebRTC-API] _onAcptC : recv pranswer. ");

	            if (options.sdp || options.cands) {
	                // options.sdp && (options.sdp.type = "pranswer");
	                options.sdp && self.webRtc.setRemoteDescription(options.sdp);
	                options.cands && self._onTcklC(from, options);

	                //self._onHandShake(from, options);

	                self.onAcceptCall(from, options);
	            }
	        }
	    },

	    onAcceptCall: function onAcceptCall(from, options) {},

	    _onAnsC: function _onAnsC(from, options) {
	        // answer
	        var self = this;

	        _logger.info("[WebRTC-API] _onAnsC : recv answer. ");

	        options.sdp && self.webRtc.setRemoteDescription(options.sdp);
	        options.cands && self._onTcklC(from, options);
	    },

	    _onInitC: function _onInitC(from, options, rtkey, tsxId, fromSid) {
	        var self = this;

	        self.consult = false;

	        self.callee = from;
	        self._rtcCfg2 = options.rtcCfg;
	        self._rtKey = rtkey;
	        self._tsxId = tsxId;
	        self._fromSid = fromSid;

	        self._rtcId = options.rtcId;
	        self._sessId = options.sessId;

	        self.webRtc.createRtcPeerConnection(self._rtcCfg2);

	        options.cands && self._onTcklC(from, options);
	        options.sdp && self.webRtc.setRemoteDescription(options.sdp).then(function () {
	            self._onHandShake(from, options);

	            /*
	             * chrome 版本 大于 50时，可以使用pranswer。
	             * 小于50 不支持pranswer，此时处理逻辑是，直接进入振铃状态
	             *
	             */
	            if (WebIM.WebRTC.supportPRAnswer) {
	                self.webRtc.createPRAnswer(function (prAnswer) {
	                    self._onGotWebRtcPRAnswer(prAnswer);

	                    setTimeout(function () {
	                        //由于 chrome 在 pranswer时，ice状态只是 checking，并不能像sdk那样 期待 connected 振铃；所以目前改为 发送完pranswer后，直接振铃
	                        _logger.info("[WebRTC-API] onRinging : after send pranswer. ", self.callee);
	                        self.onRinging(self.callee);
	                    }, 500);
	                });
	            } else {
	                setTimeout(function () {
	                    _logger.info("[WebRTC-API] onRinging : After iniC, cause by: not supported pranswer. ", self.callee);
	                    self.onRinging(self.callee);
	                }, 500);
	                self._ping();
	            }
	        });
	    },

	    _onGotWebRtcPRAnswer: function _onGotWebRtcPRAnswer(prAnswer) {
	        var self = this;

	        var rt = new P2PRouteTo({
	            //tsxId: self._tsxId,
	            to: self.callee,
	            rtKey: self._rtKey
	        });

	        //self._onHandShake();

	        //self.api.acptC(rt, self._sessId, self._rtcId, prAnswer, null, 1);
	        self.api.acptC(rt, self._sessId, self._rtcId, prAnswer);

	        self._ping();
	    },

	    onRinging: function onRinging(caller) {},

	    accept: function accept() {
	        var self = this;

	        function createAndSendAnswer() {
	            _logger.info("createAndSendAnswer : ...... ");

	            self.webRtc.createAnswer(function (answer) {
	                var rt = new P2PRouteTo({
	                    //tsxId: self._tsxId,
	                    to: self.callee,
	                    rtKey: self._rtKey
	                });

	                if (WebIM.WebRTC.supportPRAnswer) {
	                    self.api.ansC(rt, self._sessId, self._rtcId, answer);
	                } else {
	                    self.api.acptC(rt, self._sessId, self._rtcId, answer, null, 1);
	                }
	            });
	        }

	        self.webRtc.createMedia(function (webrtc, stream) {
	            webrtc.setLocalVideoSrcObject(stream);

	            createAndSendAnswer();
	        });
	    },

	    _onHandShake: function _onHandShake(from, options) {
	        var self = this;

	        self.consult = true;
	        _logger.info("hand shake over. may switch cands.");

	        options && setTimeout(function () {
	            self._onTcklC(from, options);
	        }, 100);

	        setTimeout(function () {
	            self._onIceCandidate();
	        }, 100);
	    },

	    _onTcklC: function _onTcklC(from, options) {
	        // offer
	        var self = this;

	        // options.sdp && self.webRtc.setRemoteDescription(options.sdp);

	        if (self.consult) {
	            _logger.info("[WebRTC-API] recv and add cands.");

	            self._recvCands && self._recvCands.length > 0 && self.webRtc.addIceCandidate(self._recvCands);
	            options && options.cands && self.webRtc.addIceCandidate(options.cands);
	        } else if (options && options.cands && options.cands.length > 0) {
	            for (var i = 0; i < options.cands.length; i++) {
	                (self._recvCands || (self._recvCands = [])).push(options.cands[i]);
	            }
	            _logger.debug("[_onTcklC] temporary memory[recv] ice candidate. util consult = true");
	        }
	    },

	    _onIceStateChange: function _onIceStateChange(event) {
	        var self = this;
	        event && _logger.debug("[WebRTC-API] " + self.webRtc.iceConnectionState() + " |||| ice state is " + event.target.iceConnectionState);
	        self.api.onIceConnectionStateChange(self.webRtc.iceConnectionState());
	    },

	    _onIceCandidate: function _onIceCandidate(event) {
	        var self = this;

	        if (self.consult) {
	            var sendIceCandidate = function sendIceCandidate(candidate) {
	                _logger.debug("send ice candidate...");

	                var rt = new P2PRouteTo({
	                    to: self.callee,
	                    rtKey: self._rtKey
	                });

	                if (candidate) {
	                    self.api.tcklC(rt, self._sessId, self._rtcId, null, candidate);
	                }
	            };

	            if (self._cands && self._cands.length > 0) {

	                sendIceCandidate(self._cands);

	                self._cands = [];
	            }
	            event && event.candidate && sendIceCandidate(event.candidate);
	        } else {
	            event && event.candidate && (self._cands || (self._cands = [])).push(event.candidate);
	            _logger.debug("[_onIceCandidate] temporary memory[send] ice candidate. util consult = true");
	        }
	    },

	    termCall: function termCall(reason) {
	        var self = this;

	        self._pingIntervalId && window.clearInterval(self._pingIntervalId);

	        var rt = new P2PRouteTo({
	            to: self.callee,
	            rtKey: self._rtKey
	        });

	        self.hangup || self.api.termC(rt, self._sessId, self._rtcId, reason);

	        self.webRtc.close();

	        self.hangup = true;

	        self.onTermCall(reason);
	    },

	    _onTermC: function _onTermC(from, options) {
	        var self = this;

	        self.hangup = true;
	        self.termCall(options.reason);
	    },

	    onTermCall: function onTermCall() {
	        //to be overwrited by call.listener.onTermCall
	    }
	};

	module.exports = function (initConfigs) {
	    var self = this;

	    _util.extend(true, this, CommonPattern, initConfigs || {});

	    self.init();
	};

	/**
	 * TODO: Conference
	 */

/***/ }

/******/ });
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



(function(){
	var _const = {
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
		// 坐席状态，dom上的className值
		agentStatusClassName: {
			Idle: 'online',
			Online: 'online',
			Busy: 'busy',
			Leave: 'leave',
			Hidden: 'hidden',
			Offline: 'offline',
			Logout: 'offline',
			Other: 'em-hide'
		},
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
		}
	};

	window.easemobim = window.easemobim || {};
	easemobim._const = _const;

	//每页历史记录条数
	easemobim.LISTSPAN = 10;

	//支持的图片格式
	easemobim.PICTYPE = {
		jpg: true,
		gif: true,
		png: true,
		bmp: true
	};

	//自定义支持的文件格式
	easemobim.FILETYPE = {
		zip: true,
		doc: true,
		docx: true,
		txt: true,
		gif: true
	};

	//loading element
	easemobim.LOADING = !easemobim.utils.isQQBrowserInAndroid && easemobim.utils.getIEVersion > 9
		? ["<div class='em-widget-loading'><svg version='1.1' id='图层_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'",
		" viewBox='0 0 70 70' enable-background='new 0 0 70 70' xml:space='preserve'>",
		"<circle opacity='0.3' fill='none' stroke='#000000' stroke-width='4' stroke-miterlimit='10' cx='35' cy='35' r='11'/>",
		"<path fill='none' stroke='#E5E5E5' stroke-width='4' stroke-linecap='round' stroke-miterlimit='10' d='M24,35c0-6.1,4.9-11,11-11",
		"c2.8,0,5.3,1,7.3,2.8'/><image src='//kefu.easemob.com/webim/static/img/loading.gif' width='20' style='margin-top:10px;' /></svg></div>"].join('')
		: "<img src='//kefu.easemob.com/webim/static/img/loading.gif' width='20' style='margin-top:10px;'/>";

	//表情包
	Easemob.im.EMOTIONS = {
		path: 'static/img/faces/'
		, map: {
			'[):]': 'ee_1.png',
			'[:D]': 'ee_2.png',
			'[;)]': 'ee_3.png',
			'[:-o]': 'ee_4.png',
			'[:p]': 'ee_5.png',
			'[(H)]': 'ee_6.png',
			'[:@]': 'ee_7.png',
			'[:s]': 'ee_8.png',
			'[:$]': 'ee_9.png',
			'[:(]': 'ee_10.png',
			'[:\'(]': 'ee_11.png',
			'[:|]': 'ee_12.png',
			'[(a)]': 'ee_13.png',
			'[8o|]': 'ee_14.png',
			'[8-|]': 'ee_15.png',
			'[+o(]': 'ee_16.png',
			'[<o)]': 'ee_17.png',
			'[|-)]': 'ee_18.png',
			'[*-)]': 'ee_19.png',
			'[:-#]': 'ee_20.png',
			'[:-*]': 'ee_21.png',
			'[^o)]': 'ee_22.png',
			'[8-)]': 'ee_23.png',
			'[(|)]': 'ee_24.png',
			'[(u)]': 'ee_25.png',
			'[(S)]': 'ee_26.png',
			'[(*)]': 'ee_27.png',
			'[(#)]': 'ee_28.png',
			'[(R)]': 'ee_29.png',
			'[({)]': 'ee_30.png',
			'[(})]': 'ee_31.png',
			'[(k)]': 'ee_32.png',
			'[(F)]': 'ee_33.png',
			'[(W)]': 'ee_34.png',
			'[(D)]': 'ee_35.png'
		}
	};
}());
;(function () {
	var EMPTYFN = function () {};

	var _createStandardXHR = function () {
		try {
			return new window.XMLHttpRequest();
		} catch( e ) {
			return false;
		}
	};
	
	var _createActiveXHR = function () {
		try {
			return new window.ActiveXObject( "Microsoft.XMLHTTP" );
		} catch( e ) {
			return false;
		}
	};

	var emajax = function ( options ) {
		var dataType = options.dataType || 'text';
		var suc = options.success || EMPTYFN;
		var error = options.error || EMPTYFN;
		var xhr = _createStandardXHR () || _createActiveXHR();
		xhr.onreadystatechange = function () {
			if( xhr.readyState === 4 ){
				var status = xhr.status || 0;
				if ( status === 200 ) {
					if ( dataType === 'text' ) {
						suc(xhr.responseText, xhr);
						return;
					}
					if ( dataType === 'json' ) {
						try {
							var json = JSON.parse(xhr.responseText);
							suc(json,xhr);
						} catch ( e ) {}
						return;
					}
					suc(xhr.response || xhr.responseText,xhr);
					return;
				} else {
					if ( dataType=='json'){
						try{
							var json = JSON.parse(xhr.responseText);
							error(json, xhr, '服务器返回错误信息');
						} catch ( e ) {
							error(xhr.responseText,xhr, '服务器返回错误信息');
						}
						return;
					}
					error(xhr.responseText, xhr, '服务器返回错误信息');
					return;
				}
			}
			if( xhr.readyState === 0 ) {
				error(xhr.responseText, xhr, '服务器异常');
			}
		};

		var type = options.type || 'GET',
			data = options.data || {},
			tempData = '';

		if ( type.toLowerCase() === 'get' ) {
			for ( var o in data ) {
				if ( data.hasOwnProperty(o) ) {
					tempData += o + '=' + data[o] + '&';
				}
			}
			tempData = tempData ? tempData.slice(0, -1) : tempData;
			options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
			data = null;
		} else {
			data._v = new Date().getTime();
			data = JSON.stringify(data);
		}
		xhr.open(type, options.url);
		if ( xhr.setRequestHeader ) {

			var headers = options.headers || {};

			headers['Content-Type'] = headers['Content-Type'] || 'application/json';

			for ( var key in headers ) {
				if ( headers.hasOwnProperty(key) ) {
					xhr.setRequestHeader(key, headers[key]);
				}
			}
		}
		xhr.send(data);
		return xhr;
	};
	window.easemobim = window.easemobim || {};
	window.easemobim.emajax = emajax;
}());

window.easemobim = window.easemobim || {};
window.easemobIM = window.easemobIM || {};

easemobIM.Transfer = easemobim.Transfer = (function () {
	'use strict'
   
	var handleMsg = function ( e, callback, accept ) {
		// 微信调试工具会传入对象，导致解析出错
		if('string' !== typeof e.data) return;
		var msg = JSON.parse(e.data);


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

;(function () {
	var getData = new easemobim.Transfer(null, 'api');

	var createObject = function ( options ) {
		var headers = null;

		if ( options.msg.data && options.msg.data.headers ) {
			headers = options.msg.data.headers;
			delete options.msg.data.headers;
		}

		return {
			url: options.url
			, headers: headers
			, data: options.excludeData ? null : options.msg.data
			, type: options.type || 'GET'
			, success: function ( info ) {
				try {
					info = JSON.parse(info);
				} catch ( e ) {}
				getData.send({
					call: options.msg.api
					, timespan: options.msg.timespan
					, status: 0
					, data: info
				});
			}
			, error: function ( info ) {
				try {
					info = JSON.parse(info);
				} catch ( e ) {}
				getData.send({
					call: options.msg.api
					, timespan: options.msg.timespan
					, status: 1
					, data: info
				});
			}
		};
	};

	getData.listen(function ( msg ) {

		getData.targetOrigin = msg.origin;

		switch ( msg.api ) {
			case 'getRelevanceList':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/targetChannels',
					msg: msg
				}));
				break;
			case 'getDutyStatus':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/showMessage',
					msg: msg
				}));
				break;
			case 'getWechatVisitor':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors/wechat/' + msg.data.openid + '?tenantId=' + msg.data.tenantId,
					msg: msg,
					type: 'POST'
				}));
				break;
			case 'createVisitor':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors?tenantId=' + msg.data.tenantId,
					msg: msg,
					type: 'POST'
				}));
				break;
			case 'getSession':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors/' + msg.data.id + '/schedule-data?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			case 'getExSession':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors/' + msg.data.id + '/schedule-data-ex?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			case 'getPassword':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors/password',
					msg: msg
				}));
				break;
			case 'getGroup':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors/' + msg.data.id + '/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			case 'getGroupNew':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/tenant/' + msg.data.tenantId + '/visitors/' + msg.data.id + '/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			case 'getHistory':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/visitors/msgHistory',
					msg: msg
				}));
				break;
			case 'getSlogan':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/notice/options',
					msg: msg
				}));
				break;
			case 'getTheme':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/theme/options',
					msg: msg
				}));
				break;
			case 'getSystemGreeting':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/welcome',
					msg: msg
				}));
				break;
			case 'getRobertGreeting':
				easemobim.emajax(createObject({
					url: '/v1/Tenants/'
						+ msg.data.tenantId
						+ '/robots/visitor/greetings/'
						+ msg.data.originType
						+ '?tenantId=' + msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			case 'sendVisitorInfo':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/tenants/' + msg.data.tenantId + '/visitors/' + msg.data.visitorId + '/attributes?tenantId=' + msg.data.tenantId,
					msg: msg,
					type: 'POST'
				}));
				break;
			case 'getProject':
				easemobim.emajax(createObject({
					url: '/tenants/' + msg.data.tenantId + '/projects',
					msg: msg
				}));
				break;
			case 'createTicket':
				easemobim.emajax(createObject({
					url: '/tenants/'+ msg.data.tenantId + '/projects/' + msg.data.projectId + '/tickets?tenantId=' + msg.data.tenantId + '&easemob-target-username=' + msg.data['easemob-target-username'] + '&easemob-appkey=' + msg.data['easemob-appkey'] + '&easemob-username=' + msg.data['easemob-username'],
					msg: msg,
					type: 'POST'
				}));
				break;
			case 'receiveMsgChannel':
				easemobim.emajax(createObject({
					url: '/v1/imgateway/messages',
					msg: msg
				}));
				break;
			case 'sendMsgChannel':
				easemobim.emajax(createObject({
					url: '/v1/imgateway/messages?tenantId=' + msg.data.tenantId,
					msg: msg,
					type: 'POST'
				}));
				break;
			case 'getAgentStatus':
				easemobim.emajax(createObject({
					url: '/v1/tenants/' + msg.data.tenantId + '/agents/' + msg.data.agentUserId + '/agentstate',
					msg: msg
				}));
				break;
			case 'getNickNameOption':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/agentnicename/options?tenantId=' + msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			// 此接口使用的是单独的微服务，无需限流
			case 'reportEvent':
				easemobim.emajax(createObject({
					url: '/v1/event_collector/events',
					msg: msg,
					type: 'POST'
				}));
				break;
			case 'deleteEvent':
				easemobim.emajax(createObject({
					url: '/v1/event_collector/event/' + encodeURIComponent(msg.data.userId),
					msg: msg,
					type: 'DELETE',
					excludeData: true
				}));
				break;
			case 'mediaStreamUpdateStatus':
				// patch
				var streamId = msg.data.streamId;
				delete msg.data.streamId;

				easemobim.emajax(createObject({
					url: '/v1/rtcmedia/media_streams/' + streamId,
					msg: msg,
					type: 'PUT'
				}));
				break;
			case 'getKefuOptions/audioVideo':
				easemobim.emajax(createObject({
					url: '/tenants/' + msg.data.tenantId + '/options/audioVideo',
					msg: msg,
					excludeData: true
				}));
				break;
			case 'graylist':
				easemobim.emajax(createObject({
					url: '/management/graylist',
					msg: msg,
					excludeData: true
				}));
				break;
			default:
				break;
		}
	}, ['data']);
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
 * autogrow
 */
easemobim.autogrow = (function () {
	return function ( options ) {
		var utils = easemobim.utils,
			that = options.dom,
			minHeight = that.getBoundingClientRect().height,
			lineHeight = that.style.lineHeight;
		
		var shadow = document.createElement('div');
		shadow.style.cssText = [
			'position:absolute;',
			'top:-10000px;',
			'left:-10000px;',
			'width:' + (that.getBoundingClientRect().width - 45) +'px;',
			'font-size:' + (that.style.fontSize || 17) + 'px;',
			'line-height:' + (that.style.lineHeight || 17) + 'px;',
			'resize:none;',
			'word-wrap:break-word;'].join('');
		document.body.appendChild(shadow);

		var update = function () {
			var times = function ( string, number ) {
				for ( var i = 0, r = ''; i < number; i++ ) {
					r += string;
				}
				return r;
			};
			
			var val = this.value
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/&/g, '&amp;')
			.replace(/\n$/, '<br/>&nbsp;')
			.replace(/\n/g, '<br/>')
			.replace(/ {2,}/g, function(space) { return times('&nbsp;', space.length -1) + ' ' });
			
			shadow.innerHTML = val;
			val && (this.style.height = Math.max(shadow.getBoundingClientRect().height + 17, minHeight) + 'px');
			typeof options.callback == 'function' && options.callback();
		};
		
		utils.on(that, 'change', update);
		utils.on(that, 'keyup', update);
		utils.on(that, 'keydown', update);
		
		options.update = function () {
			update.apply(that);
		}
		update.apply(that);
	};
}());

//文本消息
Easemob.im.EmMessage.txt = function ( id ) {
	this.id = id;
	this.type = 'txt';
	this.brief = '';
	this.body = {};
};
Easemob.im.EmMessage.txt.prototype.get = function ( isReceive ) {
	if ( !this.value ) {
		return '';
	}

	this.value = this.emotion ? this.value : easemobim.utils.decode(this.value);
	
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				this.id ? "<div id='" + this.id + "_failed' data-type='txt' class='em-widget-msg-status em-hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					"<pre>" + Easemob.im.Utils.parseLink(this.emotion ? this.value : Easemob.im.Utils.parseEmotions(this.value)) + "</pre>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};
Easemob.im.EmMessage.txt.prototype.set = function ( opt ) {
	this.value = opt.value;
	this.emotion = opt.emotion;
	if ( this.value ) {
		this.brief = (opt.brief || this.value).replace(/\n/mg, '');
		this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
	}
	this.body = {
		id: this.id
		, to: opt.to
		, msg: this.value 
		, type : this.type
		, ext: opt.ext || {}
		, success: opt.success
		, fail: opt.fail
	};
};

//cmd消息
Easemob.im.EmMessage.cmd = function ( id ) {
	this.id = id;
	this.type = 'cmd';
	this.body = {};
};
Easemob.im.EmMessage.cmd.prototype.set = function ( opt ) {
	this.value = '';

	this.body = {
		to: opt.to
		, action: opt.action
		, msg: this.value 
		, type : this.type 
		, ext: opt.ext || {}
	};
};

//图片消息
Easemob.im.EmMessage.img = function ( id ) {
	this.id = id;
	this.type = 'img';
	this.brief = '图片';
	this.body = {};
}
Easemob.im.EmMessage.img.prototype.get = function ( isReceive ) {
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",,
				this.id ? "<div id='" + this.id + "_failed' class='em-widget-msg-status em-hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					this.value === null ? "<i class='icon-broken-pic'></i>" : "<a href='javascript:;'><img class='em-widget-imgview' src='" + this.value.url + "'/></a>",,
				"</div>",
			"</div>",
		"</div>"
	].join('');
}
Easemob.im.EmMessage.img.prototype.set = function ( opt ) {
	this.value = opt.file;
				
	this.body = {
		id: this.id 
		, file: this.value 
		, apiUrl: opt.apiUrl
		, accessToken: opt.accessToken
		, to: opt.to
		, type : this.type
		, onFileUploadError : opt.uploadError
		, onFileUploadComplete: opt.uploadComplete
		, success: opt.success
		, fail: opt.fail
		, flashUpload: opt.flashUpload
	};
}
//按钮列表消息，机器人回复，满意度调查
Easemob.im.EmMessage.list = function ( id ) {
	this.id = id;
	this.type = 'list';
	this.brief = '';
	this.body = {};
};
Easemob.im.EmMessage.list.prototype.get = function ( isReceive ) {
	if ( !this.value ) {
		return '';
	}
	return [
		"<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",,
				"<div class='em-widget-msg-container em-widget-msg-menu'>",
					"<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(easemobim.utils.encode(this.value))) + "</p>",
					this.listDom,
				"</div>",
				"<div id='" + this.id + "_failed' class='em-widget-msg-status em-hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>",
			"</div>",
		"</div>"
	].join('');
};
Easemob.im.EmMessage.list.prototype.set = function ( opt ) {
	this.value = opt.value;
	if ( this.value ) {
		this.brief = this.value.replace(/\n/mg, '');
		this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
	}
	this.listDom = opt.list;
};
//文件消息
Easemob.im.EmMessage.file = function ( id ) {
	this.id = id;
	this.type = 'file';
	this.brief = '文件';
	this.body = {};
}
Easemob.im.EmMessage.file.prototype.get = function ( isReceive ) {
	var filename = this.filename;
	var filesize = easemobim.utils.filesizeFormat(this.value.filesize);
	var url = this.value.url;
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper em-widget-msg-file'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",,
				this.id
				? "<div id='" + this.id + "_failed' class='em-widget-msg-status em-hide'>"
				+ "<span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>"
				+ "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + config.LOADING + "</div>"
				: "",
				"<div class='em-widget-msg-container'>",
					this.value === null
					? "<i class='icon-broken-pic'></i>"
					: '<i class="icon-file"></i>'
					+ '<span class="file-info">'
						+ '<p class="filename">' + filename + '</p>'
						+ '<p class="filesize">' + filesize + '</p>'
					+ '</span>'
					+ "<a target='_blank' href='" + url + "' class='icon-file-download' title='"
					+ filename + "'></a>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
}
Easemob.im.EmMessage.file.prototype.set = function ( opt ) {
	this.value = opt.file;
	this.filename = opt.filename || this.value.filename || '文件';

	this.body = {
		id: this.id 
		, file: this.value
		, filename: this.filename
		, apiUrl: opt.apiUrl
		, to: opt.to
		, type: this.type
		, onFileUploadError : opt.uploadError
		, onFileUploadComplete: opt.uploadComplete
		, success: opt.success
		, fail: opt.fail
		, flashUpload: opt.flashUpload
	};
}

/**
 * ctrl+v发送截图功能:当前仅支持chrome/firefox/ie11
 */
easemobim.paste = function ( chat ) {
	var dom = document.createElement('div'),
		utils = easemobim.utils,
		data;

	utils.addClass(dom, 'em-widget-dialog em-widget-paste-wrapper em-hide');
	utils.html(dom, "\
		<div class='em-widget-paste-image'></div>\
		<div>\
			<button class='em-widget-cancel'>取消</button>\
			<button class='bg-color'>发送</button>\
		</div>\
	");
	easemobim.imChat.appendChild(dom);

	var buttons = dom.getElementsByTagName('button'),
		cancelBtn = buttons[0],
		sendImgBtn = buttons[1],
		imgContainer = dom.getElementsByTagName('div')[0];

	utils.on(cancelBtn, 'click', function () {
		easemobim.paste.hide();
	});
	utils.on(sendImgBtn, 'click', function () {
		chat.sendImgMsg({data: data, url: dom.getElementsByTagName('img')[0].getAttribute('src')});
		easemobim.paste.hide();
	});

	return ({
		show: function ( blob ) {
			var img = new Image();
			if ( typeof blob === 'string' ) {
				img.src = blob;
			} else {
				img.src = window.URL.createObjectURL(blob);
			}
			data = blob;
			imgContainer.appendChild(img);
			utils.removeClass(dom, 'em-hide');
			img = null;
		}
		, hide: function () {
			imgContainer.innerHTML = '';
			utils.addClass(dom, 'em-hide');
		}
		, bind: function () {
			var me = this;

			utils.on(easemobim.textarea, 'paste', function ( e ) {
				var ev = e || window.event;

				try {
					if ( ev.clipboardData && ev.clipboardData.types ) {
						if ( ev.clipboardData.items.length > 0 ) {
							if ( /^image\/\w+$/.test(ev.clipboardData.items[0].type) ) {
								me.show(ev.clipboardData.items[0].getAsFile());
							}
						}
					} else if ( window.clipboardData ) {
						var url = window.clipboardData.getData('URL');
						me.show(url);
					}
				} catch ( ex ) {}
			});
			return this;
		}
	}.bind());
};

/**
 * 留言
 */
;(function () {
	easemobim.leaveMessage = function ( chat, tenantId ) {

		var leaveMessage = this.leaveMessage,
			utils = this.utils,
			imChat = easemobim.imChat;

		if ( leaveMessage.dom ) {
			return false;
		}

		leaveMessage.domBg = document.createElement('div');
		leaveMessage.dom = document.createElement('div');
		leaveMessage.domBg.id = 'em-widgetOffline';
		utils.addClass(leaveMessage.domBg, 'em-widget-offline-bg em-hide');
		utils.addClass(leaveMessage.dom, 'em-widget-offline');
		utils.html(leaveMessage.dom, "\
			<h3>请填写以下内容以方便我们及时联系您</h3>\
			<input type='text' placeholder='姓名'/>\
			<input type='text' placeholder='电话'/>\
			<input type='text' placeholder='邮箱'/>\
			<textarea spellcheck='false' placeholder='请输入留言'></textarea>\
			<button class='em-widget-offline-cancel'>取消</button>\
			<button class='em-widget-offline-ok bg-color'>留言</button>\
			<div class='em-widget-success-prompt em-hide'><i class='icon-circle'><i class='icon-good'></i></i><p>留言发送成功</p></div>\
			");
		leaveMessage.domBg.appendChild(leaveMessage.dom);
		imChat.appendChild(leaveMessage.domBg);

		var msg = leaveMessage.dom.getElementsByTagName('textarea')[0],
			contact = leaveMessage.dom.getElementsByTagName('input')[0],
			phone = leaveMessage.dom.getElementsByTagName('input')[1],
			mail = leaveMessage.dom.getElementsByTagName('input')[2],
			leaveMessageBtn = leaveMessage.dom.getElementsByTagName('button')[1],
			cancelBtn = leaveMessage.dom.getElementsByTagName('button')[0],
			success = leaveMessage.dom.getElementsByTagName('div')[0];

		//close
		utils.on(cancelBtn, utils.click, function () {
			utils.addClass(leaveMessage.domBg, 'em-hide');			   
		});

		//create ticket
		utils.on(leaveMessageBtn, utils.click, function () {
			if ( sending ) {
				chat.errorPrompt('留言提交中...');
				return false;
			}
			if ( !project || !targetUser ) {
				chat.errorPrompt('留言失败，token无效');
			} else if ( !contact.value || contact.value.length > 140 ) {
				chat.errorPrompt('姓名输入不正确');
			} else if ( !phone.value || phone.value.length > 24 ) {
				chat.errorPrompt('电话输入不正确');
			} else if ( !mail.value || mail.value.length > 127 ) {
				chat.errorPrompt('邮箱输入不正确');
			} else if ( !msg.value || msg.value.length > 2000 ) {
				chat.errorPrompt('留言内容不能为空，长度小于2000字');
			} else {
				sending = true;
				setTimeout(function () { sending = false; }, 10000);
				easemobim.api('createTicket', {
					tenantId: tenantId,
					'easemob-target-username': targetUser,
					'easemob-appkey': appkey,
					'easemob-username': username,
					headers: { Authorization: 'Easemob IM ' + actoken },
					projectId: project,
					subject: '',
					content: msg.value,
					status_id: '',
					priority_id: '',
					category_id: '',
					creator: { 
						name: contact.value,
						avatar: '',
						email: mail.value,
						phone: phone.value,
						qq: '',
						company: '',
						description: ''
					},
					attachments:null
				}, function ( msge ) {
					sending = false;
					if ( msge && msge.data && msge.data.id ) {
						utils.removeClass(success, 'em-hide');

						setTimeout(function(){
							utils.addClass(success, 'em-hide');
						}, 1500);

						contact.value = '';
						phone.value = '';
						mail.value = '';
						msg.value = '';
					} else {
						chat.errorPrompt('留言失败，请稍后重试');
					}
				});
				
			}
		});

		var project = null,//projectid
			targetUser = null,//target-username
			actoken = null,//accessToke
			appkey = null,
			sending = false,
			username = null;

		return {
			auth: function ( token, config ) {
				actoken = token;
				targetUser = config.toUser;
				username = config.user.username;
				appkey = config.appKey.replace('#', '%23');

				if ( !project ) {
					easemobim.api('getProject', {
						tenantId: tenantId,
						'easemob-target-username': targetUser,
						'easemob-appkey': appkey,
						'easemob-username': username,
						headers: { Authorization: 'Easemob IM ' + actoken }
					}, function ( msg ) {
						if ( msg.data && msg.data.entities && msg.data.entities.length > 0 ) {
							project = msg.data.entities[0].id;
						}
					});
				}
			},
			show: function ( offDuty ) {
				offDuty && utils.addClass(cancelBtn, 'em-hide');			   
				utils.removeClass(leaveMessage.domBg, 'em-hide');			   
			}
		};
	};
}());

/**
 * 满意度调查
 */
easemobim.satisfaction = function ( chat ) {

	var dom = document.querySelector('.em-widget-dialog.em-widget-satisfaction-dialog');
	var utils = easemobim.utils;
	var satisfactionEntry = document.querySelector('.em-widget-satisfaction');
	var starsUl = dom.getElementsByTagName('ul')[0];
	var lis = starsUl.getElementsByTagName('li');
	var msg = dom.getElementsByTagName('textarea')[0];
	var buttons = dom.getElementsByTagName('button');
	var cancelBtn = buttons[0];
	var submitBtn = buttons[1];
	var success = dom.getElementsByTagName('div')[1];
	var session;
	var invite;
	
	utils.on(satisfactionEntry, utils.click, function () {
		session = null;
		invite = null;
		utils.removeClass(dom, 'hide');
		clearInterval(chat.focusText);
	});
	utils.live('button.js_satisfybtn', 'click', function () {
		session = this.getAttribute('data-servicesessionid');
		invite = this.getAttribute('data-inviteid');
		utils.removeClass(dom, 'hide');
		clearInterval(chat.focusText);
	});
	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'hide');
	});
	utils.on(submitBtn, 'click', function () {
		var level = getStarLevel();

		if ( level === 0 ) {
			chat.errorPrompt('请先选择星级');
			return false;
		}
		chat.sendSatisfaction(level, msg.value, session, invite);

		msg.blur();
		utils.removeClass(success, 'hide');

		setTimeout(function(){
			msg.value = '';
			clearStars();
			utils.addClass(success, 'hide');
			utils.addClass(dom, 'hide');
		}, 1500);
	});
	utils.on(starsUl, 'click', function ( e ) {
		var ev = e || window.event,
			that = ev.target || ev.srcElement,
			cur = that.getAttribute('idx');

		if ( !cur ) {
			return false;
		}
		for ( var i = 0; i < lis.length; i++ ) {
			if ( i < Number(cur) ) {
				utils.addClass(lis[i], 'sel');
			} else {
				utils.removeClass(lis[i], 'sel');
			}
		}
	});

	function getStarLevel(){
		var count = 0;

		for ( var i = lis.length; i > 0; i-- ) {
			if ( utils.hasClass(lis[i-1], 'sel') ) {
				count += 1;
			}
		}
		return count;
	}
	function clearStars(){
		for ( var i = lis.length; i > 0; i-- ) {
			utils.removeClass(lis[i-1], 'sel');
		}
	};

};

easemobim.imgView = (function (utils) {

	var imgWrapper = document.querySelector('div.img-view');
	var img = imgWrapper.querySelector('img');

	utils.on(imgWrapper, 'click', function () {
		utils.addClass(imgWrapper, 'hide');
	}, false);

	return {
		show: function ( url ) {
			img.setAttribute('src', url);
			utils.removeClass(imgWrapper, 'hide');
		}
	};
}(easemobim.utils));

/**
 * 为不支持异步上传的浏览器提供上传接口
*/
easemobim.uploadShim = function ( config, chat ) {
	var me = this,
		utils = easemobim.utils;

	me.flashUpload = function ( url, options ) {
		me.swfupload.setUploadURL(url);
		me.swfupload.startUpload();
		me.swfupload.uploadOptions = options;
	};

	me.uploadShim = function ( fileInputId ) {
		if ( !Easemob.im.Utils.isCanUploadFile ) {
			return;
		}

		var pageTitle = document.title;
		var uploadBtn = utils.$Dom(fileInputId);
		if ( typeof SWFUpload === 'undefined' || uploadBtn.length < 1 ) {
			return;
		}

		return new SWFUpload({ 
			file_post_name: 'file'
			, flash_url: location.protocol + config.staticPath + '/js/swfupload/swfupload.swf'
			, button_placeholder_id: fileInputId
			, button_width: 120
			, button_height: 30
			, button_cursor: SWFUpload.CURSOR.HAND
			, button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT
			, file_size_limit: 10485760
			, file_upload_limit: 0
			, file_queued_error_handler: function () {}
			, file_dialog_start_handler: function () {}
			, file_dialog_complete_handler: function () {}
			, file_queued_handler: function ( file ) {
				if ( this.getStats().files_queued > 1 ) {
					this.cancelUpload();
				}
				if ( 10485760 < file.size ) {
					chat.errorPrompt('请上传大小不超过10M的文件');
					this.cancelUpload();
				} else if ( easemobim.PICTYPE[file.type.slice(1).toLowerCase()] ) {
					chat.sendImgMsg({name: file.name, data: file});
				} else if ( easemobim.FILETYPE[file.type.slice(1).toLowerCase()] ) {
					chat.sendFileMsg({name: file.name, data: file});
				} else {
					chat.errorPrompt('不支持此类型' + file.type);
					this.cancelUpload();
				}
			}
			, upload_error_handler: function ( file, code, msg ) {
				if ( code != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED
				&& code != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED 
				&& code != SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED ) {
					var msg = new Easemob.im.EmMessage('img');
					msg.set({file: null});
					chat.appendMsg(config.user.username, config.toUser, msg);
					chat.appendDate(new Date().getTime(), config.toUser);
				}
			}
			, upload_success_handler: function ( file, response ) {
				if ( !file || !response ) {
					var msg = new Easemob.im.EmMessage('img');
					msg.set({file: null});
					chat.appendMsg(config.user.username, config.toUser, msg);
					chat.appendDate(new Date().getTime(), config.toUser);
					return;
				}
				try {
					var res = Easemob.im.Utils.parseUploadResponse(response);
					res = JSON.parse(res);
					if (file && !file.url && res.entities && res.entities.length > 0 ) {
						file.url = res.uri + '/' + res.entities[0].uuid;
					}
					var msg = new Easemob.im.EmMessage('img');
					msg.set({file: file});
					chat.appendDate(new Date().getTime(), config.toUser);
					chat.appendMsg(config.user.username, config.toUser, msg);
					chat.scrollBottom(1000);
					this.uploadOptions.onFileUploadComplete(res);
				} catch ( e ) {
					chat.errorPrompt('上传图片发生错误');
				}
			}
		});
	};

	//不支持异步upload的浏览器使用flash插件搞定
	if ( !Easemob.im.Utils.isCanUploadFileAsync && Easemob.im.Utils.isCanUploadFile ) {
		me.swfupload = me.uploadShim('em-widgetFileInput');
	}
};

;(function () {
	var wechat = /MicroMessenger/.test(navigator.userAgent);
	var wechatAuth = easemobim.utils.query('wechatAuth');
	var appid = easemobim.utils.query('appid');
	var code = easemobim.utils.query('code');
	var tenantId = easemobim.utils.query('tenantId');


	if ( !wechat || !wechatAuth || !tenantId || !appid ) {
		return;
	}

	easemobim.wechat = function ( callback ) {
		//get profile
		var getComponentId = function ( callback ) {
			easemobim.emajax({
				url: '/v1/weixin/admin/appid'
				, success: function ( info ) {
					callback(info);
				}
				, error: function ( e ) {
					callback(null);
				}
			});
		};


		var getProfile = function ( code, callback ) {
			//get profile
			easemobim.emajax({
				url: '/v1/weixin/sns/userinfo/' + appid + '/' + code
				, data: { tenantId: tenantId }
				, type: 'GET'
				, success: function ( info ) {
					callback(info);
				}
				, error: function ( e ) {
					var url = location.href.replace(/&code=[^&]+/, '');

					if ( url.indexOf('appid') !== url.lastIndexOf('appid') ) {
						url = url.replace(/&appid=wx[^&]+/, '');
					}
					location.href = url;
				}
			});
		};

		if ( !code ) {
			getComponentId(function ( id ) {
				if ( !id ) {
					callback();
					return;
				}

				var url = encodeURIComponent(location.href);
				var redirect = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + url + '&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=' + id + '#wechat_redirect';

				location.href = redirect;
			});

		} else {
			getProfile(code, function ( resp ) {
				if ( !resp ) {
					callback();
					return;
				}
				callback(resp);
			});
		}
	};
}());

;(function () {
	var site = function () {
		this.list = {};
	};

	site.prototype.set = function ( key, value ) {
		if ( typeof this.list[key] === 'undefined' ) {
			this.list[key] = value;
		}
		return this;
	};

	site.prototype.get = function ( key ) {
		if ( this.list.hasOwnProperty(key) ) {
			return this.list[key];	
		} else {
			return null;
		}
	};

	site.prototype.remove = function ( key ) {
		if ( typeof this.list[key] !== 'undefined' ) {
			delete this.list[key];
		}
	};

	easemobim.site = site;
}());

;(function () {
	var Polling = function (fn, interval){
		this.fn = fn;
		this.isStarted = false;
		this.timerHandler = null;
		this.interval = interval;
	};

	Polling.prototype.start = function (){
		if (!this.isStarted) {
			this.isStarted = true;
			setTimeout(this.fn, 0);
			this.timerHandler = setInterval(this.fn, this.interval);
		}
	};

	Polling.prototype.stop = function () {
		if (this.isStarted) {
			this.isStarted = false;
			clearInterval(this.timerHandler);
		}
	};

	Polling.prototype.isStarted = function () {
		return this.isStarted;
	};

	easemobim.Polling = Polling;
}());


easemobim.channel = function ( config ) {
	// 如果im连不上，则INITTIMER ms后变为可发送
	var INITTIMER = 20000;
	// IM心跳间隔HEARTBEATTIMER ms
	var HEARTBEATTIMER = 60000;
	// 收消息轮训间隔RECEIVETIMER ms
	var RECEIVETIMER = 60000;
	// SENDTIMER ms后没收到ack则开启第二通道
	var SENDTIMER = 30000;
	// 发送消息第二通道失败后，最多再试1次
	var MAXRETRY = 1;


	var me = this;

	var utils = easemobim.utils;
	var api = easemobim.api;


		//监听ack的timer, 每条消息启动一个
	var ackTS = new easemobim.site();

		//初始监听xmpp的timer, 如果30s后xmpp没有连接成功则处理按钮变为发送，走api发送消息
	var firstTS;

		//发消息队列
	var sendMsgSite = new easemobim.site();

		//收消息队列
	var receiveMsgSite = new easemobim.site();




	var _obj = {

		getConnection: function () {

			// return new Easemob.im.Connection({ 
			// 	url: config.xmppServer,
			// 	retry: true,
			// 	multiResources: config.resources,
			// 	heartBeatWait: HEARTBEATTIMER
			// });
			return new WebIM.connection({
				url: config.xmppServer,
				retry: true,
				isMultiLoginSessions: config.resources,
				heartBeatWait: HEARTBEATTIMER
			});
		},

		reSend: function ( type, id ) {
			if ( id ) {
				var msg = sendMsgSite.get(id);

				switch ( type ) {

					case 'txt':
						_sendMsgChannle(msg, 0);//重试只发一次
						break;
				}
			}
		},

		send: function ( type ) {

			var id = utils.uuid();

			switch ( type ) {

				case 'txt':
					//不是历史记录开启倒计时
					if ( !arguments[2] ) {
						_detectSendMsgByApi(id);
					}


					_obj.sendText(arguments[1], arguments[2], arguments[3], id);
					break;
				//转人工
				case 'transferToKf':
					_detectSendMsgByApi(id);

					_obj.transferToKf(arguments[1], arguments[2], id);
					break;

				case 'img':
					_obj.sendImg(arguments[1], arguments[2], id);
					break;

				case 'file':
					_obj.sendFile(arguments[1], arguments[2], id);
					break;
				//满意度评价
				case 'satisfaction':
					//不是历史记录开启倒计时, 当前只有文本消息支持降级
					_detectSendMsgByApi(id);
					_obj.sendSatisfaction(arguments[1], arguments[2], arguments[3], arguments[4], id);
					break;
			};
		},

		appendAck: function ( msg, id ) {
			msg.body.ext.weichat.msg_id_for_ack = id;
		},

		sendSatisfaction: function ( level, content, session, invite, id ) {

			var msg = new Easemob.im.EmMessage('txt', id);
			msg.set({value: '', to: config.toUser});
			utils.extend(msg.body, {
				ext: {
					weichat: {
						ctrlType: 'enquiry'
						, ctrlArgs: {
							inviteId: invite || ''
							, serviceSessionId: session || ''
							, detail: content
							, summary: level
						}
					}
				}
			});
			_obj.appendAck(msg, id);
			me.conn.send(msg.body);
			sendMsgSite.set(id, msg);
		},

		sendText: function ( message, isHistory, ext, id ) {

			var msg = new Easemob.im.EmMessage('txt', isHistory ? null : id);
			msg.set({
				value: message || easemobim.utils.encode(easemobim.textarea.value),
				to: config.toUser,
				success: function ( id ) {
					// 此回调用于确认im server收到消息, 有别于kefu ack
				},
				fail: function ( id ) {
					
				}
			});

			if ( ext ) {
				utils.extend(msg.body, ext);
			}

			utils.addClass(easemobim.sendBtn, 'disabled');
			if ( !isHistory ) {
				me.setExt(msg);
				_obj.appendAck(msg, id);
				me.conn.send(msg.body);
				sendMsgSite.set(id, msg);
				easemobim.textarea.value = '';
				if ( msg.body.ext && msg.body.ext.type === 'custom' ) { return; }
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			} else {
				me.appendMsg(config.user.username, isHistory, msg, true);
			}
		},


		transferToKf: function ( tid, sessionId, id ) {
			var msg = new Easemob.im.EmMessage('cmd', id);
			msg.set({
				to: config.toUser
				, action: 'TransferToKf'
				, ext: {
					weichat: {
						ctrlArgs: {
							id: tid,
							serviceSessionId: sessionId,
						}
					}
				}
			});

			_obj.appendAck(msg, id);
			me.conn.send(msg.body);
			sendMsgSite.set(id, msg);

			me.handleEventStatus(null, null, true);
		},

		sendImg: function ( file, isHistory, id ) {

			var msg = new Easemob.im.EmMessage('img', isHistory ? null : id);

			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: file || Easemob.im.Utils.getFileUrl(easemobim.realFile.getAttribute('id')),
				accessToken: me.token,
				to: config.toUser,
				uploadError: function ( error ) {
					setTimeout(function () {
						//显示图裂，无法重新发送
						if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
							easemobim.swfupload && easemobim.swfupload.settings.upload_error_handler();
						} else {
							var id = error.id;
							var loading = utils.$Dom(id + '_loading');
							var msgWrap = document.getElementById(id).querySelector('.em-widget-msg-container');

							msgWrap.innerHTML = '<i class="icon-broken-pic"></i>';
							utils.addClass(loading, 'hide');
							me.scrollBottom();
						}
					}, 50);
				},
				uploadComplete: function () {
					me.handleEventStatus();
				},
				success: function ( id ) {
					utils.$Remove(utils.$Dom(id + '_loading'));
					utils.$Remove(utils.$Dom(id + '_failed'));
				},
				fail: function ( id ) {
					utils.addClass(utils.$Dom(id + '_loading'), 'hide');
					utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
				},
				flashUpload: easemobim.flashUpload
			});
			if ( !isHistory ) {
				me.setExt(msg);
				me.conn.send(msg.body);
				easemobim.realFile.value = '';
				if ( Easemob.im.Utils.isCanUploadFileAsync ) {
					me.appendDate(new Date().getTime(), config.toUser);
					me.appendMsg(config.user.username, config.toUser, msg);
				}
			} else {
				me.appendMsg(config.user.username, file.to, msg, true);
			}
		},

		sendFile: function ( file, isHistory, id ) {

			var msg = new Easemob.im.EmMessage('file', isHistory ? null : id),
				file = file || Easemob.im.Utils.getFileUrl(easemobim.realFile.getAttribute('id'));

			if ( !file || !file.filetype || !config.FILETYPE[file.filetype.toLowerCase()] ) {
				me.errorPrompt('不支持此文件');
				easemobim.realFile.value = null;
				return false;
			}

			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: file,
				to: config.toUser,
				uploadError: function ( error ) {
					//显示图裂，无法重新发送
					if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
						easemobim.swfupload && easemobim.swfupload.settings.upload_error_handler();
					} else {
						var id = error.id;
						var loading = utils.$Dom(id + '_loading');
						var msgWrap = document.getElementById(id).querySelector('.em-widget-msg-container');

						msgWrap.innerHTML = '<i class="icon-broken-pic"></i>';
						utils.addClass(loading, 'hide');
						me.scrollBottom();
					}
				},
				uploadComplete: function () {
					me.handleEventStatus();
				},
				success: function ( id ) {
					utils.$Remove(utils.$Dom(id + '_loading'));
					utils.$Remove(utils.$Dom(id + '_failed'));
				},
				fail: function ( id ) {
					utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
					utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
				},
				flashUpload: easemobim.flashUpload
			});
			if ( !isHistory ) {
				me.setExt(msg);
				me.conn.send(msg.body);
				easemobim.realFile.value = '';
				if ( Easemob.im.Utils.isCanUploadFileAsync ) {
					me.appendDate(new Date().getTime(), config.toUser);
					me.appendMsg(config.user.username, config.toUser, msg);
				}
			} else {
				me.appendMsg(config.user.username, file.to, msg, true);
			}
		},

		handleReceive: function ( msg, type, isHistory ) {
			if (config.offDuty) {return;}


			//如果是ack消息，清除ack对应的site item，返回
			if ( msg && msg.ext && msg.ext.weichat && msg.ext.weichat.ack_for_msg_id ) {
				_clearTS(msg.ext.weichat.ack_for_msg_id);
				return;
			}


			var msgid = me.getMsgid(msg);

			if ( receiveMsgSite.get(msgid) ) {
				return;
			} else {
				msgid && receiveMsgSite.set(msgid, 1);
			}

			//绑定访客的情况有可能会收到多关联的消息，不是自己的不收
			if ( !isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !msg.noprompt ) {
				return;
			}

			var message = null;

			//满意度评价
			if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType && msg.ext.weichat.ctrlType == 'inviteEnquiry' ) {
				type = 'satisfactionEvaluation';  
			}
			//机器人自定义菜单
			else if ( msg.ext && msg.ext.msgtype && msg.ext.msgtype.choice ) {
				type = 'robotList';  
			}
			//机器人转人工
			else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType === 'TransferToKfHint' ) {
				type = 'robotTransfer';  
			}
			else {}

			switch ( type ) {
				case 'txt':
				case 'face':
					message = new Easemob.im.EmMessage('txt');

					message.set({value: isHistory ? msg.data : me.getSafeTextValue(msg)});
					break;
				case 'img':
					message = new Easemob.im.EmMessage('img');

					if ( msg.url ) {
						message.set({file: {url: msg.url}});
					} else {
						try {
							message.set({file: {url: msg.bodies[0].url}});
						} catch ( e ) {}
					}
					break;
				case 'file':
					message = new Easemob.im.EmMessage('file');
					if ( msg.url ) {
						message.set({file: {
							url: msg.url,
							filename: msg.filename,
							filesize: msg.file_length
						}});
					} else {
						// todo 问这块什么情况会出现
						try {
							message.set({file: {
								url: msg.bodies[0].url,
								filename: msg.bodies[0].filename
							}});
						}
						catch (e) {
							// todo IE console
							// console.warn('channel.js @handleReceive case file', e);
						}
					}
					break;
				case 'satisfactionEvaluation':
					message = new Easemob.im.EmMessage('list');
					message.set({value: '请对我的服务做出评价', list: ['\
						<div class="em-widget-list-btns">\
							<button class="em-widget-list-btn bg-hover-color js_satisfybtn" data-inviteid="' + msg.ext.weichat.ctrlArgs.inviteId + '"\
							 data-servicesessionid="'+ msg.ext.weichat.ctrlArgs.serviceSessionId + '">立即评价</button>\
						</div>']});

					// fake 临时解决用户重复收到邀请评价的问题
					// 由于消息走的第二通道，刷新后没有去重（此处待验证），导致重复收到
					// 所以 === false 的 isHistory临时过滤掉
					if('undefined' === typeof isHistory){
						// 创建隐藏的立即评价按钮，并触发click事件
						var el = document.createElement('BUTTON');
						el.className = 'js_satisfybtn';
						el.style.display = 'none';
						el.setAttribute('data-inviteid', msg.ext.weichat.ctrlArgs.inviteId);
						el.setAttribute('data-servicesessionid', msg.ext.weichat.ctrlArgs.serviceSessionId);
						document.body.appendChild(el);
						utils.trigger(el, 'click');
						easemobim.textarea.blur();
					}
					break;
				case 'robotList':
					message = new Easemob.im.EmMessage('list');
					var str;
					var list = msg.ext.msgtype.choice.items || msg.ext.msgtype.choice.list;

					if ( list.length > 0 ) {
						str = '<div class="em-widget-list-btns">';
						for ( var i = 0, l = list.length; i < l; i++ ) {
							if(list[i].id === 'TransferToKf'){
								str += '<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js_robotbtn" data-id="' + list[i].id + '">' + (list[i].name || list[i]) + '</button>';
							}else{
								str += '<button class="em-widget-list-btn bg-hover-color js_robotbtn" data-id="' + list[i].id + '">' + (list[i].name || list[i]) + '</button>';
							}
						}
						str += '</div>';
					}
					message.set({value: msg.ext.msgtype.choice.title, list: str});
					break;
				case 'robotTransfer':
					message = new Easemob.im.EmMessage('list');
					var ctrlArgs = msg.ext.weichat.ctrlArgs;
					var title = msg.data
						|| (msg.bodies && msg.bodies[0] && msg.bodies[0].msg)
						|| msg.ext.weichat.ctrlArgs.label;
				/*
					msg.data 用于处理即时消息
					msg.bodies[0].msg 用于处理历史消息
					msg.ext.weichat.ctrlArgs.label 未知是否有用，暂且保留
					此处修改为了修复取出历史消息时，转人工评价标题改变的bug
					还有待测试其他带有转人工的情况
				*/
					var str = [
						'<div class="em-widget-list-btns">',
							'<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js_robotTransferBtn" ',
							'data-sessionid="' + ctrlArgs.serviceSessionId + '" ', 
							'data-id="' + ctrlArgs.id + '">' + ctrlArgs.label + '</button>',
						'</div>'
					].join('');

					message.set({value: title, list: str});
					break;
				default:
					break;
			}
			
			if ( !isHistory ) {

				if ( msg.ext && msg.ext.weichat ) {
					if (msg.ext.weichat.event){
						switch(msg.ext.weichat.event.eventName){
							case 'ServiceSessionTransferedEvent':
							// 转接到客服
								me.handleEventStatus('transferd', msg.ext.weichat.event.eventObj);
								break;
							case 'ServiceSessionTransferedToAgentQueueEvent':
							// 转人工或者转到技能组
								me.handleEventStatus('transfering', msg.ext.weichat.event.eventObj);
								break;
							// 会话结束
							case 'ServiceSessionClosedEvent':
								easemobim.eventCollector.startToReport();
								me.session = null;
								me.sessionSent = false;
								config.agentUserId = null;
								me.stopGettingAgentStatus();
								// 还原企业头像和企业名称
								me.setAgentProfile({
									tenantName: config.defaultAgentName,
									avatar: config.tenantAvatar
								});
								// 去掉坐席状态
								me.clearAgentStatus();
								me.handleEventStatus('close');
								utils.isTop || transfer.send(easemobim.EVENTS.ONSESSIONCLOSED, window.transfer.to);
								break;
							case 'ServiceSessionOpenedEvent':
								//fake
								me.agentCount < 1 && (me.agentCount = 1);
								me.handleEventStatus('linked', msg.ext.weichat.event.eventObj);
								break;
							case 'ServiceSessionCreatedEvent':
								me.handleEventStatus('create');
								break;
							default:
								me.handleEventStatus('reply', msg.ext.weichat.agent);
								break;
						}
					}
					else{
						me.handleEventStatus('reply', msg.ext.weichat.agent);
					}
				}


				//空消息不显示
				if ( !message || !message.value ) {
					return;
				}

				if ( !msg.noprompt ) {
					me.messagePrompt(message);
				}
				me.appendDate(new Date().getTime(), msg.from);
				me.resetSpan();
				me.appendMsg(msg.from, msg.to, message);
				me.scrollBottom(50);

				// 收消息回调
				if ( config.hasReceiveCallback && !utils.isTop) {
					easemobim.EVENTS.ONMESSAGE.data = {
						from: msg.from,
						to: msg.to,
						message: message
					};
					try {
						transfer.send(easemobim.EVENTS.ONMESSAGE, window.transfer.to);
					} catch (e) {}
				}
			} else {
				if ( !message || !message.value ) {
					return;
				}
				me.appendMsg(msg.from, msg.to, message, true);
			}
		},

		listen: function () {
				
			me.conn.listen({
				onOpened: function ( info ) {
					
					_clearFirstTS();

					me.reOpen && clearTimeout(me.reOpen);
					me.token = info.accessToken;
					me.conn.setPresence();

					me.handleReady(info);
				}
				, onTextMessage: function ( message ) {
					me.receiveMsg(message, 'txt');
				}
				, onEmotionMessage: function ( message ) {
					me.receiveMsg(message, 'face');
				}
				, onPictureMessage: function ( message ) {
					me.receiveMsg(message, 'img');
				}
				, onFileMessage: function ( message ) {
					me.receiveMsg(message, 'file');
				}
				, onCmdMessage: function ( message ) {
					me.receiveMsg(message, 'cmd');
				}
				, onOnline: function () {
					utils.isMobile && me.open();
				}
				, onOffline: function () {
					utils.isMobile && me.conn.close();
					// for debug
					console.log('onOffline-channel');
					// 断线关闭视频通话
					if(utils.isSupportWebRTC){
						easemobim.videoChat.onOffline();
					}
				// todo 断线后停止轮询坐席状态
				// me.stopGettingAgentStatus();
				}
				, onError: function ( e ) {
					if ( e.reconnect ) {
						me.open();
					} else if ( e.type === 2 ) {
						me.reOpen || (me.reOpen = setTimeout(function () {
							me.open();
						}, 2000));
					} else {
						//me.conn.stopHeartBeat(me.conn);
						typeof config.onerror === 'function' && config.onerror(e);
					}
				}
			});
		},

		handleHistory: function ( chatHistory ) {

			if ( chatHistory.length > 0 ) {
				utils.each(chatHistory, function ( k, v ) {
					var msgBody = v.body,
						msg,
						isSelf = msgBody.from === config.user.username;

					if ( msgBody && msgBody.bodies.length > 0 ) {
						msg = msgBody.bodies[0];
						if ( msgBody.from === config.user.username ) {
							//visitors' msg
							switch ( msg.type ) {
								case 'img':
									msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
									msg.to = msgBody.to;
									me.sendImgMsg(msg, true);
									break;
								case 'file':
									msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
									msg.to = msgBody.to;
									me.sendFileMsg(msg, true);
									break;
								case 'txt':
									me.sendTextMsg(msg.msg, true);
									break;
							}
						} else {
							//agents' msg

							//判断是否为满意度调查的消息
							if ( msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType && msgBody.ext.weichat.ctrlType == 'inviteEnquiry'
							//机器人自定义菜单
							|| msgBody.ext && msgBody.ext.msgtype && msgBody.ext.msgtype.choice
							//机器人转人工
							|| msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType === 'TransferToKfHint' ) {
								me.receiveMsg(msgBody, '', true);
							} else {
								var data = msg.msg;

								msg.type === 'txt' && (data = me.getSafeTextValue(msgBody));

								me.receiveMsg({
									msgId: v.msgId,
									data: data,
									filename: msg.filename,
									file_length: msg.file_length,
									url: /^http/.test(msg.url) ? msg.url : config.base + msg.url,
									from: msgBody.from,
									to: msgBody.to
								}, msg.type, true);
							}
						}

						if ( msg.type === 'cmd'//1.cmd消息 
						|| (msg.type === 'txt' && !msg.msg)//2.空文本消息
						|| receiveMsgSite.get(v.msgId) ) {//3.重复消息
							
						} else {
							me.appendDate(v.timestamp || msgBody.timestamp, isSelf ? msgBody.to : msgBody.from, true);
						}
					}
				});
			}
		}
	};


	//收消息轮训通道
	var _receiveMsgChannle = function () {

		if ( config.offDuty ) {
			return;
		}

		setInterval(function () {
			api('receiveMsgChannel', {
				orgName: config.orgName,
				appName: config.appName,
				easemobId: config.toUser,
				tenantId: config.tenantId,
				visitorEasemobId: config.user.username
			}, function ( msg ) {

				//处理收消息
				if ( msg && msg.data.status === 'OK' ) {
					for ( var i = 0, l = msg.data.entities.length; i < l; i++ ) {
						try {
							_obj.handleReceive(msg.data.entities[i], msg.data.entities[i].bodies[0].type, false);
						} catch ( e ) {}
					}
				}
			});		   
		}, RECEIVETIMER);
	};

	//发消息通道
	var _sendMsgChannle = function ( msg, count ) {
		var count = count === 0 ? 0 : (count || MAXRETRY);
		var id = msg.id;

		api('sendMsgChannel', {
			from: config.user.username,
			to: config.toUser,
			tenantId: config.tenantId,
			bodies: [{
				type: 'txt',
				msg: msg.value,
			}],
			ext: msg.body ? msg.body.ext : null,
			orgName: config.orgName,
			appName: config.appName,
			originType: 'webim'
		}, function () {
			//发送成功清除
			_clearTS(id);
		}, function () {
			//失败继续重试
			if ( count > 0 ) {
				_sendMsgChannle(msg, --count);
			} else {
				utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
				utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
			}
		});
	};

	//消息发送成功，清除timer
	var _clearTS = function ( id ) {

		clearTimeout(ackTS.get(id));
		ackTS.remove(id);

		utils.$Remove(utils.$Dom(id + '_loading'));
		utils.$Remove(utils.$Dom(id + '_failed'));
		
		if ( sendMsgSite.get(id) ) {
			me.handleEventStatus(null, null, sendMsgSite.get(id).value === '转人工' || sendMsgSite.get(id).value === '转人工客服');
		}

		sendMsgSite.remove(id);
	};

	//30s内连上xmpp后清除timer，暂不开启api通道发送消息
	var _clearFirstTS = function () {
		clearTimeout(firstTS);
	}

	//监听ack，超时则开启api通道, 发消息时调用
	var _detectSendMsgByApi = function ( id ) {

		ackTS.set(
			id,
			setTimeout(function () {
				//30s没收到ack使用api发送
				_sendMsgChannle(sendMsgSite.get(id));
			}, SENDTIMER)
		);
	};


	firstTS = setTimeout(function () {
		me.handleReady();
	}, INITTIMER);
	
	//收消息轮训通道常驻
	_receiveMsgChannle();

	return _obj;
};

// 视频邀请确认对话框
easemobim.ui = {};
easemobim.ui.videoConfirmDialog = easemobim.utils.isSupportWebRTC && (function(){
	var dialog = document.querySelector('div.em-dialog-video-confirm');
	var buttonPanel = dialog.querySelector('div.button-panel');
	var btnConfirm = dialog.querySelector('.btn-confirm');
	var btnCancel = dialog.querySelector('.btn-cancel');
	var confirmCallback = null;
	var cancelCallback = null;

	buttonPanel.addEventListener('click', function(evt){
		var className = evt.target.className;

		if (~className.indexOf('btn-cancel')) {
			'function' === typeof cancelCallback && cancelCallback();
		}
		else if (~className.indexOf('btn-confirm')) {
			'function' === typeof confirmCallback && confirmCallback();
		}
		else {
			return;
		}
		confirmCallback = null;
		cancelCallback = null;
		_hide();
	}, false);

	function _show(){
		dialog.classList.remove('hide');
	}
	function _hide(){
		dialog.classList.add('hide');
	}
	function _init(confirm, cancel){
		confirmCallback = confirm;
		cancelCallback = cancel;
		_show();
	}
	return {
		show: _show,
		hide: _hide,
		init: _init
	}
}());
easemobim.videoChat = (function(dialog){
	var imChat = document.getElementById('em-kefu-webim-chat');
	var btnVideoInvite = document.querySelector('.em-video-invite');
	var videoWidget = document.querySelector('.em-widget-video');
	var dialBtn = videoWidget.querySelector('.btn-accept-call');
	var ctrlPanel = videoWidget.querySelector('.toolbar-control');
	var subVideoWrapper = videoWidget.querySelector('.sub-win');
	var mainVideo = videoWidget.querySelector('video.main');
	var subVideo = videoWidget.querySelector('video.sub');

	var config = null;
	var call = null;
	var sendMessageAPI = null;
	var localStream = null;
	var remoteStream = null;

	var statusTimer = {
		timer: null,
		counter: 0,
		prompt: videoWidget.querySelector('.status p.prompt'),
		timeSpan: videoWidget.querySelector('.status p.time-escape'),
		start: function(prompt){
			var me = this;
			me.counter = 0;
			me.prompt.innerHTML = prompt;
			me.timeSpan.innerHTML = '00:00';
			me.timer = setInterval(function(){
				me.timeSpan.innerHTML = format(++me.counter);
			}, 1000)

			function format(second){
				return (new Date(second * 1000))
					.toISOString()
					.slice(-'00:00.000Z'.length)
					.slice(0, '00:00'.length);
			}
		},
		stop: function(){
			var me = this;
			clearInterval(me.timer);
		}
	};

	var closingTimer = {
		isConnected: false,
		timer: null,
		delay: 3000,
		closingPrompt: videoWidget.querySelector('.full-screen-prompt'),
		timeSpan: videoWidget.querySelector('.full-screen-prompt p.time-escape'),
		show: function(){
			var me = this;
			if(me.isConnected){
				me.timeSpan.innerHTML = statusTimer.timeSpan.innerHTML;
			}
			else{
				me.timeSpan.innerHTML = '00:00';
			}
			me.closingPrompt.classList.remove('hide');
			setTimeout(function(){
				imChat.classList.remove('has-video');
				me.closingPrompt.classList.add('hide');
			}, me.delay);
		}
	}

	var endCall = function(){
		statusTimer.stop();
		closingTimer.show();
		localStream && localStream.getTracks().forEach(function(track){
			track.stop();
		})
		remoteStream && remoteStream.getTracks().forEach(function(track){
			track.stop();
		})
		mainVideo.src = '';
		subVideo.src = '';
	};

	var events = {
		'btn-end-call': function(){
			try {
				call.endCall();
			}
			catch (e) {
				console.error('end call:', e);
			}
			finally {
				endCall();
			}			
		},
		'btn-accept-call': function(){
			closingTimer.isConnected = true;
			dialBtn.classList.add('hide');
			ctrlPanel.classList.remove('hide');
			subVideoWrapper.classList.remove('hide');
			statusTimer.stop();
			statusTimer.start('视频通话中');
			call.acceptCall();
		},
		'btn-toggle': function(){
			localStream && localStream.getVideoTracks().forEach(function(track){
				track.enabled = !track.enabled;
			});
		},
		'btn-change': function(){
			var tmp;

			tmp = subVideo.src;
			subVideo.src = mainVideo.src;
			mainVideo.src = tmp;
			subVideo.play();
			mainVideo.play();

			subVideo.muted = !subVideo.muted;
			mainVideo.muted = !mainVideo.muted;
		},
		'btn-minimize': function(){
			videoWidget.classList.add('minimized');
		},
		'btn-maximize': function(){
			videoWidget.classList.remove('minimized');
		}
	};


	function sendVideoInvite() {
		console.log('send video invite');
		sendMessageAPI('txt', '邀请客服进行实时视频', false, {
				ext: {
				type: 'rtcmedia/video',
				msgtype: {
					liveStreamInvitation: {
						msg: '邀请客服进行实时视频',
						orgName: config.orgName,
						appName: config.appName,
						userName: config.user.username,
						resource: 'webim'
					}
				}
			}
		});
	}

	function init(conn, sendMessage, cfg){
		sendMessageAPI = sendMessage;
		config = cfg;

		videoWidget.classList.remove('hide');
		// 按钮初始化
		btnVideoInvite.classList.remove('hide');
		btnVideoInvite.addEventListener('click', function(){
			dialog.init(sendVideoInvite);
		}, false);

		// 视频组件事件绑定
		videoWidget.addEventListener('click', function(evt){
			var className = evt.target.className;

			Object.keys(events).forEach(function(key){
				~className.indexOf(key) && events[key]();
			})
		}, false);

		call = new WebIM.WebRTC.Call({
			connection: conn,

			mediaStreamConstaints: {
				audio: true,
				video: true
			},

			listener: {
				onAcceptCall: function (from, options) {
					console.log('onAcceptCall', from, options);
				},
				onGotRemoteStream: function (stream) {
					// for debug
					console.log('onGotRemoteStream', stream);
					mainVideo.src = URL.createObjectURL(stream);
					remoteStream = stream;
					mainVideo.play();
				},
				onGotLocalStream: function (stream) {
					// for debug
					console.log('onGotLocalStream', stream);
					subVideo.src = URL.createObjectURL(stream);
					localStream = stream;
					subVideo.play();
				},
				onRinging: function (caller) {
					// for debug
					console.log('onRinging', caller);
					// init
					subVideo.muted = true;
					mainVideo.muted = false;
					closingTimer.isConnected = false;

					subVideoWrapper.classList.add('hide');
					ctrlPanel.classList.add('hide');
					imChat.classList.add('has-video');
					statusTimer.start('视频连接请求，等待你的确认');
					dialBtn.classList.remove('hide');
				},
				onTermCall: function () {
					// for debug
					console.log('onTermCall');
					endCall();
				},
				onError: function (e) {
					console.log(e && e.message ? e.message : 'An error occured when calling webrtc');
				}
			}
		});
	}

	return {
		init: init,
		onOffline: function() {
			// for debug
			console.log('onOffline');
			endCall();
		}
	}
}(easemobim.ui.videoConfirmDialog));

/**
 * webim交互相关
 */
;(function () {

	easemobim.chat = function ( config ) {
		var utils = easemobim.utils;
		var _const = easemobim._const;

		// todo: 把dom都移到里边
		var doms = {
			agentStatusText: utils.$Class('span.em-header-status-text')[0],
			agentStatusSymbol: utils.$Dom('em-widgetAgentStatus'),
			nickname: document.querySelector('.em-widgetHeader-nickname')
		};

		easemobim.doms = doms;

		//DOM init
		easemobim.im = utils.$Dom('EasemobKefuWebim');
		easemobim.imBtn = utils.$Dom('em-widgetPopBar');
		easemobim.imChat = utils.$Dom('em-kefu-webim-chat');
		easemobim.imChatBody = utils.$Dom('em-widgetBody');
		easemobim.send = utils.$Dom('em-widgetSend');
		easemobim.textarea = easemobim.send.querySelector('.em-widget-textarea');
		easemobim.sendBtn = utils.$Dom('em-widgetSendBtn');
		easemobim.faceBtn = easemobim.send.querySelector('.em-bar-face');
		easemobim.realFile = utils.$Dom('em-widgetFileInput');
		easemobim.sendFileBtn = utils.$Dom('em-widgetFile');
		easemobim.noteBtn = utils.$Dom('em-widgetNote');
		easemobim.dragHeader = utils.$Dom('em-widgetDrag');
		easemobim.dragBar = easemobim.dragHeader.querySelector('.drag-bar');
		easemobim.chatFaceWrapper = utils.$Dom('EasemobKefuWebimFaceWrapper');
		easemobim.avatar = document.querySelector('.em-widgetHeader-portrait');
		easemobim.swfupload = null;//flash 上传


		//cache current agent
		config.agentUserId = null;

		//chat window object
		return {
			init: function () {
				
				this.channel = easemobim.channel.call(this, config);

				//create & init connection
				this.conn = this.channel.getConnection();
				//sroll bottom timeout stamp
				this.scbT = 0;
				//unread message count
				this.msgCount = 0;
				//just show date label once in 1 min
				this.msgTimeSpan = {};
				//chat window status
				this.opened = true;
				//fill theme
				this.setTheme();
				//init sound reminder
				this.soundReminder();
				//init face
				this.fillFace();
				//bind events on dom
				this.bindEvents();
			}
			, handleReady: function ( info ) {
				var me = this;
				if ( easemobim.textarea.value ) {
					utils.removeClass(easemobim.sendBtn, 'disabled');
				}
				easemobim.sendBtn.innerHTML = '发送';

				if (me.readyHandled) return;
				me.readyHandled = true;

				if ( info && config.user ) {
					config.user.token = config.user.token || info.accessToken;
				}

				easemobim.leaveMessage && easemobim.leaveMessage.auth(me.token, config);

				// 发送用于回呼访客的命令消息
				if(!config.cachedCommandMessage){
					me.sendTextMsg('', false, config.cachedCommandMessage);
					config.cachedCommandMessage = null;
				}
				if ( utils.isTop ) {
					//get visitor
					var visInfo = config.visitor;
					if ( !visInfo ) {
						visInfo = utils.getStore(config.tenantId + config.emgroup + 'visitor');
						try { config.visitor = Easemob.im.Utils.parseJSON(visInfo); } catch ( e ) {}
						utils.clearStore(config.tenantId + config.emgroup + 'visitor');
					}

					//get ext
					var ext = utils.getStore(config.tenantId + config.emgroup + 'ext');
					try { ext && me.sendTextMsg('', false, {ext: Easemob.im.Utils.parseJSON(ext)}); } catch ( e ) {}
					utils.clearStore(config.tenantId + config.emgroup + 'ext');
				} else {
					transfer.send(easemobim.EVENTS.ONREADY, window.transfer.to);
				}
			}
			, setExt: function ( msg ) {
				msg.body.ext = msg.body.ext || {};
				msg.body.ext.weichat = msg.body.ext.weichat || {};

				//bind skill group
				if ( config.emgroup ) {
					msg.body.ext.weichat.queueName = decodeURIComponent(config.emgroup);
				}

				//bind visitor
				if ( config.visitor ) {
					msg.body.ext.weichat.visitor = config.visitor;
				}

				//bind agent
				if ( config.agentName ) {
					msg.body.ext.weichat.agentUsername = config.agentName;
				}

				//set language
				if ( config.language ) {
					msg.body.ext.weichat.language = config.language;
				}

				//set growingio id
				if ( config.grUserId ) {
					msg.body.ext.weichat.visitor = msg.body.ext.weichat.visitor || {};
					msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
				}
			}
			, ready: function () {
				//add tenant notice
				this.setNotice();
				//add msg callback
				this.channel.listen();
				//connect to xmpp server
				this.open();
				//create chat container
				this.handleGroup();
				//get service serssion info
				this.getSession();
				//set tenant logo
				this.setLogo();
				//mobile set textarea can growing with inputing
				utils.isMobile && this.initAutoGrow();
				this.chatWrapper.getAttribute('data-getted') || config.newuser || this.getHistory();
			}
			, initAutoGrow: function () {
				var me = this;

				if (me.autoGrowOptions) return;
				me.autoGrowOptions = {};
				me.autoGrowOptions.callback = function () {
					var height = easemobim.send.getBoundingClientRect().height;
					if ( me.direction === 'up' ) {
						easemobim.chatFaceWrapper.style.top = 43 + height + 'px';
					} else {
						easemobim.imChatBody.style.bottom = height + 'px';
						easemobim.chatFaceWrapper.style.bottom = height + 'px';
					}
				};
				me.autoGrowOptions.dom = easemobim.textarea;
				setTimeout(function () {
					easemobim.autogrow(me.autoGrowOptions);
				}, 1000);
			}
			, handleChatWrapperByHistory: function ( chatHistory, chatWrapper ) {
				if ( chatHistory.length === easemobim.LISTSPAN ) {//认为可以继续获取下一页历史记录
					var startSeqId = Number(chatHistory[easemobim.LISTSPAN - 1].chatGroupSeqId) - 1;

					if ( startSeqId > 0 ) {
						chatWrapper.setAttribute('data-start', startSeqId);
						chatWrapper.setAttribute('data-history', 0);
					} else {
						chatWrapper.setAttribute('data-history', 1);
					}
				} else {
					chatWrapper.setAttribute('data-history', 1);
				}
			}
			, getHistory: function ( notScroll ) {
				if (config.offDuty) return;

				var me = this,
					chatWrapper = me.chatWrapper,
					groupid = chatWrapper.getAttribute('data-groupid');

				if ( groupid ) {
					Number(chatWrapper.getAttribute('data-history')) || easemobim.api('getHistory', {
						fromSeqId: chatWrapper.getAttribute('data-start') || 0
						, size: easemobim.LISTSPAN
						, chatGroupId: groupid
						, tenantId: config.tenantId
					}, function ( msg ) {
						me.handleChatWrapperByHistory(msg.data, chatWrapper);
						if ( msg.data && msg.data.length > 0 ) {
							me.channel.handleHistory(msg.data);
							notScroll || me.scrollBottom();
						}
					});
				} else {
					Number(chatWrapper.getAttribute('data-history')) || easemobim.api('getGroupNew', {
						id: config.user.username
						, orgName: config.orgName
						, appName: config.appName
						, imServiceNumber: config.toUser
						, tenantId: config.tenantId
					}, function ( msg ) {
						if ( msg && msg.data ) {
							chatWrapper.setAttribute('data-groupid', msg.data);
							easemobim.api('getHistory', {
								fromSeqId: chatWrapper.getAttribute('data-start') || 0
								, size: easemobim.LISTSPAN
								, chatGroupId: msg.data
								, tenantId: config.tenantId
							}, function ( msg ) {
								me.handleChatWrapperByHistory(msg.data, chatWrapper);
								if ( msg && msg.data && msg.data.length > 0 ) {
									me.channel.handleHistory(msg.data);
									notScroll || me.scrollBottom();
								}
							});
						}
					});
				}
				chatWrapper.setAttribute('data-getted', 1);
			}
			, getGreeting: function () {
				var me = this;

				if ( me.greetingGetted ) return;

				me.greetingGetted = true;

				//system greeting
				easemobim.api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function ( msg ) {
					msg && msg.data && me.receiveMsg({
						data: msg.data,
						ext: {
							weichat: {
								html_safe_body: {
									msg: msg.data
								}
							}
						},
						type: 'txt',
						noprompt: true
					}, 'txt');

					//robert greeting
					easemobim.api('getRobertGreeting', {
						tenantId: config.tenantId,
						originType: 'webim'
					}, function ( msg ) {
						var rGreeting = msg && msg.data;
						if(!rGreeting) return;
						switch (rGreeting.greetingTextType) {
							case 0:
								//robert text greeting
								me.receiveMsg({
									data: rGreeting.greetingText,
									ext: {
										weichat: {
											html_safe_body: {
												msg: rGreeting.greetingText
											}
										}
									},
									type: 'txt',
									noprompt: true
								}, 'txt');
								break;
							case 1:
								try {
									var greetingObj = Easemob.im.Utils.parseJSON(rGreeting.greetingText.replace(/&quot;/g, '"'));
									if ( rGreeting.greetingText === '{}' ) {
										me.receiveMsg({
											data: '该菜单不存在',
											type: 'txt',
											noprompt: true
										}, 'txt');
									} else {
										//robert list greeting
										me.receiveMsg({ 
											ext: greetingObj.ext,
											noprompt: true
										 });	
									}
								} catch ( e ) {}
								break;
							default:
								break;
						}
					});
				});
			}
			, getNickNameOption: function () {
				if ( config.offDuty ) { return; }

				easemobim.api('getNickNameOption', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if (msg && msg.data && msg.data.length) {
						config.nickNameOption = msg.data[0].optionValue === 'true';
					} else {
						config.nickNameOption = null;
					}
				}, function () {
					config.nickNameOption = null;
				});
			}
			, getSession: function () {
				if ( config.offDuty ) { return; }

				var me = this

				me.agent = me.agent || {};

				easemobim.api('getExSession', {
					id: config.user.username
					, orgName: config.orgName
					, appName: config.appName
					, imServiceNumber: config.toUser
					, tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg && msg.data ) {
						me.onlineHumanAgentCount = msg.data.onlineHumanAgentCount;//人工坐席数
						me.onlineRobotAgentCount = msg.data.onlineRobotAgentCount;//机器人坐席数
						me.agentCount = +me.onlineHumanAgentCount + +me.onlineRobotAgentCount;
						config.agentUserId = msg.data.serviceSession ? msg.data.serviceSession.agentUserId : null;//get agentuserid

						if ( me.agentCount === 0 ) {
							me.noteShow = false;
						}

						// 确保正在进行中的会话，刷新后还会继续轮询坐席状态
						if(config.agentUserId){
							me.startToGetAgentStatus();
						}
					} else {
						me.getGreeting();
					}

					if ( !msg.data.serviceSession ) {
						//get greeting only when service session is not exist
						me.getGreeting();
					} else {
						me.session = msg.data.serviceSession;
						msg.data.serviceSession.visitorUser 
						&& msg.data.serviceSession.visitorUser.userId 
						&& easemobim.api('sendVisitorInfo', {
							tenantId: config.tenantId,
							visitorId: msg.data.serviceSession.visitorUser.userId,
							referer:  document.referrer
						});
					}


					if ( !me.nicknameGetted ) {
						me.nicknameGetted = true;
						//get the switcher of agent nickname
						me.getNickNameOption();
					}
				});
			}
			, handleGroup: function () {
				this.chatWrapper = easemobim.imChatBody.querySelector('.em-widget-chat');

				this.setAgentProfile({
					tenantName: config.defaultAgentName,
					avatar: config.tenantAvatar
				});
			}
			, getMsgid: function ( msg ) {
				if ( msg ) {
					if ( msg.ext && msg.ext.weichat ) {
						return msg.ext.weichat.msgId;
					}
					return msg.msgId
				}
				return null;
			}
			, startToGetAgentStatus: function () {
				var me = this;

				if ( config.agentStatusTimer ) return;

				// start to poll
				config.agentStatusTimer = setInterval(function() {
					me.updateAgentStatus();
				}, 5000);
			}
			, stopGettingAgentStatus: function () {
				config.agentStatusTimer = clearInterval(config.agentStatusTimer);
			}
			, clearAgentStatus: function () {
				doms.agentStatusSymbol.className = 'em-hide';
				doms.agentStatusText.innerText = '';
			}
			, updateAgentStatus: function () {
				var me = this;

				if ( !config.agentUserId || !config.nickNameOption ) {
					me.stopGettingAgentStatus();
					return;
				}

				easemobim.api('getAgentStatus', {
					tenantId: config.tenantId,
					orgName: config.orgName,
					appName: config.appName,
					agentUserId: config.agentUserId,
					userName: config.user.username,
					token: config.user.token,
					imServiceNumber: config.toUser
				}, function ( msg ) {
					var state;

					if ( msg && msg.data && msg.data.state ) {
						state = msg.data.state;
						doms.agentStatusText.innerText = _const.agentStatusText[state];
						doms.agentStatusSymbol.className = 'em-widget-agent-status ' + _const.agentStatusClassName[state];
					}
				});
			}
			, setAgentProfile: function ( info ) {

				var avatarImg = info && info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.tenantAvatar || config.defaultAvatar;

				//更新企业头像和名称
				if ( info.tenantName ) {
					doms.nickname.innerText = info.tenantName;
					easemobim.avatar.setAttribute('src', avatarImg);
				}

				//昵称开关关闭
				if (!config.nickNameOption) return;

				// fake: 默认不显示调度员昵称
				if('调度员' === info.userNickname) return;

				if(!info.userNickname) return;

				//更新坐席昵称
				doms.nickname.innerText = info.userNickname;

				this.currentAvatar = avatarImg;
				var src = easemobim.avatar.getAttribute('src');

				if ( !this.currentAvatar ) { return; }
				easemobim.avatar.setAttribute('src', this.currentAvatar);

				//更新头像显示状态
				//只有头像和昵称更新成客服的了才开启轮训
				//this.updateAgentStatus();
			}
			, setTheme: function () {
				easemobim.api('getTheme', {
					tenantId: config.tenantId
				}, function ( msg ) {
					var themeName = msg.data && msg.data.length && msg.data[0].optionValue;
					var className = _const.themeMap[themeName];

					className && utils.addClass(document.body, className);
				});
			}
			, setLogo: function () {
				// 为了保证消息插入位置正确
				if (config.logo) {
					utils.removeClass(document.querySelector('.em-widget-tenant-logo'), 'hide');
					document.querySelector('.em-widget-tenant-logo img').src = config.logo;
				}
			}
			, setNotice: function () {
				var me = this;

				if ( me.hasSetSlogan || config.offDuty ) {
					return;
				}

				easemobim.api('getSlogan', {
					tenantId: config.tenantId
				}, function (msg) {
					me.hasSetSlogan = true;
					var slogan = msg.data && msg.data.length && msg.data[0].optionValue;
					if(slogan){
						// 设置信息栏内容
						document.querySelector('.em-widget-tip .content').innerHTML = Easemob.im.Utils.parseLink(slogan);
						// 显示信息栏
						utils.addClass(easemobim.imChat, 'has-tip');

						// 隐藏信息栏按钮
						utils.on(
							document.querySelector('.em-widget-tip .tip-close'),
							utils.click,
							function(){
								// 隐藏信息栏
								utils.removeClass(easemobim.imChat, 'has-tip');
							}
						);
					}
				});
			}
			//fill emotions async
			, fillFace: function () {
				if ( utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0]) ) {
					return;
				}

				var faceStr = '',
					count = 0,
					me = this;

				utils.on(easemobim.faceBtn, utils.click, function () {
					easemobim.textarea.blur();
					utils.toggleClass(easemobim.chatFaceWrapper, 'em-hide');

					if ( faceStr ) return false;
					faceStr = '<li class="e-face">';
					utils.each(Easemob.im.EMOTIONS.map, function ( k, v ) {
						count += 1;
						faceStr += ["<div class='em-bar-face-bg e-face'>",
										"<img class='em-bar-face-img e-face em-emotion' ",
											"src='" + Easemob.im.EMOTIONS.path + v + "' ",
											"data-value=" + k + " />",
									"</div>"].join('');
						if ( count % 7 === 0 ) {
							faceStr += '</li><li class="e-face">';
						}
					});
					if ( count % 7 === 0 ) {
						faceStr = faceStr.slice(0, -('<li class="e-face">').length);
					} else {
						faceStr += '</li>';
					}

					utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0], faceStr);
				});

				//表情的选中
				utils.live('img.em-emotion', utils.click, function ( e ) {
					!utils.isMobile && easemobim.textarea.focus();
					easemobim.textarea.value = easemobim.textarea.value + this.getAttribute('data-value');
					if ( utils.isMobile ) {
						me.autoGrowOptions.update();//update autogrow
						setTimeout(function () {
							easemobim.textarea.scrollTop = 10000;
						}, 100);
					}
					me.readyHandled && utils.removeClass(easemobim.sendBtn, 'disabled');
				}, easemobim.chatFaceWrapper);
			}
			, errorPrompt: function ( msg, isAlive ) {//暂时所有的提示都用这个方法
				var me = this;

				me.ePrompt = me.ePrompt || document.querySelector('.em-widget-error-prompt');
				me.ePromptContent = me.ePromptContent || me.ePrompt.querySelector('span');
				
				me.ePromptContent.innerHTML = msg;
				utils.removeClass(me.ePrompt, 'hide');
				isAlive || setTimeout(function () {
					utils.addClass(me.ePrompt, 'hide');
				}, 2000);
			}
			, getSafeTextValue: function ( msg ) {
				if ( msg && msg.ext && msg.ext.weichat && msg.ext.weichat.html_safe_body ) {
					return msg.ext.weichat.html_safe_body.msg;
				} else {
					try {
						return msg.bodies[0].msg;
					} catch ( e ) {}
				}
				return '';
			}
			, setOffline: function ( isOffDuty ) {
				if ( !isOffDuty ) { return; }

				switch ( config.offDutyType ) {
					case 'chat':
									
						break;
					case 'none':// disable note & msg

						var word = config.offDutyWord || '现在是下班时间。';

						try {
							word = decodeURIComponent(word);
						} catch ( e ) {}

						var msg = new Easemob.im.EmMessage('txt');
						msg.set({ value: word });
						if ( !this.chatWrapper ) {
							this.handleGroup();
						}
						this.appendMsg(config.toUser, config.user.username, msg);
						utils.addClass(easemobim.send, 'em-widget-send-disable');
						break;
					default:// show note
						this.slogan && utils.addClass(this.slogan, 'em-hide');
						utils.removeClass(easemobim.leaveMessage.dom, 'em-hide');
						utils.addClass(easemobim.imChatBody, 'em-hide');
						utils.addClass(easemobim.send, 'em-hide');
						easemobim.leaveMessage.show(isOffDuty);
						break;
				}
			}
			//close chat window
			, close: function () {
				this.opened = false;

				if ( !config.hide ) {
					utils.addClass(easemobim.imChat, 'em-hide');
					setTimeout(function () {
						utils.removeClass(easemobim.imBtn, 'em-hide');
					}, 60);
				}
			}
			//show chat window
			, show: function () {
				var me = this;

				me.opened = true;
				me.scrollBottom(50);
				utils.addClass(easemobim.imBtn, 'em-hide');
				utils.removeClass(easemobim.imChat, 'em-hide');
				if (!config.offDuty || config.offDutyType !== 'none') {
					try { easemobim.textarea.focus(); } catch ( e ) {}
				}
				!utils.isTop && transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
			}
			, appendDate: function ( date, to, isHistory ) {
				var chatWrapper = this.chatWrapper;
				var dom = document.createElement('div');
				var fmt = 'M月d日 hh:mm';

				if (!chatWrapper) return;

				dom.innerHTML = new Date(date).format(fmt);
				utils.addClass(dom, 'em-widget-date');

				if ( !isHistory ) {
					if ( to ) {
						if ( !this.msgTimeSpan[to] || (date - this.msgTimeSpan[to] > 60000) ) {//间隔大于1min  show
							chatWrapper.appendChild(dom); 
						}
						this.resetSpan(to);
					} else {
						chatWrapper.appendChild(dom); 
					}
				} else {
					utils.insertBefore(chatWrapper, dom, chatWrapper.getElementsByTagName('div')[0]);
				}
			}
			, resetSpan: function ( id ) {
				this.msgTimeSpan[id] = new Date().getTime();
			}
			, open: function () {
				var me = this;

				var op = {
					user: config.user.username
					, appKey: config.appKey
					, apiUrl: location.protocol + '//' + config.restServer
				};

				if ( config.user.token ) {
					op.accessToken = config.user.token;
				} else {
					op.pwd = config.user.password;
				}

				me.conn.open(op);

				// init webRTC
				if(utils.isSupportWebRTC){
					// 视频功能灰度
					// easemobim.api('getKefuOptions/audioVideo', {tenantId: config.tenantId}, function (msg) {
					// 	if (
					// 		msg.data
					// 		&& msg.data.data
					// 		&& msg.data.data[0]
					// 		&& msg.data.data[0].optionValue === 'true'
					// 	){
					// 		easemobim.videoChat.init(me.conn, me.channel.send, config);
					// 	}
					// });
					easemobim.api('graylist', {}, function (msg) {
						if (
							msg.data
							&& msg.data.audioVideo
							&& msg.data.audioVideo.indexOf(+config.tenantId)
						){
							easemobim.videoChat.init(me.conn, me.channel.send, config);
						}
					});
				}
			}
			, soundReminder: function () {
				var me = this;
				var ast = 0;

				if (!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) {
					return;
				}

				me.reminder = document.querySelector('.em-widgetHeader-audio');

				//音频按钮静音
				utils.on(me.reminder, 'mousedown touchstart', function () {
					me.slience = !me.slience;
					utils.toggleClass(me.reminder, 'icon-slience', me.slience);
					utils.toggleClass(me.reminder, 'icon-bell', !me.slience);

					return false;
				});

				me.audio = document.createElement('audio');
				me.audio.src = config.staticPath + '/mp3/msg.m4a';
				me.soundReminder = function () {
					if ( (utils.isMin() ? false : me.opened) || ast !== 0 || me.slience ) {
						return;
					}
					ast = setTimeout(function() {
						ast = 0;
					}, 3000);
					me.audio.play();
				};
			}
			, bindEvents: function () {
				var me = this;

				utils.on(
					document.querySelector('.em-widgetHeader-keyboard'),
					utils.click,
					function(){
						var status = utils.hasClass(this, 'icon-keyboard-down');
						me.direction = status ? 'down' : 'up';

						utils.toggleClass(this, 'icon-keyboard-up', status);
						utils.toggleClass(this, 'icon-keyboard-down', !status);

						switch (me.direction) {
							case 'up':
								easemobim.send.style.bottom = 'auto';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = '43px';
								easemobim.imChatBody.style.bottom = '0';
								easemobim.chatFaceWrapper.style.bottom = 'auto';
								easemobim.chatFaceWrapper.style.top = 43 + easemobim.send.getBoundingClientRect().height + 'px';
								break;
							case 'down':
								easemobim.send.style.bottom = '0';
								easemobim.send.style.zIndex = '3';
								easemobim.send.style.top = 'auto';
								easemobim.imChatBody.style.bottom = easemobim.send.getBoundingClientRect().height + 'px';
								easemobim.chatFaceWrapper.style.bottom = easemobim.send.getBoundingClientRect().height + 'px';
								easemobim.chatFaceWrapper.style.top = 'auto';
								me.scrollBottom(50);
								break;
						}
					}
				);
				
				!utils.isMobile && !utils.isTop && utils.on(easemobim.imBtn, utils.click, function () {
					transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
				});
				utils.on(easemobim.imChatBody, utils.click, function () {
					easemobim.textarea.blur();
					return false;
				});
				utils.on(document, 'mouseover', function () {
					utils.isTop || transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
				});
				utils.live('img.em-widget-imgview', 'click', function () {
					easemobim.imgView.show(this.getAttribute('src'));
				});

				if (config.dragenable && !utils.isMobile && !utils.isTop) {//drag
					
					easemobim.dragBar.style.cursor = 'move';

					utils.on(easemobim.dragBar, 'mousedown', function ( ev ) {
						var e = window.event || ev;
						easemobim.textarea.blur();//ie a  ie...
						easemobim.EVENTS.DRAGREADY.data = { x: e.clientX, y: e.clientY };
						transfer.send(easemobim.EVENTS.DRAGREADY, window.transfer.to);
						return false;
					}, false);
				}

				//pc 和 wap 的上滑加载历史记录的方法
				(function () {
					var st,
						_startY,
						_y,
						touch;

					//wap
					utils.live('div.em-widget-date', 'touchstart', function ( ev ) {
						var e = ev || window.event,
							touch = e.touches;

						if ( e.touches && e.touches.length > 0 ) {
							_startY = touch[0].pageY;
						}
					});
					utils.live('div.em-widget-date', 'touchmove', function ( ev ) {
						var e = ev || window.event,
							touch = e.touches;

						if ( e.touches && e.touches.length > 0 ) {
							_y = touch[0].pageY;
							if ( _y - _startY > 8 && this.getBoundingClientRect().top >= 0 ) {
								clearTimeout(st);
								st = setTimeout(function () {
									me.getHistory(true);
								}, 100);
							}
						}
					});

					//pc
					var getHis = function ( ev ) {
						var e = ev || window.event,
							that = this;

						if ( e.wheelDelta / 120 > 0 || e.detail < 0 ) {
							clearTimeout(st);
							st = setTimeout(function () {
								if ( that.getBoundingClientRect().top >= 0 ) {
									me.getHistory(true);
								}
							}, 400);
						}
					};
					utils.live('div.em-widget-chat', 'mousewheel', getHis);
					utils.live('div.em-widget-chat', 'DOMMouseScroll', getHis);
				}());

				//resend
				utils.live('div.em-widget-msg-status', utils.click, function () {
					var id = this.getAttribute('id').slice(0, -'_failed'.length);

					utils.addClass(this, 'em-hide');
					utils.removeClass(utils.$Dom(id + '_loading'), 'em-hide');
					if ( this.getAttribute('data-type') === 'txt' ) {
						me.channel.reSend('txt', id);
					} else {
						me.conn.send(id);
					}
				});

				utils.live('button.js_robotTransferBtn', utils.click,  function () {
					var that = this;

					if ( that.clicked ) { return false; }

					that.clicked = true;
					me.transferToKf(that.getAttribute('data-id'), that.getAttribute('data-sessionid'));
					return false;
				});

				//机器人列表
				utils.live('button.js_robotbtn', utils.click, function () {
					var that = this;

					me.sendTextMsg(utils.html(that), null, {
						msgtype: {
							choice: { menuid: that.getAttribute('data-id') }
						}
					});
					return false;
				});
				
				var handleSendBtn = function () {
					if ( !me.readyHandled ) {
						utils.addClass(easemobim.sendBtn, 'disabled');
						return false;
					}
					utils.toggleClass(easemobim.sendBtn, 'disabled', !easemobim.textarea.value);
				};

				utils.on(easemobim.textarea, 'keyup', handleSendBtn);
				utils.on(easemobim.textarea, 'change', handleSendBtn);
				utils.on(easemobim.textarea, 'input', handleSendBtn);
				
				if ( utils.isMobile ) {
					var handleFocus = function () {
						easemobim.textarea.style.overflowY = 'auto';
						me.scrollBottom(800);
						clearInterval(me.focusText);
						me.focusText = setInterval(function () {
							document.body.scrollTop = 10000;
						}, 100);
					};
					utils.on(easemobim.textarea, 'input', function () {
						me.autoGrowOptions.update();
						me.scrollBottom(800);
					});
					utils.on(easemobim.textarea, 'focus', handleFocus);
					utils.one(easemobim.textarea, 'touchstart', handleFocus);
					utils.on(easemobim.textarea, 'blur', function () {
						clearInterval(me.focusText);
					});
				}

				//选中文件并发送
				utils.on(easemobim.realFile, 'change', function () {
					easemobim.realFile.value && me.sendImgMsg();
				});

				//hide face wrapper
				utils.on(document, utils.click, function ( ev ) {
					var e = window.event || ev,
						t = e.srcElement || e.target;

					if ( !utils.hasClass(t, 'e-face') ) {
						utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
					}
				});

				utils.on(easemobim.sendFileBtn, 'touchend', function () {
					easemobim.textarea.blur();
				});
				//弹出文件选择框
				utils.on(easemobim.sendFileBtn, 'click', function () {
					if ( !me.readyHandled ) {
						me.errorPrompt('正在连接中...');
						return false;
					}
					if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
						me.errorPrompt('当前浏览器需要安装flash发送图片');
						return false;	
					}
					easemobim.realFile.click();
				});

				//显示留言界面
				utils.on(easemobim.noteBtn, 'click', function () {
					easemobim.leaveMessage.show();
				});

				// 最小化
				utils.on(document.querySelector('.em-widgetHeader-min'), 'click', function () {
					transfer.send(easemobim.EVENTS.CLOSE, window.transfer.to);
					return false;
				});

				//hot key
				utils.on(easemobim.textarea, 'keydown', function ( evt ) {
					if(evt.keyCode !== 13) return;

					if(utils.isMobile || evt.ctrlKey || evt.shiftKey){
						return false;
					}
					else{
						utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
						if ( utils.hasClass(easemobim.sendBtn, 'disabled') ) {
							return false;
						}
						me.sendTextMsg();

						// 可能是事件绑定得太多了，导致换行清不掉，稍后解决
						setTimeout(function(){
							easemobim.textarea.value = '';
						}, 0);
					}
				});

				utils.on(easemobim.sendBtn, 'click', function () {
					if ( utils.hasClass(this, 'disabled') ) {
						return false;
					}
					var textMsg = easemobim.textarea.value;
					if(textMsg.length > 1500){
						me.errorPrompt("输入字数过多");
						return false;
					}
					utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
					me.sendTextMsg();
					if ( utils.isMobile ) {
						easemobim.textarea.style.height = '34px';
						easemobim.textarea.style.overflowY = 'hidden';
						me.direction === 'up' || (easemobim.imChatBody.style.bottom = '77px');
						easemobim.textarea.focus();
					}
					return false;
				});
			}
			, scrollBottom: function ( wait ) {
				var ocw = easemobim.imChatBody;

				wait 
				? (clearTimeout(this.scbT), this.scbT = setTimeout(function () {
					ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
				}, wait))
				: (ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000);
			}
			//send image message function
			, sendImgMsg: function ( file, isHistory ) {
				this.channel.send('img', file, isHistory);
			}
			//send file message function
			, sendFileMsg: function ( file, isHistory ) {
				this.channel.send('file', file, isHistory);
			}
			, handleEventStatus: function ( action, info, robertToHubman ) {

				var res = robertToHubman ? this.onlineHumanAgentCount < 1 : this.agentCount < 1;
				if ( res ) {//显示无坐席在线
					
					//每次激活只显示一次
					if ( !this.noteShow ) {
						this.noteShow = true;
						this.appendEventMsg(_const.eventMessageText.NOTE);
					}
					
				}

				if ( action === 'reply' && info ) {

					if ( config.agentUserId ) {
						this.startToGetAgentStatus();
					}

					this.setAgentProfile({
						userNickname: info.userNickname,
						avatar: info.avatar
					});
				} else if ( action === 'create' ) {//显示会话创建
					this.appendEventMsg(_const.eventMessageText.CREATE);
				} else if ( action === 'close' ) {//显示会话关闭
					this.appendEventMsg(_const.eventMessageText.CLOSED);
				} else if ( action === 'transferd' ) {//显示转接到客服
					this.appendEventMsg(_const.eventMessageText.TRANSFER);
				} else if ( action === 'transfering' ) {//显示转接中
					this.appendEventMsg(_const.eventMessageText.TRANSFERING);
				 } else if ( action === 'linked' ) {//接入成功
					this.appendEventMsg(_const.eventMessageText.LINKED);
				}

				if(action === 'transferd' || action === 'linked'){
					//坐席发生改变
					this.handleAgentStatusChanged(info);
				}
			}
			//坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
			, handleAgentStatusChanged: function ( info ) {
				if (!info) return;

				config.agentUserId = info.userId;

				this.updateAgentStatus();
				this.startToGetAgentStatus();

				//更新头像和昵称
				this.setAgentProfile({
					userNickname: info.agentUserNiceName,
					avatar: info.avatar
				});
			}
			//转接中排队中等提示上屏
			, appendEventMsg: function (msg) {
				//如果设置了hideStatus, 不显示转接中排队中等提示
				if (config.hideStatus) return;

				var dom = document.createElement('div');

				dom.innerText = msg;
				dom.className = 'em-widget-event';

				this.appendDate(new Date().getTime());
				this.chatWrapper.appendChild(dom);
				this.scrollBottom(utils.isMobile ? 800 : null);
			}
			//消息上屏
			, appendMsg: function ( from, to, msg, isHistory ) {

				var me = this;

				var isSelf = from == config.user.username && (from || config.user.username),
					curWrapper = me.chatWrapper;

				var div = document.createElement('div');
				utils.html(div, msg.get(!isSelf));

				if ( isHistory ) {
					utils.insertBefore(curWrapper, div, curWrapper.childNodes[0]);
				} else {
					curWrapper.appendChild(div);
					me.scrollBottom(utils.isMobile ? 800 : null);
				}
				var imgList = utils.$Class('img.em-widget-imgview', div),
					img = imgList.length > 0 ? imgList[0] : null;
					
				if ( img ) {
					utils.on(img, 'load', function () {
						me.scrollBottom();
						img = null;
					});
				}
				div = null;
			}
			//send text message function
			, sendTextMsg: function ( message, isHistory, ext ) {
				this.channel.send('txt', message, isHistory, ext);
			}
			, transferToKf: function ( id, sessionId ) {
				this.channel.send('transferToKf', id, sessionId);
			}
			//send satisfaction evaluation message function
			, sendSatisfaction: function ( level, content, session, invite ) {
				this.channel.send('satisfaction', level, content, session, invite);
			}
			, messagePrompt: function ( message ) {

				if ( utils.isMobile ) {
					return;
				}

				var me = this;

				if ( me.opened && !utils.isTop) {
					transfer.send(easemobim.EVENTS.RECOVERY, window.transfer.to);
				}

				if ( utils.isMin() || !me.opened ) {
					me.soundReminder();
					utils.isTop || transfer.send(easemobim.EVENTS.SLIDE, window.transfer.to);
					utils.isTop || transfer.send({
						event: 'notify',
						data: {
							avatar: this.currentAvatar,
							title: '新消息',
							brief: message.brief
						}
					}, window.transfer.to);
				}
			}
			//receive message function
			, receiveMsg: function ( msg, type, isHistory ) {
				if (config.offDuty) return;

				this.channel.handleReceive(msg, type, isHistory);
			}
		};
	};



	/**
	 * 调用指定接口获取数据
	*/
	easemobim.api = function ( apiName, data, success, error ) {
		//cache
		easemobim.api[apiName] = easemobim.api[apiName] || {};

		var ts = new Date().getTime();
		easemobim.api[apiName][ts] = {
			success: success,
			error: error
		};
		easemobim.getData
		.send({
			api: apiName
			, data: data
			, timespan: ts
		})
		.listen(function ( msg ) {
			if ( easemobim.api[msg.call] && easemobim.api[msg.call][msg.timespan] ) {

				var callback = easemobim.api[msg.call][msg.timespan];
				delete easemobim.api[msg.call][msg.timespan];

				if ( msg.status !== 0 ) {
					typeof callback.error === 'function' && callback.error(msg);
				} else {
					typeof callback.success === 'function' && callback.success(msg);
				}
			}
		}, ['api']);
	};
}());

;(function(Polling, utils, api){
	var POLLING_INTERVAL = 5000;

	var _polling;
	var _callback;
	var _config;
	var _gid;
	var _url;

	function _reportData(userType, userId){
		transfer.send({event: 'updateURL'}, window.transfer.to);

		easemobim.api('reportEvent', {
			type: 'VISIT_URL',
			// 第一次轮询时URL还未传过来，所以使用origin
			url: _url || transfer.origin,
			// for debug
			// url: 'http://172.17.3.86',
			// 时间戳不传，以服务器时间为准
			// timestamp: 0,
			userId: {
				type: userType,
				id: userId
			}
		}, function(res){
			var data = res.data;

			switch(data && data.type){
				// 没有坐席呼叫，什么都不做
				case 'OK':
					break;
				// 有坐席呼叫
				case 'INIT_CALL':
					if(_isStarted()){
						// 回呼游客，游客身份变为访客
						if (data.userName){
							_gid = data.orgName + '#' + data.appName + '_' + data.userName;
							_polling.stop();
							_polling = new Polling(function(){
								_reportData('VISITOR', _gid);
							});
						}
						_stopReporting();
						_callback(data);
					}
					// 已停止轮询 （被呼叫的访客/游客 已经创建会话），不回呼
					else {}
					break;
				default:
					break;
			}
		});
	}

	function _deleteEvent(){
		_gid && api('deleteEvent', {userId: _gid});
		// _gid = '';
	}

	function _startToReoprt(config, callback){
		_callback || (_callback = callback);
		_config || (_config = config);

		// 用户点击联系客服弹出的窗口，结束会话后调用的startToReport没有传入参数
		if(!_config){
			console.log('not config yet.');
		}
		else if(_polling){
			_polling.start();
		}
		else if(_config.user.username){
			_reportVisitor(_config.user.username);
		}
		else{
			_reportGuest();
		}
	}

	function _reportGuest(){
		var guestId = _config.guestId || utils.uuid();

		// 缓存guestId
		transfer.send({event: 'setItem', data: {
			key: 'guestId',
			value: guestId
		}}, window.transfer.to);

		_polling = new Polling(function(){
			_reportData('GUEST', guestId);
		}, POLLING_INTERVAL);

		_polling.start();
	}

	function _reportVisitor(username){
		api('getRelevanceList', {
			tenantId: _config.tenantId
		}, function(msg) {
			if (!msg.data.length) {
				throw '未创建关联';
			}
			var relevanceList = msg.data[0];
			var orgName = relevanceList.orgName;
			var appName = relevanceList.appName;
			var imServiceNumber = relevanceList.imServiceNumber;
			_gid = orgName + '#' + appName + '_' + username;

			_polling = new Polling(function(){
				_reportData('VISITOR', _gid);
			}, POLLING_INTERVAL);

			_polling.start();
		});
	}

	function _stopReporting(){
		_polling && _polling.stop();
		_deleteEvent();
	}

	function _isStarted() {
		return _polling && _polling.isStarted;
	}

	easemobim.eventCollector = {
		startToReport: _startToReoprt,
		stopReporting: _stopReporting,
		isStarted: _isStarted,
		updateURL: function(url){
			_url = url;
		}
	};
}(
	easemobim.Polling,
	easemobim.utils,
	easemobim.api
));

;(function(window, undefined) {
	'use strict';

	var utils = easemobim.utils;
	var api = easemobim.api;
	var eventCollector = easemobim.eventCollector;
	var chat;
	var afterChatReady;

	getConfig();

	function getConfig() {
		if (utils.isTop) {
			var tenantId = utils.query('tenantId');
			var config = {};
			//get config from referrer's config
			try {
				config = JSON.parse(utils.code.decode(utils.getStore('emconfig' + tenantId)));
			} catch (e) {}

			config.tenantId = tenantId;
			config.hide = true;
			config.offDutyType = utils.query('offDutyType');
			config.grUserId = utils.query('grUserId');

			// H5 方式集成时不支持eventCollector配置
			config.to = utils.convertFalse(utils.query('to'));
			config.xmppServer = utils.convertFalse(utils.query('xmppServer'));
			config.restServer = utils.convertFalse(utils.query('restServer'));
			config.agentName = utils.convertFalse(utils.query('agentName'));
			config.resources = utils.convertFalse(utils.query('resources'));
			config.hideStatus = utils.convertFalse(utils.query('hideStatus'));
			config.satisfaction = utils.convertFalse(utils.query('sat'));
			config.wechatAuth = utils.convertFalse(utils.query('wechatAuth'));
			config.hideKeyboard = utils.convertFalse(utils.query('hideKeyboard'));

			config.appKey = utils.convertFalse(decodeURIComponent(utils.query('appKey')));
			config.domain = config.domain || '//' + location.host;
			config.offDutyWord = decodeURIComponent(utils.query('offDutyWord'));
			config.language = utils.query('language') || 'zh_CN';
			config.ticket = utils.query('ticket') === '' ? true : utils.convertFalse(utils.query('ticket')); //true default
			try {
				config.emgroup = decodeURIComponent(utils.query('emgroup'));
			} catch (e) {
				config.emgroup = utils.query('emgroup');
			}


			//没绑定user直接取cookie
			if (!utils.query('user')) {
				config.user = {
					username: utils.get('root' + config.tenantId + config.emgroup),
					password: '',
					token: ''
				};
			} else if (!config.user || (config.user.username && config.user.username !== utils.query('user'))) {
				config.user = {
					username: '',
					password: '',
					token: ''
				};
			}
			chat = easemobim.chat(config);
			initUI(config, initAfterUI);
		} else {
			window.transfer = new easemobim.Transfer(null, 'main').listen(function(msg) {
				switch (msg.event) {
					case easemobim.EVENTS.SHOW.event:
						chatEntry.open();
						break;
					case easemobim.EVENTS.CLOSE.event:
						chatEntry.close();
						break;
					case easemobim.EVENTS.EXT.event:
						chat.sendTextMsg('', false, msg.data.ext);
						break;
					case easemobim.EVENTS.TEXTMSG.event:
						chat.sendTextMsg(msg.data.data, false, msg.data.ext);
						break;
					case 'updateURL':
						easemobim.eventCollector.updateURL(msg.data);
						break;
					case 'initConfig':
						chat = easemobim.chat(msg.data);
						window.transfer.to = msg.data.parentId;
						initUI(msg.data, initAfterUI);
						break;
					default:
						break;
				}
			}, ['easemob']);
		}
	}

	function initAfterUI(config) {
		// chat = easemobim.chat(config);

		config.base = location.protocol + config.domain;

		//load modules
		easemobim.leaveMessage = easemobim.leaveMessage(chat, config.tenantId);
		easemobim.paste = easemobim.paste(chat);
		easemobim.satisfaction(chat);

		// 访客回呼功能
		if (config.eventCollector && !eventCollector.isStarted()) {
			eventCollector.startToReport(config, function(targetUserInfo) {
				chatEntry.init(config, targetUserInfo);
			});
			// config.hide = true;
		}
		else {
			// 获取关联，创建访客，调用聊天窗口
			chatEntry.init(config);
		}
	}

	function initUI(config, callback) {
		var iframe = document.getElementById('EasemobKefuWebimIframe');

		iframe.src = config.domain + '/webim/transfer.html?v=43.12.005';
		utils.on(iframe, 'load', function() {
			easemobim.getData = new easemobim.Transfer('EasemobKefuWebimIframe', 'data');
			callback(config);
		});

		// em-widgetPopBar
		utils.toggleClass(
			utils.$Dom('em-widgetPopBar'),
			'em-hide',
			(utils.isTop || !config.minimum || config.hide)
		);

		// em-kefu-webim-chat
		utils.toggleClass(
			utils.$Dom('em-kefu-webim-chat'),
			'em-hide', !(utils.isTop || !config.minimum)
		);

		// 联系客服按钮
		var $button = utils.$Class('a.em-widget-pop-bar')[0];

		// 设置按钮文字
		$button.innerText = config.buttonText;

		// mobile
		if (utils.isMobile) {
			// 联系客服按钮改为弹窗
			$button.href = location.href;
			$button.target = '_blank';
			// 添加移动端样式类
			utils.addClass(document.body, 'em-mobile');
		}

		// 留言按钮
		utils.toggleClass(
			utils.$Dom('em-widgetNote'),
			'em-hide',
			!config.ticket
		);

		// 最小化按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-min'),
			'hide',
			!config.minimum || utils.isTop
		);

		// 静音按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-audio'),
			'hide',
			!window.HTMLAudioElement || utils.isMobile || !config.soundReminder
		);

		// 输入框位置开关
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-keyboard'),
			'hide',
			!utils.isMobile || config.offDuty || config.hideKeyboard
		);

		// 满意度评价按钮
		utils.toggleClass(
			document.querySelector('.em-widget-satisfaction'),
			'hide',
			!config.satisfaction
		);

		//不支持异步上传则加载swfupload
		if (!Easemob.im.Utils.isCanUploadFileAsync && Easemob.im.Utils.isCanUploadFile) {
			var script = document.createElement('script');
			script.onload = script.onreadystatechange = function() {
				if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
					easemobim.uploadShim(config, chat);
				}
			};
			script.src = location.protocol + config.staticPath + '/js/swfupload/swfupload.min.js';
			document.body.appendChild(script);
		}
	}

	var chatEntry = {
		init: function(config, targetUserInfo) {
			var me = this;

			config.toUser = config.toUser || config.to;

			//上下班状态
			api('getDutyStatus', {
				tenantId: config.tenantId
			}, function(msg) {
				config.offDuty = msg.data ? msg.data && config.offDutyType !== 'chat' : false;

				chat.setOffline(config.offDuty); //根据状态展示上下班不同view
			});

			config.orgName = config.appKey.split('#')[0];
			config.appName = config.appKey.split('#')[1];

			//获取关联信息
			api('getRelevanceList', {
				tenantId: config.tenantId
			}, function(msg) {
				if (msg.data.length === 0) {
					chat.errorPrompt('未创建关联', true);
					return;
				}
				config.relevanceList = msg.data;
				config.tenantAvatar = utils.getAvatarsFullPath(msg.data[0].tenantAvatar, config.domain);
				config.defaultAvatar = config.staticPath ? config.staticPath + '/img/default_avatar.png' : 'static' + '/img/default_avatar.png';
				config.defaultAgentName = msg.data[0].tenantName;
				config.logo = config.logo || msg.data[0].tenantLogo;
				config.toUser = config.toUser || msg.data[0].imServiceNumber;
				config.orgName = config.orgName || msg.data[0].orgName;
				config.appName = config.appName || msg.data[0].appName;
				config.channelid = config.channelid || msg.data[0].channelId;
				config.appKey = config.appKey || config.orgName + '#' + config.appName;
				config.restServer = config.restServer || msg.data[0].restDomain;

				var cluster = config.restServer ? config.restServer.match(/vip\d/) : '';
				cluster = cluster && cluster.length ? '-' + cluster[0] : '';
				config.xmppServer = config.xmppServer || 'im-api' + cluster + '.easemob.com';
				chat.init();

				if (targetUserInfo) {

					config.toUser = targetUserInfo.agentImName;

					// 游客回呼
					if(targetUserInfo.userName){
						config.user = {
							username: targetUserInfo.userName,
							password: targetUserInfo.userPassword
						};

						chat.ready();
						chat.show();
						// 发送空的ext消息，延迟发送
						config.cachedCommandMessage = {ext: {weichat: {agentUsername: targetUserInfo.agentUserName}}};
						transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
						transfer.send({
							event: 'setUser',
							data: {
								username: targetUserInfo.userName,
								group: config.user.emgroup
							}
						}, window.transfer.to);
					}
					// 访客回呼
					else {
						api('getPassword', {
							userId: config.user.username,
							tenantId: config.tenantId
						}, function(msg) {
							if (!msg.data) {
								console.log('用户不存在！');
							} else {
								config.user.password = msg.data;

								chat.ready();
								chat.show();
								// 发送空的ext消息
								chat.sendTextMsg('', false, {ext: {weichat: {agentUsername: targetUserInfo.agentUserName}}});
								transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
							}
						});
					}
				}
				else if (config.user.username && (config.user.password || config.user.token)) {
					chat.ready();
				}
				//检测微信网页授权
				else if (config.wechatAuth) {
					easemobim.wechat(function(data) {
						try {
							data = JSON.parse(data);
						} catch (e) {
							data = null;
						}
						if (!data) { //失败自动降级，随机创建访客
							me.go(config);
						} else {
							config.visitor = config.visitor || {};
							config.visitor.userNickname = data.nickname;
							var oid = config.tenantId + '_' + config.orgName + '_' + config.appName + '_' + config.toUser + '_' + data.openid;
							easemobim.emajax({
								url: '/v1/webimplugin/visitors/wechat/' + oid + '?tenantId=' + config.tenantId,
								data: {
									orgName: config.orgName,
									appName: config.appName,
									imServiceNumber: config.toUser
								},
								type: 'POST',
								success: function(info) {
									try {
										info = JSON.parse(info);
									} catch (e) {
										info = null;
									}
									if (info && info.status === 'OK') {
										config.user.username = info.entity.userId;
										config.user.password = info.entity.userPassword;
										chat.ready();
									} else {
										me.go(config);
									}

								},
								error: function(e) {
									//失败自动降级，随机创建访客
									me.go(config);
								}
							});
						}
					});
				}
				else if (config.user.username) {
					api('getPassword', {
						userId: config.user.username,
						tenantId: config.tenantId
					}, function(msg) {
						if (!msg.data) {
							me.go(config);
						} else {
							config.user.password = msg.data;
							chat.ready();
						}
					});
				} else {
					me.go(config);
				}
			});
		},
		go: function(config) {
			api('createVisitor', {
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				tenantId: config.tenantId
			}, function(msg) {
				config.newuser = true;
				config.user.username = msg.data.userId;
				config.user.password = msg.data.userPassword;
				if (utils.isTop) {
					utils.set('root' + config.tenantId + config.emgroup, config.user.username)
				} else {
					transfer.send({
						event: 'setUser', data: {
							username: config.user.username,
							group: config.user.emgroup
						}
					}, window.transfer.to);
				}
				chat.ready();
			});
		},
		open: function() {
			// 停止上报访客
			eventCollector.stopReporting();
			chat.show();
		},
		close: function() {
			chat.close();
		}
	};

}(window, undefined));
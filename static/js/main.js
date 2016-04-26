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
    b64_sha1:       function (s) { return binb2b64(core_sha1(str2binb(s),s.length * 8)); },
    binb2str:       binb2str,
    core_hmac_sha1: core_hmac_sha1,
    str_hmac_sha1:  function (key, data){ return binb2str(core_hmac_sha1(key, data)); },
    str_sha1:       function (s) { return binb2str(core_sha1(str2binb(s),s.length * 8)); }
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
 *    (Object) obj - The object that will become 'this' in the bound function.
 *    (Object) argN - An option argument that will be prepended to the
 *      arguments given for the function call
 *
 *  Returns:
 *    The bound function.
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
 *    (Object) elt - The object to look for.
 *    (Integer) from - The index from which to start looking. (optional).
 *
 *  Returns:
 *    The index of elt in the array or -1 if not found.
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
        window.Strophe =        o.Strophe;
        window.$build =         o.$build;
        window.$iq =            o.$iq;
        window.$msg =           o.$msg;
        window.$pres =          o.$pres;
        window.SHA1 =           o.SHA1;
        window.Base64 =         o.Base64;
        window.MD5 =            o.MD5;
        window.b64_hmac_sha1 =  o.SHA1.b64_hmac_sha1;
        window.b64_sha1 =       o.SHA1.b64_sha1;
        window.str_hmac_sha1 =  o.SHA1.str_hmac_sha1;
        window.str_sha1 =       o.SHA1.str_sha1;
    }
}(this, function (SHA1, Base64, MD5) {

var Strophe;

/** Function: $build
 *  Create a Strophe.Builder.
 *  This is an alias for 'new Strophe.Builder(name, attrs)'.
 *
 *  Parameters:
 *    (String) name - The root element name.
 *    (Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $build(name, attrs) { return new Strophe.Builder(name, attrs); }

/** Function: $msg
 *  Create a Strophe.Builder with a <message/> element as the root.
 *
 *  Parmaeters:
 *    (Object) attrs - The <message/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $msg(attrs) { return new Strophe.Builder("message", attrs); }

/** Function: $iq
 *  Create a Strophe.Builder with an <iq/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <iq/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
 */
function $iq(attrs) { return new Strophe.Builder("iq", attrs); }

/** Function: $pres
 *  Create a Strophe.Builder with a <presence/> element as the root.
 *
 *  Parameters:
 *    (Object) attrs - The <presence/> element attributes in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder object.
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
                        'a':          ['href'],
                        'blockquote': ['style'],
                        'br':         [],
                        'cite':       ['style'],
                        'em':         [],
                        'img':        ['src', 'alt', 'style', 'height', 'width'],
                        'li':         ['style'],
                        'ol':         ['style'],
                        'p':          ['style'],
                        'span':       ['style'],
                        'strong':     [],
                        'ul':         ['style'],
                        'body':       []
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
     *      failed after Math.floor(TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 1.1, and with default wait, 66 seconds.
     *  SECONDARY_TIMEOUT - Secondary timeout multiplier. In cases where
     *      Strophe can detect early failure, it will consider the request
     *      failed if it doesn't return after
     *      Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 0.1, and with default wait, 6 seconds.
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
     *    (String) name - The name under which the namespace will be
     *      referenced under Strophe.NS
     *    (String) value - The actual namespace.
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
     *    (XMLElement) elem - The element to operate on.
     *    (String) elemName - The child element tag name filter.
     *    (Function) func - The function to apply to each child.  This
     *      function should take a single argument, a DOM element.
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
     *    (XMLElement) el - A DOM element.
     *    (String) name - The element name.
     *
     *  Returns:
     *    true if the element's tag name matches _el_, and false
     *    otherwise.
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
     *    The currently used DOM document.
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
     *    A Microsoft XML DOM Object
     *  See Also:
     *    http://msdn.microsoft.com/en-us/library/ms757837%28VS.85%29.aspx
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
     *    (String) name - The name for the element.
     *    (Array|Object) attrs - An optional array or object containing
     *      key/value pairs to use as element attributes. The object should
     *      be in the format {'key': 'value'} or {key: 'value'}. The array
     *      should have the format [['key1', 'value1'], ['key2', 'value2']].
     *    (String) text - The text child data for the element.
     *
     *  Returns:
     *    A new XML DOM element.
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
     *     (String) text - text to escape.
     *
     *  Returns:
     *      Escaped text.
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
    *     (String) text - text to unescape.
    *
    *  Returns:
    *      Unescaped text.
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
     *    (String) text - The content of the text node.
     *
     *  Returns:
     *    A new XML DOM text node.
     */
    xmlTextNode: function (text)
    {
        return Strophe.xmlGenerator().createTextNode(text);
    },

    /** Function: xmlHtmlNode
     *  Creates an XML DOM html node.
     *
     *  Parameters:
     *    (String) html - The content of the html node.
     *
     *  Returns:
     *    A new XML DOM text node.
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
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A String with the concatenated text of all text element children.
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
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A new, copied DOM element tree.
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
     *    (HTMLElement) elem - A DOM element.
     *
     *  Returns:
     *    A new, copied DOM element tree.
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
     *    (String) node - A node (or local part).
     *
     *  Returns:
     *    An escaped node (or local part).
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
     *    (String) node - A node (or local part).
     *
     *  Returns:
     *    An unescaped node (or local part).
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
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the node.
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
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the domain.
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
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the resource.
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
     *    (String) jid - A JID.
     *
     *  Returns:
     *    A String containing the bare JID.
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
     *    DEBUG - Messages useful for debugging purposes.
     *    INFO - Informational messages.  This is mostly information like
     *      'disconnect was called' or 'SASL auth succeeded'.
     *    WARN - Warnings about potential problems.  This is mostly used
     *      to report transient connection errors like request timeouts.
     *    ERROR - Some error occurred.
     *    FATAL - A non-recoverable fatal error occurred.
     *
     *  Parameters:
     *    (Integer) level - The log level of the log message.  This will
     *      be one of the values in Strophe.LogLevel.
     *    (String) msg - The log message.
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
     *    (String) msg - The log message.
     */
    debug: function(msg)
    {
        this.log(this.LogLevel.DEBUG, msg);
    },

    /** Function: info
     *  Log a message at the Strophe.LogLevel.INFO level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    info: function (msg)
    {
        this.log(this.LogLevel.INFO, msg);
    },

    /** Function: warn
     *  Log a message at the Strophe.LogLevel.WARN level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    warn: function (msg)
    {
        this.log(this.LogLevel.WARN, msg);
    },

    /** Function: error
     *  Log a message at the Strophe.LogLevel.ERROR level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    error: function (msg)
    {
        this.log(this.LogLevel.ERROR, msg);
    },

    /** Function: fatal
     *  Log a message at the Strophe.LogLevel.FATAL level.
     *
     *  Parameters:
     *    (String) msg - The log message.
     */
    fatal: function (msg)
    {
        this.log(this.LogLevel.FATAL, msg);
    },

    /** Function: serialize
     *  Render a DOM element and all descendants to a String.
     *
     *  Parameters:
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    The serialized element tree as a String.
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
     *    (String) name - The name of the extension.
     *    (Object) ptype - The plugin's prototype.
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
 *  >     .c('query', {xmlns: 'strophe:example'})
 *  >     .c('example')
 *  >     .toString()
 *  The above generates this XML fragment
 *  > <iq to='you' from='me' type='get' id='1'>
 *  >   <query xmlns='strophe:example'>
 *  >     <example/>
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
 *    (String) name - The name of the root element.
 *    (Object) attrs - The attributes for the root element in object notation.
 *
 *  Returns:
 *    A new Strophe.Builder.
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
     *    The DOM tree as a element object.
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
     *    The serialized DOM tree in a String.
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
     *    The Stophe.Builder object.
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
     *    (Object) moreattrs - The attributes to add/modify in object notation.
     *
     *  Returns:
     *    The Strophe.Builder object.
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
     *    (String) name - The name of the child.
     *    (Object) attrs - The attributes of the child in object notation.
     *    (String) text - The text to add to the child.
     *
     *  Returns:
     *    The Strophe.Builder object.
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
     *    (XMLElement) elem - A DOM element.
     *
     *  Returns:
     *    The Strophe.Builder object.
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
     *    (String) text - The text data to append to the current element.
     *
     *  Returns:
     *    The Strophe.Builder object.
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
     *    (String) html - The html to insert as contents of current element.
     *
     *  Returns:
     *    The Strophe.Builder object.
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
 *    (Function) handler - A function to be executed when the handler is run.
 *    (String) ns - The namespace to match.
 *    (String) name - The element name to match.
 *    (String) type - The element type to match.
 *    (String) id - The element id attribute to match.
 *    (String) from - The element from attribute to match.
 *    (Object) options - Handler options
 *
 *  Returns:
 *    A new Strophe.Handler object.
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
     *    (XMLElement) elem - The XML element to test.
     *
     *  Returns:
     *    true if the stanza matches and false otherwise.
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
     *    (XMLElement) elem - The DOM element that triggered the
     *      Strophe.Handler.
     *
     *  Returns:
     *    A boolean indicating if the handler should remain active.
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
     *    A String.
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
 *    (Integer) period - The number of milliseconds to wait before the
 *      handler is called.
 *    (Function) handler - The callback to run when the handler fires.  This
 *      function should take no arguments.
 *
 *  Returns:
 *    A new Strophe.TimedHandler object.
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
     *    true if the Strophe.TimedHandler should be called again, and false
     *      otherwise.
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
     *    The string representation.
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
 *    (String) service - The BOSH or WebSocket service URL.
 *    (Object) options - A hash of configuration options
 *
 *  Returns:
 *    A new Strophe.Connection object.
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
     *    (String) suffix - A optional suffix to append to the id.
     *
     *  Returns:
     *    A unique string to be used for the id attribute.
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
     *    (String) jid - The user's JID.  This may be a bare JID,
     *      or a full JID.  If a node is not supplied, SASL ANONYMOUS
     *      authentication will be attempted.
     *    (String) pass - The user's password.
     *    (Function) callback - The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (String) route - The optional route value.
     *    (String) authcid - The optional alternative authentication identity
     *      (username) if intending to impersonate another user.
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
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
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
     *    (String) jid - The user's JID.  This may be a bare JID or a full JID.
     *    (Function) callback - The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
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
     *    (XMLElement) elem - The XML data received by the connection.
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
     *    (XMLElement) elem - The XMLdata sent by the connection.
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
     *    (String) data - The data received by the connection.
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
     *    (String) data - The data sent by the connection.
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
     *    (XMLElement |
     *     [XMLElement] |
     *     Strophe.Builder) elem - The stanza to send.
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
     *    (XMLElement) elem - The stanza to send.
     *    (Function) callback - The callback function for a successful request.
     *    (Function) errback - The callback function for a failed or timed
     *      out request.  On timeout, the stanza will be null.
     *    (Integer) timeout - The time specified in milliseconds for a
     *      timeout to occur.
     *
     *  Returns:
     *    The id used to send the IQ.
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
     *    (Integer) period - The period of the handler.
     *    (Function) handler - The callback function.
     *
     *  Returns:
     *    A reference to the handler that can be used to remove it.
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
     *    (Strophe.TimedHandler) handRef - The handler reference.
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
     *    (Function) handler - The user callback.
     *    (String) ns - The namespace to match.
     *    (String) name - The stanza name to match.
     *    (String) type - The stanza type attribute to match.
     *    (String) id - The stanza id attribute to match.
     *    (String) from - The stanza from attribute to match.
     *    (String) options - The handler options
     *
     *  Returns:
     *    A reference to the handler that can be used to remove it.
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
     *    (Strophe.Handler) handRef - The handler reference.
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
     *    (String) reason - The reason the disconnect is occuring.
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
     *    (Integer) status - the new connection status, one of the values
     *      in Strophe.Status
     *    (String) condition - the error condition or null
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
     *    (Strophe.Request) req - The request that has data ready.
     *    (string) req - The stanza a raw string (optiona).
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
     *    (Strophe.Request) req - The current request.
     *    (Function) _callback - low level (xmpp) connect callback function.
     *      Useful for plugins with their own xmpp connect callback (when their)
     *      want to do something special).
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
     *    (XMLElement) elem - The stanza that triggered the callback.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (XMLElement) elem - The matching stanza.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (XMLElement) elem - The stanza that triggered the callback.
     *
     *  Returns:
     *    false to remove the handler.
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
     *    (Integer) period - The period of the handler.
     *    (Function) handler - The callback function.
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
     *    (Function) handler - The callback function.
     *    (String) ns - The namespace to match.
     *    (String) name - The stanza name to match.
     *    (String) type - The stanza type attribute to match.
     *    (String) id - The stanza id attribute to match.
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
     *    false to remove the handler.
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
 *    (String) name - SASL Mechanism name.
 *    (Boolean) isClientFirst - If client should send response first without challenge.
 *    (Number) priority - Priority.
 *
 *  Returns:
 *    A new Strophe.SASLMechanism object.
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
   *    (Strophe.Connection) connection - Target Connection.
   *
   *  Returns:
   *    (Boolean) If mechanism was able to run.
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
   *    (Strophe.Connection) connection - Target Connection.
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
   *    (Strophe.Connection) connection - Target Connection.
   *    (String) challenge - current challenge to handle.
   *
   *  Returns:
   *    (String) Mechanism response.
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
 *    (String) str - The string to be quoted.
 *
 *  Returns:
 *    quoted string
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
    Strophe:        Strophe,
    $build:         $build,
    $msg:           $msg,
    $iq:            $iq,
    $pres:          $pres,
    SHA1:           SHA1,
    Base64:         Base64,
    MD5:            MD5
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
 *    (XMLElement) elem - The XML data to be sent in the request.
 *    (Function) func - The function that will be called when the
 *      XMLHttpRequest readyState changes.
 *    (Integer) rid - The BOSH rid attribute associated with this request.
 *    (Integer) sends - The number of times this same request has been
 *      sent.
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
     *    "parsererror" - A parser error occured.
     *
     *  Returns:
     *    The DOM element tree of the response.
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
     *    A new XMLHttpRequest.
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
 *    (Strophe.Connection) connection - The Strophe.Connection that will use BOSH.
 *
 *  Returns:
 *    A new Strophe.Bosh object.
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
     *    A Strophe.Builder with a <body/> element.
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
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
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
     *    (String) jid - The full JID that is bound by the session.
     *      This parameter is optional but recommended, specifically in cases
     *      where prebinded BOSH sessions are used where it's important to know
     *      that the right session is being restored.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
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
     *    (Strophe.Request) bodyWrap - The received stanza.
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
     *    (Strophe.Request) bodyWrap - The received stanza.
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
     *    (Request) pres - This stanza will be sent before disconnecting.
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
     *    True, if there are no Requests queued, False otherwise.
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
     *    (Integer) reqStatus - The request status.
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
     *    (Function) func - The handler for the request.
     *    (Strophe.Request) req - The request that is changing readyState.
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
     *    (Integer) i - The index of the request in the queue.
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
     *    (Strophe.Request) req - The request to remove.
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
     *    (Integer) i - The index of the request in the queue.
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
     *    (Object) req - The Request.
     *
     *  Returns:
     *    The stanza that was passed.
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
 *    (Strophe.Connection) connection - The Strophe.Connection that will use WebSockets.
 *
 *  Returns:
 *    A new Strophe.WebSocket object.
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
     *    A Strophe.Builder with a <stream> element.
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
     *    (Strophe.Request) bodyWrap - The received stanza.
     *    connectstatus - The ConnectStatus that will be set on error.
     *  Returns:
     *     true if there was a streamerror, false otherwise.
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
     *    (Strophe.Request) bodyWrap - The received stanza.
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
     *    (Node) message - Stanza containing the <open /> tag.
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
     *    (Request) pres - This stanza will be sent before disconnecting.
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
     *    True, because WebSocket messages are send immediately after queueing.
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
     *    (Object) stanza - The stanza.
     *
     *  Returns:
     *    The stanza that was passed.
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

/**************************************************************************
***                             Easemob WebIm Js SDK                    ***
***                             v1.1.0                                  ***
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
    Easemob.im.version = "1.1.0";

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

        if ( window.XDomainRequest ) {
            XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
            XDomainRequest.prototype.send = function () {
                XDomainRequest.prototype.oldsend.apply(this, arguments);
                this.readyState = 2;
            };
        }

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

                    msg = msg.replace(/&amp;/g, '&');
                    msg = msg.replace(/&#39;/g, '\'');
                    msg = msg.replace(/&lt;/g, '<');

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
                var res = msg.match(reg);
                var src = res && res[0] ? res[0] : ''; 
                if ( res && res.length ) {
                    var prefix = /^https?:\/\//.test(src);
                    msg = msg.replace(reg
                        , "<a href='" 
                            + (prefix 
                                ? src 
                                : '\/\/' + src) 
                            + "' target='_blank'>" 
                            + src 
                            + "</a>");
                }
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

            conn.retry && setTimeout(function () {
                if ( _msgHash[message.id] ) {
                    if ( typeof _msgHash[message.id].timeout === 'undefined' ) {
                        _msgHash[message.id].timeout = 2;
                    }
                    if ( _msgHash[message.id].timeout === 0 ) {
                        _msgHash[message.id].timeout = 2;
                        _msgHash[message.id].msg.fail instanceof Function 
                        && _msgHash[message.id].msg.fail(message.id);
                    } else {
                        _msgHash[message.id].timeout -= 1;
                        _send(message);
                    }
                }
            }, 20000);
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
            } else if ( status == Strophe.Status.DISCONNECTING ) {
                if ( conn.isOpened() ) {// 不是主动关闭
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
            
            var jid = appKey + "_" + user + "@" + conn.domain,
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
        }

        connection.prototype.heartBeat = function ( conn ) {
            var options = {
                to : conn.domain,
                type : "normal"
            };
            conn.heartBeatID = setInterval(function () {
                conn.sendHeartBeatMessage(options);
            }, 60000);
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

        connection.prototype.stopHeartBeat = function ( conn ) {
            clearInterval(conn.heartBeatID);
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

            var from = msginfo.getAttribute('from') || '';
            var to = msginfo.getAttribute('to') || '';
            var type = msginfo.getAttribute('type') || '';
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
					} else if ( info.type === 'unavailable' ) {
						if ( !info.status ) {//web正常退出
							info.type = 'leaveChatRoom';
						} else if ( info.code == 110 ) {//app先退或被管理员踢
							info.type = 'leaveChatRoom';
						} else if ( info.error && info.error.code == 406 ) {//聊天室人已满，无法加入
							info.type = 'joinChatRoomFailed';
						}
					}
				}
			} else if ( type === 'unavailable' ) {//聊天室被删除没有roomtype, 需要区分群组被踢和解散
				if ( info.destroy ) {//群组和聊天室被删除
					info.type = 'deleteGroupChat';
				} else if ( info.code == 307 ) {//群组被踢
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

            if ( from !== "" && from !== curJid && curUser !== name ) {
                return true;
			}

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
                            , data: emotionsbody.body
                            , ext: extmsg
                        });
                    } else {
                        this.onTextMessage({
                            id: id
                            , type: chattype
                            , from: from
                            , to: too
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
                    });
                } else if ( "cmd" === type ) {
                    this.onCmdMessage({
                        id: id
                        , from: from
                        , to: too
                        , action: msgBody.action
                        , ext: extmsg
                    });
                }
            }
        };

        connection.prototype.handleReceivedMessage = function ( message ) {
            this.onReceivedMessage(message);

            var rcv = message.getElementsByTagName('received'),
                id = undefined;

            if ( rcv.length > 0 ) {
                if ( rcv[0].childNodes && rcv[0].childNodes.length > 0 ) {
                    id = rcv[0].childNodes[0].nodeValue;
                } else {
                    id = rcv[0].innerHTML || rcv[0].innerText;
                }
            }
            
            if ( _msgHash[id] ) {
                _msgHash[id].msg.success instanceof Function && _msgHash[id].msg.success(id);
                delete _msgHash[id];
            }
        };

        connection.prototype.handleInviteMessage = function ( message ) {
            var form = null;
            var invitemsg = message.getElementsByTagName('invite');

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
                            var json = Utils.parseJSON(xhr.responseText);
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
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(data);
        return xhr;
    };
    window.easemobim = window.easemobim || {};
    window.easemobim.emajax = emajax;
}());

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

;(function () {
    var getData = new easemobim.Transfer();

    var createObject = function ( options ) {
        return {
            url: options.url
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
                    url: '/v1/Tenants/' + msg.data.tenantId + '/robots/visitor/greetings',
                    msg: msg
                }));
                break;
			case 'sendVisitorInfo':
                easemobim.emajax(createObject({
                    url: '/v1/webimplugin/tenants/' + msg.data.tenantId + '/visitors/' + msg.data.visitorId + '/attributes?tenantId=' + msg.data.tenantId,
                    msg: msg,
                    type: 'POST'
                }));
                break;
            default:
                break;
        }
    });
}());

window.easemobim = window.easemobim || {};

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
easemobim.LOADING = !easemobim.utils.isQQBrowserInAndroid && !(easemobim.utils.getIEVersion && easemobim.utils.getIEVersion === 9)
    ? ["<div class='easemobWidget-loading'><svg version='1.1' id='图层_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'",
    " viewBox='0 0 70 70' enable-background='new 0 0 70 70' xml:space='preserve'>",
    "<circle opacity='0.3' fill='none' stroke='#000000' stroke-width='4' stroke-miterlimit='10' cx='35' cy='35' r='11'/>",
    "<path fill='none' stroke='#E5E5E5' stroke-width='4' stroke-linecap='round' stroke-miterlimit='10' d='M24,35c0-6.1,4.9-11,11-11",
    "c2.8,0,5.3,1,7.3,2.8'/><image src='/webim/static/img/loading.gif' width='20' style='margin-top:10px;' /></svg></div>"].join('')
    : "<img src='/webim/static/img/loading.gif' width='20' style='margin-top:10px;'/>";

//当前支持的所有主题
easemobim.THEME = {
    '天空之城': {
        css: 'body .theme-color{color:#42b8f4;}body .bg-color{background-color:#42b8f4}.border-color{border:1px solid #00a0e7}.hover-color{background-color:#7dcdf7}'
    }
    , '丛林物语': {
        css: 'body .theme-color{color:#00b45f;}body .bg-color{background-color:#00b45f}.border-color{border:1px solid #009a51}.hover-color{background-color:#16cd77}'
    }
    , '红瓦洋房': {
        css: 'body .theme-color{color:#b50e03;}body .bg-color{background-color:#b50e03}.border-color{border:1px solid #811916}.hover-color{background-color:#e92b25}'
    }
    , '鲜美橙汁': {
        css: 'body .theme-color{color:#ffa000;}body .bg-color{background-color:#ffa000}.border-color{border:1px solid #f69000}.hover-color{background-color:#ffb63b}'
    }
    , '青草田间': {
        css: 'body .theme-color{color:#9ec100;}body .bg-color{background-color:#9ec100}.border-color{border:1px solid #809a00}.hover-color{background-color:#bad921}'
    }
    , '湖光山色': {
        css: 'body .theme-color{color:#00cccd;}body .bg-color{background-color:#00cccd}.border-color{border:1px solid #12b3b4}.hover-color{background-color:#38e6e7}'
    }
    , '冷峻山峰': {
        css: 'body .theme-color{color:#5b799a;}body .bg-color{background-color:#5b799a}.border-color{border:1px solid #48627b}.hover-color{background-color:#6a8eb5}'
    }
    , '月色池塘': {
        css: 'body .theme-color{color:#3977cf;}body .bg-color{background-color:#3977cf}.border-color{border:1px solid #2b599b}.hover-color{background-color:#548bdc}'
    }
};

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
			
			utils.html(shadow, val);
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
	return that;
}());

/*
 * 数据和配置参数初始化
 */

var EasemobWidget = EasemobWidget || {};
EasemobWidget.init = function ( obj, callback ) {

    var message = new TransferMessage();
    var tenantId = obj.json.tenantId;
    
	EasemobWidget.api.getTo(tenantId)
    .done(function(toinfo){
		var curIdx = 0;

        if(toinfo.length > 0) {
            obj.to = toinfo[curIdx].imServiceNumber;
            obj.orgName = toinfo[curIdx].orgName;
            obj.appName = toinfo[curIdx].appName;
            obj.apiUrl = toinfo[curIdx].restDomain ? '//' + toinfo[curIdx].restDomain : '//a1.easemob.com';

			var cluster = toinfo[curIdx].restDomain ? toinfo[curIdx].restDomain.match(/vip\d/) : '';
            obj.cluster = cluster && cluster.length > 0 ? cluster[0] : '';
            obj.avatar = toinfo[curIdx].tenantAvatar || 'static/img/default_avatar.png';
            obj.tenantName = toinfo[curIdx].tenantName;
            obj.appkey = toinfo[curIdx].orgName + '#' + toinfo[curIdx].appName;
			obj.logo = toinfo[curIdx].tenantLogo || '';
        } else {
            return;
        }

        if ( obj.mobile ) {
			Emc.set('emKefuChannel' + tenantId, obj.to + '*' + obj.orgName + '*' + obj.appName, obj.json.tenants);
        } else {
            message.sendToParent({ event: 'setchannel', channel:  obj.to + '*' + obj.orgName + '*' + obj.appName, tenantId: tenantId });
        }

		typeof callback == 'function' && callback();
    });
};

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
	return [
		!isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper'>",
				"<i class='easemobWidget-corner'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='easemobWidget-msg-container'>",
					"<p>" + Easemob.im.Utils.parseLink(this.emotion ? this.value : Easemob.im.Utils.parseEmotions(easemobim.utils.encode(this.value))) + "</p>",
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
		!isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper'>",
				"<i class='easemobWidget-corner'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='easemobWidget-msg-container'>",
					this.value === null ? "<a class='easemobWidget-noline' href='javascript:;'><i class='easemobWidget-unimage'>I</i></a>" : "<a class='easemobWidget-noline' href='javascript:;'><img class='easemobWidget-imgview' src='" + this.value.url + "'/></a>",,
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
		"<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper'>",
				"<i class='easemobWidget-corner'></i>",
				"<div class='easemobWidget-msg-container'>",
					"<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(easemobim.utils.encode(this.value))) + "</p>",
				"</div>",
				"<div id='" + this.id + "_failed' class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>",
			"</div>",
			this.listDom,
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
	return [
		!isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper easemobWidget-msg-file'>",
				"<i class='easemobWidget-corner'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status em-hide'><span>发送失败</span><i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + config.LOADING + "</div>" : "",
				"<div class='easemobWidget-msg-container'>",
					this.value === null ? "<a class='easemobWidget-noline' href='javascript:;'><i class='easemobWidget-unimage'>I</i></a>" : "<a target='_blank' href='" + this.value.url + "' class='easemobWidget-fileMsg' title='" + this.filename + "'><img class='easemobWidget-msg-fileicon' src='static/img/file_download.png'/><span>" + (this.filename.length > 19 ? this.filename.slice(0, 19) + '...': this.filename) + "</span></a>",
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

	utils.addClass(dom, 'easemobWidget-dialog easemobWidget-paste-wrapper em-hide');
	utils.html(dom, "\
		<div class='easemobWidget-paste-image'></div>\
		<div>\
			<button class='easemobWidget-cancel'>取消</button>\
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
			utils.html(imgContainer, '');
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
	easemobim.leaveMessage = function ( chat ) {

		var leaveMessage = this.leaveMessage,
			utils = this.utils,
			imChat = easemobim.imChat;

		if ( leaveMessage.dom ) {
			return false;
		}

		leaveMessage.dom = document.createElement('div');
		leaveMessage.dom.id = 'easemobWidgetOffline';
		utils.addClass(leaveMessage.dom, 'easemobWidget-offline em-hide');
		utils.html(leaveMessage.dom, "\
			<h3>请留下您的联系方式，以方便客服再次联系您</h3>\
			<input type='text' placeholder='请输入手机/邮箱/QQ号'/>\
			<p>留言内容</p>\
			<textarea spellcheck='false' placeholder='请输入留言'></textarea>\
			<button class='bg-color'>留言</button>\
			<div class='easemobWidget-success-prompt em-hide'><i>A</i><p>留言发送成功</p></div>\
		");
		imChat.appendChild(leaveMessage.dom);

		var msg = leaveMessage.dom.getElementsByTagName('textarea')[0],
			contact = leaveMessage.dom.getElementsByTagName('input')[0],
			leaveMessageBtn = leaveMessage.dom.getElementsByTagName('button')[0],
			success = leaveMessage.dom.getElementsByTagName('div')[0];

		utils.on(leaveMessageBtn, utils.click, function () {
			if ( !contact.value && !msg.value ) {
				chat.errorPrompt('联系方式和留言不能为空');
			} else if ( !contact.value ) {
				chat.errorPrompt('联系方式不能为空');
			} else if ( !msg.value ) {
				chat.errorPrompt('留言不能为空');
			} else if ( !/^\d{5,11}$/g.test(contact.value) 
				&& !/^[a-zA-Z0-9-_]+@([a-zA-Z0-9-]+[.])+[a-zA-Z]+$/g.test(contact.value) ) {
				chat.errorPrompt('请输入正确的手机号码/邮箱/QQ号');
			} else {
				chat.sendTextMsg('手机号码/邮箱/QQ号：' + contact.value + '   留言：' + msg.value);
				utils.removeClass(success, 'em-hide');
				setTimeout(function(){
					utils.addClass(success, 'em-hide');
				}, 1500);
				contact.value = '';
				msg.value = '';
			}
		});
	};
}());

/**
 * 满意度调查
 */
easemobim.satisfaction = function ( chat ) {

	var dom = document.createElement('div'),
		utils = easemobim.utils;

	utils.addClass(dom, 'easemobWidget-dialog easemobWidget-satisfaction-dialog em-hide');
	utils.html(dom, "\
		<h3>请对我的服务做出评价</h3>\
		<ul><li idx='1'>H</li><li idx='2'>H</li><li idx='3'>H</li><li idx='4'>H</li><li idx='5'>H</li></ul>\
		<textarea spellcheck='false' placeholder='请输入留言'></textarea>\
		<div>\
			<button class='easemobWidget-cancel'>取消</button>\
			<button class='bg-color'>提交</button>\
		</div>\
		<div class='easemobWidget-success-prompt em-hide'><i>A</i><p>提交成功</p></div>\
	");
	easemobim.imChat.appendChild(dom);

	var satisfactionEntry = utils.$Dom('EasemobKefuWebimSatisfy'),
		starsUl = dom.getElementsByTagName('ul')[0],
		lis = starsUl.getElementsByTagName('li'),
		msg = dom.getElementsByTagName('textarea')[0],
		buttons = dom.getElementsByTagName('button'),
		cancelBtn = buttons[0],
		submitBtn = buttons[1],
		success = dom.getElementsByTagName('div')[1],
		session,
		invite,
		getStarLevel = function () {
			var count = 0;

			for ( var i = lis.length; i > 0; i-- ) {
				if ( utils.hasClass(lis[i-1], 'sel') ) {
					count += 1;
				}
			}
			return count;
		},
		clearStars = function () {
			for ( var i = lis.length; i > 0; i-- ) {
				utils.removeClass(lis[i-1], 'sel');
			}
		};
	
	satisfactionEntry && utils.on(satisfactionEntry, utils.click, function () {
		session = null;
		invite = null;
		utils.removeClass(dom, 'em-hide');
		clearInterval(chat.focusText);
	});
	utils.live('button.js_satisfybtn', 'click', function () {
		session = this.getAttribute('data-servicesessionid');
		invite = this.getAttribute('data-inviteid');
		utils.removeClass(dom, 'em-hide');
		clearInterval(chat.focusText);
	});
	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'em-hide');
	});
	utils.on(submitBtn, 'click', function () {
		var level = getStarLevel();

		if ( level === 0 ) {
			chat.errorPrompt('请先选择星级');
			return false;
		}
		chat.sendSatisfaction(level, msg.value, session, invite);

		msg.blur();
		utils.removeClass(success, 'em-hide');

		setTimeout(function(){
			msg.value = '';
			clearStars();
			utils.addClass(success, 'em-hide');
			utils.addClass(dom, 'em-hide');
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
};

/**
 * img view
 */
easemobim.imgView = (function () {

	var imgViewWrap = document.createElement('div'),
		utils = easemobim.utils,
		img = document.createElement('img');

	img.style.cssText = '\
	position: absolute;\
    max-width: 90%;\
    max-height: 90%;\
    top: 0;\
    left: 0;\
    right: 0;\
    bottom: 0;\
    margin: auto;';
	imgViewWrap.appendChild(img);

	imgViewWrap.style.cssText = '\
	display: none;\
	z-index: 100000;\
    position: fixed;\
    width: 100%;\
    height: 100%;\
    left: 0;\
    top: 0;\
    background: rgba(0,0,0,.3);';
	document.body.appendChild(imgViewWrap);

	utils.on(imgViewWrap, 'click', function () {
		imgViewWrap.style.display = 'none';
	}, false);


	return {
		show: function ( url ) {
			img.setAttribute('src', url);
			imgViewWrap.style.display = 'block';
		}
	};
}());

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
            , flash_url: utils.protocol + config.staticPath + '/js/swfupload/swfupload.swf'
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
                    var msg = new Easemob.im.EmMessage('img', this.fileMsgId);
                    msg.set({file: null});
                    me.appendMsg(config.user.username, config.toUser, msg);
                    me.appendDate(new Date().getTime(), config.toUser);
                }
            }
            , upload_success_handler: function ( file, response ) {
                if ( !file || !response ) {
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
        me.swfupload = me.uploadShim('easemobWidgetFileInput');
    }
};

/**
 * support: ie8+ & modern borwsers & mobile browsers
 */
;(function ( window, undefined ) {
    'use strict';

	if ( typeof easemobim === 'function' ) {
		return false;
	}

	//set default value
	/*var setdefault = function ( target, defaultvalue ) {
		return target || target === false ? target : defaultvalue;
    };*/


    var webim = document.getElementById('EasemobKefuWebim'),
		utils = easemobim.utils,
		entry;



	//main entry
	var main = function ( config ) {


		//如果是H5的方式
		if ( utils.root ) {
			config.satisfaction = utils.convertFalse(utis.query('sat'));
			config.resources = utils.convertFalse(utis.query('resources'));
		}

		//reset
		config.tenantId = config.tenantId || utis.query('tenantId');
		config.hide = utils.convertFalse(config.hide);
		config.resources = utils.convertFalse(config.resources);
		config.satisfaction = utils.convertFalse(config.satisfaction);
		

		//render Tpl
		webim.innerHTML = "\
			<div id='easemobWidgetPopBar'" + (!config.minimum || config.hide ? " class='em-hide'" : "") + "'>\
				<a class='easemobWidget-pop-bar bg-color' href='javascript:;'><i></i>" + config.buttonText + "</a>\
				<span class='easemobWidget-msgcount em-hide'></span>\
			</div>\
			<div id='EasemobKefuWebimChat' class='easemobWidgetWrapper" + (!config.minimum ? "'" : " em-hide'") + ">\
				<div id='easemobWidgetHeader' class='easemobWidgetHeader-wrapper bg-color border-color'>\
					<div id='easemobWidgetDrag'>\
						<p></p>\
						<img class='easemobWidgetHeader-portrait border-color'/>\
						<span class='easemobWidgetHeader-nickname'></span>\
					</div>\
				</div>\
				<div id='easemobWidgetBody' class='easemobWidgetBody-wrapper'></div>\
				<div id='EasemobKefuWebimFaceWrapper' class='easemobWidget-face-wrapper e-face em-hide'>\
					<ul class='easemobWidget-face-container'></ul>\
				</div>\
				<div id='easemobWidgetSend' class='easemobWidget-send-wrapper'>\
					<i class='easemobWidget-face e-face' tile='表情'></i>\
					<i class='easemobWidget-file' id='easemobWidgetFile' tile='图片'></i>\
					<input id='easemobWidgetFileInput' type='file' accept='image/*'/>\
					<textarea class='easemobWidget-textarea' spellcheck='false'></textarea>" +
					(utils.isMobile || !config.satisfaction ? "" : "<span id='EasemobKefuWebimSatisfy' class='easemobWidget-satisfaction'>请对服务做出评价</span>") + "\
					<a href='javascript:;' class='easemobWidget-send bg-color disabled' id='easemobWidgetSendBtn'>连接中</a>\
				</div>\
				<iframe id='EasemobKefuWebimIframe' class='em-hide' src='" + config.domain + "/webim/transfer.html'>\ </div>\
		";

		if ( utils.isMobile ) {
			document.getElementById('EasemobKefuWebimChat').style.cssText = 'width:100%;height:100%;right:0;bottom:0;';
		} else {
			document.getElementById('EasemobKefuWebimChat').style.cssText = 'width:' + config.dialogWidth + ';height:' + config.dialogHeight + ';';
		}


		var chat = easemobim.chat(config),
			api = easemobim.api;

		config.base = utils.protocol + config.domain;
		config.sslImgBase = config.domain + '/ossimages/';

		if ( !Easemob.im.Utils.isCanUploadFileAsync && Easemob.im.Utils.isCanUploadFile ) {
			var script = document.createElement('script');
			script.onload = script.onreadystatechange = function () {
				if ( !this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ) {
					easemobim.uploadShim(config, chat);
				}
			};
			script.src = utils.protocol + config.staticPath + '/js/swfupload/swfupload.min.js';
			webim.appendChild(script);
		}


		/**
		 * chat Entry
		 */
		entry = {
			init: function () {
				api('getDutyStatus', {
					tenantId: config.tenantId
				}, function ( msg ) {
					config.offDuty = msg.data;

					if ( msg.data ) {
						chat.setOffline();//根据状态展示上下班不同view
					}
				});

				config.orgName = config.appKey.split('#')[0];
				config.appName = config.appKey.split('#')[1];

				chat.init();

				api('getRelevanceList', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg.data.length === 0 ) {
						chat.errorPrompt('未创建关联', true);
						return;
					}
					config.relevanceList = msg.data;
					config.defaultAvatar = utils.getAvatarsFullPath(msg.data[0].tenantAvatar, config.domain);
					config.defaultAgentName = msg.data[0].tenantName;
					config.logo = config.logo || msg.data[0].tenantLogo;
					config.toUser = config.toUser || msg.data[0].imServiceNumber;
					config.orgName = config.orgName || msg.data[0].orgName;
					config.appName = config.appName || msg.data[0].appName;
					config.appKey = config.appKey || config.orgName + '#' + config.appName;
					config.restServer = config.restServer || msg.data[0].restDomain;

					var cluster = config.restServer ? config.restServer.match(/vip\d/) : '';
					cluster = cluster ? '-' + cluster : '';
					config.xmppServer = config.xmppServer || 'im-api' + cluster + '.easemob.com'; 

					if ( config.user.username && (config.user.password || config.user.token) ) {
						chat.ready();
					} else {
						
						if ( config.user.username ) {
							api('getPassword', {
								userId: config.user.username
							}, function ( msg ) {
								if ( !msg.data ) {
									api('createVisitor', {
										orgName: config.orgName
										, appName: config.appName
										, imServiceNumber: config.toUser
										, tenantId: config.tenantId
									}, function ( msg ) {
										config.newuser = true;
										config.user.username = msg.data.userId;
										config.user.password = msg.data.userPassword;
										easemobim.EVENTS.CACHEUSER.data = {
											username: config.user.username,
											group: config.user.emgroup
										};
										transfer.send(easemobim.EVENTS.CACHEUSER);
										chat.ready();
									});
								} else {
									config.user.password = msg.data;
									chat.ready();
								}
							});
						} else {
							api('createVisitor', {
								orgName: config.orgName
								, appName: config.appName
								, imServiceNumber: config.toUser
							}, function ( msg ) {
								config.newuser = true;
								config.user.username = msg.data.userId;
								config.user.password = msg.data.userPassword;
								easemobim.EVENTS.CACHEUSER.data = {
									username: config.user.username,
									group: config.user.emgroup
								};
								transfer.send(easemobim.EVENTS.CACHEUSER);
								chat.ready();
							});
						}
					}
				});
				return this;
			}
			, beforeOpen: function () {}
			, open: function ( outerTrigger ) {
				config.toUser = config.to;
				this.beforeOpen();
				chat.show(outerTrigger);
			}
			, close: function ( outerTrigger ) {
				chat.close(outerTrigger);
				this.afterClose();
			}
			, afterClose: function () {}
		};


		utils.on(utils.$Dom('EasemobKefuWebimIframe'), 'load', function () {
			easemobim.getData = new easemobim.Transfer('EasemobKefuWebimIframe');
			entry.init();
		});


		//load modules
		typeof easemobim.leaveMessage === 'function' && easemobim.leaveMessage(chat);
		typeof easemobim.paste === 'function' && (easemobim.paste = easemobim.paste(chat));
		typeof easemobim.satisfaction === 'function' && easemobim.satisfaction(chat);
	};



	//Controller
	window.transfer = new easemobim.Transfer().listen(function ( msg ) {

		if ( msg && msg.tenantId ) {
			main(msg);
		} else if ( msg.event ) {
			switch ( msg.event ) {
				case easemobim.EVENTS.SHOW.event:
					entry.open(true);
					break;
				case easemobim.EVENTS.CLOSE.event:
					entry.close(true);
					break;
			}
		}
	});
} ( window, undefined ));

/**
 * webim交互相关
 */
;(function () {

    easemobim.chat = function ( config ) {
		var utils = easemobim.utils;

		easemobim.im = utils.$Dom('EasemobKefuWebim'),
		easemobim.imBtn = utils.$Dom('easemobWidgetPopBar'),
		easemobim.imChat = utils.$Dom('EasemobKefuWebimChat'),
		easemobim.imChatBody = utils.$Dom('easemobWidgetBody'),
		easemobim.send = utils.$Dom('easemobWidgetSend'),
		easemobim.textarea = easemobim.send.getElementsByTagName('textarea')[0],
		easemobim.sendBtn = utils.$Dom('easemobWidgetSendBtn'),
		easemobim.faceBtn = easemobim.send.getElementsByTagName('i')[0],
		easemobim.realFile = utils.$Dom('easemobWidgetFileInput'),
		easemobim.sendFileBtn = utils.$Dom('easemobWidgetFile'),
		easemobim.dragHeader = utils.$Dom('easemobWidgetDrag'),
		easemobim.dragBar = easemobim.dragHeader.getElementsByTagName('p')[0],
		easemobim.chatFaceWrapper = utils.$Dom('EasemobKefuWebimFaceWrapper'),
		easemobim.messageCount = easemobim.imBtn.getElementsByTagName('span')[0];
		easemobim.swfupload = null;//flash 上传


        return {
            init: function () {
                this.setConnection();
                this.scbT = 0;//sroll bottom timeout stamp
				this.msgCount = 0;//未读消息数
                this.msgTimeSpan = {};//用于处理1分钟之内的消息只显示一次时间
                this.opened = false;//聊天窗口是否已展示

				this.setTheme();
                this.setMinmum();
                this.soundReminder();
                this.bindEvents();
				this.mobile();
            }
			, mobile: function () {
				if ( !utils.isMobile ) { return false; }

				var i = document.createElement('i');
                utils.addClass(easemobim.imChat, 'easemobWidgetWrapper-mobile');
				utils.addClass(i, 'easemobWidgetHeader-keyboard easemobWidgetHeader-keyboard-down');
				easemobim.dragHeader.appendChild(i);
			}
            , ready: function () {
                this.setNotice();
                this.sdkInit();
                this.open();
                this.handleGroup();
                this.getSession();
				this.setLogo();
                this.chatWrapper.getAttribute('data-getted') || config.newuser || this.getHistory();
            }
            , setConnection: function() {
                this.conn = new Easemob.im.Connection({ 
					url: config.xmppServer,
					retry: true,
					multiResources: config.resources
				});
            }
            , handleChatWrapperByHistory: function ( chatHistory, chatWrapper ) {
                if ( chatHistory.length === easemobim.LISTSPAN ) {
                    chatWrapper.setAttribute('data-start', Number(chatHistory[easemobim.LISTSPAN - 1].chatGroupSeqId) - 1);
                    chatWrapper.setAttribute('data-history', 0);
                } else {
                    chatWrapper.setAttribute('data-history', 1);
                }
            }
            , getHistory: function ( notScroll ) {
                if ( config.offDuty || config.newuser ) {
                    return;
                }

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
                            me.handleHistory(msg.data);
                            notScroll || me.scrollBottom();
                        }
                    });
                } else {
                    Number(chatWrapper.getAttribute('data-history')) || easemobim.api('getGroup', {
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
                                    me.handleHistory(msg.data);
                                    notScroll || me.scrollBottom();
                                }
                            });
                        }
                    });
                }
                chatWrapper.setAttribute('data-getted', 1);
            }
			, getGreeting: function () {
				var me = this,
					msg = null;

				if ( me.greetingGetted ) {
					return;
				}

				me.greetingGetted = true;

				easemobim.api('getSystemGreeting', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( msg && msg.data ) {
						msg = {
							data: msg.data,
							type: 'txt',
							noprompt: true
						};
						me.receiveMsg(msg, 'txt');
					}

					easemobim.api('getRobertGreeting', {
						tenantId: config.tenantId
					}, function ( msg ) {
						if ( msg && msg.data ) {
							var rGreeting = msg.data;

							switch ( rGreeting.greetingTextType ) {
								case 0:
									msg = {
										msg: rGreeting.greetingText,
										type: 'txt',
										noprompt: true
									};
									me.receiveMsg(msg, 'txt', null, wrapper, true);
									break;
								case 1:
									try {
										var greetingObj = Easemob.im.Utils.parseJSON(rGreeting.greetingText.replace(/&quot;/g, '"'));
										if ( rGreeting.greetingText === '{}' ) {
											msg = {
												msg: '该菜单不存在',
												type: 'txt',
												noprompt: true
											};
											me.receiveMsg(msg, 'txt');
										} else {
											msg = { 
												ext: greetingObj.ext,
												noprompt: true
											 };
											me.receiveMsg(msg);	
										}
									} catch ( e ) {}
									break;
								default: break;
							}
						}
					});
				});
			}
            , getSession: function () {
				if ( config.offDuty ) { return; }

                var me = this

				if ( !me.session || !me.sessionSent ) {
					me.sessionSent = true;
					me.agent = me.agent || {};

					easemobim.api('getSession', {
						id: config.user.username
						, orgName: config.orgName
						, appName: config.appName
						, imServiceNumber: config.toUser
						, tenantId: config.tenantId
					}, function ( msg ) {
						if ( msg && msg.data ) {
							var ref = config.referrer ? decodeURIComponent(config.referrer) : document.referrer;
							me.agentCount = msg.data.onlineAgentCount;
						} else {
							me.session = null;
							me.getGreeting();
						}

						if ( !msg.data.serviceSession ) {
							me.getGreeting();
						} else {
							me.session = msg.data.serviceSession;
							msg.data.serviceSession.visitorUser 
							&& msg.data.serviceSession.visitorUser.userId 
							&& easemobim.api('sendVisitorInfo', {
								tenantId: config.tenantId,
								visitorId: msg.data.serviceSession.visitorUser.userId,
								referer:  ref
							});//ref info
						}
					});
				}
            }
            , handleGroup: function () {
                this.handleChatContainer(config.toUser);
                this.chatWrapper = utils.$Dom(config.toUser);
            }
            , handleChatContainer: function ( userName ) {
                var curChatContainer = utils.$Dom(userName);

                this.setAgentProfile( {userNickname: config.title} );
                if ( curChatContainer ) {
                    utils.removeClass(curChatContainer, 'em-hide');
                    utils.addClass(utils.siblings(curChatContainer, 'easemobWidget-chat'), 'em-hide');
                    utils.addClass(utils.$Class('div.easemobWidget-status-prompt'), 'em-hide');
                    utils.removeClass(utils.$Dom(config.toUser + '-transfer'), 'em-hide');
                } else {
                    curChatContainer = document.createElement('div');
                    curChatContainer.id = userName;
                    utils.addClass(curChatContainer, 'easemobWidget-chat');
                    utils.insertBefore(easemobim.imChatBody, curChatContainer, easemobim.imChatBody.childNodes[this.hasLogo ? 1 : 0]);

                    curChatContainer = document.createElement('div');
                    curChatContainer.id = config.toUser + '-transfer';
                    utils.addClass(curChatContainer, 'easemobWidget-status-prompt em-hide');
                    easemobim.imChat.appendChild(curChatContainer);
                    curChatContainer = null;
                    this.handleChatContainer(userName);     
                }
            }
            , handleHistory: function ( chatHistory ) {
                var me = this;

                if ( chatHistory.length > 0 ) {
                    utils.each(chatHistory, function ( k, v ) {
                        var msgBody = v.body,
                            msg,
                            isSelf = msgBody.from === config.user.username;

                        if ( msgBody && msgBody.bodies.length > 0 ) {
                            msg = msgBody.bodies[0];
                            if ( msgBody.from === config.user.username ) {
                                switch ( msg.type ) {
                                    case 'img':
                                        msg.url = config.base + msg.url;
                                        msg.to = msgBody.to;
                                        me.sendImgMsg(msg, true);
                                        break;
									case 'file':
                                        msg.url = config.base + msg.url;
                                        msg.to = msgBody.to;
                                        me.sendFileMsg(msg, true);
                                        break;
                                    case 'txt':
                                        me.sendTextMsg(msg.msg, msgBody.to);
                                        break;
                                }
                            } else {
                                if ( msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType && msgBody.ext.weichat.ctrlType == 'inviteEnquiry'//判断是否为满意度调查的消息
                                || msgBody.ext && msgBody.ext.msgtype && msgBody.ext.msgtype.choice//机器人自定义菜单
                                || msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType === 'TransferToKfHint' ) {//机器人转人工
                                    me.receiveMsg(msgBody, '', true);
                                } else {
                                    me.receiveMsg({
                                        data: msg.msg,
                                        url: config.base + msg.url,
                                        from: msgBody.from,
                                        to: msgBody.to
                                    }, msg.type, true);
                                }
                            }
							if ( msg.type === 'cmd' || msg.type === 'txt' && !msg.msg ) {
								
							} else {
								me.appendDate(v.timestamp || msgBody.timestamp, isSelf ? msgBody.to : msgBody.from, true);
							}
                        }
                    });
                }
            }
			, setKeyboard: function ( direction ) {
				var me = this;

				me.direction = direction;					
				switch ( direction ) {
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
            , setAgentProfile: function ( info ) {
                var nickName = utils.$Class('span.easemobWidgetHeader-nickname')[0],
                    avatar = utils.$Class('img.easemobWidgetHeader-portrait')[0];

                utils.html(nickName, info && info.userNickname ? info.userNickname : info && info.agentUserNiceName || config.defaultAgentName);

				this.currentAvatar = info && info.avatar ? utils.getAvatarsFullPath(info.avatar, config.domain) : config.defaultAvatar;
                if ( avatar.getAttribute('src') !== this.currentAvatar ) {
                    var cur = this.currentAvatar;

                    avatar.onload = function () {
                        avatar.style.opacity = '1';
                    };
					avatar.style.opacity = '0';
					avatar.setAttribute('src', cur);
                }
            }
            , setMinmum: function () {
                if ( !config.minimum || window.top == window ) {
                    return;
                }
                var me = this,
					min = document.createElement('a');

                min.setAttribute('href', 'javascript:;');
                min.setAttribute('title', '关闭');
                utils.addClass(min, 'easemobWidgetHeader-min bg-color border-color');
                easemobim.dragHeader.appendChild(min);
                utils.on(min, 'mousedown touchstart', function () {
					me.close();
					return false;
				});
                utils.on(min, 'mouseenter', function () {
                    utils.addClass(this, 'hover-color');
                });
                utils.on(min, 'mouseleave', function () {
                    utils.removeClass(this, 'hover-color');
                });
                min = null;
            }
			, setTheme: function () {
                var me = this;

				easemobim.api('getTheme', {
					tenantId: config.tenantId
				}, function ( msg ) {
					if ( !msg.data || !msg.data.length ) { return; }
					config.theme = msg.data[0].optionValue;
					if ( config.theme ) {
						if ( !easemobim.THEME[config.theme] ) {
							config.theme = '天空之城';
						}

						var style = document.createElement('style');
						style.setAttribute('type', 'text/css');
						utils.html(style, easemobim.THEME[config.theme].css);
						var head = document.head || document.getElementsByTagName('head')[0];
						head.appendChild(style);
					}
				});

            }
			, setLogo: function () {
				if ( !utils.$Class('div.easemobWidget-tenant-logo').length && config.logo ) {
					utils.html(this.chatWrapper, '<div class="easemobWidget-tenant-logo"><img src="' + config.logo + '"></div>' + utils.html(this.chatWrapper));
					this.hasLogo = true;
				}
			}
            , setNotice: function () {
                var me = this;

                if ( me.slogan || config.offDuty ) {
                    return;
                }

                easemobim.api('getSlogan', {
                    tenantId: config.tenantId
                }, function ( msg ) {
                    if ( msg.data && msg.data.length > 0 && msg.data[0].optionValue ) {
                        easemobim.imChatBody.style.top = '90px';
                        me.slogan = document.createElement('div');
                        utils.addClass(me.slogan, 'easemobWidget-word');

                        var slogan = Easemob.im.Utils.parseLink(msg.data[0].optionValue);
                        utils.html(me.slogan, "<span>" + slogan + "</span><a class='easemobWidget-word-close' href='javascript:;'></a>");
                        easemobim.imChat.appendChild(me.slogan);

                        //关闭广告语按钮
                        utils.on(utils.$Class('a.easemobWidget-word-close'), utils.click, function () {
                            utils.addClass(me.slogan, 'em-hide');
                            easemobim.imChatBody.style.top = '43px';
                        });
                    }
                });
            }
            , fillFace: function () {
                if ( utils.html(easemobim.chatFaceWrapper.getElementsByTagName('ul')[0]) ) {
                    return;
                }

				var faceStr = '',
					count = 0,
					me = this;

                utils.on(easemobim.faceBtn, 'mouseenter', function () {
                    utils.isMobile || utils.addClass(this, 'theme-color');
                })
                utils.on(easemobim.faceBtn, 'mouseleave', function () {
                    utils.isMobile || utils.removeClass(this, 'theme-color');
                });
                utils.on(easemobim.faceBtn, utils.click, function () {
					easemobim.textarea.blur();
                    utils.hasClass(easemobim.chatFaceWrapper, 'em-hide')
                    ? utils.removeClass(easemobim.chatFaceWrapper, 'em-hide')
                    : utils.addClass(easemobim.chatFaceWrapper, 'em-hide')

					if ( faceStr ) return false;
					faceStr = '<li class="e-face">';
					utils.each(Easemob.im.EMOTIONS.map, function ( k, v ) {
						count += 1;
						faceStr += ["<div class='easemobWidget-face-bg e-face'>",
										"<img class='easemobWidget-face-img e-face em-emotion' ",
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
                    utils.removeClass(easemobim.sendBtn, 'disabled');
                    if ( utils.isMobile ) {
                        me.autoGrowOptions.update();//update autogrow
                        setTimeout(function () {
                            easemobim.textarea.scrollTop = 10000;
                        }, 100);
                    }
                    utils.removeClass(easemobim.sendBtn, 'disabled');
                });
            }
            , errorPrompt: function ( msg, isAlive ) {//暂时所有的提示都用这个方法
                var me = this;

                if ( !me.ePrompt ) {
                    me.ePrompt = document.createElement('p');
                    me.ePrompt.className = 'easemobWidget-error-prompt em-hide';
                    utils.html(me.ePrompt, '<span></span>');
                    easemobim.imChat.appendChild(me.ePrompt);
                    me.ePromptContent = me.ePrompt.getElementsByTagName('span')[0];
                }
                
                utils.html(me.ePromptContent, msg);
                utils.removeClass(me.ePrompt, 'em-hide');
                isAlive || setTimeout(function(){
                    utils.html(me.ePromptContent, '');
                    utils.addClass(me.ePrompt, 'em-hide');
                }, 2000);
            }
            , setOffline: function () {
                if ( typeof easemobim.leaveMessage === 'function' ) {
					this.slogan && utils.addClass(this.slogan, 'em-hide');
					utils.addClass(easemobim.imBtn.getElementsByTagName('a')[0], 'easemobWidget-offline-bg');
					utils.removeClass(easemobim.leaveMessage.dom, 'em-hide');
					utils.addClass(easemobim.imChatBody, 'em-hide');
					utils.addClass(easemobim.send, 'em-hide');
				}
            }
            , close: function ( outerTrigger ) {
                this.opened = false;
				if ( !config.hide ) {
					utils.addClass(easemobim.imChat, 'em-hide');
					setTimeout(function () {
						utils.removeClass(easemobim.imBtn, 'em-hide');
					}, 60);
				}
				if ( !outerTrigger ) {
					easemobim.EVENTS.CLOSE.data = { trigger: true };
					transfer.send(easemobim.EVENTS.CLOSE);
				}
            }
            , show: function ( outerTrigger ) {
				var me = this;
				if ( !outerTrigger ) {
					easemobim.EVENTS.SHOW.data = { trigger: true };
					transfer.send(easemobim.EVENTS.SHOW);
				}
                me.opened = true;
                me.fillFace();
                me.scrollBottom(50);
                utils.addClass(easemobim.imBtn, 'em-hide');
                utils.removeClass(easemobim.imChat, 'em-hide');
                try { easemobim.textarea.focus(); } catch ( e ) {}
				transfer.send(easemobim.EVENTS.RECOVERY);
                
                if ( !me.autoGrowOptions ) {
                    me.autoGrowOptions = {};
                    me.autoGrowOptions.callback = function () {
                        var height = easemobim.send.getBoundingClientRect().height;
						if ( me.direction === 'up' ) {
							easemobim.chatFaceWrapper.style.top = 43 + easemobim.send.getBoundingClientRect().height + 'px';
						} else {
							easemobim.imChatBody.style.bottom = height + 'px';
							easemobim.chatFaceWrapper.style.bottom = easemobim.send.getBoundingClientRect().height + 'px';
						}
                    };
                    me.autoGrowOptions.dom = easemobim.textarea;
					setTimeout(function () {
						utils.isMobile && easemobim.autogrow(me.autoGrowOptions);
					}, 1000);
                }
            }
            , sdkInit: function () {
                var me = this;
                
                me.conn.listen({
                    onOpened: function () {
                        me.conn.setPresence();
                        me.conn.heartBeat(me.conn);

                        if ( easemobim.textarea.value ) {
                            utils.removeClass(easemobim.sendBtn, 'disabled');
                        }
                        utils.html(easemobim.sendBtn, '发送');
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
                    , onError: function ( e ) {
                        if ( e.reconnect ) {
                            me.open();
                        } else {
                            me.conn.stopHeartBeat(me.conn);
                            typeof config.onerror === 'function' && config.onerror(e);
                        }
                    }
                });
            }
            , appendDate: function ( date, to, isHistory ) {
                var chatWrapper = utils.$Dom(to || config.toUser),
                    dom = document.createElement('div'),
                    fmt = 'M月d日 hh:mm';

                if ( !chatWrapper ) {
                    return;
                }
                utils.html(dom, new Date(date).format(fmt));
                utils.addClass(dom, 'easemobWidget-date');
                if ( !isHistory ) {
                    if ( !this.msgTimeSpan[to] || (date - this.msgTimeSpan[to] > 60000) ) {//间隔大于1min  show
                        chatWrapper.appendChild(dom); 
                    }
                    this.resetSpan(to);
                } else {
                    utils.insertBefore(chatWrapper, dom, chatWrapper.getElementsByTagName('div')[this.hasLogo ? 1 : 0]);
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
					, apiUrl: (utils.ssl ? 'https://' : 'http://') + config.restServer
				};
				
				if ( config.user.password ) {
					op.pwd = config.user.password;
				} else {
					op.accessToken = config.user.token;
				}

				me.conn.open(op);
            }
            , soundReminder: function () {
                var me = this;

                //if lte ie 8 , return
                if ( (utils.getIEVersion && utils.getIEVersion < 9) || utils.isMobile || !config.soundReminder ) {
                    me.soundReminder = function () {};
                    return;
                }

                me.reminder = document.createElement('a');
                me.reminder.setAttribute('href', 'javascript:;');
                utils.addClass(me.reminder, 'easemobWidgetHeader-audio theme-color');
                easemobim.dragHeader.appendChild(me.reminder);

                //音频按钮静音
                utils.on(me.reminder, 'mousedown touchstart', function () {
                    me.silence = me.silence ? false : true;
                    utils.hasClass(me.reminder, 'easemobWidgetHeader-silence') 
                    ? utils.removeClass(me.reminder, 'easemobWidgetHeader-silence') 
                    : utils.addClass(me.reminder, 'easemobWidgetHeader-silence');

                    return false;
                });

                if ( window.HTMLAudioElement ) {
                    var ast = 0;
                    
                    me.audio = document.createElement('audio');
                    me.audio.src = config.staticPath + '/mp3/msg.m4a';
                    me.soundReminder = function () {
                        if ( (utils.isMin() ? false : me.opened) || ast !== 0 || me.silence ) {
                            return;
                        }
                        ast = setTimeout(function() {
                            ast = 0;
                        }, 3000);
                        me.audio.play();
                    };
                }
            }
            , setThemeBackground: function ( obj ) {
                utils.isMobile || utils.addClass(obj, 'bg-color');
            }
            , clearThemeBackground: function ( obj ) {
                utils.isMobile || utils.removeClass(obj, 'bg-color');
            }
            , setThemeColor: function ( obj ) {
                utils.isMobile || utils.addClass(obj, 'theme-color');
            }
            , clearThemeColor: function ( obj ) {
                utils.isMobile || utils.removeClass(obj, 'theme-color');
            }
            , bindEvents: function () {
                var me = this;

				utils.live('i.easemobWidgetHeader-keyboard', utils.click, function () {
					if ( utils.hasClass(this, 'easemobWidgetHeader-keyboard-up') ) {
						utils.addClass(this, 'easemobWidgetHeader-keyboard-down');
						utils.removeClass(this, 'easemobWidgetHeader-keyboard-up');
						me.setKeyboard('down');
					} else {
						utils.addClass(this, 'easemobWidgetHeader-keyboard-up');
						utils.removeClass(this, 'easemobWidgetHeader-keyboard-down');
						me.setKeyboard('up');
					}
				});
				
				utils.on(easemobim.imBtn, utils.click, function () {
					me.show();
				});
				utils.on(easemobim.imChatBody, utils.click, function () {
					easemobim.textarea.blur();
					return false;
				});
                utils.on(document, 'mouseover', function () {
					transfer.send(easemobim.EVENTS.RECOVERY);
                });
				utils.live('img.easemobWidget-imgview', 'click', function () {
					easemobim.imgView.show(this.getAttribute('src'));
                });
                utils.live('button.easemobWidget-list-btn', 'mouseover', function () {
                    me.setThemeBackground(this);
                });
                utils.live('button.easemobWidget-list-btn', 'mouseout', function () {
                    me.clearThemeBackground(this);
                });
                utils.on(easemobim.sendFileBtn, 'mouseenter', function () {
                    me.setThemeColor(this);
                });
                utils.on(easemobim.sendFileBtn, 'mouseleave', function () {
                    me.clearThemeColor(this);
                });

				if ( config.dragenable ) {//drag
					
					easemobim.dragBar.style.cursor = 'move';

					utils.isMobile || utils.on(easemobim.dragBar, 'mousedown', function ( ev ) {
						var e = window.event || ev;
						easemobim.textarea.blur();//ie a  ie...
						easemobim.EVENTS.DRAGREADY.data = { x: e.clientX, y: e.clientY };
						transfer.send(easemobim.EVENTS.DRAGREADY);
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
                    utils.live('div.easemobWidget-date', 'touchstart', function ( ev ) {
                        var e = ev || window.event,
                            touch = e.touches;

                        if ( e.touches && e.touches.length > 0 ) {
                            _startY = touch[0].pageY;
                        }
                    });
                    utils.live('div.easemobWidget-date', 'touchmove', function ( ev ) {
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
                            touch = e.touches,
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
                    utils.live('div.easemobWidget-chat', 'mousewheel', getHis);
                    utils.live('div.easemobWidget-chat', 'DOMMouseScroll', getHis);
                }());

                //resend
                utils.live('div.easemobWidget-msg-status', utils.click, function () {
                    var id = this.getAttribute('id').slice(0, -7);

                    utils.addClass(this, 'em-hide');
                    utils.removeClass(utils.$Dom(id + '_loading'), 'em-hide');
                    me.conn.send(id);
                });

				utils.live('button.js_robertTransferBtn', utils.click,  function () {
                    var that = this;

                    me.transferToKf(that.getAttribute('data-id'), that.getAttribute('data-sessionid'));
                    return false;
                });

                //机器人列表
                utils.live('button.js_robertbtn', utils.click, function () {
                    var that = this;

                    me.sendTextMsg(utils.html(that), null, {
                        msgtype: {
                            choice: { menuid: that.getAttribute('data-id') }
                        }
                    });
                    return false;
                });
                
                var handleSendBtn = function () {
                    easemobim.textarea.value && utils.html(easemobim.sendBtn) !== '连接中' ? utils.removeClass(easemobim.sendBtn, 'disabled') : utils.addClass(easemobim.sendBtn, 'disabled');
                };

                utils.on(easemobim.textarea, 'keyup', handleSendBtn);
                utils.on(easemobim.textarea, 'change', handleSendBtn);
                utils.on(easemobim.textarea, 'input', handleSendBtn);
                
                if ( utils.isMobile ) {
                    var handleFocus = function () {
						easemobim.textarea.style.overflowY = 'auto';
						me.scrollBottom(800);
						if ( me.focusText ) {
							return;
						}
						me.focusText = setInterval(function () {
							document.body.scrollTop = 100000;
						}, 200);
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
                    me.sendImgMsg();
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
                    if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
                        me.errorPrompt('当前浏览器需要安装flash发送图片');
                        return false;    
                    }
                    easemobim.realFile.click();
                });

                //hot key
                utils.on(easemobim.textarea, 'keydown', function ( evt ) {
                    var that = this;
                    if ( (utils.isMobile && evt.keyCode === 13) 
                        || (evt.ctrlKey && evt.keyCode === 13) 
                        || (evt.shiftKey && evt.keyCode === 13) ) {

                        that.value = that.value + '\n';
                        return false;
                    } else if ( evt.keyCode === 13 ) {
                        utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
                        if ( utils.hasClass(easemobim.sendBtn, 'disabled') ) {
                            return false;
                        }
                        me.sendTextMsg();
                        setTimeout(function(){
                            that.value = '';
                        }, 0);
                    }
                });

                utils.on(easemobim.sendBtn, 'click', function () {
                    if ( utils.hasClass(this, 'disabled') ) {
                        return false;
                    }
                    utils.addClass(easemobim.chatFaceWrapper, 'em-hide');
                    me.sendTextMsg();
                    if ( utils.isMobile ) {
                        easemobim.textarea.style.height = '34px';
                        easemobim.textarea.style.overflowY = 'hidden';
                        me.direction === 'up' || (easemobim.imChatBody.style.bottom = '43px');
                        easemobim.textarea.focus();
                    }
                    return false;
                });
            }
            , scrollBottom: function ( type ) {
                var ocw = easemobim.imChatBody;

                type 
                ? (clearTimeout(this.scbT), this.scbT = setTimeout(function () {
                    ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
                }, type))
                : (ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000);
            }
            , sendImgMsg: function ( file, isHistory ) {
                var me = this,
                    msg = new Easemob.im.EmMessage('img', isHistory ? null : me.conn.getUniqueId());

                msg.set({
                    file: file || Easemob.im.Utils.getFileUrl(easemobim.realFile.getAttribute('id')),
                    to: config.toUser,
                    uploadError: function ( error ) {
                        //显示图裂，无法重新发送
                        if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
                            easemobim.swfupload && easemobim.swfupload.settings.upload_error_handler();
                        } else {
                            var id = error.id,
                                wrap = utils.$Dom(id);
    
                            utils.html(utils.$Class('a.easemobWidget-noline')[0], '<i class="easemobWidget-unimage">I</i>');
                            utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                            me.scrollBottom();
                        }
                    },
                    uploadComplete: function ( data ) {
                        me.handleTransfer('sending');
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
                    me.conn.send(msg.body);
                    easemobim.realFile.value = '';
                    if ( Easemob.im.Utils.isCanUploadFileAsync ) {
                        me.appendDate(new Date().getTime(), config.toUser);
                        me.appendMsg(config.user.username, config.toUser, msg);
                    }
                } else {
                    me.appendMsg(config.user.username, file.to, msg, true);
                }
            }
			, sendFileMsg: function ( file, isHistory ) {
                var me = this,
                    msg = new Easemob.im.EmMessage('file', isHistory ? null : me.conn.getUniqueId()),
					file = file || Easemob.im.Utils.getFileUrl(easemobim.realFile.getAttribute('id'));

				if ( !file || !file.filetype || !config.FILETYPE[file.filetype.toLowerCase()] ) {
                    chat.errorPrompt('不支持此文件');
					easemobim.realFile.value = null;
					return false;
				}

                msg.set({
                    file: file,
                    to: config.toUser,
                    uploadError: function ( error ) {
                        //显示图裂，无法重新发送
                        if ( !Easemob.im.Utils.isCanUploadFileAsync ) {
                            easemobim.swfupload && easemobim.swfupload.settings.upload_error_handler();
                        } else {
                            var id = error.id,
                                wrap = utils.$Dom(id);
    
                            utils.html(utils.$Class('a.easemobWidget-noline')[0], '<i class="easemobWidget-unimage">I</i>');
                            utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                            me.scrollBottom();
                        }
                    },
                    uploadComplete: function ( data ) {
                        me.handleTransfer('sending');
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
                    me.conn.send(msg.body);
                    easemobim.realFile.value = '';
                    if ( Easemob.im.Utils.isCanUploadFileAsync ) {
                        me.appendDate(new Date().getTime(), config.toUser);
                        me.appendMsg(config.user.username, config.toUser, msg);
                    }
                } else {
                    me.appendMsg(config.user.username, file.to, msg, true);
                }
            }
            , handleTransfer: function ( action, info ) {
                var wrap = utils.$Dom( config.toUser + '-transfer');

                config.agentList = config.agentList || {};
                config.agentList[config.toUser] = config.agentList[config.toUser] || {};
                if ( action === 'sending' ) {
                    if ( !config.agentList[config.toUser].firstMsg && !this.chatWrapper.getAttribute('data-session') ) {
                        config.agentList[config.toUser].firstMsg = true;
                        utils.addClass(wrap, 'link');
                        utils.removeClass(wrap, 'em-hide');
                        if ( utils.isMobile ) {
                            utils.addClass(easemobim.dragHeader.getElementsByTagName('img')[0], 'em-hide');
                            utils.addClass(easemobim.dragHeader.getElementsByTagName('span')[0], 'em-hide');
                        }
                    }
                } else if ( action === 'transfer' ) {
                    utils.addClass(wrap, 'transfer');
                    utils.removeClass(wrap, 'link');
                    if ( utils.isMobile ) {
						utils.addClass(easemobim.dragHeader.getElementsByTagName('img')[0], 'em-hide');
						utils.addClass(easemobim.dragHeader.getElementsByTagName('span')[0], 'em-hide');
					}
                } else if ( action === 'reply' ) {
                    utils.removeClass(wrap, 'transfer');
                    utils.removeClass(wrap, 'link');
                    if ( info ) {
                        info && this.setAgentProfile({
                            userNickname: info.userNickname,
                            avatar: info.avatar
                        });
                    }
                    if ( utils.isMobile ) {
                        utils.removeClass(easemobim.dragHeader.getElementsByTagName('img')[0], 'em-hide');
						utils.removeClass(easemobim.dragHeader.getElementsByTagName('span')[0], 'em-hide');
                    }
                }
            }
            , appendMsg: function ( from, to, msg, isHistory ) {//消息上屏
                var isSelf = from == config.user.username && (from || config.user.username),
					me = this,
                    curWrapper = me.chatWrapper;

                var div = document.createElement('div');
                div.className = 'emim-clear emim-mt20 emim-tl emim-msg-wrapper ';
                div.className += isSelf ? 'emim-fr' : 'emim-fl';
                utils.html(div, msg.get(!isSelf));
                if ( isHistory ) {
                    utils.insertBefore(curWrapper, div, curWrapper.childNodes[me.hasLogo ? 1 : 0]);
                } else {
                    curWrapper.appendChild(div);
					me.scrollBottom(utils.isMobile ? 700 : null);

					var imgList = utils.$Class('img.easemobWidget-img', div),
						img = imgList.length > 0 ? imgList[0] : null;
						
					if ( img ) {
						utils.on(img, 'load', function () {
							me.scrollBottom(utils.getIEVersion && utils.getIEVersion < 9 ? 700 : null);
							img = null;
						});
					}
                }
                div = null;
            }
            , sendTextMsg: function ( message, isHistory, ext ) {
                var me = this;
                
                var msg = new Easemob.im.EmMessage('txt', isHistory ? null : me.conn.getUniqueId());
                msg.set({
                    value: message || easemobim.textarea.value,
                    to: config.toUser,
                    success: function ( id ) {
                        utils.$Remove(utils.$Dom(id + '_loading'));
                        utils.$Remove(utils.$Dom(id + '_failed'));
                        config.offDuty || me.handleTransfer('sending');
                    },
                    fail: function ( id ) {
                        utils.addClass(utils.$Dom(id + '_loading'), 'em-hide');
                        utils.removeClass(utils.$Dom(id + '_failed'), 'em-hide');
                    }
                });

                if ( ext ) {
                    utils.extend(msg.body, {
                        ext: ext
                    });
                }

                if ( !isHistory ) {
                    me.conn.send(msg.body);
					easemobim.textarea.value = '';
					me.appendDate(new Date().getTime(), config.toUser);
					me.appendMsg(config.user.username, config.toUser, msg);
                } else {
                    me.appendMsg(config.user.username, isHistory, msg, true);
                }
				utils.addClass(easemobim.sendBtn, 'disabled')
            }
			, transferToKf: function ( id, sessionId ) {
                var me = this;

				var msg = new Easemob.im.EmMessage('cmd');
				msg.set({
                    to: config.toUser
					, action: 'TransferToKf'
                    , ext: {
                        weichat: {
                            ctrlArgs: {
                                id: id,
								serviceSessionId: sessionId,
                            }
                        }
                    }
                });
                me.conn.send(msg.body);
            }
            , sendSatisfaction: function ( level, content, session, invite ) {
                var me = this;

                var msg = new Easemob.im.EmMessage('txt', me.conn.getUniqueId());
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
                me.conn.send(msg.body);
            }
            , messagePrompt: function ( message ) {//未读消息提醒

				if ( utils.isMobile ) {
					return;
				}

				var me = this;

				if ( !me.opened ) {
					utils.removeClass(utils.html(easemobim.messageCount, ''), 'hide');
					me.msgCount += 1;

					if ( me.msgCount > 9 ) {
						utils.html(utils.addClass(easemobim.messageCount, 'mutiCount'), '\…');
					} else {
						utils.html(utils.removeClass(easemobim.messageCount, 'mutiCount'), me.msgCount);
					}

				} else {
					me.resetPrompt();
				}

				if ( utils.isMin() || !me.opened ) {
					me.soundReminder();
					easemobim.EVENTS.NOTIFY.data = {
						avatar: this.currentAvatar,
						title: '新消息',
						brief: message.brief
					};
					transfer.send(easemobim.EVENTS.SLIDE);
					transfer.send(easemobim.EVENTS.NOTIFY);
				}
            }
			, resetPrompt: function () {
				this.msgCount = 0;
				utils.addClass(utils.html(easemobim.messageCount, ''), 'em-hide');
				transfer.send(easemobim.EVENTS.RECOVERY);
			}
            , receiveMsg: function ( msg, type, isHistory ) {
                if ( config.offDuty ) {
                    return;
                }

                var me = this,
                    message = null;

                //满意度评价
                if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType && msg.ext.weichat.ctrlType == 'inviteEnquiry' ) {
                    type = 'satisfactionEvaluation';  
                } else if ( msg.ext && msg.ext.msgtype && msg.ext.msgtype.choice ) {//机器人自定义菜单
                    type = 'robertList';  
                } else if ( msg.ext && msg.ext.weichat && msg.ext.weichat.ctrlType === 'TransferToKfHint' ) {//机器人转人工
                    type = 'robertTransfer';  
				}

                switch ( type ) {
					case 'txt':
                        message = new Easemob.im.EmMessage('txt');
                        message.set({value: msg.data});
                        break;
					case 'face':
						message = new Easemob.im.EmMessage('txt');
						var msgStr = '', brief = '';

						for ( var i = 0, l = msg.data.length; i < l; i++ ) {
							brief += msg.data[i].type === 'emotion' ? "[表情]" : msg.data[i].data;
							msgStr += msg.data[i].type === 'emotion' ? "\<img class=\'em-emotion\' src=\'" + msg.data[i].data + "\' alt=\'表情\'\/\>" : msg.data[i].data;
						}
						message.set({value: msgStr, emotion: true, brief: brief});
						break;
                    case 'img':
                        message = new Easemob.im.EmMessage('img');
                        message.set({file: {url: msg.url}});
                        break;
					case 'file':
                        message = new Easemob.im.EmMessage('file');
                        message.set({file: {url: msg.url, filename: msg.filename}});
                        break;
                    case 'satisfactionEvaluation':
                        message = new Easemob.im.EmMessage('list');
                        message.set({value: '请对我的服务做出评价', list: ['\
                            <div class="easemobWidget-list-btns">\
                                <button class="easemobWidget-list-btn js_satisfybtn" data-inviteid="' + msg.ext.weichat.ctrlArgs.inviteId + '" data-servicesessionid="'+ msg.ext.weichat.ctrlArgs.serviceSessionId + '">立即评价</button>\
                            </div>']});
                        break;
                    case 'robertList':
                        message = new Easemob.im.EmMessage('list');
                        var str = '',
                            robertV = msg.ext.msgtype.choice.items || msg.ext.msgtype.choice.list;

                        if ( robertV.length > 0 ) {
                            str = '<div class="easemobWidget-list-btns">';
                            for ( var i = 0, l = robertV.length; i < l; i++ ) {
                                str += '<button class="easemobWidget-list-btn js_robertbtn" data-id="' + robertV[i].id + '">' + (robertV[i].name || robertV[i]) + '</button>';
                            }
                            str += '</div>';
                        }
                        message.set({value: msg.ext.msgtype.choice.title, list: str});
                        break;
					case 'robertTransfer':
						message = new Easemob.im.EmMessage('list');
                        var str = '',
                            robertV = [msg.ext.weichat.ctrlArgs];

                        if ( robertV.length > 0 ) {
                            str = '<div class="easemobWidget-list-btns">';
                            for ( var i = 0, l = robertV.length; i < l; i++ ) {
                                str += '<button class="easemobWidget-list-btn js_robertTransferBtn" data-sessionid="' + robertV[i].serviceSessionId + '" data-id="' + robertV[i].id + '">' + robertV[i].label + '</button>';
                            }
                            str += '</div>';
                        }
                        message.set({ value: msg.data || msg.ext.weichat.ctrlArgs.label, list: str });
                        break;
                    default:
                        return;
                }
                
                if ( !isHistory ) {
                    if ( msg.ext && msg.ext.weichat && msg.ext.weichat.event && msg.ext.weichat.event.eventName === 'ServiceSessionTransferedEvent' ) {
                        this.handleTransfer('transfer');//transfer msg
                    } else if ( msg.ext && msg.ext.weichat ) {
                        if ( !msg.ext.weichat.agent ) {//switch off
                            this.handleTransfer('reply');
                        } else {//switch on
                             msg.ext.weichat.agent && msg.ext.weichat.agent.userNickname !== '调度员' && this.handleTransfer('reply', msg.ext.weichat.agent);
                        }
                    }

                    if ( !message.value ) {//空消息不显示
                        return;
                    }
                    if ( !msg.noprompt ) {
						me.messagePrompt(message);
					}
					me.appendDate(new Date().getTime(), msg.from);
                    me.resetSpan();
                    me.appendMsg(msg.from, msg.to, message);
                    me.scrollBottom();
					if ( config.receive ) {
						easemobim.EVENTS.ONMESSAGE.data = {
							from: msg.from,
							to: msg.to,
							message: message
						};
						transfer.send(easemobim.EVENTS.ONMESSAGE);
					}
                } else {
                    if ( !message.value ) {
                        return;
                    }
                    me.appendMsg(msg.from, msg.to, message, true);
                }
            }
        };
    };


    /**
     * 调用指定接口获取数据
    */
    easemobim.api = function ( apiName, data, callback ) {
        //cache
        easemobim.api[apiName] = easemobim.api[apiName] || {};

        var ts = new Date().getTime();
        easemobim.api[apiName][ts] = callback;
        easemobim.getData
        .send({
            api: apiName
            , data: data
            , timespan: ts
        })
        .listen(function ( msg ) {
            if ( easemobim.api[msg.call] && typeof easemobim.api[msg.call][msg.timespan] === 'function' ) {

                var callback = easemobim.api[msg.call][msg.timespan];
                delete easemobim.api[msg.call][msg.timespan];

                if ( msg.status !== 0 ) {
					typeof config.onerror === 'function' && config.onerror(msg);
                } else {
                    callback(msg);
                }
            }
        });
    };
}());

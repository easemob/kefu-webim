/*
 * Easemob widget utils
*/
;(function(window, undefined) {

    var EasemobWidget = EasemobWidget || {};
    EasemobWidget.utils = EasemobWidget.utils || {};
    
    EasemobWidget.utils.queryString = function(url, key) {//queryString
        var r = url.match(new RegExp('[?&]?'+key+'=[0-9a-zA-Z%._-]*[^&]', 'g'));
        r = r && r[0] ? (r[0][0]=='?' || r[0][0]=='&' ? r[0].slice(1) : r[0]) : '';

        return r.slice(key.length+1);
    }

    EasemobWidget.utils.getConfig = function(key){//get config from current script
        var that;
        if(!!key) {
            var scripts = document.scripts;
            for(var s = 0, l=scripts.length; s<l; s++) {
                if(scripts[s].src && 0 < scripts[s].src.indexOf(key)) {
                    that = scripts[s].src;
                    break;
                }
            }
        } else {
            that = location.href;
        }

        var obj = {}
        if(!that) return {
            str: ''
            , json: obj
            , domain: ''
        };

        var tmp,
            idx = that.indexOf('?'),
            sIdx = that.indexOf('//') > -1 ? that.indexOf('//') : 0,
            domain = that.slice(sIdx, that.indexOf('/', sIdx + 2)),
            arr = that.slice(idx+1).split('&');
        
        obj.src = that.slice(0, idx);
        for(var i=0,l=arr.length;i<l;i++) {
            tmp = arr[i].split('=');
            obj[tmp[0]] = tmp.length>1 ? tmp[1] : '';
        }
        return {
            str: that
            , json: obj
            , domain: domain
        };
    }
    EasemobWidget.utils.isAndroid = /Android/i.test(navigator.userAgent);//is mobile
    EasemobWidget.utils.isMobile = /mobile/i.test(navigator.userAgent);//is mobile

    /*
     * message transfer
     * easemob.com
     * 1.0.0
    */
    var EmMessage = (function(){
       
        //attribute
        var _supportPostMessage = 'postMessage' in window;

        //method
        var _on = function(target, ev, fn) {
            if(target.addEventListener) {
                target.addEventListener(ev, fn);
            } else if(target.attachEvent) {
                target.attachEvent('on' + ev, fn);
            } else {
                target['on' + ev] = fn;
            }
        }
        var _hasHash = function(url) {
            var idx = url.lastIndexOf('/'),
                idxj = url.lastIndexOf('#');

            if(0 > idxj) return false;
            if(url.indexOf('#') > idx && idxj != url.length) return true;
        }
        var _parseHash = function(url, key) {
            var res = url.match(new RegExp(key + '\\w*' + key, 'g'));
            return res ? 
                res[0] ? res[0].slice(key.length, -key.length) : ''
                : '';
        }
        var _getMsg = function(key, url) {
            var str = key.toString(),
                arr = url.match(new RegExp(str + '\\w*' + str, 'g'));
            if(arr) {
                return arr[0].slice(str.length, -str.length);
            }
            return '';
        }
        var _appendMsg = function(key, msg, url) {
            return url.replace(new RegExp(key + '\\w*' + key, 'g'), key + msg + key);
        }
        
        //core: message
        var message = function(iframeId, prefix){
            
            if(!(this instanceof message)) {
                 return new message();
            }
            this.t = new Date().getTime();
            this.iframe = document.getElementById(iframeId);
            this.prefix = prefix || '_em_';
            delete this.t;
        }
        message.prototype.sendToParent = function(msg){
            if(typeof msg !== 'string') {
                throw 'msg must be string';
            }

            if(_supportPostMessage) {
                window.parent.postMessage(msg, '*');
                return this;
            }

            return this;
        }
        message.prototype.sendToIframe = function(msg){
            if(typeof msg !== 'string') {
                throw 'msg must be string';
            }

            if(_supportPostMessage) {
                this.iframe.contentWindow.postMessage(msg, '*');
                return this;
            }
            
            var src = this.iframe.getAttribute('src');
            if(_hasHash(src)) {
                if(_getMsg(this.prefix, src)) {
                    this.iframe.setAttribute('src', _appendMsg(this.prefix, msg, src));
                } else {
                    this.iframe.setAttribute('src', src + '&' + this.prefix + msg + this.prefix);
                }
            } else {
                this.iframe.setAttribute('src', src += '#' + this.prefix + msg + this.prefix)
            }

            return this;
        }
        message.prototype.listenToParent = function(callback){
            if(_supportPostMessage) {
                _on(window, 'message', function(e){
                    callback(e.data);
                });
                return this;
            }
            if(window.onhashchange) {
                window.onhashchange = function(){
                    callback(_parseHash(location.href, this.prefix));
                }
            } else {
                var that = this;
                var memHref = location.href,
                    sit = setInterval(function(){
                        var curHref = location.href;
                        if(curHref != memHref) {
                            memHref = curHref;
                            callback(_parseHash(curHref, that.prefix));
                        }
                    }, 50);
            }

            return this;
        }
        message.prototype.listenToIframe = function(callback){
            if(_supportPostMessage) {
                _on(window, 'message', function(e){
                    callback(e.data);
                });
            }
            return this;
        }

        return message;
    }());
    
    var c = {
        setcookie: function(key, value) {
            var date = new Date();
            date.setTime(date.getTime() + 30*24*3600*1000);
            document.cookie = key + '=' + escape(value) + ';expires=' + date.toGMTString();
        }
        , getcookie: function(key) {
            var results = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)'); 
            return results ? (unescape(results[2])) : null;
        }
    }
    window.EasemobWidget = EasemobWidget;
    window.EmMessage = EmMessage;
    window.Emc = c;
}(window, undefined));

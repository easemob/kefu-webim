/**
 * support: ie8+ & modern borwsers & mobile browsers
 * 包含以下模块：
 *      common: 简化window.URL & 添加通用日期format
 *      utils: 简单的工具类
 *      autogrow: 移动端输入框高度随内容变化的插件
 *      notify: 浏览器通知方法,仅支持该方法的浏览器可用
 *      ctrl + v粘贴发送截图: 仅pc端火狐，ie11，谷歌，safari等webkit内核浏览器支持
 *      聊天窗口拖拽
 *      satisfaction: 满意度评价
 *      leaveMessage: 留言
 *      titleSlide: 当不在当前tab或聊天窗口最小化则浏览器标题滚动
 *      chat: 聊天窗口的所有交互
 *      Message: 当前所有消息类型封装，文本消息，图片消息等，开发者可改写或自定义添加类型
 *      Emotions: easemob webim自定义表情包扩展
 */
;(function ( window, undefined ) {
    'use strict';
    var getData = new easemobIM.Transfer('EasemobKefuWebimIframe'),
        https = location.protocol === 'https:',
        config = window.easemobIM.config;


    /**
     * common
     */
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    Date.prototype.format = function ( fmt ) {//date format
        var o = {
            'M+': this.getMonth() + 1,//月份
            'd+': this.getDate(),//日
            'h+': this.getHours(),//小时
            'm+': this.getMinutes(),//分
            's+': this.getSeconds(),//秒
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


    /**
     * utils
     */
    var utils = {
        nodeListType: {
            '[object Object]': 1
            , '[object NodeList]': 1
            , '[object HTMLCollection]': 1
            , '[object Array]': 1
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
                    parentNode.insertBefore(newDom, curDom);
                }
            }
        }
        , getIEVersion: function () {
            var ua = navigator.userAgent,matches,tridentMap={'4':8,'5':9,'6':10,'7':11};
            matches = ua.match(/MSIE (\d+)/i);
            if(matches&&matches[1]) {
                return +matches[1];
            }
            matches = ua.match(/Trident\/(\d+)/i);
            if(matches&&matches[1]) {
                return tridentMap[matches[1]]||null;
            }
            return null;
        }
        , live: function ( target, ev, fn ) {
            utils.on(document, ev, function ( e ) {
                var ev = e || window.event,
                    tar = ev.target || ev.srcElement,
                    targetList = utils.$Class(target);

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
                if ( target.addEventListener ) {
                    target.addEventListener(ev, fn, isCapture);
                } else if ( target.attachEvent ) {
                    target['_' + ev] = function () {
                        fn.apply(target, arguments);
                    }
                    target.attachEvent('on' + ev, target['_' + ev]);
                } else {
                    target['on' + ev] = fn;
                }
            };
            return function ( target, ev, fn, isCapture ) {
                if ( Object.prototype.toString.call(target) in utils.nodeListType && target.length ) {
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
            for ( var o in extend ) {
                if ( extend.hasOwnProperty(o) ) {
                    object[o] = extend[o];
                }
            }
            return object;
        }
        , addClass: function ( target, className ) {
            if ( !target ) {
                return;
            }
            if ( Object.prototype.toString.call(target) in utils.nodeListType && target.length ) {
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
            if ( Object.prototype.toString.call(target) in utils.nodeListType && target.length ) {
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
        , $Class: function ( DomDotClass ) {
            var temp = DomDotClass.split('.'),
                tag = temp[0],
                className = temp[1];

            if ( document.getElementsByClassName ) {
                return document.getElementsByClassName(className);
            } else {
                var tags = document.getElementsByTagName(tag),
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
            if ( typeof html === 'undefined' ) {
                return dom.innerHTML;
            } else {
                dom.innerHTML = html;
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
        , isAndroid: /android/i.test(navigator.useragent)
        , isQQBrowserInAndroid: function () {
            return this.isAndroid && /MQQBrowser/.test(navigator.userAgent);
        }
        , isMin: function () {//detect the browser if minimize
            if(document.visibilityState && document.visibilityState == 'hidden' || document.hidden) {
                return true;
            } 
        }
        , setcookie: function ( key, value ) {
            var date = new Date();
            date.setTime(date.getTime() + 30*24*3600*1000);
            document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + ';path=/;expires=' + date.toGMTString();
        }
        , getcookie: function ( key ) {
            var results = document.cookie.match('(^|;) ?' + encodeURIComponent(key) + '=([^;]*)(;|$)'); 
            return results ? decodeURIComponent(results[2]) : '';
        }
    };


    /**
     * autogrow
     */
    var autogrow = (function () {
        return function ( options ) {
            var that = options.dom,
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


    /**
     * 浏览器提示
     */
    var notify = (function () {
        var st = 0;

        return function ( img, title, content ) {
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
                            title
                            , {
                                icon: img
                                , body: content
                            }
                        );
                        setTimeout(function () {
                            notification.close();
                        }, 3000);
                    } else {
                        Notification.requestPermission();
                    }
                }
            } catch ( e ) {}
        };
    }())


    /**
     * webim交互相关
     */
    var im = utils.$Dom('EasemobKefuWebim'),
        imBtn = utils.$Dom('easemobWidgetPopBar'),
        imChat = utils.$Dom('EasemobKefuWebimChat'),
        imChatBody = utils.$Dom('easemobWidgetBody'),
        send = utils.$Dom('easemobWidgetSend'),
        textarea = send.getElementsByTagName('textarea')[0],
        sendBtn = utils.$Dom('easemobWidgetSendBtn'),
        faceBtn = send.getElementsByTagName('i')[0],
        realFile = utils.$Dom('easemobWidgetFileInput'),
        sendFileBtn = utils.$Dom('easemobWidgetFile'),
        dragHeader = utils.$Dom('easemobWidgetDrag'),
        chatFaceWrapper = utils.$Dom('EasemobKefuWebimFaceWrapper'),
        swfupload = null,//flash 上传
        https = location.protocol == 'https:' ? true : false,
        click = config.mobile && ('ontouchstart' in window) ? 'touchstart' : 'click';


    /**
     * ctrl + v
     */
    var paste = (function () {//ctrl+v发送截图功能:当前仅支持chrome/firefox/ie11
        var dom = document.createElement('div'),
            data;

        utils.addClass(dom, 'easemobWidget-dialog easemobWidget-paste-wrapper em-hide');
        utils.html(dom, "\
            <div class='easemobWidget-paste-image'></div>\
            <div>\
                <button class='easemobWidget-cancel'>取消</button>\
                <button class='bg-color'>发送</button>\
            </div>\
        ");
        imChat.appendChild(dom);

        var buttons = dom.getElementsByTagName('button'),
            cancelBtn = buttons[0],
            sendImgBtn = buttons[1],
            imgContainer = dom.getElementsByTagName('div')[0];

        utils.on(cancelBtn, 'click', function () {
            paste.hide();
        });
        utils.on(sendImgBtn, 'click', function () {
            chat.sendImgMsg({data: data, url: dom.getElementsByTagName('img')[0].getAttribute('src')});
            paste.hide();
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
            , getBase64: (function () {
                var canvas = document.createElement('canvas');
                if ( !canvas.getContext ) {
                    return;
                }
                var ctx = canvas.getContext("2d"),
                    img = new Image();

                return function ( url, callback ) {
                    img.onload = function () {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(this, 0, 0);
                        typeof callback === 'function' && callback(canvas.toDataURL('image/png'));
                    };
                    img.src = url;
                };
            }())
            , getBlob: function ( base64 ) {
                var me = this;
                try {
                    if ( base64.indexOf('data:image') < 0 ) {
                        this.getBase64(base64, function ( blob ) {
                            me.getBlob(blob);
                        });
                    }
                    var bytes = window.atob(base64.split(',')[1]),
                        ab = new ArrayBuffer(bytes.length),
                        ia = new Uint8Array(ab);

                    for ( var i = 0, l = bytes.length; i < l; i++ ) {
                        ia[i] = bytes.charCodeAt(i);
                    }
                    return new Blob( [ab], {type : 'image/png', encoding: 'utf-8'});
                } catch ( e ) {/*error Value of 'err' may be overwritten in IE 8 and earlier.*/
                    return null;
                }
            }
            , bind: function () {
                var ctrl_pressed = false,
                    me = this;

                if ( utils.getIEVersion() && utils.getIEVersion() < 11 ) {
                    return;
                }
                
                var keydown = function( e ) {
                    var ev = e || window.event,
                        k = ev.keyCode;
                    if ( k === 17 || ev.metaKey || ev.ctrlKey ) {
                        ctrl_pressed = true;
                    }
                    if ( k === 86 ) {
                        if ( ctrl_pressed === true && !window.Clipboard ) {
                            pw.focus();
                            setTimeout(function () {
                                ctrl_pressed = false;
                            }, 50);
                        }
                    }
                };
                utils.on(textarea, 'keydown', keydown);
                utils.on(imChatBody, 'keydown', keydown);

                var pw = document.createElement('div');
                pw.setAttribute('contenteditable', '');
                pw.style.cssText = 'opacity:0;position:fixed;top:-10px;left:-10px;width:1px;height:1px;overflow:hidden;outline:none;';
                utils.on(pw, 'DOMSubtreeModified', function () {
                    if ( !ctrl_pressed ) {
                        return true;
                    } else {
                        ctrl_pressed = false;
                    }
                    var img = pw.getElementsByTagName('img');
                    if ( img.length > 0 && img.getAttribure('src') ) {
                        var b = me.getBlob(img.getAttribure('src'));
                        me.show(b);
                    }
                    var word = pw.children.length === 0 ? utils.html(pw) : utils.html(pw.children[0]);
                    textarea.value = textarea.value + word;
                    utils.removeClass(sendBtn, 'disabled');
                    utils.html(pw, '');
                });
                document.body.appendChild(pw);

                utils.on(imChatBody, 'paste', function ( e ) {
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
    }());


    /**
     * 窗口拖拽
     */
    (function () {
        if ( !config.dragEnable || config.mobile ) {
            return;
        }

        dragHeader.style.cursor = 'move';

        var _startPos,
            dom,
            screen;
        var getDomRect = function () {
            dom = {
                width: im.clientWidth,
                height: im.clientHeight
            };
        };

        var _start = function ( e ) {
            var ev = window.event || e,
                target = ev.srcElement || ev.target;

            if ( target.id !== 'easemobWidgetDrag' && !utils.hasClass(target, 'easemobWidgetHeader-nickname') ) {
                return false;
            }

            _startPos = {
                x: ev.clientX,
                y: ev.clientY
            };
            screen = {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
            getDomRect();
            dom.pos = {
                x: screen.width - dom.width - im.getBoundingClientRect().left,
                y: screen.height - dom.height - im.getBoundingClientRect().top
            };
            utils.on(document, 'mousemove', _move);
            utils.on(document, 'mouseup', _moveend);
        }
           
        var _move = function ( e ) {
            var ev = window.event || e,
                _x = dom.pos.x - ev.clientX + _startPos.x,
                _y = dom.pos.y - ev.clientY + _startPos.y;
  
            if ( screen.width - _x - dom.width < 0 ) {//left
                _x = screen.width - dom.width;
            } else if ( _x < 0 ) {//right
                _x = 0;
            }
            if ( screen.height - _y - dom.height <= 0 ) {//top
                _y = screen.height - dom.height;
            } else if ( _y <= 0 ) {//bottom
                _y = 0;
            }

            im.style.left = 'auto';
            im.style.top = 'auto';
            im.style.right = _x + 'px';
            im.style.bottom = _y + 'px';
        };

        var _moveend = function () {
            utils.remove(document, 'mousemove', _move);
            utils.remove(document, 'mouseup', _moveend);
        };
        
        var resize = function () {
            screen = {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
            getDomRect();
            dom.pos = {
                x: screen.width - dom.width - im.getBoundingClientRect().left,
                y: screen.height - dom.height - im.getBoundingClientRect().top
            };

            //width
            if ( screen.width < dom.width ) {
                im.style.left = 'auto';
                im.style.right = 0;
            } else if ( screen.width - dom.pos.x < dom.width ) {
                im.style.right = 'auto';
                im.style.left = 0;
            } else {
                im.style.left = 'auto';
                im.style.right = dom.pos.x + 'px';
            }

            //height
            if ( screen.height < dom.height ) {
                im.style.top = 'auto';
                im.style.bottom = 0;
            } else if ( screen.height - dom.pos.y < dom.height ) {
                im.style.bottom = 'auto';
                im.style.top = 0;
            } else {
                im.style.top = 'auto';
                im.style.bottom = dom.pos.y + 'px';
            }
        };
        setTimeout(function () {
            utils.on(window, 'resize', resize);
        }, 3000); 
        utils.on(dragHeader, 'mousedown', _start);
    }());
 

    /**
     * 满意度调查
     */
    var satisfaction = (function () {
        var dom = document.createElement('div');

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
        imChat.appendChild(dom);

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
        
        satisfactionEntry && utils.on(satisfactionEntry, click, function () {
            session = null;
            invite = null;
            utils.removeClass(dom, 'em-hide');
        });
        utils.live('button.js_satisfybtn', click, function () {
            session = this.getAttribute('data-servicesessionid');
            invite = this.getAttribute('data-inviteid');
            utils.removeClass(dom, 'em-hide');
        });
        utils.on(cancelBtn, click, function () {
            utils.addClass(dom, 'em-hide');
        });
        utils.on(submitBtn, click, function () {
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
        utils.on(starsUl, click, function ( e ) {
            var ev = e || window.event,
                that = ev.target || ev.srcElement,
                cur = that.getAttribute('idx');

            for ( var i = 0; i < lis.length; i++ ) {
                if ( i < Number(cur) ) {
                    utils.addClass(lis[i], 'sel');
                } else {
                    utils.removeClass(lis[i], 'sel');
                }
            }
        });
    }());


    /**
     * 留言
     */
    var leaveMessage = function () {
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

        utils.on(leaveMessageBtn, click, function () {
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


    /**
     * title滚动
     */
    var titleSlide = (function () {
        var newTitle = '新消息提醒',
            titleST = 0,
            originTitle = document.title,
            tempArr = (originTitle + newTitle).split(''),
            word;

        return {
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
    }());


    /**
     * 为不支持异步上传的浏览器提供上传接口
    */
    var flashUpload = function ( url, options ) {
        swfupload.setUploadURL(url);
        swfupload.startUpload();
        swfupload.uploadOptions = options;
    };
    var uploadShim = function ( fileInputId ) {
        if ( !Easemob.im.Utils.isCanUploadFile() ) {
            return;
        }

        var pageTitle = document.title;
        var uploadBtn = utils.$Dom(fileInputId);
        if ( typeof SWFUpload === 'undefined' || uploadBtn.length < 1 ) {
            return;
        }

        return new SWFUpload({ 
            file_post_name: 'file'
            , flash_url: easemobIM.config.base + '/webim/static/js/swfupload/swfupload.swf'
            , button_placeholder_id: fileInputId
            , button_width: 120
            , button_height: 30
            , button_cursor: SWFUpload.CURSOR.HAND
            , button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT
            , file_size_limit: 10485760
            , file_upload_limit: 0
            , file_queued_handler: function(file) {
                if ( this.getStats().files_queued > 1 ) {
                    this.cancelUpload();
                }
                if ( !config.PICTYPE[file.type.slice(1).toLowerCase()] ) {
                    chat.errorPrompt('不支持此类型' + file.type);
                    this.cancelUpload();
                } else if ( 10485760 < file.size ) {
                    chat.errorPrompt('请上传大小不超过10M的文件');
                    this.cancelUpload();
                } else {
                    chat.sendImgMsg({name: file.name, data: file});
                }
            }
            , upload_error_handler: function ( file, code, msg ) {
                if ( code != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED
                && code != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED 
                && code != SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED ) {
                    var msg = new Message('img', this.fileMsgId);
                    msg.set({file: null});
                    me.appendMsg(config.user.name, config.toUser, msg);
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
                    var msg = new Message('img');
                    msg.set({file: file});
                    chat.appendDate(new Date().getTime(), config.toUser);
                    chat.appendMsg(config.user.name, config.toUser, msg);
                    this.uploadOptions.onFileUploadComplete(res);
                } catch ( e ) {
                    chat.errorPrompt('上传图片发生错误');
                }
            }
        });
    };
    //不支持异步upload的浏览器使用flash插件搞定
    if ( !Easemob.im.Utils.isCanUploadFileAsync() && Easemob.im.Utils.isCanUploadFile() ) {
        swfupload = uploadShim('easemobWidgetFileInput');
    }


    /**
     * 所有交互在这里
     */
    var chat = (function () {
        var isShowDirect = false;//不同技能组之间，直接显示

        return {
            init: function () {
                this.scbT = 0;//sroll bottom timeout stamp
                this.msgTimeSpan = {};//用于处理1分钟之内的消息只显示一次时间
                this.opened = false;//聊天窗口是否已展示

                this.setSlogan();//设置广告语
                this.setMinmum();//设置最小化按钮
                this.soundReminder();//设置声音提醒
                this.bindEvents();//开始绑定dom各种事件
            }
            , ready: function () {
                this.setConnection();
                this.sdkInit();
                this.open();
                this.handleGroup();
                this.getSession();
                this.chatWrapper.getAttribute('data-getted') || chat.getHistory();
            }
            , setConnection: function() {
                this.conn = new Easemob.im.Connection();
            }
            , handleChatWrapperByHistory: function ( chatHistory, chatWrapper ) {
                if ( chatHistory.length === config.LISTSPAN ) {
                    chatWrapper.setAttribute('data-start', Number(chatHistory[config.LISTSPAN - 1].chatGroupSeqId) - 1);
                    chatWrapper.setAttribute('data-history', 0);
                } else {
                    chatWrapper.setAttribute('data-history', 1);
                }
            }
            , getHistory: function ( notScroll ) {
                if ( config.offDuty ) {
                    return;
                }

                var me = this,
                    chatWrapper = me.chatWrapper,
                    groupid = chatWrapper.getAttribute('data-groupid');

                if ( groupid ) {
                    Number(chatWrapper.getAttribute('data-history')) || api('getHistory', {
                        fromSeqId: chatWrapper.getAttribute('data-start') || 0
                        , size: config.LISTSPAN
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
                    Number(chatWrapper.getAttribute('data-history')) || api('getGroup', {
                        id: config.user.name
                        , orgName: config.orgName
                        , appName: config.appName
                        , imServiceNumber: config.toUser
                        , tenantId: config.tenantId
                    }, function ( msg ) {
                        if ( msg && msg.data ) {
                            chatWrapper.setAttribute('data-groupid', msg.data);
                            api('getHistory', {
                                fromSeqId: chatWrapper.getAttribute('data-start') || 0
                                , size: config.LISTSPAN
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
            , getSession: function () {
                if ( config.offDuty ) {
                    this.setAgentProfile();
                    return;
                }

                var me = this,
                    chatWrapper = me.chatWrapper;

                api('getSession', {
                    id: config.user.name
                    , orgName: config.orgName
                    , appName: config.appName
                    , imServiceNumber: config.toUser
                    , tenantId: config.tenantId
                }, function ( msg ) {
                    if ( msg && msg.data ) {
                        chatWrapper.setAttribute('data-session', 1);
                        me.setAgentProfile( msg.data );
                    }
                });
            }
            , handleGroup: function () {
                if ( !config.toUser ) {
                    return false;
                }
                this.handleChatContainer(config.toUser);
                this.chatWrapper = utils.$Dom(config.toUser);
            }
            , handleChatContainer: function ( userName ) {
                var curChatContainer = utils.$Dom(userName);

                this.setAgentProfile( {userNicename: config.title} );
                if ( curChatContainer ) {
                    utils.removeClass(curChatContainer, 'em-hide');
                    utils.addClass(utils.siblings(curChatContainer, 'easemobWidget-chat'), 'em-hide');
                    utils.addClass(utils.$Class('div.easemobWidget-status-prompt'), 'em-hide');
                    utils.removeClass(utils.$Dom(config.toUser + '-transfer'), 'em-hide');
                } else {
                    curChatContainer = document.createElement('div');
                    curChatContainer.id = userName;
                    utils.addClass(curChatContainer, 'easemobWidget-chat');
                    utils.insertBefore(imChatBody, curChatContainer, imChatBody.childNodes[0]);

                    curChatContainer = document.createElement('div');
                    curChatContainer.id = config.toUser + '-transfer';
                    utils.addClass(curChatContainer, 'easemobWidget-status-prompt em-hide');
                    imChat.appendChild(curChatContainer);
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
                            isSelf = msgBody.from === config.user.name;

                        if ( msgBody && msgBody.bodies.length > 0 ) {
                            msg = msgBody.bodies[0];
                            if ( msgBody.from === config.user.name ) {
                                switch ( msg.type ) {
                                    case 'img':
                                        msg.url = config.base + msg.url;
                                        msg.to = msgBody.to;
                                        me.sendImgMsg(msg, true);
                                        break;
                                    case 'txt':
                                        me.sendTextMsg(msg.msg, msgBody.to);
                                        break;
                                }
                            } else {
                                //判断是否为满意度调查的消息
                                if ( msgBody.ext && msgBody.ext.weichat && msgBody.ext.weichat.ctrlType && msgBody.ext.weichat.ctrlType == 'inviteEnquiry'
                                //机器人自定义菜单
                                || msgBody.ext && msgBody.ext.msgtype && msgBody.ext.msgtype.choice ) {
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
                            msg.type === 'cmd' || me.appendDate(v.timestamp || msgBody.timestamp, isSelf ? msgBody.to : msgBody.from, true);
                        }
                    });
                }
            }
            , setAgentProfile: function ( info ) {
                var nickName = utils.$Class('span.easemobWidgetHeader-nickname')[0],
                    avatar = utils.$Class('img.easemobWidgetHeader-portrait')[0];

                utils.html(nickName, info && info.userNicename ? info.userNicename : (info && info.agentUserNiceName || config.defaultAgentName));

                this.currentAvatar = info && info.avatar ? info.avatar : config.defaultAvatar;
                if ( avatar.getAttribute('src') != this.currentAvatar ) {
                    config.newAvatar = config.newAvatar || new Image();
                    var cur = this.currentAvatar;

                    config.newAvatar.onload = function () {
                        avatar.style.opacity = '0';
                        avatar.setAttribute('src', cur);
                        avatar.style.opacity = '1';
                    };
                    config.newAvatar.setAttribute('src', cur);
                }
            }
            , setMinmum: function () {
                if ( !config.minimum ) {
                    return;
                }
                var min = document.createElement('a');
                min.setAttribute('href', 'javascript:;');
                min.setAttribute('title', '关闭');
                utils.addClass(min, 'easemobWidgetHeader-min bg-color border-color');
                dragHeader.appendChild(min);
                utils.on(min, click, this.hide);
                utils.on(min, 'mouseenter', function () {
                    utils.addClass(this, 'hover-color');
                });
                utils.on(min, 'mouseleave', function () {
                    utils.removeClass(this, 'hover-color');
                });
                min = null;
            }
            , setSlogan: function () {
                var me = this;

                if ( me.slogan ) {
                    return;
                }

                api('getSlogan', {
                    tenantId: config.tenantId
                }, function ( msg ) {
                    if ( msg.data && msg.data.length > 0 && msg.data[0].optionValue ) {
                        imChatBody.style.top = '90px';
                        me.slogan = document.createElement('div');
                        utils.addClass(me.slogan, 'easemobWidget-word');

                        var slogan = Easemob.im.Utils.parseLink(msg.data[0].optionValue);
                        utils.html(me.slogan, "<span>" + slogan + "</span><a class='easemobWidget-word-close' href='javascript:;'></a>");
                        imChat.appendChild(me.slogan);

                        //关闭广告语按钮
                        utils.on(utils.$Class('a.easemobWidget-word-close'), click, function () {
                            utils.addClass(me.slogan, 'em-hide');
                            imChatBody.style.top = '43px';
                        });
                    }
                });
            }
            , fillFace: function () {
                if ( utils.html(chatFaceWrapper.getElementsByTagName('ul')[0]) ) {
                    return;
                }

                var faceStr = '<li class="e-face">',
                    count = 0,
                    me = this;

                utils.each(Easemob.im.EMOTIONS.map, function ( k, v ) {
                    count += 1;
                    faceStr += ["<div class='easemobWidget-face-bg e-face'>",
                                    "<img class='easemobWidget-face-img e-face' ",
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

                utils.html(chatFaceWrapper.getElementsByTagName('ul')[0], faceStr),
                faceStr = null;

                utils.on(faceBtn, 'mouseenter', function () {
                    config.mobile || utils.addClass(this, 'theme-color');
                })
                utils.on(faceBtn, 'mouseleave', function () {
                    config.mobile || utils.removeClass(this, 'theme-color');
                });
                utils.on(faceBtn, click, function () {
                    utils.hasClass(chatFaceWrapper, 'em-hide')
                    ? utils.removeClass(chatFaceWrapper, 'em-hide')
                    : utils.addClass(chatFaceWrapper, 'em-hide')
                });

                //表情的选中
                utils.on(chatFaceWrapper.getElementsByTagName('img'), click, function ( e ) {
                    !config.mobile && textarea.focus();
                    textarea.value = textarea.value + this.getAttribute('data-value');
                    utils.removeClass(sendBtn, 'disabled');
                    if ( config.mobile ) {
                        me.autoGrowOptions.update();//update autogrow
                        setTimeout(function () {
                            textarea.scrollTop = 10000;
                        }, 100);
                    }
                    utils.removeClass(sendBtn, 'disabled');
                });
            }
            , errorPrompt: function ( msg, isAlive ) {//暂时所有的提示都用这个方法
                var me = this;

                if ( !me.ePrompt ) {
                    me.ePrompt = document.createElement('p');
                    me.ePrompt.className = 'easemobWidget-error-prompt em-hide';
                    utils.html(me.ePrompt, '<span></span>');
                    imChat.appendChild(me.ePrompt);
                    me.ePromptContent = me.ePrompt.getElementsByTagName('span')[0];
                }
                
                utils.html(me.ePromptContent, msg);
                utils.removeClass(me.ePrompt, 'em-hide');
                isAlive || setTimeout(function(){
                    utils.html(me.ePromptContent, '');
                    utils.addClass(me.ePrompt, 'em-hide');
                }, 2000);
            }
            , setOffline: function() {
                leaveMessage();
                this.slogan && utils.addClass(this.slogan, 'em-hide');
                utils.addClass(imBtn.getElementsByTagName('a')[0], 'easemobWidget-offline-bg');
                utils.removeClass(leaveMessage.dom, 'em-hide');
                utils.addClass(imChatBody, 'em-hide');
                utils.addClass(send, 'em-hide');
            }
            , hide: function () {
                this.opened = false;
                utils.addClass(imChat, 'em-hide');
                config.hide || utils.removeClass(imBtn, 'em-hide');
                config.mobile && utils.removeClass(im, 'em-mobile-show');
            }
            , show: function(windowStatus) {
                this.opened = true;
                this.fillFace();
                this.scrollBottom(50);
                utils.addClass(imBtn, 'em-hide');
                utils.removeClass(imChat, 'em-hide');
                try { textarea.focus(); } catch ( e ) {}
                titleSlide.stop();
                config.mobile && utils.addClass(im, 'em-mobile-show');
                
                if ( !this.autoGrowOptions ) {
                    this.autoGrowOptions = {};
                    this.autoGrowOptions.callback = function () {
                        var height = send.getBoundingClientRect().height;
                        imChatBody.style.bottom = height + 'px';
                    };
                    this.autoGrowOptions.dom = textarea;
                    config.mobile && autogrow(this.autoGrowOptions);
                }
            }
            , sdkInit: function () {
                var me = this;
                
                me.conn.listen({
                    onOpened: function () {
                        me.conn.setPresence();
                        me.conn.heartBeat(me.conn);

                        if ( textarea.value ) {
                            utils.removeClass(sendBtn, 'disabled');
                        }
                        utils.html(sendBtn, '发送');
                    }
                    , onTextMessage: function ( message ) {
                        me.receiveMsg(message, 'txt');
                    }
                    , onPictureMessage: function ( message ) {
                        me.receiveMsg(message, 'img');
                    }
                    , onCmdMessage: function ( message ) {
                        me.receiveMsg(message, 'cmd');
                    }
                    , onError: function ( e ) {
                        if ( e.reconnect ) {
                            me.open();
                        } else {
                            me.conn.stopHeartBeat(me.conn);
                            config.error(e);
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
                    utils.insertBefore(chatWrapper, dom, chatWrapper.getElementsByTagName('div')[0]);
                }
            }
            , resetSpan: function ( id ) {
                this.msgTimeSpan[id] = new Date().getTime();
            }
            , open: function () {
                this.conn.open({
                    user: config.user.name
                    , pwd: config.authMode === 'password' && config.user.password
                    , accessToken: config.authMode === 'token' && config.user.token
                    , appKey: config.appKey
                });
            }
            , soundReminder: function () {
                var me = this;

                //if lte ie 8 , return
                if ( utils.getIEVersion() && utils.getIEVersion() < 9 || config.mobile || !config.soundReminder ) {
                    me.soundReminder = function () {};
                    return;
                }

                me.reminder = document.createElement('a');
                me.reminder.setAttribute('href', 'javascript:;');
                utils.addClass(me.reminder, 'easemobWidgetHeader-audio bg-color');
                dragHeader.appendChild(me.reminder);

                //音频按钮静音
                utils.on(me.reminder, 'click', function () {
                    me.silence = me.silence ? false : true;
                    utils.hasClass(me.reminder, 'easemobWidgetHeader-silence') 
                    ? utils.removeClass(me.reminder, 'easemobWidgetHeader-silence') 
                    : utils.addClass(me.reminder, 'easemobWidgetHeader-silence');
                    return false;
                });

                if ( window.HTMLAudioElement ) {
                    var ast = 0;
                    
                    me.audio = document.createElement('audio');
                    me.audio.src = 'static/mp3/msg.m4a';
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
                config.mobile || utils.addClass(obj, 'bg-color');
            }
            , clearThemeBackground: function ( obj ) {
                config.mobile || utils.removeClass(obj, 'bg-color');
            }
            , setThemeColor: function ( obj ) {
                config.mobile || utils.addClass(obj, 'theme-color');
            }
            , clearThemeColor: function ( obj ) {
                config.mobile || utils.removeClass(obj, 'theme-color');
            }
            , bindEvents: function () {
                var me = this;

                utils.on(document, 'mouseover', function () {
                    titleSlide.stop();
                }); 
                utils.live('button.js_satisfybtn', 'mouseover', function () {
                    me.setThemeBackground(this);
                });
                utils.live('button.js_robertbtn', 'mouseover', function () {
                    me.setThemeBackground(this);
                });
                utils.live('button.js_satisfybtn', 'mouseout', function () {
                    me.clearThemeBackground(this);
                });
                utils.live('button.js_robertbtn', 'mouseout', function () {
                    me.clearThemeBackground(this);
                });
                utils.on(sendFileBtn, 'mouseenter', function () {
                    me.setThemeColor(this);
                });
                utils.on(sendFileBtn, 'mouseleave', function () {
                    me.clearThemeColor(this);
                });
                
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
                utils.live('div.easemobWidget-msg-status', click, function () {
                    var id = this.getAttribute('id').slice(0, -7);

                    utils.addClass(this, 'em-hide');
                    utils.removeClass(utils.$Dom(id + '_loading'), 'em-hide');
                    me.conn.send(id);
                });

                //机器人列表
                utils.live('button.js_robertbtn', click, function () {
                    var that = this;

                    me.sendTextMsg(utils.html(that), null, {
                        msgtype: {
                            choice: { menuid: that.getAttribute('data-id') }
                        }
                    });
                    return false;
                });
                
                var handleSendBtn = function () {
                    textarea.value && utils.html(sendBtn) !== '连接中' ? utils.removeClass(sendBtn, 'disabled') : utils.addClass(sendBtn, 'disabled');
                };

                utils.on(textarea, 'keyup', handleSendBtn);
                utils.on(textarea, 'change', handleSendBtn);
                utils.on(textarea, 'input', handleSendBtn);
                
                if ( config.mobile ) {
                    var handleFocus = function () {
                        textarea.style.overflowY = 'auto';
                        var scrollTimer = function () {
                            document.body.scrollTop = 10000;
                            me.focusText = setTimeout(scrollTimer, 200);
                        };
                        scrollTimer();
                        me.scrollBottom(800);
                    }
                    utils.on(textarea, 'input', function () {
                        me.autoGrowOptions.update();
                        me.scrollBottom(800);
                    });
                    utils.on(textarea, 'focus', handleFocus);
                    utils.one(textarea, 'touchstart', handleFocus);
                    utils.on(textarea, 'blur', function () {
                    
                        clearTimeout(me.focusText);
                    });
                }

                //选中文件并发送
                utils.on(realFile, 'change', function () {
                    me.sendImgMsg();
                });

                //hide face wrapper
                utils.on(document, click, function ( ev ) {
                    var e = window.event || ev,
                        t = e.srcElement || e.target;

                    if ( !utils.hasClass(t, 'e-face') ) {
                        utils.addClass(chatFaceWrapper, 'em-hide');
                    }
                });

                //弹出文件选择框
                utils.on(sendFileBtn, 'click', function () {
                    if ( !Easemob.im.Utils.isCanUploadFileAsync() ) {
                        me.errorPrompt('当前浏览器需要安装flash发送图片');
                        return false;    
                    }
                    realFile.click();
                });

                //hot key
                utils.on(textarea, 'keydown', function ( evt ) {
                    var that = this;
                    if ( (config.mobile && evt.keyCode === 13) 
                        || (evt.ctrlKey && evt.keyCode === 13) 
                        || (evt.shiftKey && evt.keyCode === 13) ) {

                        that.value = that.value + '\n';
                        return false;
                    } else if ( evt.keyCode === 13 ) {
                        utils.addClass(chatFaceWrapper, 'em-hide');
                        if ( utils.hasClass(sendBtn, 'disabled') ) {
                            return false;
                        }
                        me.sendTextMsg();
                        setTimeout(function(){
                            that.value = '';
                        }, 0);
                    }
                });

                utils.on(sendBtn, 'click', function () {
                    if ( utils.hasClass(this, 'disabled') ) {
                        return false;
                    }
                    utils.addClass(chatFaceWrapper, 'em-hide');
                    me.sendTextMsg();
                    if ( config.mobile ) {
                        textarea.style.height = '34px';
                        textarea.style.overflowY = 'hidden';
                        imChatBody.style.bottom = '43px';
                        textarea.focus();
                    }
                    return false;
                });
            }
            , scrollBottom: function ( type ) {
                var ocw = imChatBody;
                
                type 
                ? (clearTimeout(this.scbT), this.scbT = setTimeout(function () {
                    ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
                }, type))
                : (ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000);
            }
            , sendImgMsg: function ( file, isHistory ) {
                var me = this,
                    msg = new Message('img', isHistory ? null : me.conn.getUniqueId());

                msg.set({
                    file: file || Easemob.im.Utils.getFileUrl(realFile.getAttribute('id')),
                    to: config.toUser,
                    uploadError: function ( error ) {
                        //显示图裂，无法重新发送
                        if ( !Easemob.im.Utils.isCanUploadFileAsync() ) {
                            swfupload && swfupload.settings.upload_error_handler();
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
                    flashUpload: flashUpload
                });
                if ( !isHistory ) {
                    me.conn.send(msg.body);
                    realFile.value = '';
                    if ( Easemob.im.Utils.isCanUploadFileAsync() ) {
                        me.appendDate(new Date().getTime(), config.toUser);
                        me.appendMsg(config.user.name, config.toUser, msg);
                    }
                } else {
                    me.appendMsg(config.user.name, file.to, msg, true);
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
                        if ( config.mobile ) {
                            utils.addClass(dragHeader, 'em-hide');
                        }
                    }
                } else if ( action === 'transfer' ) {
                    utils.addClass(wrap, 'transfer');
                    utils.removeClass(wrap, 'link');
                    config.mobile && utils.addClass(dragHeader, 'em-hide');
                } else if ( action === 'reply' ) {
                    utils.removeClass(wrap, 'transfer');
                    utils.removeClass(wrap, 'link');
                    if ( info ) {
                        info && this.setAgentProfile({
                            userNicename: info.userNicename,
                            avatar: info.avatar
                        });
                    }
                    if ( config.mobile ) {
                        utils.removeClass(dragHeader, 'em-hide');
                    }
                }
            }
            , appendMsg: function ( from, to, msg, isHistory ) {//消息上屏
                var isSelf = from == config.user.name,
                    curWrapper = utils.$Dom(isSelf ? to : from || config.toUser);

                var div = document.createElement('div');
                div.className = 'emim-clear emim-mt20 emim-tl emim-msg-wrapper ';
                div.className += isSelf ? 'emim-fr' : 'emim-fl';
                utils.html(div, msg.get(!isSelf));
                if ( isHistory ) {
                    utils.insertBefore(curWrapper, div, curWrapper.childNodes[0]);
                } else {
                    curWrapper.appendChild(div);
                    this.scrollBottom(config.mobile ? 700 : undefined);
                }
                div = null;
            }
            , sendTextMsg: function ( message, isHistory, ext ) {
                var me = this;
                
                var msg = new Message('txt', isHistory ? null : me.conn.getUniqueId());
                msg.set({
                    value: message || textarea.value,
                    to: config.toUser,
                    success: function ( id ) {
                        utils.$Remove(utils.$Dom(id + '_loading'));
                        utils.$Remove(utils.$Dom(id + '_failed'));
                        me.handleTransfer('sending');
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
                    textarea.value = '';
                    me.appendDate(new Date().getTime(), config.toUser);
                    me.appendMsg(config.user.name, config.toUser, msg);
                } else {
                    me.appendMsg(config.user.name, isHistory, msg, true);
                }
            }
            , sendSatisfaction: function ( level, content, session, invite ) {
                var me = this;

                var msg = new Message('txt', me.conn.getUniqueId());
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
                if ( !this.opened || utils.isMin() ) {
                    notify(this.currentAvatar, '新消息', message.brief);
                    titleSlide.start();
                    this.soundReminder();
                }
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
                }

                switch ( type ) {
                    case 'img':
                        message = new Message('img');
                        message.set({file: {url: msg.url}});
                        break;
                    case 'satisfactionEvaluation':
                        message = new Message('list');
                        message.set({value: '请对我的服务做出评价', list: ['\
                            <div class="easemobWidget-list-btns">\
                                <button class="easemobWidget-list-btn js_satisfybtn" data-inviteid="' + msg.ext.weichat.ctrlArgs.inviteId + '" data-servicesessionid="'+ msg.ext.weichat.ctrlArgs.serviceSessionId + '">立即评价</button>\
                            </div>']});
                        break;
                    case 'robertList':
                        message = new Message('list');
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
                    default:
                        message = new Message('txt');
                        message.set({value: msg.data});
                        break;
                }
                
                if ( !isHistory ) {
                    if ( msg.ext && msg.ext.weichat && msg.ext.weichat.event && msg.ext.weichat.event.eventName === 'ServiceSessionTransferedEvent' ) {
                        this.handleTransfer('transfer');//transfer msg
                    } else if ( msg.ext && msg.ext.weichat && (msg.ext.weichat.agent || msg.ext.weichat.agent === null) ) {//version23:normal msg
                        if ( msg.ext.weichat.agent === null ) {
                            this.handleTransfer('reply');//switch off
                        } else if ( msg.ext.weichat.agent && msg.ext.weichat.agent.userNicename !== '调度员' ) {//switch on
                             this.handleTransfer('reply', msg.ext.weichat.agent);
                        }
                    } else {
                        this.handleTransfer('reply');
                    }

                    if ( !message.value ) {//空消息不显示
                        return;
                    }
                    me.appendDate(new Date().getTime(), msg.from);
                    me.resetSpan();
                    me.appendMsg(msg.from, msg.to, message);
                    me.scrollBottom();
                    me.messagePrompt(message);
                    typeof config.onReceive === 'function' && config.onReceive(msg.from, msg.to, message);
                } else {
                    if ( !message.value ) {
                        return;
                    }
                    me.appendMsg(msg.from, msg.to, message, true);
                }
            }
        };
    }());


    /**
     * 消息类
     */
    var Message = function ( type, id ) {
        if ( !(this instanceof Message) ) {
            return new Message(type);
        }

        this._msg = {};

        if ( typeof Message[type] === 'function' ) {
            this._msg = new Message[type](id);
        }
        return this._msg;
    }

    //文本消息
    Message.txt = function ( id ) {
        this.id = id;
        this.type = 'txt';
        this.brief = '';
        this.body = {};
    };
    Message.txt.prototype.get = function ( isReceive ) {
        if ( !this.value ) {
            return '';
        }
        return [
            !isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
                "<div class='easemobWidget-msg-wrapper'>",
                    "<i class='easemobWidget-corner'></i>",
                    this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status em-hide'><span>发送失败</span><i></i></div>" : "",
                    this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + config.LOADING + "</div>" : "",
                    "<div class='easemobWidget-msg-container'>",
                        "<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(utils.encode(this.value))) + "</p>",
                    "</div>",
                "</div>",
            "</div>"
        ].join('');
    };
    Message.txt.prototype.set = function ( opt ) {
        this.value = opt.value;
        if ( this.value ) {
            this.brief = this.value.replace(/\n/mg, '');
            this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
        }
        this.body = {
            id: this.id
            , to: opt.to
            , msg: this.value 
            , type : 'chat'
            , success: opt.success
            , fail: opt.fail
        };
    };

    //图片消息
    Message.img = function ( id ) {
        this.id = id;
        this.type = 'img';
        this.brief = '图片';
        this.body = {};
    }
    Message.img.prototype.get = function ( isReceive ) {
        return [
            !isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
                "<div class='easemobWidget-msg-wrapper'>",
                    "<i class='easemobWidget-corner'></i>",
                    this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status em-hide'><span>发送失败</span><i></i></div>" : "",
                    this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + config.LOADING + "</div>" : "",
                    "<div class='easemobWidget-msg-container'>",
                        this.value === null ? "<a class='easemobWidget-noline' href='javascript:;'><i class='easemobWidget-unimage'>I</i></a>" : "<a class='easemobWidget-noline' href='" + this.value.url + "' target='_blank'><img src='" + this.value.url + "'/></a>",
                    "</div>",
                "</div>",
            "</div>"
        ].join('');
    }
    Message.img.prototype.set = function ( opt ) {
        this.value = opt.file;
                    
        this.body = {
            id: this.id 
            , file: this.value 
            , apiUrl: (https ? 'https:' : 'http:') + '//a1.easemob.com'
            , to: opt.to
            , type : 'chat'
            , ext: {
                messageType: 'img'
            }
            , onFileUploadError : opt.uploadError
            , onFileUploadComplete: opt.uploadComplete
            , success: opt.success
            , fail: opt.fail
            , flashUpload: opt.flashUpload
        };
    }
    //按钮列表消息，机器人回复，满意度调查
    Message.list = function ( id ) {
        this.id = id;
        this.type = 'list';
        this.brief = '';
        this.body = {};
    };
    Message.list.prototype.get = function ( isReceive ) {
        if ( !this.value ) {
            return '';
        }
        return [
            "<div class='easemobWidget-left'>",
                "<div class='easemobWidget-msg-wrapper'>",
                    "<i class='easemobWidget-corner'></i>",
                    "<div class='easemobWidget-msg-container'>",
                        "<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(utils.encode(this.value))) + "</p>",
                    "</div>",
                    "<div id='" + this.id + "_failed' class='easemobWidget-msg-status em-hide'><span>发送失败</span><i></i></div>",
                "</div>",
                this.listDom,
            "</div>"
        ].join('');
    };
    Message.list.prototype.set = function ( opt ) {
        this.value = opt.value;
        if ( this.value ) {
            this.brief = this.value.replace(/\n/mg, '');
            this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
        }
        this.listDom = opt.list;
    };


    /**
     * 一些常量
     */
    config.LISTSPAN = 20;//每次获取的历史记录条数
    config.PICTYPE = {//自定义支持的图片格式
        jpg : true
        , gif : true
        , png : true
        , bmp : true
    };
    config.LOADING = !utils.isQQBrowserInAndroid && !(utils.getIEVersion() && utils.getIEVersion() == 9)//消息loading
        ? ["<div class='easemobWidget-loading'><svg version='1.1' id='图层_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px'",
        " viewBox='0 0 70 70' enable-background='new 0 0 70 70' xml:space='preserve'>",
        "<circle opacity='0.3' fill='none' stroke='#000000' stroke-width='4' stroke-miterlimit='10' cx='35' cy='35' r='11'/>",
        "<path fill='none' stroke='#E5E5E5' stroke-width='4' stroke-linecap='round' stroke-miterlimit='10' d='M24,35c0-6.1,4.9-11,11-11",
        "c2.8,0,5.3,1,7.3,2.8'/><image src='static/img/loading.gif' width='20' style='margin-top:10px;' /></svg></div>"].join('')
        : "<img src='static/img/loading.gif' width='20' style='margin-top:10px;'/>";
    Easemob.im.EMOTIONS = {//表情集
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

    
    /**
     * 调用指定接口获取数据
    */
    var api = function ( apiName, data, callback ) {
        //cache
        api[apiName] = api[apiName] || {};

        var ts = new Date().getTime();
        api[apiName][ts] = callback;
        getData
        .send({
            api: apiName
            , data: data
            , timespan: ts
        })
        .listen(function ( msg ) {
            if ( api[msg.call] && typeof api[msg.call][msg.timespan] === 'function' ) {

                var callback = api[msg.call][msg.timespan];
                delete api[msg.call][msg.timespan];

                if ( msg.status !== 0 ) {
                    config.error(msg);
                } else {
                    callback(msg);
                }
            }
        });
    };


    /**
     * chat Entry
     */
    var webim = ({
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
            return this;
        }
        , beforeOpen: function () {
            api('getRelevanceList', {
                tenantId: config.tenantId
            }, function ( msg ) {
                if ( msg.data.length === 0 ) {
                    chat.errorPrompt('未创建关联', true);
                    return;
                }
                config.relevanceList = msg.data;
                config.defaultAvatar = msg.data[0].tenantAvatar || config.defaultAvatar;
                config.defaultAgentName = msg.data[0].tenantName;

                if ( config.user.name ) {
                    chat.ready();
                } else {
                    var user = utils.getcookie('emkefuuser');
                    if ( user ) {
                        config.user.name = user;
                        api('getPassword', {
                            userId: config.user.name
                        }, function ( msg ) {
                            config.user.password = msg.data;
                            config.authMode = 'password';
                            utils.setcookie('emkefuuser', config.user.name);
                            chat.ready();
                        });
                    } else {
                        api('createVisitor', {
                            orgName: config.orgName
                            , appName: config.appName
                            , imServiceNumber: config.toUser
                        }, function ( msg ) {
                            config.user.name = msg.data.userId;
                            config.user.password = msg.data.userPassword;
                            config.authMode = 'password';
                            chat.ready();
                            utils.setcookie('emkefuuser', config.user.name);
                        });
                    }
                }
            });
        }
        , open: function ( channelName, imUser ) {
            //if ( /*if not login*/ ) {return;}

            config.title = typeof channelName === 'string' ? channelName : '';
            config.toUser = imUser ? imUser : config.to;
            if ( config.relevanceList && config.relevanceList.length > 0 ) {
                chat.handleGroup();
                chat.getSession();
                chat.chatWrapper.getAttribute('data-getted') || chat.getHistory();
            } else {
                webim.beforeOpen();
            }
            chat.show();
        }
        , close: function () {
            chat.hide();
            webim.afterClose();
        }
        , afterClose: function () {}
    }.init());
    im.style.display = 'block';
    config.minimum ? utils.on(imBtn, click, webim.open) : webim.open();

    window.easemobIM = webim.open;
} ( window, undefined ));

/*
    客服接入js
    version 1.0.0
*/
;(function ( window, undefined ) {
    'use strict';

    var message, iframe, iframeId, curUser, eTitle = document.title,
        iframePosition = {//iframe position
            x: 10
            , y: 10
        },
        _startPosition = {
            x: 0
            , y: 0
        },
        shadow = document.createElement('div'),
        newTitle = '-新消息提醒  ',
		titleST = 0,
		referrer = document.referrer,
		initdata;
    
    var getConfig = function ( key, searchScript ) {//get config from current script
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
    };

	var convertFalse = function ( obj ) {
		obj = typeof obj === 'undefined' ? '' : obj;
		return obj === 'false' ? false : obj;
	};

    var config = getConfig('easemob.js', true);
    config.json.hide = convertFalse(config.json.hide);
    config.json.sat = convertFalse(config.json.sat);
    config.json.tenants = convertFalse(config.json.tenants);

	var updateAttribute = function ( link, attr ) {
		var url = link || config.domain + '/webim/im.html?tenantId=';

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

    //open Api
    var open = function () {
        message.listenToIframe(function ( msg ) {
            var user, channel, group, tenantId, msgDetail = '新消息提醒';


            switch ( msg.event ) {
                case 'msgPrompt'://title slide
                    var l = 1, p, tArr = (eTitle + newTitle).split('');

                    clearInterval(titleST);
                    titleST = setInterval(function () {
                        p = tArr.shift();
                        document.title = p + Array.prototype.join.call(tArr, '');
                        tArr.push(p);
                    }, 360);
                    break;
                case 'notify'://title slide
                    notify(config.domain + '/webim/static/img/notify.png', '新消息', msg.detail);
                    break;
                case 'recoveryTitle':
                    clearInterval(titleST);
                    document.title = eTitle;
                    break;
                case 'showChat'://show Chat window
                    iframe.style.width = '400px';
                    iframe.style.height = '500px';
                    iframe.style.visibility = 'visible';
                    
                    iframe.style.right = iframePosition.x + 'px';
                    iframe.style.bottom = iframePosition.y + 'px';
                    
                    iframe.style.cssText += 'box-shadow: 0 4px 8px rgba(0,0,0,.2);border-radius: 4px;border: 1px solid #ccc\\9;';
                    break;
                case 'minChat'://show Chat window
                    _st && clearTimeout(_st);
                    iframe.style.boxShadow = 'none';
                    iframe.style.borderRadius = '4px;';
                    iframe.style.left = 'auto';
                    iframe.style.right = '-5px';
                    iframe.style.top = 'auto';
                    iframe.style.bottom = '10px';
                    iframe.style.border = 'none';
                    if(!config.json.hide) {
                        iframe.style.height = '37px';
                        iframe.style.width = '104px';
                    } else {
                        iframe.style.visibility = 'hidden';
                        iframe.style.width = '12px';
                        iframe.style.height = '12px';
                    }
                    break;
                case 'setuser':
                    Emc.set('emKefuUser' + msg.tenantId, msg.user, config.json.tenants);
                    break;
                case 'setgroupuser':
                    Emc.set(msg.group + msg.tenantId, msg.user, config.json.tenants);
                    break;
                case 'setchannel':
                    Emc.set('emKefuChannel' + msg.tenantId, msg.channel, config.json.tenants);
                    break;
                case 'dragready':
					_startPosition.x = isNaN(Number(msg.x)) ? 0 : Number(msg.x);
					_startPosition.y = isNaN(Number(msg.y)) ? 0 : Number(msg.y);
                    shadow.style.display = 'block';
                    iframe.style.display = 'none';
                    EasemobWidget.utils.on(document, 'mousemove', _move);
                    break;
                case 'dragend':
                    _moveend();
                    break;
                default: break;
            }   
        });
    };

	//open to customers
	window.easemobIM = function ( group ) {
		window.easemobIMS(null, group);
	};
	window.easemobIMS = function ( tenantId, group ) {
		tenantId = tenantId || config.json.tenantId;

		if ( !tenantId ) { return; }

		iframe || ready(tenantId, 'initIframWithoutSettingSrc');

		var url = '', user,
			op = {
				tenantId: tenantId,
				sat: config.json.sat,
				user: '',
				referrer: encodeURIComponent(referrer),
				show: true
			};

		if ( !!group ) {//技能组
			user = Emc.get(group + tenantId, config.json.tenants);
			op.emgroup = group;
			op.user = user;
			url = updateAttribute(iframe.getAttribute('src'), op);
		} else {
			user = Emc.get('emKefuUser' + tenantId, config.json.tenants);
			op.user = user;
			url = updateAttribute(iframe.getAttribute('src'), op);
		}

		if ( EasemobWidget.utils.isMobile ) {
			var a = window.event.srcElement || window.event.target;

			a.setAttribute('href', url);
			a.setAttribute('target', '_blank');
		} else {
			iframe.setAttribute('src', url);
		}
	};

    //add kefu widget
    var appendIframe = function ( tenantId, flag ) {
		if ( !tenantId || iframe ) {
			return;
		}

        iframe = (/MSIE (6|7|8)/).test(navigator.userAgent)
            ? document.createElement('<iframe name="' + new Date().getTime() + '">')
            : document.createElement('iframe');
        iframeId = 'EasemobIframe' + new Date().getTime();
        iframe.id = iframeId;
        iframe.name = new Date().getTime();
        iframe.frameBorder = 0;
        iframe.allowTransparency = 'true';
        iframe.style.cssText = [
            'z-index:16777269;',
            'overflow:hidden;',
            'position:fixed;',
            'bottom:10px;',
            'right:-5px;',
            'border:none;',
            'width:400px;',
            'height:0;',
            'display:none;',
            'transition:all .01s;'].join('');
        shadow.style.cssText = [
            'display:none;',
            'cursor:move;',
            'z-index:16777270;',
            'position:fixed;',
            'bottom:10px;',
            'right:10px;',
            'border:none;',
            'width:400px;',
            'height:500px;',
            'border-radius:4px;',
            'box-shadow: 0 4px 8px rgba(0,0,0,.2);',
            'border-radius: 4px;'].join('');

        shadow.style.background = 'url(' + config.domain + '/webim/static/img/drag.png) no-repeat';
        
        initdata = {
			tenantId: (tenantId || config.json.tenantId),
			hide: config.json.hide,
			sat: config.json.sat,
			user: curUser,
			referrer: encodeURIComponent(referrer)
		};

		config.json.resources && (initdata.resources = config.json.resources);

		var params = '';
		for ( var o in initdata ) {
			if ( initdata.hasOwnProperty(o) ) {
				params += o + '=' + initdata[o] + '&';
			}
		}
		params.slice(-1) === '&' && (params = params.slice(0, -1));

        flag || (iframe.src = config.domain + '/webim/im.html?' + params);

        if ( !config.json.hide ) {
            iframe.style.height = '37px';
            iframe.style.width = '104px';
        } else {
            iframe.style.height = '0';
            iframe.style.width = '0';
        }
        if ( EasemobWidget.utils.isMobile ) {
            iframe.style.cssText += 'left:0;bottom:0';
            iframe.style.width = '100%';   
        }

		document.body.appendChild(shadow);
		document.body.appendChild(iframe);

        if ( iframe.readyState ) {
            iframe.onreadystatechange = function () {
                if ( iframe.readyState === "loaded" || iframe.readyState === "complete" ) {
                    this.style.display = 'block';
                    message = new TransferMessage(iframeId);
                    open();
                    message.sendToIframe(initdata);
                }
            };
        } else {
            iframe.onload = function () {
                this.style.display = 'block';
                message = new TransferMessage(iframeId);
                open();
                message.sendToIframe(initdata);
            };
        }
    };

    var ready = function ( tenantId, flag ) {
		var id = tenantId || config.json.tenantId;
        curUser = Emc.get('emKefuUser' + id, config.json.tenants);
        appendIframe(id, flag);
        EasemobWidget.utils.on(shadow, 'mouseup', _moveend);
        resize();
    };

    var _st = 0;
    var _move = function ( e ) {

        var ev = window.event || e,
            _width = document.documentElement.clientWidth,
            _height = document.documentElement.clientHeight,
            _x = _width - e.clientX - 400 + _startPosition.x,
            _y = _height - e.clientY - 500 + _startPosition.y;
        
        if ( e.clientX - _startPosition.x <= 0 ) {//left
            _x = _width - 400;
        } else if ( e.clientX + 400 - _startPosition.x >= _width ) {//right
            _x = 0;
        }
        if ( e.clientY - _startPosition.y <= 0 ) {//top
            _y = _height - 500;
        } else if ( e.clientY + 500 - _startPosition.y >= _height ) {//bottom
            _y = 0;
        }
        shadow.style.left = 'auto';
        shadow.style.top = 'auto';
        shadow.style.right = _x + 'px';
        shadow.style.bottom = _y + 'px';

        iframePosition = {
            x: _x
            , y: _y
        };
        
        clearTimeout(_st);
        _st = setTimeout(_moveend, 500);
    };
    var _moveend = function () {
        EasemobWidget.utils.remove(document, 'mousemove', _move);
        iframe.style.left = 'auto';
        iframe.style.top = 'auto';
        iframe.style.right = iframePosition.x + 'px';
        iframe.style.bottom = iframePosition.y + 'px';
        shadow.style.left = 'auto';
        shadow.style.top = 'auto';
        shadow.style.right = iframePosition.x + 'px';
        shadow.style.bottom = iframePosition.y + 'px';
        shadow.style.display = 'none';
        iframe.style.display = 'block';
        setTimeout(function () {
            message.sendToIframe({ event: 'dragend' });
        }, 3000);
    };
       
    var resize = function () {
        EasemobWidget.utils.on(window, 'resize', function () {
            var _width = document.documentElement.clientWidth,
                _height = document.documentElement.clientHeight,
                _right = Number(iframe.style.right.slice(0, -2)),
                _bottom = Number(iframe.style.bottom.slice(0, -2));
            
            //width
            if ( _width < 400 ) {
                iframe.style.left = 'auto';
                iframe.style.right = 0;
                shadow.style.left = 'auto';
                shadow.style.right = 0;
            } else if ( _width - _right < 400 ) {
                iframe.style.right = _width - 400 + 'px';
                iframe.style.left = 0;
                shadow.style.right = _width - 400 + 'px';
                shadow.style.left = 0;
            } else {
                iframe.style.left = 'auto';
                shadow.style.left = 'auto';
            }

            //height
            if ( _height < 500 ) {
                iframe.style.top = 'auto';
                iframe.style.bottom = 0;
            } else if ( _height - _bottom < 500 ) {
                iframe.style.bottom = _height - 500 + 'px';
                iframe.style.top = 0;
            } else {
                iframe.style.top = 'auto';
            }
        });
    };
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
						notification.onclick = function () {
							typeof window.focus === 'function' && window.focus();
                            this.close();
						};
                        setTimeout(function () {
                            notification.close();
                        }, 3000);
                    } else {
                        Notification.requestPermission();
                    }
                } else {} 
            } catch ( e ) {}
        };
    }());

	config.json.hide || ready();
}(window, undefined));

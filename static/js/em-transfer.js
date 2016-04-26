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

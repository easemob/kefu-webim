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
			case 'graylist':
				easemobim.emajax(createObject({
					url: '/management/graylist',
					msg: msg,
					excludeData: true
				}));
				break;
			case 'getCurrentServiceSession':
				easemobim.emajax(createObject({
					url: '/v1/webimplugin/tenant/'
						+ msg.data.tenantId
						+ '/visitors/'
						+ msg.data.id
						+ '/CurrentServiceSession?techChannelInfo='
						+ msg.data.orgName + '%23'
						+ msg.data.appName + '%23'
						+ msg.data.imServiceNumber
						+ '&tenantId='
						+ msg.data.tenantId,
					msg: msg,
					excludeData: true
				}));
				break;
			default:
				break;
		}
	}, ['data']);
}());

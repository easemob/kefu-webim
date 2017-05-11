// 此文件用于跨域请求api，故为了兼容老版本，接口不能删
// 新增接口一律写在后边，按照时间顺序
// 接口应在url上附加tenantId，用于限流

(function () {
	// 此处由于要兼容老版本，所以在实例化对象时不能指定 useObject = true，而是依据 options.msg.useObject 来判断
	var getData = new easemobim.Transfer(null, 'api');

	var createObject = function (options) {
		var headers = null;
		var useObject = options.msg.useObject;

		if (options.msg.data && options.msg.data.headers) {
			headers = options.msg.data.headers;
			delete options.msg.data.headers;
		}

		return {
			url: options.url,
			headers: headers,
			data: options.excludeData ? null : options.msg.data,
			type: options.type || 'GET',
			isFileUpload: options.isFileUpload,
			success: function (info) {
				try {
					info = JSON.parse(info);
				}
				catch (e) {}
				getData.send({
					call: options.msg.api,
					timespan: options.msg.timespan,
					status: 0,
					data: info,
					useObject: useObject
				});
			},
			error: function (info) {
				try {
					info = JSON.parse(info);
				}
				catch (e) {}
				getData.send({
					call: options.msg.api,
					timespan: options.msg.timespan,
					status: 1,
					data: info,
					useObject: useObject
				});
			}
		};
	};

	getData.listen(function (msg) {

		getData.targetOrigin = msg.origin;

		switch (msg.api) {
		case 'getRelevanceList':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/targetChannels',
				msg: msg
			}));
			break;
		case 'getDutyStatus':
			// deprecated
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
				url: '/v1/webimplugin/visitors/' + msg.data.id + '/schedule-data?techChannelInfo=' + msg.data.orgName + '%23'
					+ msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getExSession':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/visitors/' + msg.data.id + '/schedule-data-ex?techChannelInfo=' + msg.data.orgName +
					'%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
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
				url: '/v1/webimplugin/visitors/' + msg.data.id + '/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' +
					msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'getGroupNew':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenant/' + msg.data.tenantId + '/visitors/' + msg.data.id +
					'/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber
					+ '&tenantId=' + msg.data.tenantId,
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
			// deprecated
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
				url: '/v1/webimplugin/tenants/' + msg.data.tenantId + '/visitors/' + msg.data.visitorId +
					'/attributes?tenantId=' + msg.data.tenantId,
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
				url: '/tenants/' + msg.data.tenantId + '/projects/' + msg.data.projectId + '/tickets?tenantId=' + msg.data.tenantId
					+ '&easemob-target-username=' + msg.data['easemob-target-username'] + '&easemob-appkey=' + msg.data[
						'easemob-appkey'] + '&easemob-username=' + msg.data['easemob-username'],
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
			// 没有token时不发送请求
			if (msg.data.token) return;
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
		case 'messagePredict':
			// fake: 避免多余的参数传递到 post body 中
			// todo：改进ajax，避免post时多传参数
			var tenantId = msg.data.tenantId;
			var agentId = msg.data.agentId;

			delete msg.data.tenantId;
			delete msg.data.agentId;

			easemobim.emajax(createObject({
				url: '/v1/webimplugin/agents/'
					+ agentId
					+ '/messagePredict'
					+ '?tenantId='
					+ tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'getSessionQueueId':
			var visitorUsername = msg.data.visitorUsername;
			easemobim.emajax(createObject({
				url: '/v1/visitors/' + visitorUsername + '/waitings/sessions',
				msg: msg,
				type: 'GET'
			}));
			break;
		case 'getWaitListNumber':
			easemobim.emajax(createObject({
				url: '/v1/visitors/waitings/data',
				msg: msg,
				type: 'GET'
			}));
			break;
		case 'getDutyStatus_2':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenants/show-message',
				msg: msg
			}));
			break;
		case 'getRobertGreeting_2':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/tenants/robots/welcome',
				msg: msg
			}));
			break;
		case 'getAgentInputState':
			easemobim.emajax(createObject({
				url: '/v1/webimplugin/sessions/' + msg.data.serviceSessionId
				+ '/agent-input-state?tenantId=' + msg.data.tenantId
				+ '&orgName=' + msg.data.orgName + '&appName='+ msg.data.appName 
				+ '&userName=' + msg.data.username + '&token=' + msg.data.token,
				msg: msg,
				excludeData: true
			}));
			break;
		case 'closeServiceSession':
			var ssid = msg.data.serviceSessionId;
			delete msg.data.serviceSessionId;
			easemobim.emajax(createObject({
				url: '/webimplugin/tenants/' + msg.data.tenantId
				+ '/visitors/' + msg.data.userName
				+ '/servicesessions/' + ssid
				+ '/stop?tenantId=' + msg.data.tenantId,
				msg: msg,
				type: 'POST'
			}));
			break;
		case 'uploadImgMsgChannel':
			easemobim.emajax(createObject({
				url: '/v1/Tenant/' + msg.data.tenantId
					+ '/' + msg.data.orgName + '/' + msg.data.appName
					+ '/' + msg.data.userName +'/MediaFiles',
				msg: msg,
				isFileUpload: true,
				type: 'POST'
			}));
			break;
		default:
			break;
		}
	}, ['data']);
}());

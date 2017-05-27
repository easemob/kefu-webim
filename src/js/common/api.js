// 此文件用于跨域请求api，故为了兼容老版本，接口不能删
// 新增接口一律写在后边，按照时间顺序
// 主要入口的url上附加tenantId，用于限流
// post 请求时，所以msg.data参数都会被序列化为request body，如果需要去除参数需要使用 delete

(function (emajax, Transfer) {
	// 此处由于要兼容老版本，所以在实例化对象时不能指定 useObject = true，而是依据 options.msg.useObject 来判断
	var getData = new easemobim.Transfer(null, 'api');

	function emitAjax(options) {
		var headers = null;
		var msg = options.msg;
		var data = msg.data;
		var useObject = msg.useObject;
		var api = msg.api;
		var timestamp = msg.timespan;

		if (data && data.headers) {
			headers = data.headers;
			delete data.headers;
		}

		easemobim.emajax({
			url: options.url,
			headers: headers,
			data: options.excludeData ? null : data,
			type: options.type,
			isFileUpload: options.isFileUpload,
			success: function (resp) {
				try {
					resp = JSON.parse(resp);
				}
				catch (e) {}
				getData.send({
					call: api,
					timespan: timestamp,
					status: 0,
					data: resp,
					useObject: useObject
				});
			},
			error: function (resp) {
				try {
					resp = JSON.parse(resp);
				}
				catch (e) {}
				getData.send({
					call: api,
					timespan: timestamp,
					status: 1,
					data: resp,
					useObject: useObject
				});
			}
		});
	}

	getData.listen(function (msg) {
		var apiName = msg.api;
		var params = msg.data || {};
		var tenantId = params.tenantId;
		var techChannelInfo = params.orgName
			+ '%23' + params.appName
			+ '%23' + params.imServiceNumber;

		getData.targetOrigin = msg.origin;

		switch (apiName) {
		case 'getRelevanceList':
			emitAjax({
				url: '/v1/webimplugin/targetChannels',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getDutyStatus':
			// deprecated
			emitAjax({
				url: '/v1/webimplugin/showMessage',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getWechatVisitor':
			emitAjax({
				url: '/v1/webimplugin/visitors/wechat/' + params.openid
					+ '?tenantId=' + tenantId,
				msg: msg,
				type: 'POST'
			});
			break;
		case 'createVisitor':
			emitAjax({
				url: '/v1/webimplugin/visitors?tenantId=' + tenantId,
				msg: msg,
				type: 'POST'
			});
			break;
		case 'getSession':
			// deprecated
			emitAjax({
				url: '/v1/webimplugin/visitors/' + params.id
					+ '/schedule-data?techChannelInfo=' + techChannelInfo
					+ '&tenantId=' + tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getExSession':
			emitAjax({
				url: '/v1/webimplugin/visitors/' + params.id
					+ '/schedule-data-ex?techChannelInfo=' + techChannelInfo
					+ '&tenantId=' + tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getPassword':
			emitAjax({
				url: '/v1/webimplugin/visitors/password',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getGroup':
			// deprecated
			emitAjax({
				url: '/v1/webimplugin/visitors/' + params.id
					+ '/ChatGroupId?techChannelInfo=' + techChannelInfo
					+ '&tenantId=' + tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getGroupNew':
			// deprecated
			emitAjax({
				url: '/v1/webimplugin/tenant/' + tenantId
					+ '/visitors/' + params.id +
					'/ChatGroupId?techChannelInfo=' + techChannelInfo
					+ '&tenantId=' + tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getHistory':
			// deprecated
			emitAjax({
				url: '/v1/webimplugin/visitors/msgHistory',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getSlogan':
			emitAjax({
				url: '/v1/webimplugin/notice/options',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getTheme':
			emitAjax({
				url: '/v1/webimplugin/theme/options',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getSystemGreeting':
			emitAjax({
				url: '/v1/webimplugin/welcome',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getRobertGreeting':
			// deprecated
			emitAjax({
				url: '/v1/Tenants/'
					+ tenantId
					+ '/robots/visitor/greetings/'
					+ params.originType
					+ '?tenantId=' + tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'sendVisitorInfo':
			emitAjax({
				url: '/v1/webimplugin/tenants/' + tenantId
					+ '/visitors/' + params.visitorId +
					'/attributes?tenantId=' + tenantId,
				msg: msg,
				type: 'POST'
			});
			break;
		case 'getProject':
			emitAjax({
				url: '/tenants/' + tenantId + '/projects',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getConfig':
			emitAjax({
				url: '/v1/webimplugin/settings/visitors/configs/' + params.configId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'createTicket':
			emitAjax({
				url: '/tenants/' + tenantId
					+ '/projects/' + params.projectId
					+ '/tickets?tenantId=' + tenantId
					+ '&easemob-target-username=' + params['easemob-target-username']
					+ '&easemob-appkey=' + params[ 'easemob-appkey']
					+ '&easemob-username=' + params['easemob-username'],
				msg: msg,
				type: 'POST'
			});
			break;
		case 'receiveMsgChannel':
			emitAjax({
				url: '/v1/imgateway/messages',
				type: 'GET',
				msg: msg
			});
			break;
		case 'sendMsgChannel':
			emitAjax({
				url: '/v1/imgateway/messages?tenantId=' + tenantId,
				msg: msg,
				type: 'POST'
			});
			break;
		case 'getAgentStatus':
			// 没有token时不发送请求
			if (!params.token){
				console.error('token does not exist.');
				return;
			}
			emitAjax({
				url: '/v1/tenants/' + tenantId
					+ '/agents/' + params.agentUserId + '/agentstate',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getNickNameOption':
			emitAjax({
				url: '/v1/webimplugin/agentnicename/options?tenantId=' + tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
			// 此接口使用的是单独的微服务，无需限流
		case 'reportEvent':
			emitAjax({
				url: '/v1/event_collector/events',
				msg: msg,
				type: 'POST'
			});
			break;
		case 'deleteEvent':
			emitAjax({
				url: '/v1/event_collector/event/' + encodeURIComponent(params.userId),
				msg: msg,
				type: 'DELETE',
				excludeData: true
			});
			break;
		case 'mediaStreamUpdateStatus':
			// patch
			var streamId = params.streamId;
			delete params.streamId;

			emitAjax({
				url: '/v1/rtcmedia/media_streams/' + streamId,
				msg: msg,
				type: 'PUT'
			});
			break;
		case 'graylist':
			emitAjax({
				url: '/management/graylist',
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getCurrentServiceSession':
			emitAjax({
				url: '/v1/webimplugin/tenant/'
					+ tenantId
					+ '/visitors/'
					+ params.id
					+ '/CurrentServiceSession?techChannelInfo=' + techChannelInfo
					+ '&tenantId='
					+ tenantId,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'messagePredict':
			// fake: 避免多余的参数传递到 post body 中
			var _tmpTenantId = params.tenantId;
			var _tmpAgentId = params.agentId;

			delete params.tenantId;
			delete params.agentId;

			emitAjax({
				url: '/v1/webimplugin/agents/'
					+ _tmpAgentId
					+ '/messagePredict'
					+ '?tenantId='
					+ _tmpTenantId,
				msg: msg,
				type: 'POST'
			});
			break;
		case 'getSessionQueueId':
			var visitorUsername = params.visitorUsername;
			emitAjax({
				url: '/v1/visitors/' + visitorUsername + '/waitings/sessions',
				msg: msg,
				type: 'GET'
			});
			break;
		case 'getWaitListNumber':
			emitAjax({
				url: '/v1/visitors/waitings/data',
				msg: msg,
				type: 'GET'
			});
			break;
		case 'getDutyStatus_2':
			emitAjax({
				url: '/v1/webimplugin/tenants/show-message',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getRobertGreeting_2':
			emitAjax({
				url: '/v1/webimplugin/tenants/robots/welcome',
				type: 'GET',
				msg: msg
			});
			break;
		// 会话创建前 获取该会话  是否将于机器人进行
		case 'getRobertIsOpen':
			emitAjax({
				url: '/v1/webimplugin/tenants/robot-ready',
				type: 'GET',
				msg: msg
			});
			break;
		case 'getAgentInputState':
			emitAjax({
				url: '/v1/webimplugin/sessions/' + params.serviceSessionId
				+ '/agent-input-state?tenantId=' + tenantId
				+ '&orgName=' + params.orgName + '&appName='+ params.appName 
				+ '&userName=' + params.username + '&token=' + params.token,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'closeServiceSession':
			var ssid = params.serviceSessionId;
			delete params.serviceSessionId;
			emitAjax({
				url: '/webimplugin/tenants/' + tenantId
				+ '/visitors/' + params.userName
				+ '/servicesessions/' + ssid
				+ '/stop?tenantId=' + tenantId,
				msg: msg,
				type: 'POST'
			});
			break;
		case 'uploadImgMsgChannel':
			emitAjax({
				url: '/v1/Tenant/' + tenantId
					+ '/' + params.orgName + '/' + params.appName
					+ '/' + params.userName +'/MediaFiles',
				msg: msg,
				isFileUpload: true,
				type: 'POST'
			});
			break;
		case 'getVisitorInfo':
			emitAjax({
				url: '/v1/webimplugin/tenants/' + tenantId
					+ '/visitors?orgName=' + params.orgName
					+ '&appName=' + params.appName
					+ '&userName=' + params.userName
					+ '&token=' + params.token
					+ '&techChannelInfo=' + techChannelInfo,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getOfficalAccounts':
			emitAjax({
				url: '/v1/webimplugin/tenants/' + tenantId
					+ '/visitors/' + params.visitorId
					+ '/official-accounts?page=0&size=100'
					+ '&orgName=' + params.orgName
					+ '&appName=' + params.appName
					+ '&userName=' + params.userName
					+ '&token=' + params.token,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		case 'getOfficalAccountMessage':
			emitAjax({
				url: '/v1/webimplugin/tenants/' + tenantId
					+ '/visitors/' + params.visitorId
					+ '/official-accounts/' + params.officialAccountId
					+ '/messages'
					+ '?size=' + params.size
					// 当startId为空时不传
					+ (params.startId ? '&startId=' + params.startId : '')
					+ '&direction=' + params.direction
					+ '&orgName=' + params.orgName
					+ '&appName=' + params.appName
					+ '&userName=' + params.userName
					+ '&token=' + params.token,
				msg: msg,
				type: 'GET',
				excludeData: true
			});
			break;
		default:
			console.error('unexpect api name: ' + apiName);
			break;
		}
	}, ['data']);
}(easemobim.emajax, easemobim.Transfer));

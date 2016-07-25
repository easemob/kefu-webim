;(function () {
    var getData = new easemobim.Transfer();

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
                    url: '/v1/webimplugin/visitors/password?tenantId=' + msg.data.tenantId,
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
            case 'getProject':
                easemobim.emajax(createObject({
                    url: '/tenants/' + msg.data.tenantId + '/projects',
                    msg: msg
                }));
                break;
            case 'createTicket':
                easemobim.emajax(createObject({
                    url: '/tenants/' + msg.data.tenantId + '/projects/' + msg.data.projectId + '/tickets?tenantId=' + msg.data.tenantId + '&easemob-target-username=' + msg.data['easemob-target-username'] + '&easemob-appkey=' + msg.data['easemob-appkey'] + '&easemob-username=' + msg.data['easemob-username'],
                    msg: msg,
                    type: 'POST'
                }));
                break;
            default:
                break;
        }
    });
}());

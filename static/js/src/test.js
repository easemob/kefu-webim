;(function () {
    var getData = new easemobIM.Transfer();

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
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/targetChannels', 
                    msg: msg
                }));
                break;
            case 'getDutyStatus':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/showMessage',
                    msg: msg
                }));
                break;
            case 'createVisitor':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/visitors?tenantId=' + msg.data.tenantId,
                    msg: msg,
                    type: 'POST'
                }));
                break;
            case 'getSession':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/visitors/' + msg.data.id + '/CurrentServiceSession?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
                    msg: msg,
                    excludeData: true
                }));
                break;
            case 'getPassword':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/visitors/password',
                    msg: msg
                }));
                break;
            case 'getGroup':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/visitors/' + msg.data.id + '/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId,
                    msg: msg,
                    excludeData: true
                }));
                break;
            case 'getHistory':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/visitors/msgHistory',
                    msg: msg
                }));
                break;
            case 'getSlogan':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/notice/options',
                    msg: msg
                }));
                break;
			case 'getSystemGreeting':
                easemobIM.emajax(createObject({
                    url: '/v1/webimplugin/welcome',
                    msg: msg
                }));
                break;
			case 'getRobertGreeting':
                easemobIM.emajax(createObject({
                    url: '/v1/Tenants/' + msg.data.tenantId + '/robots/visitor/greetings',
                    msg: msg
                }));
                break;
			case 'sendVisitorInfo':
                easemobIM.emajax(createObject({
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

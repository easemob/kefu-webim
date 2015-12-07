;(function () {
    var getData = new easemobIM.Transfer();

    var createObject = function ( url, msg, type ) {
        return {
            url: url
            , data: msg.data
            , type: type || 'GET'
            , success: function ( info ) {
                try {
                    info = JSON.parse(info);
                } catch ( e ) {}
                getData.send({
                    call: msg.api
                    , timespan: msg.timespan
                    , status: 0
                    , data: info
                });
            }
            , error: function ( info ) {
                try {
                    info = JSON.parse(info);
                } catch ( e ) {}
                getData.send({
                    call: msg.api
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
                easemobIM.emajax(createObject('/v1/webimplugin/targetChannels', msg));
                break;
            case 'getDutyStatus':
                easemobIM.emajax(createObject('/v1/webimplugin/timeOffDuty', msg));
                break;
            case 'createVisitor':
                easemobIM.emajax(createObject('/v1/webimplugin/visitors', msg, 'POST'));
                break;
            case 'getSession':
                easemobIM.emajax(createObject('/v1/webimplugin/visitors/' + msg.data.id + '/CurrentServiceSession?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId, msg));
                break;
            case 'getPassword':
                easemobIM.emajax(createObject('/v1/webimplugin/visitors/password', msg));
                break;
            case 'getGroup':
                easemobIM.emajax(createObject('/v1/webimplugin/visitors/' + msg.data.id + '/ChatGroupId?techChannelInfo=' + msg.data.orgName + '%23' + msg.data.appName + '%23' + msg.data.imServiceNumber + '&tenantId=' + msg.data.tenantId, msg));
                break;
            case 'getHistory':
                easemobIM.emajax(createObject('/v1/webimplugin/visitors/msgHistory', msg));
                break;
            default:
                break;
        }
    });
}());

var EasemobWidget = EasemobWidget || {};
EasemobWidget.api = {

    //get channel 相关信息
    getTo: function ( tenantId ) {
        return $.ajax({
			url: '/v1/webimplugin/targetChannels'
			, data: {
				tenantId: tenantId
			}
			, cache: true 
		}).then(function ( r ) { return r; });
    }

    //get 上下班状态
    , getStatus: function ( tenantId ) {
        return $.ajax({
			url: '/v1/webimplugin/timeOffDuty'
			, data: {
				tenantId: tenantId
			}
			, cache: false
		}).then(function ( r ) { return r; });
    }


    , getTheme: function ( tenantId ) {
        return $.ajax({
			url:'/v1/webimplugin/theme/options'
			, data: {
				tenantId: tenantId
			}
			, cache: false
		}).then(function ( r ) { return r; });
    }

    //get 广告语
    , getWord: function ( tenantId ) {
        return $.ajax({
			url: '/v1/webimplugin/notice/options'
			, data: {
				tenantId: tenantId
			}
			, cache: false
		}).then(function ( r ) { return r; });
    }

    , getPwd: function ( obj ) {
		return $.ajax({
			url: '/v1/webimplugin/visitors/password'
			, data: {
				userId: obj.user
			}
			, cache: false
		}).then(function ( r ) { return r; });
    }

    , getGroup: function ( obj ) {
        return $.ajax({
			url: ['/v1/webimplugin/visitors/',
				obj.user,
				'/ChatGroupId?techChannelInfo=',
				encodeURIComponent(obj.orgName + '#' + obj.appName + '#' + obj.to)].join('')
			, cache: false
		}).then(function ( r ) { return r; });
    }


    , getHistory: function ( from, size, chatGroupId, tenantId ) {
        return $.ajax({
			url: '/v1/webimplugin/visitors/msgHistory'
			, data:{
				fromSeqId: from 
				, size: size 
				, chatGroupId: chatGroupId
				, tenantId: tenantId
			}
			, cache: false
		}).then(function ( r ) { return r; });
    }

    
    , getUser: function ( obj ) {
        return $.ajax({
			url: '/v1/webimplugin/visitors'
			, contentType: 'application/json'
			, type: 'post'
			, data: JSON.stringify({
				orgName: obj.orgName
				, appName: obj.appName
				, imServiceNumber: obj.to
			})
		}).then(function ( r ) { return r; });
    }


    , getSession: function ( user, obj ) {
        return $.ajax({
			url: '/v1/webimplugin/visitors/' + user + '/CurrentServiceSession?techChannelInfo=' + obj.orgName + '%23' + obj.appName + '%23' + obj.to + '&tenantId=' + obj.json.tenantId
			, contentType: 'application/json'
		}).then(function ( r ) { return r; });
    }


    , getSystemGreeting: function ( obj ) {
        return $.ajax({
			url: '/v1/webimplugin/welcome?tenantId=' + obj.json.tenantId
			, contentType: 'application/json'
		}).then(function ( r ) { return r; });
    }


    , getRobertGreeting: function ( obj ) {
        return $.ajax({
			url: '/v1/Tenants/' + obj.json.tenantId + '/robots/visitor/greetings'
			, contentType: 'application/json'
		}).then(function ( r ) { return r; });
    }
};

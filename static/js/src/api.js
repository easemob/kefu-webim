var EasemobWidget = EasemobWidget || {};
EasemobWidget.api = {

    /*
        get channel 相关信息
    */
    getTo: function(tenantId){
        var getTo = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/targetChannels'
                , data: {
                    tenantId: tenantId
                }
                , cache: false
            })
            .done(function(info){
                getTo.resolve(info);
            })
            .fail(function(){
                getTo.reject();
            });
        });
        
        return getTo;
    }

    /*
        get 上下班状态
    */
    , getStatus: function(tenantId) {
        var getStatus = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/timeOffDuty'
                , data: {
                    tenantId: tenantId
                }
                , cache: false
            })
            .done(function(info){
                getStatus.resolve(info);
            })
            .fail(function(){
                getStatus.reject();
            });
        });

        return getStatus;
    }

    /*
        get theme
    */
    , getTheme: function(tenantId) {
        var getTheme = $.Deferred(function(){
            $.ajax({
                url:'/v1/webimplugin/theme/options'
                , data: {
                    tenantId: tenantId
                }
                , cache: false
            })
            .done(function(info){
                getTheme.resolve(info);
            })
            .fail(function(){
                getTheme.reject();
            });
        });
        
        return getTheme;
    }

    /*
        get 广告语
    */
    , getWord: function(tenantId) {
        var getWord = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/notice/options'
                , data: {
                    tenantId: tenantId
                }
                , cache: false
            })
            .done(function(info){
                getWord.resolve(info);
            })
            .fail(function(){
                getWord.reject();
            });
        });

        return getWord;
    }

    /*
        get pwd
    */
    , getPwd: function(obj) {
         var getPwd = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/visitors/password'
                , data: {
                    userId: obj.user
                }
                , cache: false
            })
            .done(function(info){
                getPwd.resolve(info);
            })
            .fail(function(){
                getPwd.reject();
            });
        });

        return getPwd;
    }

    /*
        get Group
    */
    , getGroup: function(obj) {
        var getGroup = $.Deferred(function(){
            $.ajax({
                url: ['/v1/webimplugin/visitors/',
                    obj.user,
                    '/ChatGroupId?techChannelInfo=',
                    encodeURIComponent(obj.orgName + '#' + obj.appName + '#' + obj.to)].join('')
                , cache: false
            })
            .done(function(info){
                getGroup.resolve(info);
            })
            .fail(function(){
                getGroup.reject();
            });
        });

        return getGroup;
    }

    /*
        get history
    */
    , getHistory: function(from, size, chatGroupId, tenantId) {
        var getHistory = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/visitors/msgHistory'
                , data:{
                    fromSeqId: from 
                    , size: size 
                    , chatGroupId: chatGroupId
                    , tenantId: tenantId
                }
                , cache: false
            })
            .done(function(info){
                getHistory.resolve(info);
            })
            .fail(function(){
                getHistory.reject();
            });
        });

        return getHistory;
    }

    /*
        create user
    */
    , getUser: function(obj) {
        var getUser = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/visitors'
                , contentType: 'application/json'
                , type: 'post'
                , data: JSON.stringify({
                    orgName: obj.orgName
                    , appName: obj.appName
                    , imServiceNumber: obj.to
                })
            })
            .done(function(info) {
                getUser.resolve(info);
            })
            .fail(function(){
                getUser.reject();
            });
        });

        return getUser;
    }
    /*
        get session
    */
    , getSession: function(user, obj) {
        var getSession = $.Deferred(function(){
            $.ajax({
                url: '/v1/webimplugin/visitors/' + user + '/CurrentServiceSession?techChannelInfo=' + obj.orgName + '%23' + obj.appName + '%23' + obj.to + '&tenantId=' + obj.json.tenantId
                , contentType: 'application/json'
            })
            .done(function(info) {
                getSession.resolve(info);
            })
            .fail(function(){
                getSession.reject();
            });
        });

        return getSession;
    }
};

/*
    version: 1.0.0
 */
;(function(window, undefined){
    
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    typeof HTMLAudioElement !== 'undefined' && (HTMLAudioElement.prototype.stop = function() {
        this.pause(); 
        this.currentTime = 0.0; 
    });

    var swfupload = null;
    var DEBUG = false;
    var historyStartId = 0;
    var listSpan = 50;
    var disableHistory = false;
    var config = EasemobWidget.utils.getConfig();
    config.json.hide = config.json.hide == 'false' ? false : config.json.hide;
    var tenantId = config.json.tenantId;
    var preview = config.json.preview;
    var pictype = {
        jpg : true,
        gif : true,
        png : true,
        bmp : true
    }
    DEBUG && (config = {
        json: {
            tenantId: '123'
            , preview: false
        }
        , offline: false
        , to: ''
        , orgName: 'easemob-demo'
        , appName: 'chatdemoui'
        , theme: '天空之城'
        , appkey: 'easemob-demo#chatdemoui'
        , word: 'testtest'
        , user: ''
        , password: ''
    }, setTimeout(function(){im.init()}, 0));
    if(!DEBUG) {    
    /*
        get info
    */
    var getTo = $.Deferred(function(){
        $.get('/v1/webimplugin/targetChannels', {tenantId: tenantId})
        .done(function(info){
            getTo.resolve(info);
        })
        .fail(function(){
            getTo.reject();
        });
    });
    var getStatus = $.Deferred(function(){
        $.get('/v1/webimplugin/timeOffDuty', {tenantId: tenantId})
        .done(function(info){
            getStatus.resolve(info);
        })
        .fail(function(){
            getStatus.reject();
        });
    });
    var getTheme = $.Deferred(function(){
        $.get('/v1/webimplugin/theme/options', {tenantId: tenantId})
        .done(function(info){
            getTheme.resolve(info);
        })
        .fail(function(){
            getTheme.reject();
        });
    });
    var getWord = $.Deferred(function(){
        $.get('/v1/webimplugin/notice/options', {tenantId: tenantId})
        .done(function(info){
            getWord.resolve(info);
        })
        .fail(function(){
            getWord.reject();
        });
    });
    $.when(getTo, getStatus, getTheme, getWord)
    .done(function(toinfo, sinfo, tinfo, winfo){

        config.offline = sinfo;
        if(toinfo.length > 0) {
            config.to = toinfo[0].imServiceNumber;
            config.orgName = toinfo[0].orgName;
            config.appName = toinfo[0].appName;
            config.tenantName = toinfo[0].tenantName;
            config.appkey = toinfo[0].orgName + '#' + toinfo[0].appName;
        } else {
            if(!preview) return;
        }

        config.theme = tinfo && tinfo.length ? tinfo[0].optionValue : '天空之城';
        config.word = winfo && winfo.length ? winfo[0].optionValue : '';

        if(!preview) {
            var curUser = im.getChannel() != (config.to + '#' + config.appkey) ? null : im.getUser();
            im.setChannel();
            if(curUser) {
                config.user = curUser;
                var getPwd = $.Deferred(function(){
                    $.get('/v1/webimplugin/visitors/password', {userId: curUser})
                    .done(function(info){
                        getPwd.resolve(info);
                    })
                    .fail(function(){
                        getPwd.reject();
                    });
                });
                var getGroup = $.Deferred(function(){
                    $.get('/v1/webimplugin/visitors/' + curUser + '/ChatGroupId?techChannelInfo='+escape(config.orgName + '#' + config.appName + '#' + config.to))
                    .done(function(info){
                        getGroup.resolve(info);
                    })
                    .fail(function(){
                        getGroup.reject();
                    });
                });
                $.when(getPwd, getGroup)
                .done(function(p, g){
                    config.group = g;
                    config.password = p;
                    !disableHistory && $.get('/v1/webimplugin/visitors/msgHistory', {
                        fromSeqId: historyStartId
                        , size: listSpan
                        , chatGroupId: g
                    })
                    .done(function(info){
                        if(info && info.length == listSpan) {
                            historyStartId = Number(info[listSpan - 1].chatGroupSeqId) - 1;
                            disableHistory = false;
                        } else {
                            disableHistory = true;
                        }
                        config.history = info;
                        im.init();
                    })
                    .fail(function(){});
                })
                .fail(function(){});
            } else {
                $.ajax({
                    url: '/v1/webimplugin/visitors'
                    , contentType: 'application/json'
                    , type: 'post'
                    , data: JSON.stringify({
                        orgName: config.orgName
                        , appName: config.appName
                        , imServiceNumber: config.to
                    })
                    , success: function(info) {
                        config.user = info.userId;
                        config.password = info.userPassword;
                        im.setUser();
                        im.init();
                    }
                });
            }
        } else {
            im.init();
        }
    })
    .fail(function(){});
}
    /*
        listen parent's msg
    */
    var message = new EmMessage().listenToParent(function(msg){
        switch(msg) {
            case 'imclick'://toggle chat window to show or hide 
                setTimeout(function(){
                    im.toggleChatWindow.call(im);
                }, 0);
                break;
            case 'showBtn':
                setTimeout(function(){
                    im.showFixedBtn.call(im);
                }, 0);
                break;
            default: break;
        }
    });
    
    /*
        core
    */
    var im = {
        init: function(){
            this.msgCount = 0;
            this.getDom();
            this.changeTheme();
            if(!config.json.hide && window.top != window) this.fixedBtn.removeClass('hide');
            this.fillFace();
            this.setWord();
            this.setTitle();
            (preview || window.top == window) && (!preview && this.min.addClass('hide'),this.toggleChatWindow());
            //this.audioAlert();//init audio
            this.mobileInit();
            this.setOffline();
            if(!Easemob.im.Helper.isCanUploadFileAsync && Easemob.im.Helper.isCanUploadFile && typeof uploadShim === 'function') {
                swfupload = uploadShim('easemobWidgetFileInput');
            }
            !preview && this.sdkInit();
            this.bindEvents();
            this.handleHistory();
        }
        , handleHistory: function(){
            if(config.history && config.history.length > 0) {
                
                $.each(config.history, function(k, v){
                
                    if(v.body && v.body.bodies.length > 0) {
                        var msg = v.body.bodies[0];
                        if(v.body.from == config.user) {
                            switch(msg.type) {
                                case 'img':
                                    im.sendImgMsg(msg);
                                    break;
                                case 'txt':
                                    im.sendTextMsg(msg);
                                    break;
                            }
                        } else {
                            im.receiveMsg(msg, msg.type, 'history');
                        }
                    }
                });
            }
        }
        , setTitle: function(){
            var nn = this.headBar.find('.easemobWidgetHeader-nickname');
            nn.html(config.tenantName);
            document.title = nn.html() + '-客服';
        }
        , mobileInit: function(){
            if(!EasemobWidget.utils.isMobile) return;
            this.Im.find('.easemobWidget-logo').hide();
            this.fixedBtn.css({width: '100%', top: '0'});
            this.fixedBtn.children().css({
                width: '100%'
                , 'border-radius': '0'
                , 'text-align': 'center'
                , 'font-size': '18px'
                , 'height': '40px'
                , 'line-height': '40px'
            });
            this.mobileLink.attr('href', location.href);
            this.sendbtn.removeClass('disabled').addClass('easemobWidgetSendBtn-mobile');
            this.headBar.addClass('easemobWidgetHeader-mobile');
            this.chatWrapper.parent().addClass('easemobWidgetBody-mobile');
            this.faceWrapper.parent().addClass('easemobWidget-face-wrapper-mobile');
            this.facebtn.addClass('easemobWidget-face-mobile');
            $('.easemobWidget-face-bg').addClass('easemobWidget-face-bg-mobile');
            this.uploadbtn.addClass('easemobWidget-file-mobile');
            this.sendbtn.parent().addClass('easemobWidgetSend-mobile');
            this.textarea.addClass('textarea-mobile');
            this.Im.find('.easeWidget-face-rec').addClass('easeWidget-face-rec-mobile');
        }
        , setWord: function(){
            if(config.word) {
                this.word.find('span').html(this.addLink(config.word));
            } else {
                this.word.addClass('hide');
                this.chatWrapper.parent().css('top', '43px');
            }
        }
        , fillFace: function(){
            var faceStr = '<li class="e-face">',
                count = 0;
            $.each(this.face_map, function(k, v){
                count += 1;
                faceStr += "<div class='easemobWidget-face-bg e-face'>\
                        <img class='easemobWidget-face-img e-face' src='resources/faces/"+v+".png' data-value="+k+" />\
                    </div>";
                if(count % 7 == 0) {
                    faceStr += '</li><li class="e-face">';
                }
            });
            if(count % 7 == 0) {
                faceStr = faceStr.slice(0, -('<li class="e-face">').length);
            } else {
                faceStr += '</li>';
            }
            this.faceWrapper.html(faceStr);
            faceStr = null;
        }
        , errorPrompt: function(msg) {
            var me = this;
            me.ePrompt.html(msg).removeClass('hide');
            setTimeout(function(){
                me.ePrompt.html(msg).addClass('hide');
            }, 1000); 
        }
        , changeTheme: function() {
            
            if(config.json.color) {
                var color = config.json.color;
                this.min.css('background-color', color);
                this.fixedBtn.children().css('background-color', color);
                this.headBar.css('background-color', color);
                this.sendbtn.css('background-color', color);
            } else if(config.theme) {
                if(!this.theme[config.theme]) config.theme = '天空之城';
                $('head').append('<link rel="stylesheet" href="http://172.16.4.206/webim/theme/'+config.theme+'.css" />');
            } 
        }
        , showFixedBtn: function() {
            !this.fixedBtn && this.getDom();
            config.to && this.fixedBtn.removeClass('hide');
        }
        , setOffline: function() {
            var me = this;
            if(!config.offline) {
                me.offline.addClass('hide');
                config.word && me.word.removeClass('hide');
                me.chatWrapper.parent().removeClass('hide');
                me.sendbtn.parent().removeClass('hide');
                me.dutyStatus.html('(在线)');
                me.headBar.find('.easemobWidgetHeader-bar').removeClass('offline').addClass('online');
                me.fixedBtn.find('a').removeClass('easemobWidget-offline-bg');
                return;
            }
            me.fixedBtn.find('a').addClass('easemobWidget-offline-bg');
            me.headBar.find('.easemobWidgetHeader-bar').removeClass('online').addClass('offline');
            me.offline.removeClass('hide');
            me.word.addClass('hide');
            me.chatWrapper.parent().addClass('hide');
            me.sendbtn.parent().addClass('hide');
            me.dutyStatus.html('(离线)');
        }
        , toggleChatWindow: function() {
            var me = this;
            if(window.top != window) {
                !config.json.hide && me.fixedBtn.toggleClass('hide');
                message.sendToParent(me.Im.hasClass('hide') ? 'showChat' : 'minChat');
                me.Im.toggleClass('hide');
            } else {
                me.Im.removeClass('hide');
            }

            if(me.Im.hasClass('hide')) {
                me.isOpened = false;
            } else {
                !EasemobWidget.utils.isMobile && me.textarea.get(0).focus();
                me.isOpened = true;
                me.messageCount.html('').addClass('hide');
                setTimeout(function(){!config.json.hide && me.fixedBtn.addClass('hide');}, 0);
            }
        }
        , sdkInit: function(){
            var me = this;
            me.conn = new Easemob.im.Connection();
            me.impromise = me.conn.init({
                https: location.potocol == 'https' ? true : false
                , onOpened: function(){
                    me.conn.setPresence();
                }
                , onTextMessage: function(message){
                    me.receiveMsg(message, 'txt');
                }
                , onEmotionMessage: function(message){
                    me.receiveMsg(message, 'face');
                }
                , onPictureMessage: function(message){
                    me.receiveMsg(message, 'img');
                }
                , onLocationMessage: function(message){
                    me.receiveMsg(message, 'location');
                }
                , onAudioMessage: function(message) {
                    me.receiveMsg(message, 'audio');
                }
                , onError: function(e){
                    switch(e.type){
                        case 1://offline
                            me.setFailedStatus();
                            me.open();
                            break;
                        case 8://conflict
                            break;
                        default:
                            break;
                    }
                }
            });
            me.open();
        }
        , setFailedStatus: function() {
            this.chatWrapper.find('.easemobWidget-right:last .easemobWidget-msg-status').removeClass('hide');
        }
        , open: function(){
            var me = this;
            this.conn.open({
                user : config.user
                , pwd : config.password
                , appKey : config.appkey
            });
        }
        , getDom: function(){
            this.offline = $('#easemobWidgetOffline');
            this.leaveMsgBtn = this.offline.find('button');
            this.contact = this.offline.find('input');
            this.leaveMsg = this.offline.find('textarea');
            this.fixedBtn = $('#easemobWidgetPopBar');
            this.Im = $('.easemobWidgetWrapper');
            this.audio = $('audio').get(0);
            this.chatWrapper = this.Im.find('.easemobWidget-chat');
            this.textarea = this.Im.find('.easemobWidget-textarea');
            this.sendbtn = this.Im.find('#easemobWidgetSendBtn');
            this.facebtn = this.Im.find('.easemobWidget-face');
            this.uploadbtn = this.Im.find('#easemobWidgetFile');
            this.realfile = this.Im.find('#easemobWidgetFileInput');
            this.faceWrapper = this.Im.find('.easemobWidget-face-container');
            this.headBar = this.Im.find('#easemobWidgetHeader');
            this.min = this.Im.find('.easemobWidgetHeader-min');
            this.closeWord = this.Im.find('.easemobWidget-word-close');
            this.word = this.Im.find('.easemobWidget-word');
            this.messageCount = this.fixedBtn.find('.easemobWidget-msgcount');
            this.ePrompt = this.Im.find('.easemobWidget-error-prompt');
            this.mobileLink = this.Im.find('#easemobWidgetLink');
            this.dutyStatus = this.Im.find('.easemobWidgetHeader-word-status');
        }
        , audioAlert: function(){
            var me = this;
            if(window.HTMLAudioElement && this.audio) {
                me.playaudio = function(){
                    !EasemobWidget.utils.isMobile &&  me.audio.play();
                }
            }
        }
        , getface: function(img){
            $.each(this.face_map, function(k, v){
                if(img == v){
                    return k;
                }
            });
            return '[):]';
        }
        , face: function(msg){
            var me = this;
            if($.isArray(msg)){
                msg = '[' + msg[0] + ']';
            }
            else if(/\[.*\]/.test(msg)){
                msg = msg.replace(/&amp;/g, '&');
                msg = msg.replace(/&#39;/g, '\'');
                msg = msg.replace(/&lt;/g, '\<');
                $.each(me.face_map, function(k, v){
                    while(msg.indexOf(k) >= 0){
                        msg = msg.replace(k, '<img class=\"chat-face-all\" src=\"resources/faces/' + me.face_map[k] + '.png\">');
                    }
                });
            }
            return msg;
        }
        , toggleFaceWrapper: function(e){
            im.faceWrapper.parent().toggleClass('hide');
            return false;
        }
        , bindEvents: function(){
            var me = this;
            me.closeWord.on('click', function(){
                me.word.fadeOut();
                me.chatWrapper.parent().css('top', '43px');
            });
            me.textarea.on('keyup change', function(){
                $(this).val() ? me.sendbtn.removeClass('disabled') : me.sendbtn.addClass('disabled');
            });
            me.min.on('mouseenter mouseleave', function(){
                $(this).toggleClass('hover-color');
            });
            me.facebtn.on('click', me.toggleFaceWrapper);//slide up and down face wrapper
            me.faceWrapper.on('click', 'img', function(){//face click event
                me.textarea.val(me.textarea.val()+$(this).data('value'));
                me.textarea.get(0).focus();
                me.sendbtn.removeClass('disabled');
            });
            me.fixedBtn.find('a').on('click', function(){
                if(EasemobWidget.utils.isMobile) {
                    $(this).attr({
                        target: '_blank'
                        , href: location.href
                    });
                } else {
                    me.toggleChatWindow();
                    me.scrollBottom();
                }
            });
            me.min.on('click', function(){
                me.toggleChatWindow();
            });
            me.realfile.on('change', function(){
                me.sendImgMsg();
            });
            $(document).on('click', function(ev){//hide face wrapper
                var e = window.event || ev;
                if(!$(e.srcElement || e.target).hasClass('e-face')) {
                    me.faceWrapper.parent().addClass('hide');
                }
            });
            me.uploadbtn.on('click', function(){
                if(!Easemob.im.Helper.isCanUploadFile) {
                    me.errorPrompt('当前浏览器不支持发送图片');
                    return false;    
                }
                if(preview) {
                    me.errorPrompt('预览状态不支持发送图片');
                    return false;    
                }
                me.realfile.get(0).click();
            });
            me.textarea.on("keydown", function(evt){
                var that = $(this);
                if(!EasemobWidget.utils.isMobile && evt.ctrlKey && evt.keyCode == 13){
                    that.val($(this).val()+'\n');
                    return false;
                } else if(evt.keyCode == 13) {
                    if(me.sendbtn.hasClass('disabled')) {
                        return false;
                    }
                    me.sendTextMsg();
                    setTimeout(function(){
                        that.val('');
                        EasemobWidget.utils.isMobile && that.blur();
                    }, 0);
                }
            });
            me.sendbtn.on('click', function(){
                if(me.sendbtn.hasClass('disabled')) {
                    return false;
                }
                me.sendTextMsg();
                EasemobWidget.utils.isMobile && me.textarea.blur();
            });
            me.leaveMsgBtn.on('click', function(){
                if(!me.contact.val() && !me.leaveMsg.val()) {
                    me.errorPrompt('联系方式和留言不能为空');
                } else if(!me.contact.val()) {
                    me.errorPrompt('联系方式');
                } else if(!me.leaveMsg.val()) {
                    me.errorPrompt('留言不能为空');
                } else if(!/^\d{5,11}$/g.test(me.contact.val()) 
                    && !/^[a-zA-Z0-9-_]+@[a-zA-Z0-9-][.][a-zA-Z]+$/g.test(me.contact.val())) {
                    me.errorPrompt('请输入正确的手机号码/邮箱/QQ号');
                } else {
                    if(preview) {
                        me.errorPrompt('预览状态不支持留言');
                        return;
                    }
                    me.conn.sendTextMessage({
                        to: config.to
                        , msg: '手机号码/邮箱/QQ号：' + me.contact.val() + '   留言：' + me.leaveMsg.val()
                        , type : 'chat'
                    });
                    me.errorPrompt('留言成功');
                    me.contact.val('');
                    me.leaveMsg.val('');
                }
            });
            var st, memPos = 0;
            me.chatWrapper.parent().on('scroll', function(){
                var $t = $(this);
                if(memPos >= $t.scrollTop()) {
                    clearTimeout(st);
                    st = setTimeout(function(){
                        if($t.scrollTop() < 200) {
                            !disableHistory && me.errorPrompt('正在玩命获取历史消息...');
                            !disableHistory && $.get('/v1/webimplugin/visitors/msgHistory', {
                                fromSeqId: historyStartId
                                , size: listSpan
                                , chatGroupId: config.group
                            })
                            .done(function(info){
                                if(info && info.length == listSpan) {
                                    historyStartId = Number(info[listSpan - 1].chatGroupSeqId) - 1;
                                    disableHistory = false;
                                } else {
                                    disableHistory = true;
                                }
                                config.history = info;
                                im.handleHistory();
                            });
                        }
                    }, 1000);
                }
                memPos = $t.scrollTop();
            });
        }
        , scrollBottom: function(){
            var ocw = this.chatWrapper.parent().get(0);
            setTimeout(function(){
                ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
            }, 0);
        }
        , sendImgMsg: function(msg) {
            var me = this;
            
            if(msg) {
                var temp = $("\
                    <div class='easemobWidget-right'>\
                        <div class='easemobWidget-msg-wrapper'>\
                            <i class='easemobWidget-right-corner'></i>\
                            <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                            <div class='easemobWidget-msg-container'>\
                                <a href='"+msg.url+"' target='_blank'><img src='"+msg.url+"' alt='' title='' target='_blank'/></a>\
                            </div>\
                        </div>\
                    </div>\
                ");
                me.chatWrapper.prepend(temp);
                return;
            }
            if(Easemob.im.Helper.isCanUploadFileAsync) {
                if(!me.realfile.val()) return;

                var file = Easemob.im.Helper.getFileUrl(me.realfile.attr('id'));

                var temp = $("\
                    <div class='easemobWidget-right'>\
                        <div class='easemobWidget-msg-wrapper'>\
                            <i class='easemobWidget-right-corner'></i>\
                            <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                            <div class='easemobWidget-msg-container'>\
                                <a href='"+file.url+"' target='_blank'><img src='"+file.url+"' alt='' title='' target='_blank'/></a>\
                            </div>\
                        </div>\
                    </div>\
                ");
                
            } else {
                
            }
            var opt = {
                fileInputId: me.realfile.attr('id')
                , to: config.to
                , type : 'chat'
                , onFileUploadError : function(error) {
                    me.setFailedStatus();
                }
                , onFileUploadComplete: function(data){
                    if(Easemob.im.Helper.isCanUploadFileAsync) {
                        me.chatWrapper.append(temp);
                    } else {
                        swfupload.settings.upload_success_handler();
                    }
                    me.scrollBottom();
                }
                , flashUpload: Easemob.im.Helper.isCanUploadFileAsync ? null : flashUpload
            };
            !preview && me.conn.sendPicture(opt);
            me.errorPrompt('图片发送中，请稍后...');
        }
        , encode: function(str){
            if (!str || str.length == 0) return "";
            var s = "";
            s = str.replace(/&/g, "&amp;");
            s = s.replace(/<(?=[^o][^)])/g, "&lt;");
            s = s.replace(/>/g, "&gt;");
            //s = s.replace(/\'/g, "&#39;");
            s = s.replace(/\"/g, "&quot;");
            s = s.replace(/\n/g, "<br>");
            return s;
        }
        , sendTextMsg: function(msg){
            var me = this;

            if(msg) {
                me.chatWrapper.prepend("\
                    <div class='easemobWidget-right'>\
                        <div class='easemobWidget-msg-wrapper'>\
                            <i class='easemobWidget-right-corner'></i>\
                            <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                            <div class='easemobWidget-msg-container'>\
                                <p>"+me.addLink(me.face(me.encode(msg.msg)))+"</p>\
                            </div>\
                        </div>\
                    </div>\
                ");
                return;
            }

            if(!me.textarea.val()) {
                return;
            }
            var txt = me.textarea.val();
            
            //local append
            me.chatWrapper.append("\
                <div class='easemobWidget-right'>\
                    <div class='easemobWidget-msg-wrapper'>\
                        <i class='easemobWidget-right-corner'></i>\
                        <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                        <div class='easemobWidget-msg-container'>\
                            <p>"+me.addLink(me.face(me.encode(txt)))+"</p>\
                        </div>\
                    </div>\
                </div>\
            ");
            me.textarea.val('');
            me.scrollBottom();
            !preview && me.conn.sendTextMessage({
                to: config.to
                , msg: txt
                , type : 'chat'
            });
            me.textarea.get(0).focus();// reset
        }
        , addLink: function(msg) {
            var reg = new RegExp('(http(s)?:\/\/|www\.)[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+', 'gm');
            var res = msg.match(reg);
            if(res && res.length) {
                msg = msg.replace(reg, "<a href='"+res[0]+"' target='_blank'>"+res[0]+"</a>");
            }
            return msg;
        }
        , addPrompt: function(){
            if(!this.isOpened) {
                if(this.msgCount > 9) {
                    this.messageCount.addClass('mutiCount').html('...');
                } else {
                    this.messageCount.removeClass('mutiCount').html(this.msgCount);
                }
            }
        }
        , receiveMsg: function(msg, type, isHistory){
            var me = this;
            var value = '';
            
            if(!isHistory && !me.isOpened) {
                me.messageCount.html('').removeClass('hide');
                me.msgCount += 1;
                me.addPrompt();
            }
            //me.playaudio();
            switch(type){
                case 'txt':
                    value = '<p>' + me.face(me.addLink(me.encode(isHistory ? msg.msg : msg.data))) + '</p>';
                    break;
                case 'face':
                    value = '<p>';
                    $.each(msg.data, function(k, v){
                        v.data = v.data.replace(/>/g, "&gt;");
                        if(0 > v.data.indexOf('data:image')) {
                            value += v.data;
                        } else {
                            value += '<img class="chat-face-all" src="'+v.data+'">';   
                        }
                    });
                    value += '</p>';
                    value = me.addLink(value);
                    break;
                case 'img':
                    value = '<a href="'+msg.url+'" target="_blank"><img src="'+(msg.thumb || msg.url)+'"></a>';   
                    break;
                default: break;
            }
            
            var temp = "\
                <div class='easemobWidget-left'>\
                    <div class='easemobWidget-msg-wrapper'>\
                        <i class='easemobWidget-left-corner'></i>\
                        <div class='easemobWidget-msg-container'>" + value +"</div>\
                        <div class='easemobWidget-msg-status hide'><i></i><span>发送失败</span></div>\
                    </div>\
                </div>";
            isHistory ? me.chatWrapper.prepend(temp) : (me.chatWrapper.append(temp),me.scrollBottom());
        }
        , theme: {
            '天空之城': {
                bgcolor: '#42b8f4'
                , bordercolor: '#00a0e7'
                , hovercolor:'#7dcdf7'
            }
            , '丛林物语': {
                bgcolor: '#00b45f'
                , bordercolor: '#009a51'
                , hovercolor:'#16cd77'
            }
            , '红瓦洋房': {
                bgcolor: '#b50e03'
                , bordercolor: '#811916'
                , hovercolor:'#e92b25'
            }
            , '鲜美橙汁': {
                bgcolor: '#f49300'
                , bordercolor: '#ce7800'
                , hovercolor:'#ffb030'
            }
            , '青草田间': {
                bgcolor: '#9ec100'
                , bordercolor: '#809a00'
                , hovercolor: '#bad921'
            }
            , '湖光山色': {
                bgcolor: '#00cccd' 
                , bordercolor: '#12b3b4'
                , hovercolor: '#38e6e7'
            }
            , '冷峻山峰': {
                bgcolor: '#5b799a' 
                , bordercolor: '#48627b'
                , hovercolor: '#6a8eb5'
            }
            , '月色池塘': {
                bgcolor: '#3977cf' 
                , bordercolor: '#2b599b'
                , hovercolor: '#548bdc'
            }
        }
        , face_map: {
            '[):]': 'ee_1',
            '[:D]': 'ee_2',
            '[;)]': 'ee_3',
            '[:-o]': 'ee_4',
            '[:p]': 'ee_5',
            '[(H)]': 'ee_6',
            '[:@]': 'ee_7',
            '[:s]': 'ee_8',
            '[:$]': 'ee_9',
            '[:(]': 'ee_10',
            '[:\'(]': 'ee_11',
            '[:|]': 'ee_12',
            '[(a)]': 'ee_13',
            '[8o|]': 'ee_14',
            '[8-|]': 'ee_15',
            '[+o(]': 'ee_16',
            '[<o)]': 'ee_17',
            '[|-)]': 'ee_18',
            '[*-)]': 'ee_19',
            '[:-#]': 'ee_20',
            '[:-*]': 'ee_21',
            '[^o)]': 'ee_22',
            '[8-)]': 'ee_23',
            '[(|)]': 'ee_24',
            '[(u)]': 'ee_25',
            '[(S)]': 'ee_26',
            '[(*)]': 'ee_27',
            '[(#)]': 'ee_28',
            '[(R)]': 'ee_29',
            '[({)]': 'ee_30',
            '[(})]': 'ee_31',
            '[(k)]': 'ee_32',
            '[(F)]': 'ee_33',
            '[(W)]': 'ee_34',
            '[(D)]': 'ee_35'
        }
        , setUser: function() {
            var date = new Date();
            date.setTime(date.getTime() + 30*24*3600*1000);
            document.cookie = 'emKefuUser=' + escape(config.user) + ';expires=' + date.toGMTString();
        }
        , getUser: function() {
            var results = document.cookie.match('(^|;) ?emKefuUser=([^;]*)(;|$)'); 
            return results ? (unescape(results[2])) : null; 
        }
        , setChannel: function() {
            var date = new Date();
            date.setTime(date.getTime() + 30*24*3600*1000);
            document.cookie = 'emKefuChannel=' + escape(config.to + '#' + config.appkey) + ';expires=' + date.toGMTString();
        }
        , getChannel: function() {
            var results = document.cookie.match('(^|;) ?emKefuChannel=([^;]*)(;|$)'); 
            return results ? (unescape(results[2])) : null; 
        }
    };
    
    /*
        upload by flash
    */
    var uploadShim = function(fileInputId) {
        if(!Easemob.im.Helper.isCanUploadFile) {
            return;
        }
        var pageTitle = document.title;
        var uploadBtn = $('#' + fileInputId);
        if(typeof SWFUpload === 'undefined' || uploadBtn.length < 1) return;

        return new SWFUpload({ 
            file_post_name: 'file'
            , flash_url: "js/swfupload/swfupload.swf"
            , button_placeholder_id: fileInputId
            , button_width: uploadBtn.width() || 120
            , button_height: uploadBtn.height() || 30
            , button_cursor: SWFUpload.CURSOR.HAND
            , button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT
            , file_size_limit: 10485760
            , file_upload_limit: 0
            , file_queued_handler: function(file) {
                if(this.getStats().files_queued > 1) {
                    this.cancelUpload();
                }
                if(!pictype[file.type.slice(1).toLowerCase()]) {
                    im.errorPrompt('不支持此文件类型' + file.type);
                    this.cancelUpload();
                } else if(10485760 < file.size) {
                    im.errorPrompt('文件大小超过限制！请上传大小不超过10M的文件');
                    this.cancelUpload();
                } else {
                    im.sendImgMsg();
                }
            }
            , file_dialog_start_handler: function() {}
            , upload_error_handler: function(file, code, msg){
                if(code != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED && code != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED && code != SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED) {
                    im.errorPrompt('图片发送失败');
                }
            }
            , upload_complete_handler: function(){}
            , upload_success_handler: function(file, response){
                try{
                    var res = Easemob.im.Helper.parseUploadResponse(response);
                    
                    res = $.parseJSON(res);
                    //res.filename = file.name;
                    if(file && !file.url && res.entities && res.entities.length > 0) {
                        file.url = res.uri + '/' + res.entities[0].uuid;
                    }
                    var temp = $("\
                        <div class='easemobWidget-right'>\
                            <div class='easemobWidget-msg-wrapper'>\
                                <i class='easemobWidget-right-corner'></i>\
                                <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                                <div class='easemobWidget-msg-container'>\
                                    <a href='"+file.url+"' target='_blank'><img src='"+file.url+"' alt='' title='' target='_blank'/></a>\
                                </div>\
                            </div>\
                        </div>\
                    ");
                    im.chatWrapper.append(temp);
                } catch (e) {
                    im.errorPrompt('上传图片发生错误');
                }
            }
        });
    }

    /*
        提供上传接口
    */
    var flashUpload = function(url, options){
        swfupload.setUploadURL(url);
        swfupload.startUpload();
    }

}(window, undefined));















/***********************************************/
/*
case 'audio':
    var options = msg;
    options.onFileDownloadComplete = function(response, xhr) {

        var audio = document.createElement('audio');
        if (Easemob.im.Helper.isCanUploadFileAsync && ("src" in audio) && ("controls" in audio)) {
            var objectURL = window.URL.createObjectURL(response);
            audio = null;
            var temp = "\
                <div class='easemobWidget-left'>\
                    <div class='easemobWidget-msg-wrapper'>\
                        <i class='easemobWidget-left-corner'></i>\
                        <div class='easemobWidget-msg-container'>\
                            <i class='easemobWidget-msg-voice'></i>\
                            <audio src='"+objectURL+"' controls class='hide'/>\
                        </div>\
                        <div class='easemobWidget-msg-status hide'><i></i><span>发送失败</span></div>\
                    </div>\
                </div>";
            me.chatWrapper.append(temp);
            me.scrollBottom();
        } else {
            var temp = "\
                <div class='easemobWidget-left'>\
                    <div class='easemobWidget-msg-wrapper'>\
                        <i class='easemobWidget-left-corner'></i>\
                        <div class='easemobWidget-msg-container'>\
                            <i class='easemobWidget-msg-voice' data-id=''></i>\
                            <audio id='' class='hide' src='' controls/>\
                        </div>\
                        <div class='easemobWidget-msg-status hide'><i></i><span>发送失败</span></div>\
                    </div>\
                </div>";
            me.chatWrapper.append(temp);
            me.scrollBottom();
            audio = null;
        }
    };
    options.onFileDownloadError = function(e) {
        //appendMsg(from, contactDivId, e.msg + ",下载音频" + filename + "失败");
    };
    options.headers = {
        "Accept" : "audio/mp3"
    };
    Easemob.im.Helper.download(options);
    return ;
case 'location':
    value = "\
            <div class='easemobWidget-msg-mapinfo'>" + msg.addr + "</div>\
            <img class='easemobWidget-msg-mapico' src='theme/map.png' />";
    break;
***********************************************
var ts = 0;
me.chatWrapper.on('click', '.easemobWidget-msg-voice', function(){

    if(!Easemob.im.Helper.isCanUploadFileAsync || EasemobWidget.utils.isAndroid) {
        me.errorPrompt('当前浏览器不支持语音播放');
        return false;    
    }
    
    var $t = $(this),
        $a = $t.next(),
        aud = $a.get(0),
        cur = 0;
    var clear = function(){
        clearInterval(ts);
        $t.removeClass('one');
        $t.removeClass('two');
    }
    if(!aud.paused && !aud.ended && 0 < aud.currentTime) {
        aud.stop();
        clear();
        return false;
    }
    aud.play();
    $a.on('ended', function(){
        clear();
    });
    ts = setInterval(function(){
        cur += 1;
        switch(cur % 3) {
            case 0:
                $t.removeClass('two');
                break;
            case 1:
                $t.addClass('one');
                break;
            case 2:
                $t.removeClass('one');
                $t.addClass('two');
                break;
        }
        cur == 9999 && (cur = 0);
    }, 500);
    
});
DEBUG && (config = {
        json: {
            tenantId: '123'
            , preview: false
        }
        , offline: true
        , to: ''
        , orgName: 'easemob-demo'
        , appName: 'chatdemoui'
        , theme: '天空之城'
        , appkey: 'easemob-demo#chatdemoui'
        , word: 'testtest'
        , user: ''
        , password: ''
    }, setTimeout(function(){im.init()}, 0));
*/

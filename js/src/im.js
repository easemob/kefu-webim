/*
    im业务代码
    version: 1.0.0
 */
;(function(window, undefined){
    'use strict';
    
    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
    typeof HTMLAudioElement !== 'undefined' && (HTMLAudioElement.prototype.stop = function() {
        this.pause(); 
        this.currentTime = 0.0; 
    });

    var groupUser = '';//记录当前技能组对应的webim user
    var isGroupChat = false;//当前是否技能组聊天窗口
    var isShowDirect = false;
    var curGroup = '';//记录当前技能组，如果父级页面切换技能组，则直接打开chatwindow，不toggle   
    var swfupload = null;//flash 上传利器
    var https = location.protocol == 'https:' ? true : false;
    var click = EasemobWidget.utils.isMobile && ('ontouchstart' in window) 
        ? 'touchstart' 
        : 'click';

    
    //获取当前url所带的各种参数
    var config = EasemobWidget.utils.getConfig();

    config.root = window.top == window;//是否在iframe当中
    config.json.hide = config.json.hide == 'false' 
        ? false 
        : config.json.hide;

    //如果获取的历史记录条数小于EasemobWidget.LISTSPAN，则置为true，表明不需要再发送请求获取
    config.disableHistory = false
    config.historyStartId = 0//获取历史记录起始ID

    
    /*
        处理技能组user切换
    */
    var handleGroupUser = function() {
        groupUser 
        ? $.when(EasemobWidget.api.getPwd({user: groupUser}))
        .done(function(info){
            config.user = groupUser;
            config.password = info.userPassword;
            
            config.root 
            ? Emc.setcookie(curGroup, config.user) 
            : message.sendToParent('setgroupuser@' + config.user + '@emgroupuser@' + curGroup);

            im.open();

            im.toggleChatWindow(isShowDirect ? 'show' : '')
        })
        : $.when(EasemobWidget.api.getUser(config))
        .done(function(info){
            config.user = info.userId;
            config.password = info.userPassword;
            
            config.root 
            ? Emc.setcookie(curGroup, config.user) 
            : message.sendToParent('setgroupuser@' + config.user + '@emgroupuser@' + curGroup);

            im.open();

            im.toggleChatWindow(isShowDirect ? 'show' : '')
        });
    }


    /*
        监听父级窗口发来的消息
    */
    var message = new EmMessage().listenToParent(function(msg){
        var value;
        if(msg.indexOf('emgroup@') == 0) {//技能组消息
            value = msg.slice(8);
            msg = 'emgroup';
        } else if(msg.indexOf('@') > 0) {//从父级页面cookie读取相关信息
            value = msg.split('@')[1];
            msg = msg.split('@')[0];
        }

        switch(msg) {
            case 'imclick'://关闭 或 展开 iframe 聊天窗口
                isGroupChat = false;
                if(im && im.loaded) {
                    im.chatWrapper = $('#normal');
                    im.chatWrapper.removeClass('hide').siblings().addClass('hide');
                    config.user = im.curUser.user;
                    config.password = im.curUser.password;
                    im.open();
                    im.setTitle();
                    im.group = false;
                    im.toggleChatWindow(curGroup ? 'show' : '');
                } else {
                    im.toggleChatWindow();
                }
                curGroup = '';
                break;
            case 'emgroup'://技能组
                isGroupChat = true;


                var idx = value.indexOf('@emgroupuser@');

                if(idx > 0) {
                    groupUser = value.slice(1, idx);
                } else {
                    groupUser = null;
                }
                value = value.slice(idx + 13);

                if(curGroup != value) {
                    curGroup = value;
                    isShowDirect = true;
                } else {
                    isShowDirect = false;
                }


                if(im && im.loaded) {

                    if(!isShowDirect) {
                        im.toggleChatWindow();
                        return;
                    }

                    im.handleGroup(value);

                    handleGroupUser();
                } else {
                    isShowDirect
                    ? im.toggleChatWindow('show')
                    : im.toggleChatWindow()
                }

                break;
            default: break;
        }
    });
    
    /*
        聊天窗口所有业务代码
    */
    var im = ({
        
        init: function(){

            this.getDom();//绑定所有相关dom至this
            this.changeTheme();//设置相应主题

            //独立窗口不展示悬浮小按钮
            if(!config.json.hide && !config.root) this.fixedBtn.removeClass('hide');
            //独立页面
            config.root && (
                this.min.addClass('hide')//隐藏最小化按钮
                , this.toggleChatWindow()//展示聊天窗口内容
                , !!config.json.emgroup && im.handleGroup(config.json.emgroup)//处理技能组
            );
            
            //不支持异步upload的浏览器使用flash插件搞定
            if(!Easemob.im.Helper.isCanUploadFileAsync && Easemob.im.Helper.isCanUploadFile) {
                swfupload = uploadShim('easemobWidgetFileInput');
            }

            this.fillFace();//遍历FACE，添加所有表情
            this.setWord();//设置广告语
            this.setTitle();//设置im.html的标题
            //this.audioAlert();//init audio
            this.mobileInit();//h5 适配，为防止media query不准确，js动态添加class
            this.setOffline();//根据状态展示上下班不同view
            this.sdkInit();//调用js sdk相关api，初始化聊天相关操作

            this.loaded = true;//im ready
            this.handleEvents();//执行post过来的消息，清空事件列表

            this.bindEvents();//开始绑定dom各种事件
            this.handleHistory();//处理拿到的历史记录
            this.showFixedBtn();//展示悬浮小按钮

        }
        , setAttribute: function() {
            this.msgCount = 0;//未读消息数
            this.eventList = []//事件列表,防止iframe没有加载完，父级元素post过来消息执行出错
            this.scbT = 0//sroll bottom timeout stamp
            this.autoGrowOptions = {}
            this.historyFirst = true//第一次获取历史记录
            this.msgTimeSpan//用于处理1分钟之内的消息只显示一次时间
            
            return this;
        }
        , handleEvents: function() {
            this.eventList.length > 0 && this.eventList[0].call(this);
        }
        , handleGroup: function(type) {
            if(typeof type === 'string') {
                type = unescape(type);
                im.group = type;
                im.handleChatContainer(im.group);
            } else {
                if(!im.group) {
                    type.ext = {};
                    return;
                }
                type.ext = type.ext || {};
                type.ext.weichat = {
                    queueName: im.group          
                }
            }
        }
        , handleChatContainer: function(groupId) {
            var curChatContainer = $(document.getElementById(groupId));

            if(curChatContainer.length > 0) {
                this.chatWrapper = curChatContainer;
                this.setTitle(groupId);
                curChatContainer.removeClass('hide').siblings('.easemobWidget-chat').addClass('hide');
            } else {
                curChatContainer = $('<div id="' + groupId + '" class="easemobWidget-chat"></div>');
                this.chatWrapper.parent().prepend(curChatContainer);
                this.handleChatContainer(groupId);     
            }
        }
        , handleHistory: function(){
            var me = this;
            if(config.history && config.history.length > 0) {
                
                $.each(config.history, function(k, v){
                    
                    var wrapper = this.chatWrapper;
                    
                    var msg = v.body;
                    if(msg.ext && msg.ext.weichat) {
                        var groupId = msg.ext.weichat.queueName;
                        
                        if($('#' + groupId).length == 0) {
                            me.chatWrapper.parent()
                            .prepend($('<div id="' + groupId + '" class="easemobWidget-chat"></div>'));   
                        }
                        wrapper = $('#' + groupId);
                    } else {
                        wrapper = $('#normal');
                    }


    
                    if(v.body && v.body.bodies.length > 0) {
                        var msg = v.body.bodies[0];
                        if(v.body.from && v.body.from.indexOf('webim-visitor') > -1) {
                            switch(msg.type) {
                                case 'img':
                                    im.sendImgMsg(msg, wrapper);
                                    break;
                                case 'txt':
                                    im.sendTextMsg(msg, wrapper);
                                    break;
                            }
                        } else {
                            im.receiveMsg(msg, msg.type, 'history', wrapper);
                        }
                        /*
                            @param1:
                            @param2(boolean); true: 历史记录
                        */
                        im.addDate(v.timestamp || v.body.timestamp, true, wrapper);
                    }
                });

                //此坑防止第一次获取历史记录图片loaded后，不能滚动到底部
                if(im.historyFirst) {
                    im.chatWrapper.find('img:last').on('load', im.scrollBottom);
                    im.scrollBottom();
                    im.historyFirst = false;
                }
            }
        }
        , setTitle: function(title){
            var nn = this.headBar.find('.easemobWidgetHeader-nickname');
            
            nn.html(config.tenantName + (title ? '-' + title : ''));
            document.title = nn.html() + (title ? '' : '-客服');
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

            $.each(EasemobWidget.FACE, function(k, v){
                count += 1;
                faceStr += "<div class='easemobWidget-face-bg e-face'>\
                                <img class='easemobWidget-face-img e-face' \
                                    src='resources/faces/"+v+".png' \
                                    data-value="+k+" />\
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

            this.faceWrapper.html(faceStr), faceStr = null;
        }
        , errorPrompt: function(msg) {//暂时所有的提示都用这个方法
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
                if(!EasemobWidget.THEME[config.theme]) config.theme = '天空之城';
                $('head').append('<link rel="stylesheet" href="/webim/theme/'+config.theme+'.css" />');
            } 
        }
        , showFixedBtn: function() {
            !config.json.hide && this.fixedBtn.removeClass('hide');
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
        , toggleChatWindow: function(windowStatus) {
            var me = this;

            //not ready
            if(!me.loaded) {
                me.eventList = [];

                if(isGroupChat) {
                    me.eventList.push(function(){
                        handleGroupUser();
                    });  
                } else {
                    me.eventList.push(im.toggleChatWindow);
                }
                return;
            }

            if(!config.root) {
                setTimeout(function(){
                    !config.json.hide && me.fixedBtn.toggleClass('hide');
                }, 100);
                message.sendToParent(windowStatus == 'show' || me.Im.hasClass('hide') ? 'showChat' : 'minChat');
                windowStatus == 'show' 
                    ? (
                        me.fixedBtn.removeClass('hide')
                        , me.Im.removeClass('hide')
                    ) 
                    : me.Im.toggleClass('hide');
            } else {
                me.Im.removeClass('hide');
            }

            if(me.Im.hasClass('hide')) {
                me.isOpened = false;
            } else {
                me.textarea.focus();
                me.isOpened = true;
            }
            me.addPrompt();
        }
        , sdkInit: function(){
            var me = this;
            me.conn = new Easemob.im.Connection();
            me.conn.init({
                https: https ? true : false
                , url: (https ? 'https:' : 'http:') + '//im-api.easemob.com/http-bind/'
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
                , onReceivedMessage: function(message) {
                    me.addDate();
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
            me.curUser = {
                user: config.user
                , pwd: config.password
            };
            me.open();
        }
        , addDate: function(date, isHistory, wrapper) {
            var htmlPre = '<div class="easemobWidget-date">',
                htmlEnd = '</div>',
                fmt = 'M月d日 hh:mm';

            wrapper = wrapper || this.chatWrapper;

            if(!!date) {
                $(htmlPre + new Date(date).format(fmt) + htmlEnd)
                .insertAfter(wrapper.find('div:first')); 
            } else if(!isHistory) {
                if(!this.msgTimeSpan || (new Date().getTime() - this.msgTimeSpan > 60000)) {//间隔大于1min  show
                    wrapper.append(htmlPre + new Date().format(fmt) + htmlEnd); 
                }
                this.resetSpan();
            }
        }
        , resetSpan: function() {
            this.msgTimeSpan = new Date().getTime();
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
            $.each(EasemobWidget.FACE, function(k, v){
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
                $.each(EasemobWidget.FACE, function(k, v){
                    while(msg.indexOf(k) >= 0){
                        msg = msg.replace(k
                            , '<img class=\"chat-face-all\" src=\"resources/faces/' 
                                + EasemobWidget.FACE[k] 
                                + '.png\">');
                    }
                });
            }
            return msg;
        }
        , toggleFaceWrapper: function(e){
            var h = im.sendbtn.parent().outerHeight();
            im.faceWrapper.parent().css('bottom', h + 'px').toggleClass('hide');
            return false;
        }
        , bindEvents: function(){
            var me = this;

            //防止点击前进后退cache 导致的offline
            if('onpopstate' in window) {
                $(window).on('popstate', me.open);
            }

            //关闭广告语按钮
            me.closeWord.on(click, function(){
                me.word.fadeOut();
                me.chatWrapper.parent().css('top', '43px');
            });

            //autogrow  callback
            me.autoGrowOptions.callback = function() {
                var h = im.sendbtn.parent().outerHeight();
                im.faceWrapper.parent().css('bottom', h + 'px');
            };

            EasemobWidget.utils.isMobile && me.textarea.autogrow(me.autoGrowOptions);
            
            //
            me.textarea.on('keyup change', function(){
                $(this).val() ? me.sendbtn.removeClass('disabled') : me.sendbtn.addClass('disabled');
            })
            .on('touchstart', function(){//防止android部分机型滚动条常驻，看着像bug ==b
                me.scrollBottom('slow');
                me.textarea.css('overflow-y', 'auto');
                me.textarea.parent().css('bottom', '275px');
            })
            .on('blur', function(){
                me.textarea.parent().css('bottom', '0');
            });

            EasemobWidget.utils.isMobile && me.textarea.on('input', function(){
                me.autoGrowOptions.update();
                me.scrollBottom('slow');
            });

            //最小化按钮的多态
            me.min.on('mouseenter mouseleave', function(){
                $(this).toggleClass('hover-color');
            });

            //表情的展开和收起
            me.facebtn.on(click, me.toggleFaceWrapper);

            //表情的选中
            me.faceWrapper.on(click, '.easemobWidget-face-bg', function(e){
                e.originalEvent.preventDefault && e.originalEvent.preventDefault();
                !EasemobWidget.utils.isMobile && me.textarea.focus();
                me.textarea.val(me.textarea.val()+$(this).find('img').data('value'));
                if(EasemobWidget.utils.isMobile){
                    me.autoGrowOptions.update();//update autogrow
                    setTimeout(function(){
                        me.textarea.get(0).scrollTop = 10000;
                    }, 100);
                }
                me.sendbtn.removeClass('disabled');
                e.originalEvent.stopPropagation && e.originalEvent.stopPropagation();
            });

            //悬浮小按钮的点击事件
            me.fixedBtn.find('a').on('click', function(){
                if(EasemobWidget.utils.isMobile) {
                    $(this).attr({
                        target: '_blank'
                        , href: location.href
                    });
                } else {
                    me.chatWrapper.removeClass('hide').siblings().addClass('hide');
                    me.toggleChatWindow();
                    me.scrollBottom();
                }
            });

            //最小化按钮
            me.min.on('click', function(){
                me.toggleChatWindow();
            });

            //选中文件并发送
            me.realfile.on('change', function(){
                me.sendImgMsg();
            });

            //hide face wrapper
            $(document).on(click, function(ev){
                var e = window.event || ev,
                    t = $(e.srcElement || e.target);

                if(!t.hasClass('e-face')) {
                    me.faceWrapper.parent().addClass('hide');
                }
            });

            //主要用于移动端触发virtual keyboard的收起
            $('.e-face, .easemobWidgetBody-wrapper')
            .on('touchstart', function(e){
                me.textarea.blur();

                //此坑用于防止android部分机型滚动条常驻，看着像bug ==b
                !me.textarea.val() && me.textarea.css('overflow-y', 'hidden');
            });

            //弹出文件选择框
            me.uploadbtn.on(click, function(){
                if(!Easemob.im.Helper.isCanUploadFile) {
                    me.errorPrompt('当前浏览器不支持发送图片');
                    return false;    
                }
                
                me.realfile.get(0).click();
            });

            //hot key
            me.textarea.on("keydown", function(evt){
                var that = $(this);
                if((EasemobWidget.utils.isMobile && evt.keyCode == 13) 
                    || (evt.ctrlKey && evt.keyCode == 13) 
                    || (evt.shiftKey && evt.keyCode == 13)) {

                    that.val($(this).val()+'\n');
                    return false;
                } else if(evt.keyCode == 13) {
                    me.faceWrapper.parent().addClass('hide');
                    if(me.sendbtn.hasClass('disabled')) {
                        return false;
                    }
                    me.sendTextMsg();
                    setTimeout(function(){
                        that.val('');
                    }, 0);
                }
            });

            //不能用touch，无法触发focus
            me.sendbtn.on('click', function(){
                if(me.sendbtn.hasClass('disabled')) {
                    return false;
                }
                me.faceWrapper.parent().addClass('hide');
                me.sendTextMsg();
                me.scrollBottom('fast');
                me.textarea.css({
                    height: '34px'
                    , overflowY: 'hidden'
                }).focus();
            });

            //
            me.leaveMsgBtn.on(click, function(){
                if(!me.contact.val() && !me.leaveMsg.val()) {
                    me.errorPrompt('联系方式和留言不能为空');
                } else if(!me.contact.val()) {
                    me.errorPrompt('联系方式不能为空');
                } else if(!me.leaveMsg.val()) {
                    me.errorPrompt('留言不能为空');
                } else if(!/^\d{5,11}$/g.test(me.contact.val()) 
                    && !/^[a-zA-Z0-9-_]+@([a-zA-Z0-9-]+[.])+[a-zA-Z]+$/g.test(me.contact.val())) {
                    me.errorPrompt('请输入正确的手机号码/邮箱/QQ号');
                } else {
                    var opt = {
                        to: config.to
                        , msg: '手机号码/邮箱/QQ号：' + me.contact.val() + '   留言：' + me.leaveMsg.val()
                        , type : 'chat'
                    }
                    me.handleGroup(opt);
                    me.conn.sendTextMessage(opt);
                    //me.errorPrompt('留言成功');
                    var succeed = me.leaveMsgBtn.parent().find('.easemobWidget-leavemsg-success');
                    succeed.removeClass('hide');
                    setTimeout(function(){
                        succeed.addClass('hide');
                    }, 2000);
                    me.contact.val('');
                    me.leaveMsg.val('');
                }
            });

            //pc 和 wap 的上划加载历史记录的方法
            var st, memPos = 0, _startY, _y, touch, DIS=200, _fired=false;
            var triggerGetHistory = function(){
                
                !config.disableHistory && $.when(EasemobWidget.api.getHistory(
                    config.historyStartId
                    , EasemobWidget.LISTSPAN
                    , config.group
                    , config.json.tenantId
                ))
                .done(function(info){
                    if(info && info.length == EasemobWidget.LISTSPAN) {
                        config.historyStartId = Number(info[EasemobWidget.LISTSPAN - 1].chatGroupSeqId) - 1;
                        config.disableHistory = false;
                    } else {
                        config.disableHistory = true;
                    }
                    config.history = info;
                    im.handleHistory();
                });
            }

            //wap
            me.chatWrapper.parent().on('touchstart', function(e){
				var touch = e.originalEvent.touches;
                if(e.originalEvent.touches && e.originalEvent.touches.length>0) {
                    _startY = touch[0].pageY;
                }
            })
            .on('touchmove', function(e){
                var $t = $(this);
				var touch = e.originalEvent.touches;
                if(e.originalEvent.touches && e.originalEvent.touches.length>0) {

					touch = e.originalEvent.touches;
					_y = touch[0].pageY;
					if(_y-_startY > 8 && $t.scrollTop() <= 50) {
                        clearTimeout(st);
                        st = setTimeout(function(){
			    			triggerGetHistory();
                        }, 100);
					}
				}
            });

            //pc
            me.chatWrapper.parent().on('mousewheel DOMMouseScroll', function(e){
                var $t = $(this);
                
                if(e.originalEvent.wheelDelta % 120 > 0 || e.originalEvent.detail < 0) {//up
                    clearTimeout(st);
                    st = setTimeout(function(){
                        if($t.scrollTop() <= 50) {
                            triggerGetHistory();
                        }
                    }, 400);
                }
            });
        }
        , scrollBottom: function(type){
            var ocw = im.chatWrapper.parent().get(0);
            clearTimeout(this.scbT);
            var stamp;
            switch(type) {
                case 'fast':
                    stamp = 0;
                    break;
                case 'slow':
                    stamp = 800;
                    break;
                default: stamp = 500;
            }
            this.scbT = setTimeout(function(){
                ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
            }, stamp);
        }
        , sendImgMsg: function(msg, wrapper) {
            var me = this;
            wrapper = wrapper || me.chatWrapper;

            if(msg) {
                var temp = $("\
                    <div class='easemobWidget-right'>\
                        <div class='easemobWidget-msg-wrapper'>\
                            <i class='easemobWidget-right-corner'></i>\
                            <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                            <div class='easemobWidget-msg-container'>\
                                <a href='"+msg.url+"' target='_blank'><img src='"+msg.url+"'/></a>\
                            </div>\
                        </div>\
                    </div>\
                ");
                wrapper.prepend(temp);
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
                                <a href='"+file.url+"' target='_blank'><img src='"+file.url+"'/></a>\
                            </div>\
                        </div>\
                    </div>\
                ");
                
            } else {
                
            }
            var opt = {
                fileInputId: me.realfile.attr('id')
                , apiUrl: (https ? 'https:' : 'http:') + '//a1.easemob.com'
                , to: config.to
                , type : 'chat'
                , onFileUploadError : function(error) {
                    me.setFailedStatus();
                }
                , onFileUploadComplete: function(data){
                    if(Easemob.im.Helper.isCanUploadFileAsync) {
                        //me.chatWrapper.append(temp);
                    } else {
                        swfupload.settings.upload_success_handler();
                    }
                    me.scrollBottom();
                }
                , flashUpload: Easemob.im.Helper.isCanUploadFileAsync ? null : flashUpload
            };
            me.handleGroup(opt);
            me.conn.sendPicture(opt);
            me.chatWrapper.append(temp);
            me.chatWrapper.find('img:last').on('load', me.scrollBottom);
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
        , sendTextMsg: function(msg, wrapper){
            var me = this;
            wrapper = wrapper || me.chatWrapper;

            if(msg) {
                wrapper.prepend("\
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
            wrapper.append("\
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

            var opt = {
                to: config.to
                , msg: txt
                , type : 'chat'
            }
            me.handleGroup(opt);
            me.conn.sendTextMessage(opt);
        }
        , addLink: function(msg) {
            var reg = new RegExp('(http(s)?:\/\/|www[.])[a-zA-Z0-9-]+([.][a-zA-Z0-9-]+)+', 'gm');
            var res = msg.match(reg);
            if(res && res.length) {
                var prefix = /^https?:\/\//.test(res[0]);
                msg = msg.replace(reg
                    , "<a href='" 
                        + (prefix 
                            ? res[0] 
                            : '\/\/' + res[0]) 
                        + "' target='_blank'>" 
                        + res[0] 
                        + "</a>");
            }
            return msg;
        }
        , addPrompt: function(){//未读消息提醒，以及让父级页面title滚动
            if(!this.isOpened && this.msgCount > 0) {
                if(this.msgCount > 9) {
                    this.messageCount.addClass('mutiCount').html('...');
                } else {
                    this.messageCount.removeClass('mutiCount').html(this.msgCount);
                }
                message.sendToParent('msgPrompt');
            } else {
                this.msgCount = 0;
                this.messageCount.html('').addClass('hide');
                message.sendToParent('recoveryTitle');
            }
        }
        , receiveMsg: function(msg, type, isHistory, wrapper){
            var me = this;
            var value = '';
            
            wrapper = wrapper || me.chatWrapper;

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
            

            if(!isHistory) {
                wrapper.append(temp);
                me.addDate();
                me.resetSpan();
                me.scrollBottom();
            } else {
                wrapper.prepend(temp);
            }
        }
    }.setAttribute());
    

    EasemobWidget.getInfoFromApi(config, function() {
        im.init.call(im);
    });



    /*
        upload by flash
        param1: input file ID
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
                if(!EasemobWidget.PICTYPE[file.type.slice(1).toLowerCase()]) {
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
                if(!file || !response) return;
                try{
                    var res = Easemob.im.Helper.parseUploadResponse(response);
                    
                    res = $.parseJSON(res);
                    res.filename = file.name;
                    if(file && !file.url && res.entities && res.entities.length > 0) {
                        file.url = res.uri + '/' + res.entities[0].uuid;
                    }
                    var temp = $("\
                        <div class='easemobWidget-right'>\
                            <div class='easemobWidget-msg-wrapper'>\
                                <i class='easemobWidget-right-corner'></i>\
                                <div class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>\
                                <div class='easemobWidget-msg-container'>\
                                    <a href='"+file.url+"' target='_blank'><img src='"+file.url+"'/></a>\
                                </div>\
                            </div>\
                        </div>\
                    ");
                    im.chatWrapper.append(temp);
                    im.chatWrapper.find('img:last').on('load', im.scrollBottom);
                    this.uploadOptions.onFileUploadComplete(res);
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
        swfupload.uploadOptions = options;
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
*/

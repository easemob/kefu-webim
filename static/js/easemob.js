;(function () {

    var setDefault = function ( target, defaultValue ) {
        if ( typeof target === 'undefined' ) {
            return defaultValue;
        } else {
            return target;
        }
    };

    window.easemobIM = setDefault(window.easemobIM, {});
    easemobIM.config = setDefault(easemobIM.config, {});


    /**
     * 开发版无需在环信客服后台做网页插件相关设置，以下面参数为主
     * 配置以及回调
     * 主题可自定义色值，更改static/css/im.css文件的末尾.theme-color, .bg-color, .border-color等
     */
    ////必填////
    easemobIM.config.tenantId = setDefault(easemobIM.config.tenantId || '');//企业id
    easemobIM.config.to = setDefault(easemobIM.config.to, '');//必填, 指定关联对应的im号
    easemobIM.config.appKey = setDefault(easemobIM.config.appKey, '');//必填, appKey


    ////非必填////
    easemobIM.config.buttonText = setDefault(easemobIM.config.buttonText, '联系客服');//设置小按钮的文案
    easemobIM.config.hide = setDefault(easemobIM.config.hide, false);//是否隐藏小的悬浮按钮
    easemobIM.config.mobile = setDefault(easemobIM.config.mobile, /mobile/i.test(navigator.userAgent));//是否做移动端适配
    easemobIM.config.dragEnable = setDefault(easemobIM.config.dragEnable, false);//是否允许拖拽
    easemobIM.config.dialogWidth = setDefault(easemobIM.config.dialogWidth, '400px');//聊天窗口宽度,建议宽度不小于400px
    easemobIM.config.dialogHeight = setDefault(easemobIM.config.dialogHeight, '500px');//聊天窗口高度,建议宽度不小于500px
    easemobIM.config.defaultAvatar = setDefault(easemobIM.config.defaultAvatar, 'static/img/avatar.png');//默认头像
    easemobIM.config.minimum = setDefault(easemobIM.config.minimum, true);//是否允许窗口最小化，如不允许则默认展开
    easemobIM.config.visitorSatisfactionEvaluate = setDefault(easemobIM.config.visitorSatisfactionEvaluate, true);//是否允许访客主动发起满意度评价
    easemobIM.config.soundReminder = setDefault(easemobIM.config.soundReminder, true);//是否启用声音提醒
    easemobIM.config.imgView = setDefault(easemobIM.config.imgView, true);//是否启动图片点击放大功能
    easemobIM.config.fixedButtonPosition = setDefault(easemobIM.config.fixedButtonPosition, {x: '10px', y: '10px'});//悬浮初始位置，坐标以视口右边距和下边距为基准
    easemobIM.config.dialogPosition = setDefault(easemobIM.config.dialogPosition, {x: '10px', y: '10px'});//窗口初始位置，坐标以视口右边距和下边距为基准
    easemobIM.config.titleSlide = setDefault(easemobIM.config.titleSlide, true);//是否允许收到消息的时候网页title滚动
    easemobIM.config.error = setDefault(easemobIM.config.error, function ( error ) { /*alert(error);*/ });//错误回调
    easemobIM.config.onReceive = setDefault(easemobIM.config.onReceive, function ( from, to, message ) { /*console.log('收到一条消息', arguments);*/ });//收消息回调
    easemobIM.config.base = '//sandbox3.kefu.easemob.com';

    easemobIM.config.authMode = setDefault(easemobIM.config.authMode, 'token' || 'password');//验证方式
    easemobIM.config.user = setDefault(easemobIM.config.user, {
        //可集成自己的用户，如不集成，则使用当前的appkey创建随机访客
        name: '',//集成时必填
        password: '',//authMode设置为password时必填,与token二选一
        token: ''//authMode设置为token时必填,与password二选一
    });


    var webim = document.createElement('div'),
        head = document.getElementsByTagName('head')[0];

    webim.id = 'EasemobKefuWebim';
    webim.style.display = 'none';
    if ( easemobIM.config.mobile ) {
        webim.className = 'em-mobile';
    }

    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.href = 'static/css/im.css';
    head.appendChild(link);
    
    webim.innerHTML = "\
        <div id='easemobWidgetPopBar'" + (easemobIM.config.hide || !easemobIM.config.minimum ? " class='em-hide'" : "") + "'>\
            <a class='easemobWidget-pop-bar bg-color' href='javascript:;' style='right: " + easemobIM.config.fixedButtonPosition.x + ";bottom: " + easemobIM.config.fixedButtonPosition.y + "'><i></i>" + easemobIM.config.buttonText + "</a>\
        </div>\
        <div id='EasemobKefuWebimChat' class='easemobWidgetWrapper" + (easemobIM.config.minimum ? " em-hide'" : "") + "'>\
            <div id='easemobWidgetHeader' class='easemobWidgetHeader-wrapper bg-color border-color'>\
                <div id='easemobWidgetDrag'>\
                    <img class='easemobWidgetHeader-portrait'/>\
                    <span class='easemobWidgetHeader-nickname'></span>\
                </div>\
            </div>\
            <div id='easemobWidgetBody' class='easemobWidgetBody-wrapper'></div>\
            <div id='EasemobKefuWebimFaceWrapper' class='easemobWidget-face-wrapper e-face em-hide'>\
                <ul class='easemobWidget-face-container'></ul>\
            </div>\
            <div id='easemobWidgetSend' class='easemobWidget-send-wrapper'>\
                <i class='easemobWidget-face e-face' tile='表情'></i>\
                <i class='easemobWidget-file' id='easemobWidgetFile' tile='图片'></i>\
                <input id='easemobWidgetFileInput' type='file' accept='image/*'/>\
                <textarea class='easemobWidget-textarea' spellcheck='false'></textarea>" +
                (easemobIM.config.mobile || !easemobIM.config.visitorSatisfactionEvaluate ? "" : "<span id='EasemobKefuWebimSatisfy' class='easemobWidget-satisfaction'>请对服务做出评价</span>") + "\
                <a href='javascript:;' class='easemobWidget-send bg-color disabled' id='easemobWidgetSendBtn'>连接中</a>\
            </div>\
            <iframe id='EasemobKefuWebimIframe' width='0' height='0' frameborder='0' src='" + easemobIM.config.base + "/webim/transfer.html'></iframe>\
        </div>\
    ";
    document.body.appendChild(webim);

    if ( easemobIM.config.mobile ) {
        webim.style.cssText += 'z-index:1000;width:100%;position:fixed;';
        document.getElementById('EasemobKefuWebimChat').style.cssText = 'width:100%;height:100%;right:0;bottom:0;';
    } else {
        webim.style.cssText += 'z-index:1000;position:fixed;right:' + easemobIM.config.dialogPosition.x + ';bottom:' + easemobIM.config.dialogPosition.y;
        document.getElementById('EasemobKefuWebimChat').style.cssText = 'width:' + easemobIM.config.dialogWidth + ';height:' + easemobIM.config.dialogHeight + ';';
    }

    document.getElementById('EasemobKefuWebimIframe').onload = function () {
        var script = document.createElement('script');
        script.id = 'EasemobKefuWebimDepScript';
        script.src = easemobIM.config.base + '/webim/static/js/em-open.js';
        head.appendChild(script);
        script = null;

        var loadIm = function () {
            script = document.createElement('script');
            script.src = 'static/js/im.js';
            head.appendChild(script);
            script = null;
        };

        var imScript = document.getElementById('EasemobKefuWebimDepScript');

		imScript.onload = imScript.onreadystatechange = function () {
			if ( !this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ) {
				loadIm();
			}
		}
    };
}());

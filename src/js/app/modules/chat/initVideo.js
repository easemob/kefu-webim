var utils = require("../../../common/utils");

module.exports = {
    init: _init,
};

function _init(){
    _initVideoUI();
    _initEventListener();
}

function _initVideoUI(){
    var doms = _getDom();
    var parentDiv = doms.parentDiv;

    utils.hasClass(parentDiv, "hide") && utils.removeClass(parentDiv, "hide");
}

function _initEventListener(){
    var doms = _getDom();
    var parentDiv = doms.parentDiv;
    var titleDiv = doms.titleDiv;
    var videoDiv = doms.iconVideoDiv;
    var declineDiv = doms.iconDeclineDiv;

    // 点击 发起音视频邀请 按钮
    utils.on(videoDiv, "click", function(){
        titleDiv.innerText = "正在呼叫智享客服...";
        !utils.hasClass(videoDiv, "hide") && utils.addClass(videoDiv, "hide");
        utils.hasClass(declineDiv, "hide") && utils.removeClass(declineDiv, "hide");
        
        utils.trigger(videoDiv, "video-open");

        window.VIDEO_ACCEPT = true;
    });
    // 挂断 音视频 按钮
    utils.on(declineDiv, "click", function(){
        titleDiv.innerText = "";
        utils.hasClass(parentDiv, "hide") && utils.removeClass(parentDiv, "hide");
        utils.hasClass(videoDiv, "hide") && utils.removeClass(videoDiv, "hide");
        !utils.hasClass(declineDiv, "hide") && utils.addClass(declineDiv, "hide");
        
        var closeBtn = document.querySelector(".video-chat-wrapper .status-bar .control-panel .end-button");
        utils.trigger(closeBtn, "video-close");
        
        window.VIDEO_ACCEPT = false;
    });
}

function _getDom(){
	var parentDiv = document.getElementById("em-kefu-webim-chat-video");
    return {
        parentDiv: parentDiv,
        titleDiv: parentDiv.querySelector(".em-widget-wrapper-video-title"), 
        middleDiv: parentDiv.querySelector(".em-widget-wrapper-video-middle"), 
        iconDiv: parentDiv.querySelector(".em-widget-wrapper-video-icon"), 
        iconVideoDiv: parentDiv.querySelector(".em-widget-video"), 
        iconDeclineDiv: parentDiv.querySelector(".em-widget-decline"), 
    };
}
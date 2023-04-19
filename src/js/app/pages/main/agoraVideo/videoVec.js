var videoAgoraTemplate = require("../../../../../template/videoVec.html");
var profile = require("@/app/tools/profile");
var commonConfig = require("@/common/config");
var _initOnce = _.once(_init);
var utils = require("@/common/utils");
var dragMove = require("../uikit/drag")
var parentContainer;
var videoWidget;
var enlargeBefore = {};
var enlargeEl = {};

module.exports = {
	init: init,
	createSrc: createSrc,
};

function init(option){
	var opt;

	if(
		window.location.protocol !== "https:"
		|| !Modernizr.peerconnection // UC 和 夸克 该方法返回false，不支持webRtc
		|| !profile.grayList.agoraVideo
	) return;

	opt = option || {};
	parentContainer = opt.parentContainer;
    _initOnce()
}

function createSrc(configId) {
	let uri = `${window.location.origin}/webim-vec`;
	if (window.location.origin.includes('localhost')) {
		uri = 'http://localhost:8888';
	}
	var officialAccount = profile.currentOfficialAccount;
	var relatedSessionId = officialAccount && officialAccount.sessionId ? officialAccount.sessionId : '';
	var config = commonConfig.getConfig();
	var relatedVisitorUserId = config.user && config.user.username ? config.user.username : '';

	videoWidget.querySelector('iframe').src = `${uri}/index.html?configId=${configId}&lang=zh-CN&frompage=webim&source=relatedSession&relatedSessionId=${relatedSessionId}&relatedVisitorUserId=${relatedVisitorUserId}`
}

function _init() {
    if(videoWidget) return;
    // init dom
	videoWidget = utils.createElementFromHTML(_.template(videoAgoraTemplate)());
    parentContainer.appendChild(videoWidget);

    // videoWidget.querySelector('iframe').src = 'http://localhost:8888/index.html?configId=8cbf2c9e-3503-494f-8325-5492a167a359&lang=zh-CN&frompage=webim'

    // 获取视频弹窗的宽高
    enlargeEl.width = $("#em-kefu-webim-chat").width();
    enlargeEl.height = $("#em-kefu-webim-chat").height();
    // 拖拽缩放
    _dragVideo();

    // 关闭
    utils.on($('.video-vec-container .icon-close'), 'click', function() {
        $(".video-vec-container").addClass("hide");
		$(".small-video-box-vec").addClass("hide");
    });

    // 缩小
	utils.on($(".video-vec-container .icon-narrow"), "click", function(){
		$(".video-vec-container").addClass("hide");
		$(".small-video-box-vec .small-video").removeClass("hide");
		$(".small-video-box-vec").removeClass("hide");
		_dragIconVideo();
	});
	utils.on($(".small-video-box-vec"), "mousedown", function(e){
		$(".video-agora-wrapper").addClass("hide");
		var oldTim = new Date().getTime();
		utils.on($(".small-video-box-vec"), "mouseup", function(e){
			if((new Date().getTime() - oldTim) > 300 ){
				return false;
			}
			$(".video-vec-container").removeClass("hide");
			$(".video-agora-wrapper").addClass("hide");
			$(".small-video-box-vec .small-video").addClass("hide");
			$(".small-video-box-vec").addClass("hide");
		});
	});
    // 大小屏切换
    utils.on($(".video-vec-container .toggle-enlarge"), "click", function(e){
		if($(e.target).hasClass("icon-enlarge")){
			$(".video-vec-container .toggle-enlarge").addClass("icon-reduction");
			$(".video-vec-container .toggle-enlarge").removeClass("icon-enlarge");
			enlargeBefore.top = $(".video-vec-container").offset().top;
			enlargeBefore.left = $(".video-vec-container").offset().left;
			enlargeBefore.width = $(".video-vec-container").width();
			enlargeBefore.height = $(".video-vec-container").height();
			$(".video-vec-container").css({ 'width': enlargeEl.width + 'px', 'height': enlargeEl.height + 'px','top':'0','left':'0','margin-left': '0px', 'margin-top': '0px','position': 'absolute' });
		}
		else{
			$(".video-vec-container .toggle-enlarge").addClass("icon-enlarge");
			$(".video-vec-container .toggle-enlarge").removeClass("icon-reduction");
			$(".video-vec-container").css({ 'width': enlargeBefore.width + 'px', 'height': enlargeBefore.height + 'px','top': enlargeBefore.top + 'px','left':enlargeBefore.left + 'px','position': 'fixed' });
		}
	});
}

function _dragIconVideo(){
	dragMove.drag({
		parentdraf : '.small-video-box-vec' , // 拖拽元素父级
		draftin : '.small-video-box-vec' , // 拖拽元素
	}, utils.isMobile);
}

function _dragVideo(){
	dragMove.drag({
		parentdraf : '.video-vec-container' , // 拖拽元素父级
		draftin : '.video-vec-container' , // 拖拽元素
		// sizeLeft : '.video-vec-container  .barl', // 改变大小左边
		sizeRight : '.video-vec-container  .barr', // 改变大小右边
		// sizeTop : '.video-vec-container  .bart', // 改变大小上边
		sizeBottom : '.video-vec-container  .barb',  // 改变大小下边
		sizeSkew : '.video-vec-container .bar'
	}, utils.isMobile);
}


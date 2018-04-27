/*
	视频流程
	1.
		a. 访客发起邀请
		b. 坐席发起邀请
	2. 访客收到ticket
	3. 初始化sdk，回调
	4. 访客加入会议
	5. 振铃
	6. 访客接起
	7. 访客推流
*/
var Const =			require("@/common/cfg/const");
var profile =		require("@/common/cfg/profile");
var Dialog =		require("@/common/uikit/dialog");
var tips =			require("@/common/uikit/tips");
var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var ajaxWrapper =	require("@/common/kit/ajaxWrapper");
var Dispatcher =	require("@/common/disp/dispatcher");
var eventListener =	require("@/common/disp/eventListener");

var channel =		require("@/app/modules/chat/channel");
var StatusBar =		require("@/app/modules/video/videoStatusBar");
var VideoPanel =	require("@/app/modules/video/videoPanel");

var tpl =			require("@/app/modules/video/template/indexTpl.html");
var popContentTpl =	require("@/app/modules/video/template/indexPopContentTpl.html");

var ADAPTER_PATH = "static/js/lib/adapter.min.js?v=unknown-000";
var E_MEDIA_SDK_PATH = "static/js/lib/EMedia_sdk.min.js?v=1.1.2";

module.exports = classUtils.createView({

	dialog: null,
	statusBar: null,
	videoPanel: null,
	service: null,
	dispatcher: null,



	init: function(option){
		var opt;
		var triggerButton;
		var me = this;

		if(
			window.location.protocol !== "https:"
			|| !Modernizr.peerconnection
			|| !profile.grayList.audioVideo
		) return;

		opt = option || {};
		triggerButton = opt.triggerButton;

		// init dom
		this.$el = domUtils.createElementFromHTML(_.template(tpl)());

		// todo: resolve promise sequentially
		ajaxWrapper.loadScript(ADAPTER_PATH)
		.then(function(){
			return ajaxWrapper.loadScript(E_MEDIA_SDK_PATH);
		})
		.then(function(){
			// 这三行初始化，有可能有问题，之前是放在 triggerButton click 和 reveiveTicket 中的
			me.setupWidget();
			me.setupSDK();
			eventListener.add(Const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, me.reveiveTicket);

			// 显示视频邀请按钮，并绑定事件
			domUtils.removeClass(triggerButton, "hide");
			utils.on(triggerButton, "click", function(){
				me.dialog.show();
			});
		});
	},

	setupWidget: function(){
		var me = this;
		var config = profile.config;

		this.dialog = new Dialog({
			contentDom: [
				_.template(popContentTpl)({
					confirmPrompt: __("video.confirm_prompt")
				})
			].join(""),
			className: "rtc-video-confirm",
		})
		.addButton({
			confirm: function(){
				channel.sendText(__("video.invite_agent_video"), {
					ext: {
						type: "rtcmedia/video",
						msgtype: {
							liveStreamInvitation: {
								msg: __("video.invite_agent_video"),
								orgName: config.orgName,
								appName: config.appName,
								userName: config.user.username,
								imServiceNumber: config.toUser,
								restServer: config.restServer,
								xmppServer: config.xmppServer,
								resource: "webim",
								isNewInvitation: true,
								userAgent: navigator.userAgent,
							},
						},
					},
				});
			}
		});

		this.statusBar = new StatusBar({
			acceptCallback: function(){
				me.videoPanel.show();
				me.pushStream();
			},
			endCallback: function(){
				me.service && me.service.exit();
			},
		});

		this.videoPanel = new VideoPanel({
			service: me.service,
			dispatcher: me.dispatcher,
		});
	},

	setupSDK: function(){
		var me = this;
		var config = profile.config;
		// init emedia config
		// window.emedia.config({ autoSub: false });
		// disable emedia log
		window.emedia.LOG_LEVEL = 5;

		this.dispatcher = new Dispatcher();
		this.service = new window.emedia.Service({
			// 这个目前没有定义，前段可写 web
			resource: "web",
			// 这个人的昵称，可以不写。比如 jid 中的name
			nickName: config.user.username,
			// 以下监听，this object == me == service.current
			listeners: {
				// 退出，服务端强制退出，进入会议失败，sdk重连失败等 均会调用到此处
				onMeExit: function(errorCode){
					// var errorMessage = Const.E_MEDIA_SDK_ERROR_CODE_MAP[errorCode] || "unknown error code.";
					me.statusBar.showClosing();
					me.videoPanel.hide();
					// if(errorCode !== 0) throw new Error(errorMessage);
				},
				// 某人进入会议
				onAddMember: function(member){
					// console.info({
					// 	type: "memberEnter",
					// 	memberId: member.id,
					// 	memberNickname: member.nickName,
					// });
				},
				// 某人退出会议
				onRemoveMember: function(member){
					// console.info({
					// 	type: "memberExit",
					// 	memberId: member.id,
					// 	memberNickname: member.nickName,
					// });
				},
				// 某人 发布 一个流 （音视频流，共享桌面等）（包含本地流）
				onAddStream: function(stream){
					me.videoPanel.addOrUpdateStream(stream);
				},
				// 某人 取消 一个流 （音视频流，共享桌面等）（包含本地流）
				onRemoveStream: function(stream){
					me.videoPanel.removeStream(stream);
				},
				// 更新 一个流 （音视频流，共享桌面等）。
				// 可能是 断网后，重新获取到远端媒体流，或者对方静音或关闭摄像头
				onUpdateStream: function(stream){
					me.videoPanel.addOrUpdateStream(stream);
				},
				// 这个事件比较多，以后业务拓展时，根据需要再给开放一些回调，目前忽略
				onNotifyEvent: function(evt){
					// 接听 打开本地摄像头 并成功推流
					if(evt instanceof window.emedia.event.PushSuccess){

					}
					// 接听 打开本地摄像头 推流失败
					else if(evt instanceof window.emedia.event.PushFail){
						tips.tip(__("video.can_not_connected"));
						me.service.exit();
					}
					// 接听 打开摄像头失败
					else if(evt instanceof window.emedia.event.OpenMediaError){
						tips.tip(__("video.can_not_open_camera"));
						me.service.exit();
					}
					else{

					}
				},
			}
		});
	},

	pushStream: function(){
		var me = this;
		var myStream = new me.service.AVPubstream({ voff: 0, aoff: 0, name: "video" });
		me.service.openUserMedia(myStream).then(function(){
			me.service.push(myStream);
		});
	},

	reveiveTicket: function(ticketInfo){
		var me = this;
		var config = profile.config;

		// 加入会议
		this.service.setup(ticketInfo, {
			identity: "visitor",
			nickname: config.visitor.trueName || config.user.username,
			avatarUrl: "",
		});

		this.service.join(function(/* _memId */){
			me.statusBar.reset();
			me.statusBar.show();
		}, function(evt){
			me.service.exit();
			throw new Error("failed to join conference: " + evt.message());
		});
	},

});

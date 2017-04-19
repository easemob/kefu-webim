easemobim.liveStreaming = (function(){
	var utils = easemobim.utils;
	var imChat = document.getElementById('em-kefu-webim-chat');
	var btnVideoInvite = document.querySelector('.em-live-streaming-invite');
	var bar = document.querySelector('.em-live-streaming-bar');
	var videoWrapper = document.querySelector('.em-live-streaming-wrapper');
	var btnExit = videoWrapper.querySelector('.btn-exit');
	var video = videoWrapper.querySelector('video');
	var timeSpan = videoWrapper.querySelector('.status-panel .time');
	var messageInput = document.querySelector('.em-widget-textarea');

	var sourceURL;
	var sendMessageAPI;

	var closingTimer = {
		delay: 3000,
		start: function(){
			var me = this;
			setTimeout(function(){
				imChat.classList.remove('has-live-streaming-bar');
				imChat.classList.remove('has-live-streaming-video');
				videoWrapper.classList.add('hide');
			}, me.delay);
		}
	}

	var statusPoller = {
		timer: null,
		interval: 3000,
		streamId: '',
		status: 'IDLE',
		start: function(streamId){
			var me = this;
			setTimeout(this.fn, 0);
			this.timer = setInterval(fn, this.interval);
			function fn(){
				updateStatus(me.status, streamId);
			}
		},
		stop: function(){
			this.timer && clearInterval(this.timer);
			this.timer = null;
			this.updateStatus('IDLE');
		},
		updateStatus: function(status){
			this.status = status;
		}
	};

	// ios safari 输入时视频自动吸在顶部
	if (utils.isIOS){
		messageInput.addEventListener('focus', videoAdjust, false);
		messageInput.addEventListener('blur', videoAdjust, false);
		document.body.addEventListener('touchmove', videoAdjust, false);
	}

	var videoAdjust = _.throttle(function(){
			var videoWrapperOffset = videoWrapper.getBoundingClientRect().top;
			var bodyOffset = -document.body.getBoundingClientRect().top;
			console.log(videoWrapperOffset, bodyOffset);
			if (videoWrapperOffset){
				videoWrapper.style.top = bodyOffset + 'px';
			}
		}, 600, {leading: false});

	function bindEvent(){
		btnVideoInvite.addEventListener('click', function(){
			sendMessageAPI('邀请您进行实时视频', false, null);
		}, false);
		btnExit.addEventListener('click', function(evt){
			statusPoller.updateStatus('IDLE');
			video.pause();
			videoWrapper.classList.add('hide');
			imChat.classList.remove('has-live-streaming-video');
		}, false);
		bar.addEventListener('click', function(e){
			video.src = sourceURL;
			statusPoller.updateStatus('PLAYING');
			// autoReload.start();
			video.play();			
			videoWrapper.classList.remove('hide');
			imChat.classList.add('has-live-streaming-video');
		}, false);
		video.addEventListener('loadeddata', function(e){
			console.log(e.type);
			console.log('size', video.videoWidth, video.videoHeight);
		}, false);
	}

	function initDebug(){
		[
			'loadedmetadata',
			'loadstart',
			'stalled',
			'canplaythrough',
			'suspend',
			'pause',
			'playing',
			'error',
			'waiting',
			'progress',
			'webkitbeginfullscreen',
			'timeupdate',
			'webkitendfullscreen'
		].forEach(function(eventName){
			video.addEventListener(eventName, function(e){
				console.log(e.type, e);
			});
		});
	}

	function updateStatus(status, streamId){
		easemobim.api('mediaStreamUpdateStatus', {
			visitorUpdateStatusRequest: {
				status: status
			},
			streamId: streamId
		}, function(msg){
			var status = utils.getDataByPath(msg, 'data.visitorUpdateStatusResponse.status');
			var streamUri = utils.getDataByPath(msg, 'data.visitorUpdateStatusResponse.streamUri');

			switch(status){
				// 坐席端开始推流
				case 'STARTED':
					readyToPlay(streamUri);
					break;
				// 坐席端停止推流
				case 'STOPPED':
				// 坐席端推流异常
				case 'ABNORMAL':
					bar.classList.remove('playing');
					videoWrapper.classList.remove('playing');
					timeSpan.innerHTML = '00:00';
					statusPoller.stop();
					video.pause();
					video.src = '';
					closingTimer.start();
					utils.set('streamId', '');
					break;
				// 坐席端初始化，未开始推流，忽略此状态
				case 'INIT':
				default:
					break;
			}
		});
	}

	function readyToPlay(streamUri){
		sourceURL = streamUri;
		bar.classList.add('playing');
		videoWrapper.classList.add('playing');
		imChat.classList.add('has-live-streaming-bar');
	}

	return {
		init: function(sendMessage){
			sendMessageAPI = sendMessage;

			// 按钮初始化
			btnVideoInvite.classList.remove('hide');
			bindEvent();
			initDebug();

			// 计算视频高度
			videoWidth = window.innerWidth;
			videoHeight = Math.floor(window.innerWidth / 16 * 9);

			// 视频横屏处理，宽高互换，位置修正
			video.style.height = videoWidth + 'px';
			video.style.width = videoHeight + 'px';
			video.style.top = videoHeight + 'px';
			videoWrapper.style.height = videoHeight + 44 + 'px';

			var streamId = utils.get('streamId');
			if (streamId){
				statusPoller.start(streamId);
			}
		},
		open: function(streamId) {
			statusPoller.start(streamId);
			utils.set('streamId', streamId, 1);
		},
		onOffline: function() {
			// for debug
			console.log('onOffline');
		}
	}
}());

// 约定的文本消息，用以访客端获取streamId
// {
// 	ext: {
// 		type: 'live/video',
// 		msgtype: {
// 			streamId: '9c8b5869-795e-4351-8f1a-7dbb620f108c'
// 		}
// 	}
// }

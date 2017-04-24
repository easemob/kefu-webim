easemobim.liveStreaming = (function(){
	var utils = easemobim.utils;
	var videoWrapper = document.querySelector('.em-live-streaming-wrapper');
	var video = videoWrapper.querySelector('video');
	var timeSpan = videoWrapper.querySelector('.status-panel .time');
	var messageInput = document.querySelector('.em-widget-textarea');
	var liveVideoWait = document.querySelector('.live-video-wait');
	var startBtn = liveVideoWait.querySelector('.start-btn');
	var closing = document.querySelector('.live-video-closing');
	var timeRemaining = closing.querySelector('.time-remaining');

	var sourceURL;

	var closingTimer = {
		timer: null,
		start: function(){
			var me = this;
			var count = 5;

			this.timer = clearInterval(this.timer);
			this.timer = setInterval(update, 1000);
			closing.classList.remove('hide');
			timeRemaining.innerText = count;
			function update(){
				count--;
				timeRemaining.innerText = count;
				if (count < 0){
					closing.classList.add('hide');
					startBtn.classList.remove('disabled');
					videoWrapper.classList.add('hide');
					history.back();
				}
			}
		}
	}

	var statusPoller = {
		timer: null,
		interval: 3000,
		status: 'IDLE',
		start: function(streamId){
			var me = this;

			setTimeout(_syncStatus, 0);
			this.timer = setInterval(_syncStatus, this.interval);
			function _syncStatus(){
				syncStatus(me.status, streamId);
			}
		},
		stop: function(){
			this.timer = clearInterval(this.timer);
			this.updateStatus('IDLE');
		},
		updateStatus: function(status){
			this.status = status;
		}
	};

	var videoAdjust = _.throttle(function(){
			var videoWrapperOffset = videoWrapper.getBoundingClientRect().top;
			var bodyOffset = -document.body.getBoundingClientRect().top;
			console.log(videoWrapperOffset, bodyOffset);
			if (videoWrapperOffset){
				videoWrapper.style.top = bodyOffset + 'px';
			}
		}, 600, {leading: false});

	// ios safari 输入时视频自动吸在顶部
	if (utils.isIOS){
		messageInput.addEventListener('focus', videoAdjust, false);
		messageInput.addEventListener('blur', videoAdjust, false);
		document.body.addEventListener('touchmove', videoAdjust, false);
	}

	function bindEvent(){
		startBtn.addEventListener('click', function(e){
			if (this.classList.contains('disabled')) return;
			video.src = sourceURL;
			statusPoller.updateStatus('PLAYING');
			video.play();			
			videoWrapper.classList.remove('hide');
			liveVideoWait.classList.add('hide');
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

	function syncStatus(status, streamId){
		easemobim.api('mediaStreamUpdateStatus', {
			visitorUpdateStatusRequest: {
				status: status
			},
			streamId: streamId
		}, function(msg){
			var agentStatus = utils.getDataByPath(msg, 'data.visitorUpdateStatusResponse.status');
			var streamUri = utils.getDataByPath(msg, 'data.visitorUpdateStatusResponse.streamUri');

			switch(agentStatus){
				// 坐席端开始推流
				case 'STARTED':
					sourceURL = streamUri;
					startBtn.classList.remove('disabled');
					videoWrapper.classList.add('playing');
					break;
				// 坐席端停止推流
				case 'STOPPED':
				// 坐席端推流异常
				case 'ABNORMAL':
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

	return {
		init: function(sendMessage){
			// 按钮初始化
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

easemobim.videoChat = (function(dialog){
	var imChat = document.getElementById('em-kefu-webim-chat');
	var btnVideoInvite = document.querySelector('.em-video-invite');
	var videoWidget = document.querySelector('.em-widget-video');
	var dialBtn = videoWidget.querySelector('.btn-accept-call');
	var waitingPrompt = videoWidget.querySelector('.waiting-prompt');
	var timeEscape = videoWidget.querySelector('p.time-escape');
	var remoteVideoWin = videoWidget.querySelector('video.main');
	var localVideoWin = videoWidget.querySelector('video.sub');
	var config = null;
	var localStream = null;
	var remoteStream = null;
	var call = null;
	var sendMessageAPI = null;
	var emChat = null;
	var counter = 0;
	var timer = null;
	var events = {
		'btn-end-call': function(){
			call.endCall();
		},
		'btn-accept-call': function(){
			dialBtn.classList.add('hide');
			stopTimer();
			call.acceptCall();
		},
		'btn-toggle': function(){
			localStream.getVideoTracks().forEach(function(track){
				track.enabled = !track.enabled;
			});
		},
		'btn-change': function(){
			var tmp;

			tmp = localVideoWin.src;
			localVideoWin.src = remoteVideoWin.src;
			remoteVideoWin.src = tmp;

			localVideoWin.muted = localVideoWin.muted;
			remoteVideoWin.muted = remoteVideoWin.muted;
		},
		'btn-minimize': function(){
			videoWidget.classList.add('minimized');
		},
		'btn-maximize': function(){
			videoWidget.classList.remove('minimized');
		}
	};

	// 发送视频邀请
	btnVideoInvite.classList.remove('hide');
	btnVideoInvite.addEventListener('click', function(){
		dialog.init(sendVideoInvite);
	}, false);

	// 视频组件事件绑定
	videoWidget.addEventListener('click', function(evt){
		var className = evt.target.className;

		Object.keys(events).forEach(function(key){
			~className.indexOf(key) && events[key]();
		})
	}, false);


	function startTimer(){
		counter = 0;
		timeEscape.innerHTML = '00:00';
		timer = setInterval(function(){
			timeEscape.innerHTML = format(counter++);
		}, 1000)
		waitingPrompt.classList.remove('hide');
		function format(second){
			var date = new Date(second * 1000);
			return date.toISOString().slice(-'00:00.000Z'.length).slice(0, '00:00'.length);
		}
	}
	function stopTimer(){
		clearInterval(timer);
		waitingPrompt.classList.add('hide');
	}
	function sendVideoInvite() {
		console.log('send video invite');
		sendMessageAPI('txt', '邀请客服进行实时视频', false, {
				ext: {
				type: 'rtcmedia/video',
				msgtype: {
					liveStreamInvitation: {
						msg: '邀请客服进行实时视频',
						orgName: config.orgName,
						appName: config.appName,
						userName: config.user.username,
						resource: 'webim'
					}
				}
			}
		});
	}

	function init(conn, sendMessage, cfg){
		sendMessageAPI = sendMessage;
		config = cfg;

		call = new WebIM.WebRTC.Call({
			connection: conn,

			mediaStreamConstaints: {
				audio: true,
				video: true
			},

			listener: {
				onAcceptCall: function (from, options) {
					stopTimer();
					console.log('onAcceptCall', from, options);
				},
				onGotRemoteStream: function (stream) {
					remoteVideoWin.src = URL.createObjectURL(stream);
					remoteStream = stream;
					remoteVideoWin.play();
					// for debug
					console.log('onGotRemoteStream', stream);
				},
				onGotLocalStream: function (stream) {
					localVideoWin.src = URL.createObjectURL(stream);
					localStream = stream;
					localVideoWin.play();
					// for debug
					console.log('onGotLocalStream', stream);
				},
				onRinging: function (caller) {
					imChat.classList.add('has-video');
					startTimer();
					dialBtn.classList.remove('hide');
					console.log('onRinging', caller);
				},
				onTermCall: function () {
					stopTimer();
					localStream && localStream.getTracks().forEach(function(track){
						track.stop();
					})
					remoteStream && remoteStream.getTracks().forEach(function(track){
						track.stop();
					})
					remoteVideoWin.src = '';
					localVideoWin.src = '';

					// for debug
					console.log('onTermCall');
					imChat.classList.remove('has-video');
				},
				onError: function (e) {
					console.log(e && e.message ? e.message : 'An error occured when calling webrtc');
				}
			}
		});
	}

	return {
		init: init
	}
}(easemobim.ui.videoConfirmDialog));

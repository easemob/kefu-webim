'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
@params
clientConfig 创建客户端的配置
onRemoteUserChange 远端⽤户对象change变化回调
onJoinstateChange 加⼊房间状体变化事件
onErrorNotify 错误回调
onUserJoined ⽤户加⼊回调 *（加⼊后不能⽴即播放 user上还没有 audioTrack videoTrack 需要在handleUserPublished 回调触发之后才可以）
onUserLeft ⽤户离开回调
*/

function log() {
  var _console;

  for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
    params[_key] = arguments[_key];
  }

  (_console = console).log.apply(_console, params.concat(['myself']));
}

var func = function func() {
  return void 0;
};

var HxVideo = function () {
  function HxVideo() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, HxVideo);

    var _config$clientConfig = config.clientConfig;
    var clientConfig = _config$clientConfig === undefined ? { codec: 'h264', mode: 'live', role: 'host' } : _config$clientConfig;
    var _config$onRemoteUserC = config.onRemoteUserChange;
    var onRemoteUserChange = _config$onRemoteUserC === undefined ? func : _config$onRemoteUserC;
    var _config$onErrorNotify = config.onErrorNotify;
    var onErrorNotify = _config$onErrorNotify === undefined ? func : _config$onErrorNotify;
    var _config$onUserJoined = config.onUserJoined;
    var onUserJoined = _config$onUserJoined === undefined ? func : _config$onUserJoined;
    var _config$onUserLeft = config.onUserLeft;
    var onUserLeft = _config$onUserLeft === undefined ? func : _config$onUserLeft;


    this.config = config;
    this.client = AgoraRTC.createClient(clientConfig); //创建客户端
    this.joinState = false; //是否加入了频道
    this.remoteUsers = []; //远端客户对象
    this.localAudioTrack = null; //本地音频轨道
    this.localVideoTrack = null; //本地视频轨道
    this.localScreenTrack = null; //本地p屏幕轨道
    this.localScreenVideoTrack = null; //本地屏幕视频轨道
    this.localScreenAudioTrack = null; //本地屏幕音频轨道


    this.onRemoteUserChange = onRemoteUserChange.bind(this); //远端用户change回调
    this.onErrorNotify = onErrorNotify.bind(this); // 错误回调
    this.onUserJoined = onUserJoined.bind(this); // 当前用户加入回调
    this.onUserLeft = onUserLeft.bind(this); // 当前用户离开回调

    this.handleUserPublished = this.handleUserPublished.bind(this);
    this.handleUserUnpublished = this.handleUserUnpublished.bind(this);
    this.handleUserJoined = this.handleUserJoined.bind(this);
    this.handleUserLeft = this.handleUserLeft.bind(this);

    this.bindClientListener();
  }

  /* 创建本地音视频轨道 */


  _createClass(HxVideo, [{
    key: 'createLocalTracks',
    value: function createLocalTracks(audioConfig, videoConfig) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (_this.localAudioTrack && _this.localVideoTrack) {
          return resolve([_this.localAudioTrack, _this.localVideoTrack]);
        }
        AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig).then(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var microphoneTrack = _ref2[0];
          var cameraTrack = _ref2[1];

          _this.localAudioTrack = microphoneTrack;
          _this.localVideoTrack = cameraTrack;
          resolve([microphoneTrack, cameraTrack]);
        }).catch(function (error) {
          _this.onErrorNotify(error.code);
        });
      });
    }

    /* 创建用于屏幕共享的视频轨道 */
  }, {
    key: 'createScreenVideoTrack',
    value: function createScreenVideoTrack(config) {
      var _this2 = this;

      return AgoraRTC.createScreenVideoTrack(config&&config.TrackInitConfig,config&&config.withAudio).then(function (localScreenTrack) {
        if(localScreenTrack instanceof Array){
          _this2.localScreenVideoTrack = localScreenTrack[0];
          _this2.localScreenAudioTrack = localScreenTrack[1];
        }
        else{
          _this2.localScreenVideoTrack = localScreenTrack;
        }
        return localScreenTrack;
      }).catch(function (error) {
        _this2.onErrorNotify(error.code);
      });
    }
  }, {
    key: 'publish',
    value: function publish() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      this.client.publish(params);
    }
    /* audioConfig, videoConfig 创建本地音视频轨道的参数 */

  }, {
    key: 'join',
    value: function join(_ref3) {
      var _this3 = this;

      var appid = _ref3.appid;
      var channel = _ref3.channel;
      var token = _ref3.token;
      var uid = _ref3.uid;
      var audioConfig = _ref3.audioConfig;
      var videoConfig = _ref3.videoConfig;

      if (!this.client) return;

      return this.createLocalTracks(audioConfig, videoConfig).then(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2);

        var microphoneTrack = _ref5[0];
        var cameraTrack = _ref5[1];

        return _this3.client.join(appid, channel, token || null, uid || undefined);
      }).then(function () {
        return _this3.publish(_this3.localAudioTrack, _this3.localVideoTrack);
      }).then(function () {
        _this3.setJoinState(true);
      }).catch(function (error) {
        _this3.onErrorNotify(error.code);
      });
    }
  }, {
    key: 'closeLocalTrack',
	// 关闭本地⾳视频轨道
    value: function closeLocalTrack(type) {
      switch (type) {
        case 'audio':
          return void this.closeLocalAudioTrack();
        case 'video':
          return void this.closeLocalVideoTrack();
        case 'screen':
          return void this.closeLocalScreenTrack();

        default:
          this.closeLocalAudioTrack();
          this.closeLocalVideoTrack();
          this.closeLocalScreenTrack();
          return void 0;
      }
    }
    // 关闭本地音频轨道
  }, {
    key: 'closeLocalAudioTrack',
    value: function closeLocalAudioTrack() {
      var _this4 = this;
      if (this.localAudioTrack) {
        this.client.unpublish(this.localAudioTrack).then(function () {
          _this4.localAudioTrack.stop();
          _this4.localAudioTrack.close();
          _this4.localAudioTrack = void 0;
        });
      } else {
        return Promise.resolve();
      }
    }
    // 关闭本地视频轨道
  }, {
    key: 'closeLocalVideoTrack',
    value: function closeLocalVideoTrack() {
      var _this5 = this;
      if (this.localVideoTrack) {
        return this.client.unpublish(this.localVideoTrack).then(function () {
          _this5.localVideoTrack.stop();
          _this5.localVideoTrack.close();
          _this5.localVideoTrack = void 0;
        });
      } else {
        return Promise.resolve();
      }
    }
  }, {
    key: 'closeLocalScreenTrack',
    value: function closeLocalScreenTrack() {
      var _this6 = this;

      if (this.localScreenTrack) {
        return this.client.unpublish(this.localScreenTrack).then(function () {
          _this6.localScreenTrack.stop();
          _this6.localScreenTrack.close();
          _this6.localScreenTrack = void 0;
        });
      } else {
        return Promise.resolve();
      }
    }

    /* 离开 */

  }, {
    key: 'leave',
    value: function leave() {
      this.closeLocalTrack();
      this.setRemoteUsers([]);
      this.setJoinState(false);
      return this.client.leave();
    }
  }, {
    key: 'setJoinState',
    value: function setJoinState(value) {
      this.joinState = value;
    }

    

  }, {
    key: 'setRemoteUsers',
	/* 设置remoteUser 远端客户 */
    value: function setRemoteUsers(users) {
      this.remoteUsers = users || Array.from(this.client.remoteUsers);
      this.onRemoteUserChange(this.remoteUsers);
    }

    /* 销毁函数 */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.unBindClientListener();
      this.client = null;
      this.localAudioTrack = null;
      this.localVideoTrack = null;
      this.localScreenTrack = null;
    }

    

  }, {
    key: 'handleUserPublished',
	/* ⽤户发布出发回调 */
    value: function handleUserPublished(user, mediaType) {
      var _this7 = this;

      this.client.subscribe(user, mediaType).then(function () {
        _this7.setRemoteUsers();
      }).catch(function (error) {
        _this7.onErrorNotify(error.code);
      });
    }

    /* 用户取消发布触发回调 */

  }, {
    key: 'handleUserUnpublished',
    value: function handleUserUnpublished() {
      this.setRemoteUsers();
    }

    /* 用户加入回调 */

  }, {
    key: 'handleUserJoined',
    value: function handleUserJoined(user) {
      this.onUserJoined();
      this.setRemoteUsers();
    }

    /* 用户离开回调 */

  }, {
    key: 'handleUserLeft',
    value: function handleUserLeft() {
      this.onUserLeft();
      this.setRemoteUsers();
    }

    /* 取消监听 */

  }, {
    key: 'unBindClientListener',
    value: function unBindClientListener() {
      this.client.off('user-published', this.handleUserPublished);
      this.client.off('user-unpublished', this.handleUserUnpublished);
      this.client.off('user-joined', this.handleUserJoined);
      this.client.off('user-left', this.handleUserLeft);
    }

    /* 添加监听 */

  }, {
    key: 'bindClientListener',
    value: function bindClientListener() {
      if (!this.client) return;
      this.client.on('user-published', this.handleUserPublished);
      this.client.on('user-unpublished', this.handleUserUnpublished);
      this.client.on('user-joined', this.handleUserJoined);
      this.client.on('user-left', this.handleUserLeft);
    }
  }]);

  return HxVideo;
}();
module.exports = HxVideo;
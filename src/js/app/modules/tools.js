easemobim.Dict = (function () {
	var Dict = function () {
		this.list = {};
	};

	Dict.prototype.set = function (key, value) {
		if (typeof this.list[key] === 'undefined') {
			this.list[key] = value;
		}
	};

	Dict.prototype.get = function (key) {
		if (this.list.hasOwnProperty(key)) {
			return this.list[key];
		}
		else {
			return null;
		}
	};

	Dict.prototype.remove = function (key) {
		if (typeof this.list[key] !== 'undefined') {
			delete this.list[key];
		}
	};

	return Dict;
}());

easemobim.Polling = (function () {
	var Polling = function (fn, interval) {
		this.fn = fn;
		this.isStarted = false;
		this.timerHandler = null;
		this.interval = interval;
	};

	Polling.prototype.start = function () {
		if (!this.isStarted) {
			this.isStarted = true;
			setTimeout(this.fn, 0);
			this.timerHandler = setInterval(this.fn, this.interval);
		}
	};

	Polling.prototype.stop = function () {
		if (this.isStarted) {
			this.isStarted = false;
			clearInterval(this.timerHandler);
		}
	};

	Polling.prototype.isStarted = function () {
		return this.isStarted;
	};

	return Polling;
}());

window.app = {
	profile: {
		ctaEnable: false,
		agentId: null,
		currentAgentAvatar: null,
		isChatWindowOpen: null,
		// 用来缓存图片的file对象，用于全屏查看图片
		imgFileList: new easemobim.Dict(),
		isServiceSessionOpened: false,
		hasHumanAgentOnline: false,
		hasRobotAgentOnline: false,
		officialAccountList: [],
		commandMessageToBeSendList: [],
		tenantAvatar: null,
		defaultAvatar: null,
		currentOfficialAccount: {},
		systemOfficialAccount: {}
	}
};

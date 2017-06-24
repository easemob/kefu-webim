window.app = {};

app.Dict = (function () {
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

app.List = (function(){
	var List = function (){
		this.list = [];
	};

	List.prototype.add = function (value){
		if (!~this.list.indexOf(value)){
			this.list.push(value);
		}
	};

	List.prototype.remove = function (value){
		var index = this.list.indexOf(value);
		if (index >= 0){
			this.list.splice(index, 1);
		}
	};

	List.prototype.getAll = function (){
		return this.list;
	};

	List.prototype.getLength = function (){
		return this.list.length;
	};

	List.prototype.removeAll = function (){
		this.list.length = 0;
	};

	return List;
}());

app.Poller = (function () {
	var Poller = function (fn, interval) {
		this.fn = fn;
		this.isStarted = false;
		this.timerHandler = null;
		this.interval = interval;
	};

	Poller.prototype.start = function () {
		if (!this.isStarted) {
			this.isStarted = true;
			setTimeout(this.fn, 0);
			this.timerHandler = setInterval(this.fn, this.interval);
		}
	};

	Poller.prototype.stop = function () {
		if (this.isStarted) {
			this.isStarted = false;
			clearInterval(this.timerHandler);
		}
	};

	Poller.prototype.isStarted = function () {
		return this.isStarted;
	};

	return Poller;
}());

// 限制一段时间内的重试次数，以及每次调用的时间间隔
app.retryThrottle = function (fn, options){
	if (typeof fn !== 'function') throw 'unexpect type of fn.';

	var opt = options || {};
	var lastResetTimestamp = _.now();
	var retryLimit = opt.retryLimit || 3;
	var resetTime = opt.resetTime || 60 * 10 * 1000;
	var waitTime = opt.waitTime || 3 * 1000;
	var retryCount = 0;
	var throttledFn = _.throttle(fn, waitTime);

	return function (){
		if (_.now() - lastResetTimestamp < resetTime){
			if (retryCount < retryLimit){
				retryCount++;
				throttledFn();
			}
			else {
				// 达到重试次数，忽略
			}
		}
		else {
			lastResetTimestamp = _.now();
			retryCount = 1;
			throttledFn();
		}

	};
};

app.profile = {
	ctaEnable: false,
	systemAgentAvatar: null,
	isChatWindowOpen: null,
	isAgentNicknameEnable: null,
	currentBrowsingURL: null,
	// 用来缓存图片的file对象，用于全屏查看图片
	imgFileList: new app.Dict(),
	hasHumanAgentOnline: false,
	hasRobotAgentOnline: false,
	officialAccountList: [],
	commandMessageToBeSendList: [],
	tenantAvatar: null,
	defaultAvatar: null,
	currentOfficialAccount: {},
	systemOfficialAccount: {}
};

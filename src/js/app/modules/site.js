;(function () {
	var site = function () {
		this.list = {};
	};

	site.prototype.set = function ( key, value ) {
		if ( typeof this.list[key] === 'undefined' ) {
			this.list[key] = value;
		}
		return this;
	};

	site.prototype.get = function ( key ) {
		if ( this.list.hasOwnProperty(key) ) {
			return this.list[key];	
		} else {
			return null;
		}
	};

	site.prototype.remove = function ( key ) {
		if ( typeof this.list[key] !== 'undefined' ) {
			delete this.list[key];
		}
	};

	easemobim.site = site;
}());

;(function () {
	var Polling = function (fn, interval){
		this.fn = fn;
		this.isStarted = false;
		this.timerHandler = null;
		this.interval = interval;
	};

	Polling.prototype.start = function (){
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

	easemobim.Polling = Polling;
}());


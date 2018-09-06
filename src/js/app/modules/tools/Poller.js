var Poller = function(fn, interval){
	this.fn = fn;
	this.isStarted = false;
	this.timerHandler = null;
	this.interval = interval;
};

Poller.prototype.start = function(){
	if(!this.isStarted){
		this.isStarted = true;
		setTimeout(this.fn, 0);
		this.timerHandler = setInterval(this.fn, this.interval);
	}
};

Poller.prototype.stop = function(){
	if(this.isStarted){
		this.isStarted = false;
		clearInterval(this.timerHandler);
	}
};

Poller.prototype.isStarted = function(){
	return this.isStarted;
};

module.exports = Poller;

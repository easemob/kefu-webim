
// 限制一段时间内的重试次数，以及每次调用的时间间隔
function retryThrottle(fn, options){
	var opt = options || {};
	var lastResetTimestamp = _.now();
	var retryLimit = opt.retryLimit || 3;
	var resetTime = opt.resetTime || 60 * 10 * 1000;
	var waitTime = opt.waitTime || 3 * 1000;
	var retryCount = 0;
	var throttledFn = _.throttle(fn, waitTime);

	return function(){
		if(_.now() - lastResetTimestamp < resetTime){
			if(retryCount < retryLimit){
				retryCount++;
				throttledFn();
			}
			else{
				// 达到重试次数，忽略
			}
		}
		else{
			lastResetTimestamp = _.now();
			retryCount = 1;
			throttledFn();
		}

	};
}

module.exports = {
	retryThrottle: retryThrottle
};

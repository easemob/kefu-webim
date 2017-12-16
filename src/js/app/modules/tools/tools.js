var ajax = require("src/js/common/ajax2");
var utils = require("src/js/common/utils");
var _const = require("src/js/common/const");
var profile = require("./profile");

module.exports = window.tools = {
	retryThrottle: retryThrottle,
	loadScript: loadScript,
	resolvePromiseSequentially: resolvePromiseSequentially,
	cacheUsername: cacheUsername,
};
function cacheUsername(){
	// todo: unify 2 cache Key Name
	var cacheKeyName = profile.config.configId || (profile.config.to + profile.config.tenantId + profile.config.emgroup);
	if(utils.isTop){
		utils.set("root" + (profile.config.configId || (profile.config.tenantId + profile.config.emgroup)), profile.options.imUsername);
	}
	else{
		transfer.send({
			event: _const.EVENTS.CACHEUSER,
			data: {
				key: cacheKeyName,
				value: profile.options.imUsername,
			}
		});
	}
}
// todo: implemnet this
function resolvePromiseSequentially(list){

}

function loadScript(path){
	return new Promise(function(resolve, reject){
		ajax({ url: path, disableTimeStampInGet: true }, resolve, reject);
	})
	.then(function DOMEval(code){
		var script = document.createElement("script");

		script.text = code;
		document.head.appendChild(script).parentNode.removeChild(script);
	});
}
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

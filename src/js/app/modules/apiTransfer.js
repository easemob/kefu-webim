(function(root){
	var cached = {};
	var apiTransfer;

	root.api = api;
	root.initApiTransfer = initApiTransfer;

	function initApiTransfer(){
		apiTransfer = new easemobim.Transfer('cross-origin-iframe', 'data', true);

		apiTransfer.listen(function (msg) {
			var apiName = msg.call;
			var timestamp = msg.timespan;
			var isSuccess = msg.status === 0;
			var callbacks;
			var successCallback;
			var errorCallback;

			if (cached[apiName] && cached[apiName][timestamp]) {

				callbacks = cached[apiName][timestamp];
				delete cached[apiName][timestamp];

				successCallback = callbacks.success;
				errorCallback = callbacks.error;

				if (isSuccess) {
					typeof successCallback === 'function' && successCallback(msg);
				}
				else {
					typeof errorCallback === 'function' && errorCallback(msg);
				}
			}
		}, ['api']);
	}

	function api(apiName, data, success, error) {
		var ts = new Date().getTime();

		//cache
		cached[apiName] = cached[apiName] || {};

		cached[apiName][ts] = {
			success: success,
			error: error
		};

		apiTransfer.send({
			api: apiName,
			data: data,
			timespan: ts,
			// 标记postMessage使用object，47.9 增加
			useObject: true
		});
	}
}(easemobim));
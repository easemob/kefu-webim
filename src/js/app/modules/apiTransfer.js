easemobim.api = function (apiName, data, success, error) {
	//cache
	easemobim.api[apiName] = easemobim.api[apiName] || {};

	var ts = new Date().getTime();
	easemobim.api[apiName][ts] = {
		success: success,
		error: error
	};
	easemobim.getData
		.send({
			api: apiName,
			data: data,
			timespan: ts,
			// 标记postMessage使用object，47.9 增加
			useObject: true
		})
		.listen(function (msg) {
			if (easemobim.api[msg.call] && easemobim.api[msg.call][msg.timespan]) {

				var callback = easemobim.api[msg.call][msg.timespan];
				delete easemobim.api[msg.call][msg.timespan];

				if (msg.status !== 0) {
					typeof callback.error === 'function' && callback.error(msg);
				}
				else {
					typeof callback.success === 'function' && callback.success(msg);
				}
			}
		}, ['api']);
};

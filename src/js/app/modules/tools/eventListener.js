
var eventCallbackTable = {};

function _add(event, callback){
	if(!eventCallbackTable[event]) eventCallbackTable[event] = [];
	eventCallbackTable[event].push(callback);
}

function _excuteCallbacks(event, argumentList){
	argumentList.push(event);

	_.each(eventCallbackTable[event], function(callback){
		callback.apply(null, argumentList);
	});
}

module.exports = {
	add: _add,
	excuteCallbacks: _excuteCallbacks
};

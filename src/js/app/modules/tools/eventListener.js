
var eventCallbackTable = {};

module.exports = {
	add: add,
	excuteCallbacks: excuteCallbacks,
	trigger: trigger,
};

function add(eventOrArray, callback){
	if(typeof eventOrArray === "string"){
		_add(eventOrArray, callback);
	}
	else if(_.isArray(eventOrArray)){
		_.each(eventOrArray, function(event){
			_add(event, callback);
		});
	}
	else{
		throw new Error("unexpected type of event:", typeof eventOrArray);
	}
}
function _add(event, callback){
	if(!eventCallbackTable[event]) eventCallbackTable[event] = [];
	eventCallbackTable[event].push(callback);
}

function excuteCallbacks(event, argumentList){
	argumentList.push(event);

	_.each(eventCallbackTable[event], function(callback){
		try{
			callback.apply(null, argumentList);
		}
		catch(error){
			console.warn("error occurred when run event callbacks.", event, argumentList, error);
		}
	});
}

function trigger(){
	var event = arguments[0];
	var argumentList = arguments;

	_.each(eventCallbackTable[event], function(callback){
		try{
			callback.apply(null, argumentList);
		}
		catch(error){
			console.warn("error occurred when run event callbacks.", argumentList, error);
		}
	});
}

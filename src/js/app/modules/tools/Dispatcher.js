var Dict = require("./Dict");
var List = require("./List");

var Dispatecher = module.exports = function(){
	this.eventCallbackDict = new Dict();
};

Dispatecher.prototype.addEventListener = function(event, callback){
	if(this.eventCallbackDict.has(event)){
		this.eventCallbackDict.get(event).add(callback);
	}
	else{
		this.eventCallbackDict.set(event, new List([callback]));
	}
};

Dispatecher.prototype.removeEventListener = function(event, callback){
	var callbackList = this.eventCallbackDict.get(event);

	callbackList && callbackList.remove(callback);
};

Dispatecher.prototype.trigger = function(event){
	var callbackList = this.eventCallbackDict.get(event).getAll();
	var argumentList = [];
	var i;
	var l;

	// event 取后面的参数列表
	for(i = 1, l = arguments.length; i < l; ++i){
		argumentList.push(arguments[i]);
	}

	_.each(callbackList, function(callback){
		try{
			callback.apply({ type: event }, argumentList);
		}
		catch(error){
			console.error("uncaught exception inside eventDispatcher callback.", error);
		}
	});
};

var List = require("../modules/tools/List");
var Dict = require("../modules/tools/Dict");

var renderedMessageList = new List();
var callbackDict = new Dict();

module.exports = {
	markAsRendered: function(id){
		renderedMessageList.add(id);
	},
	isRendered:  function(id){
		return renderedMessageList.has(id);
	},
	resolveById: function(id){
		var resolve = callbackDict.get(id);
		if(typeof resolve === "function"){
			resolve();
			return;
		}
		console.log("can't find valid resolve callback for id:", id);
	},
	registerResolve: function(id, resolve){
		callbackDict.set(id, resolve);
	},
};

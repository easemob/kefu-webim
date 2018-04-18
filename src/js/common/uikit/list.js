var List = function(content){
	this.list = _.isArray(content) ? content : [];
};

List.prototype.has = function(value){
	return !!~this.list.indexOf(value);
};

List.prototype.add = function(value){
	if(!this.has(value)){
		this.list.push(value);
	}
};

List.prototype.remove = function(value){
	var index = this.list.indexOf(value);
	if(index >= 0){
		this.list.splice(index, 1);
	}
};

List.prototype.getAll = function(){
	return this.list;
};

List.prototype.getLength = function(){
	return this.list.length;
};

// todo: rename to clear
List.prototype.removeAll = function(){
	this.list.length = 0;
};

module.exports = List;

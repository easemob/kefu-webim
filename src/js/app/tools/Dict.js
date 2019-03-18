var Dict;

module.exports = Dict = function(){
	this.map = {};
};

Dict.prototype.set = function(key, value){
	// todo: new value overwrite old value
	!this.has(key) && (this.map[key] = value);
};

Dict.prototype.has = function(key){
	return Object.prototype.hasOwnProperty.call(this.map, key);
};

Dict.prototype.get = function(key){
	return this.has(key)
		? this.map[key]
		: undefined;
};

Dict.prototype.remove = function(key){
	this.has(key) && delete this.map[key];
};

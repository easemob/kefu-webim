var Dict = function () {
	this.list = {};
};

Dict.prototype.set = function (key, value) {
	if (typeof this.list[key] === 'undefined') {
		this.list[key] = value;
	}
};

Dict.prototype.get = function (key) {
	if (this.list.hasOwnProperty(key)) {
		return this.list[key];
	}
	else {
		return null;
	}
};

Dict.prototype.remove = function (key) {
	if (typeof this.list[key] !== 'undefined') {
		delete this.list[key];
	}
};

module.exports =  Dict;

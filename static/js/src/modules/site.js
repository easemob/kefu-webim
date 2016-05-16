;(function () {
	var site = function () {
		this.list = {};
	};

	site.prototype.set = function ( key, value ) {
		if ( typeof this.list[key] === 'undefined' ) {
			this.list[key] = value;
		}
		return this;
	};

	site.prototype.get = function ( key ) {
		if ( this.list.hasOwnProperty(key) ) {
			return this.list[key];	
		} else {
			return null;
		}
	};

	easemobim.site = site;
}());

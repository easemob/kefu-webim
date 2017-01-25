easemobim.autogrow = (function () {
	return function ( options ) {
		var utils = easemobim.utils;
		var that = options.dom;
		var originHeight = that.clientHeight;
		// var maxHeight = originHeight * 3;
		// 不知道为什么高度不会超，所以就没有限制
		var lineHeight = that.style.lineHeight;

		var update = function () {
			var height = Math.max(this.scrollHeight, originHeight);
			this.style.height = height + 'px';
			typeof options.callback == 'function' && options.callback();
		};

		utils.on(that, 'input', update);

		options.update = function () {
			update.apply(that);
		};
		update.apply(that);
	};
}());

/**
 * autogrow
 */
easemobim.autogrow = (function () {
	return function ( options ) {
		var utils = easemobim.utils,
			that = options.dom,
			minHeight = that.getBoundingClientRect().height,
			lineHeight = that.style.lineHeight;
		
		var shadow = document.createElement('div');
		shadow.style.cssText = [
			'position:absolute;',
			'top:-10000px;',
			'left:-10000px;',
			'width:' + (that.getBoundingClientRect().width - 45) +'px;',
			'font-size:' + (that.style.fontSize || 17) + 'px;',
			'line-height:' + (that.style.lineHeight || 17) + 'px;',
			'resize:none;',
			'word-wrap:break-word;'].join('');
		document.body.appendChild(shadow);

		var update = function () {
			var times = function ( string, number ) {
				for ( var i = 0, r = ''; i < number; i++ ) {
					r += string;
				}
				return r;
			};
			
			var val = this.value
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/&/g, '&amp;')
			.replace(/\n$/, '<br/>&nbsp;')
			.replace(/\n/g, '<br/>')
			.replace(/ {2,}/g, function(space) { return times('&nbsp;', space.length -1) + ' ' });
			
			utils.html(shadow, val);
			val && (this.style.height = Math.max(shadow.getBoundingClientRect().height + 17, minHeight) + 'px');
			typeof options.callback == 'function' && options.callback();
		};
		
		utils.on(that, 'change', update);
		utils.on(that, 'keyup', update);
		utils.on(that, 'keydown', update);
		
		options.update = function () {
			update.apply(that);
		}
		update.apply(that);
	};
	return that;
}());

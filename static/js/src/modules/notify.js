/**
 * 浏览器提示
 */
easemobim.notify = function () {
	var st = 0;

	easemobim.notify = function ( img, title, content ) {
		if ( st !== 0 ) {
			return;
		}
		st = setTimeout(function () {
			st = 0;
		}, 3000);
		img = img || '';
		title = title || '';
		content = content || '';
		try {
			if ( window.Notification ) {
				if ( Notification.permission === 'granted' ) {
					var notification = new Notification(
						title, {
							icon: img,
							body: content
						}
					);
					notification.onclick = function () {
						if ( typeof window.focus === 'function' ) {
							window.focus();
						}
						this.close();
						typeof easemobim.titleSlide === 'object' && easemobim.titleSlide.stop();
					};
					setTimeout(function () {
						notification.close();
					}, 3000);
				} else {
					Notification.requestPermission();
				}
			}
		} catch ( e ) {}
	};
};

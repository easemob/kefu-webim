/**
 * ctrl+v发送截图功能:当前仅支持chrome/firefox/ie11
 */
easemobim.paste = function ( chat ) {
	var dom = document.createElement('div'),
		utils = easemobim.utils,
		data;

	utils.addClass(dom, 'easemobWidget-dialog easemobWidget-paste-wrapper em-hide');
	utils.html(dom, "\
		<div class='easemobWidget-paste-image'></div>\
		<div>\
			<button class='easemobWidget-cancel'>取消</button>\
			<button class='bg-color'>发送</button>\
		</div>\
	");
	easemobim.imChat.appendChild(dom);

	var buttons = dom.getElementsByTagName('button'),
		cancelBtn = buttons[0],
		sendImgBtn = buttons[1],
		imgContainer = dom.getElementsByTagName('div')[0];

	utils.on(cancelBtn, 'click', function () {
		easemobim.paste.hide();
	});
	utils.on(sendImgBtn, 'click', function () {
		chat.sendImgMsg({data: data, url: dom.getElementsByTagName('img')[0].getAttribute('src')});
		easemobim.paste.hide();
	});

	return ({
		show: function ( blob ) {
			var img = new Image();
			if ( typeof blob === 'string' ) {
				img.src = blob;
			} else {
				img.src = window.URL.createObjectURL(blob);
			}
			data = blob;
			imgContainer.appendChild(img);
			utils.removeClass(dom, 'em-hide');
			img = null;
		}
		, hide: function () {
			utils.html(imgContainer, '');
			utils.addClass(dom, 'em-hide');
		}
		, bind: function () {
			var me = this;

			utils.on(easemobim.textarea, 'paste', function ( e ) {
				var ev = e || window.event;

				try {
					if ( ev.clipboardData && ev.clipboardData.types ) {
						if ( ev.clipboardData.items.length > 0 ) {
							if ( /^image\/\w+$/.test(ev.clipboardData.items[0].type) ) {
								me.show(ev.clipboardData.items[0].getAsFile());
							}
						}
					} else if ( window.clipboardData ) {
						var url = window.clipboardData.getData('URL');
						me.show(url);
					}
				} catch ( ex ) {}
			});
			return this;
		}
	}.bind());
};

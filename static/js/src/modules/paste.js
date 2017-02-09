/**
 * ctrl+v发送截图功能:当前仅支持chrome/firefox/ie11
 */
easemobim.paste = function ( chat ) {
	var dom = document.createElement('div');
	var utils = easemobim.utils;
	var data;

	utils.addClass(dom, 'em-widget-dialog em-widget-paste-wrapper hide');
	dom.innerHTML = "<div class='em-widget-paste-image'></div>"
		+ "<div><button class='em-widget-cancel'>取消</button>"
		+ "<button class='em-widget-confirm bg-color'>发送</button></div>";
	easemobim.imChat.appendChild(dom);

	var cancelBtn = dom.querySelector('.em-widget-cancel');
	var sendImgBtn = dom.querySelector('.em-widget-confirm');
	var imgContainer = dom.querySelector('.em-widget-paste-image');

	utils.on(cancelBtn, 'click', function () {
		easemobim.paste.hide();
	});
	utils.on(sendImgBtn, 'click', function () {
		chat.sendImgMsg({data: data, url: dom.querySelector('img').getAttribute('src')});
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
			utils.removeClass(dom, 'hide');
		}
		, hide: function () {
			imgContainer.innerHTML = '';
			utils.addClass(dom, 'hide');
		}
		, bind: function () {
			var me = this;

			utils.on(easemobim.textarea, 'paste', function ( ev ) {
				if ( ev.clipboardData && ev.clipboardData.types ) {
					if ( ev.clipboardData.items.length > 0 ) {
						if ( /^image\/\w+$/.test(ev.clipboardData.items[0].type) ) {
							me.show(ev.clipboardData.items[0].getAsFile());
						}
					}
				}
				else if ( window.clipboardData ) {
					var url = window.clipboardData.getData('URL');
					me.show(url);
				}
				else {}
			});
			return this;
		}
	}.bind());
};

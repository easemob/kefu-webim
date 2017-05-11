easemobim.imgView = (function (utils, _const) {

	var imgWrapper = document.querySelector('div.img-view');
	var img = imgWrapper.querySelector('img');

	utils.on(imgWrapper, 'click', function () {
		utils.addClass(imgWrapper, 'hide');
	}, false);

	return {
		show: function (url) {
			if (utils.isTop || utils.isMobile) {
				img.setAttribute('src', url);
				utils.removeClass(imgWrapper, 'hide');

			}
			else {
				transfer.send({
					event: _const.EVENTS.SHOW_IMG,
					data: {
						imgSrc: url,
						imgFile: window.imgFileList.get(url)
					}
				}, window.transfer.to);
			}
		}
	};
}(easemobim.utils, easemobim._const));

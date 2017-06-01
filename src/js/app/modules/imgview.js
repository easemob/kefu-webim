easemobim.imgView = (function (utils, _const, profile) {

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
						imgFile: profile.imgFileList.get(url)
					}
				});
			}
		}
	};
}(easemobim.utils, easemobim._const, app.profile));

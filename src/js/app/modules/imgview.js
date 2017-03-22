easemobim.imgView = (function (utils) {

	var imgWrapper = document.querySelector('div.img-view');
	var img = imgWrapper.querySelector('img');

	utils.on(imgWrapper, 'click', function () {
		utils.addClass(imgWrapper, 'hide');
	}, false);

	return {
		show: function ( url ) {
			img.setAttribute('src', url);
			utils.removeClass(imgWrapper, 'hide');
		}
	};
}(easemobim.utils));

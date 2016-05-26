/**
 * img view
 */
easemobim.imgView = (function () {

	var imgViewWrap = document.createElement('div'),
		utils = easemobim.utils,
		img = document.createElement('img');

	img.style.cssText = '\
	position: absolute;\
    top: 0;\
    left: 0;\
    right: 0;\
    bottom: 0;\
    margin: auto;';
	imgViewWrap.appendChild(img);

	imgViewWrap.style.cssText = '\
	display: none;\
	z-index: 100000;\
    position: fixed;\
    width: 100%;\
    height: 100%;\
    left: 0;\
    top: 0;\
    background: rgba(0,0,0,.3);';
	document.body.appendChild(imgViewWrap);

    var reset = function () {
        imgViewWrap.style.display = 'none';
        imgViewWrap.style.overflow = 'hidden';
    };

    img.onload = function () {
        if ( this.width > easemobim.utils.window.width * .9 || this.height > easemobim.utils.window.height * .9 ) {

        } else {
            reset();
        }
    };

    utils.on(imgViewWrap, 'click', reset, false);

	return {
		show: function ( url ) {
			img.setAttribute('src', url);
			imgViewWrap.style.display = 'block';
            imgViewWrap.style.overflow = 'auto';
		}
	};
}());

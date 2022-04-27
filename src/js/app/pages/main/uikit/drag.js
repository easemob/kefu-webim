module.exports = {
	drag: myPlugin
};
function myPlugin(options,isVideo) {
	var $doc = $(document);
	var defaults = {
		parentdraf: '.J-xloginPanel', // 拖拽元素父级
		draftin: '.J-xloginPanel h3', // 拖拽元素
		sizeLeft: '.J-xloginPanel .barl', // 改变大小左边
		sizeRight: '.J-xloginPanel .barr', // 改变大小右边
		sizeTop: '.J-xloginPanel .bart', // 改变大小上边
		sizeBottom: '.J-xloginPanel .barb',  // 改变大小下边
		sizeSkew: '.J-xloginPanel .bar'
	};
	var settings = $.extend({}, defaults, options);

	/* 拖拽 */
	$(settings.draftin).on('mousedown', dragmove);
	function dragmove(event) {
		event = event || window.event;
		var disX = event.pageX - $(settings.parentdraf).offset().left;
		var disY = event.pageY - $(settings.parentdraf).offset().top;
		$doc.on('mousemove', move);
		function move(event) {
			event.stopPropagation();
			event = event || window.event;
			var mouseX = event.pageX - disX;
			var mouseY = event.pageY - disY;
			var maxX = document.documentElement.clientWidth - $(settings.parentdraf).outerWidth(),
				maxY = document.documentElement.clientHeight - $(settings.parentdraf).outerHeight();
			if (mouseX < 0) {
				mouseX = 0;
			} else if (mouseX > maxX) {
				mouseX = maxX;
			}
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > maxY) {
				mouseY = maxY;
			}
			$(settings.parentdraf).css({ 'left': mouseX + 'px', 'top': mouseY + 'px', 'margin-left': '0px', 'margin-top': '0px', 'position': 'fixed' });
		};
	};
	// 移动端
	$(settings.draftin).on('touchstart', dragmove);
	function dragmove(event) {
		event = event || window.event;
		event = event.originalEvent.targetTouches && event.originalEvent.targetTouches[0];
		var disX = (event && event.pageX) - $(settings.parentdraf).offset().left;
		var disY = (event && event.pageY) - $(settings.parentdraf).offset().top;
		$doc.on('touchmove', move);
		function move(event) {
			event.stopPropagation();
			event = event || window.event;
			event = event.originalEvent && event.originalEvent.targetTouches[0];
			var mouseX = event.pageX - disX;
			var mouseY = event.pageY - disY;
			var maxX = document.documentElement.clientWidth - $(settings.parentdraf).outerWidth(),
				maxY = document.documentElement.clientHeight - $(settings.parentdraf).outerHeight();
			if (mouseX < 0) {
				mouseX = 0;
			} else if (mouseX > maxX) {
				mouseX = maxX;
			}
			if (mouseY < 0) {
				mouseY = 0;
			} else if (mouseY > maxY) {
				mouseY = maxY;
			}
			$(settings.parentdraf).css({ 'left': mouseX + 'px', 'top': mouseY + 'px', 'margin-left': '0px', 'margin-top': '0px', 'position': 'fixed' });
		};
	};

	/* 左边 */
	$(settings.sizeLeft).on('mousedown', function (event) {
		event = event || window.event;
		var $this = $(this);
		var disX = $(settings.parentdraf).offset().left,
			drafw = $(settings.parentdraf).width();
		$doc.on('mousemove', function (event) {
			event = event || window.event;
			var mouseX = event.pageX;
			if (mouseX < 0) mouseX = 0;
			$(settings.parentdraf).css({ 'left': mouseX + 'px', 'width': (disX - mouseX - 4) + drafw + 'px','mamargin-left': '0px', })
		});
	});

	/* 右边 */
	$(settings.sizeRight).on('mousedown', function (event) {
		event = event || window.event;
		var $this = $(this);
		var disX = $(settings.parentdraf).offset().left;
		var disW = $(settings.parentdraf).width();
		$doc.on('mousemove', function (event) {
			event = event || window.event;
			var mouseX = event.pageX - disX,
				maxX = document.documentElement.clientWidth - disX - 2;
			if (mouseX > maxX) mouseX = maxX;
			if (mouseX < disW) mouseX = disW;
			$(settings.parentdraf).css({ 'width': mouseX + 'px' })
		});
	});

	/* 上边 */
	$(settings.sizeTop).on('mousedown', function (event) {
		event = event || window.event;
		var $this = $(this);
		var disY = $(settings.parentdraf).offset().top,
			drafH = $(settings.parentdraf).height();
		$doc.on('mousemove', function (event) {
			event = event || window.event;
			var mouseY = event.pageY,
				range = disY - mouseY - 4;
			if (mouseY + 4 > 0) {
				$(settings.parentdraf).css({ 'top': mouseY + 'px', 'height': range + drafH + 'px','margin-top': '0px' });
			};
		});
	});

	/* 下边 */
	$(settings.sizeBottom).on('mousedown', function (event) {
		event = event || window.event;
		var $this = $(this);
		var disY = $(settings.parentdraf).offset().top;
		var disH = $(settings.parentdraf).height();
		$doc.on('mousemove', function (event) {
			event = event || window.event;
			var mouseY = event.pageY - disY,
				maxY = document.documentElement.clientHeight - disY - 2;
			if (mouseY > maxY) mouseY = maxY;
			if (mouseY < disH) mouseY = disH;
			$(settings.parentdraf).css({ 'height': mouseY + 'px' });
		});
	});


	/* 下斜 */
	$(settings.sizeSkew).on('mousedown', function (event) {
		event = event || window.event;
		var $this = $(this),
			disX = $(settings.parentdraf).offset().left,
			disY = $(settings.parentdraf).offset().top;
		var disH = $(settings.parentdraf).height();
		var disW = $(settings.parentdraf).width();
		$doc.on('mousemove', function (event) {
			event = event || window.event;
			var mouseX = event.pageX - disX + 14,
				mouseY = event.pageY - disY + 14,
				maxX = document.documentElement.clientWidth - disX - 2,
				maxY = document.documentElement.clientHeight - disY - 2;
			if (mouseX > maxX) mouseX = maxX;
			if (mouseY > maxY) mouseY = maxY;
			if (mouseX < disW) mouseX = disW;
			if (mouseY < disH) mouseY = disH;
			$(settings.parentdraf).css({ 'width': mouseX + 'px', 'height': mouseY + 'px' });
		});
	});

	/* 松开鼠标 */
	$doc.mouseup(function () {
		$doc.off('mousedown')
		$doc.off('mousemove')
		$doc.off('touchstart')
		$doc.off('touchmove')
	});
};


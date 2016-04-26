/**
 * title滚动
 */
easemobim.titleSlide = function ( config ) {
	var newTitle = '新消息提醒',
		titleST = 0,
		originTitle = document.title,
		tempArr = (originTitle + newTitle).split(''),
		word;

	easemobim.titleSlide = {
		stop: function () {
			if ( !config.titleSlide ) {
				return;
			}
			clearInterval(titleST);
			titleST = 0;
			document.title = originTitle;
		},
		start: function () {
			if ( !config.titleSlide || titleST ) {
				return;
			}
			titleST = setInterval(function () {
				word = tempArr.shift();
				document.title = word + Array.prototype.join.call(tempArr, '');
				tempArr.push(word);
			}, 360);
		}
	};
};

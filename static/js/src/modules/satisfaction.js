/**
 * 满意度调查
 */
easemobim.satisfaction = function ( chat ) {

	var dom = document.querySelector('.em-widget-satisfaction-dialog');
	var utils = easemobim.utils;
	var satisfactionEntry = document.querySelector('.em-widget-satisfaction');
	var starsUl = dom.getElementsByTagName('ul')[0];
	var lis = starsUl.getElementsByTagName('li');
	var msg = dom.getElementsByTagName('textarea')[0];
	var buttons = dom.getElementsByTagName('button');
	var cancelBtn = buttons[0];
	var submitBtn = buttons[1];
	var success = dom.getElementsByTagName('div')[1];
	var session;
	var invite;
	
	utils.on(satisfactionEntry, utils.click, function () {
		session = null;
		invite = null;
		utils.removeClass(dom, 'hide');
		clearInterval(chat.focusText);
	});
	utils.live('button.js_satisfybtn', 'click', function () {
		session = this.getAttribute('data-servicesessionid');
		invite = this.getAttribute('data-inviteid');
		utils.removeClass(dom, 'hide');
		clearInterval(chat.focusText);
	});
	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'hide');
	});
	utils.on(submitBtn, 'click', function () {
		var level = getStarLevel();

		if ( level === 0 ) {
			chat.errorPrompt('请先选择星级');
			return false;
		}
		chat.sendSatisfaction(level, msg.value, session, invite);

		msg.blur();
		utils.removeClass(success, 'hide');

		setTimeout(function(){
			msg.value = '';
			clearStars();
			utils.addClass(success, 'hide');
			utils.addClass(dom, 'hide');
		}, 1500);
	});
	utils.on(starsUl, 'click', function ( e ) {
		var ev = e || window.event,
			that = ev.target || ev.srcElement,
			cur = that.getAttribute('idx');

		if ( !cur ) {
			return false;
		}
		for ( var i = 0, l = lis.length; i < l; i++) {
			console.log(i);
			if (i < +cur) {
				utils.addClass(lis[i], 'sel');
			} else {
				utils.removeClass(lis[i], 'sel');
			}
		}
	});

	function getStarLevel(){
		var count = 0;

		for ( var i = lis.length; i > 0; i-- ) {
			if ( utils.hasClass(lis[i-1], 'sel') ) {
				count += 1;
			}
		}
		return count;
	}
	function clearStars(){
		for ( var i = lis.length; i > 0; i-- ) {
			utils.removeClass(lis[i-1], 'sel');
		}
	};

};

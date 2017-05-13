/**
 * 满意度调查
 */
easemobim.satisfaction = function (chat) {

	var utils = easemobim.utils;
	var uikit = easemobim.uikit;
	var dom = document.querySelector('.em-widget-satisfaction-dialog');
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
	});

	utils.live('button.js_satisfybtn', 'click', function () {
		session = this.getAttribute('data-servicesessionid');
		invite = this.getAttribute('data-inviteid');
		utils.removeClass(dom, 'hide');
	});

	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'hide');
	});

	utils.on(submitBtn, 'click', function () {
		var level = starsUl.querySelectorAll('li.sel').length;

		if (level === 0) {
			uikit.tip('请先选择星级');
			return;
		}
		chat.channel.sendSatisfaction(level, msg.value, session, invite);

		msg.blur();
		utils.removeClass(success, 'hide');

		setTimeout(function () {
			msg.value = '';
			// clear stars
			utils.removeClass(lis, 'sel');
			utils.addClass(success, 'hide');
			utils.addClass(dom, 'hide');
		}, 1500);
	});
	utils.on(starsUl, 'click', function (e) {
		var ev = e || window.event;
		var target = ev.target || ev.srcElement;
		var selIndex = +target.getAttribute('idx') || 0;

		_.each(lis, function (elem, i) {
			utils.toggleClass(elem, 'sel', i < selIndex);
		});
	});
};

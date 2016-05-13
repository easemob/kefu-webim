/**
 * 满意度调查
 */
easemobim.satisfaction = function ( chat ) {

	var dom = document.createElement('div'),
		utils = easemobim.utils;

	utils.addClass(dom, 'easemobWidget-dialog easemobWidget-satisfaction-dialog em-hide');
	utils.html(dom, "\
		<h3>请对我的服务做出评价</h3>\
		<ul><li idx='1'>H</li><li idx='2'>H</li><li idx='3'>H</li><li idx='4'>H</li><li idx='5'>H</li></ul>\
		<textarea spellcheck='false' placeholder='请输入留言'></textarea>\
		<div>\
			<button class='easemobWidget-cancel'>取消</button>\
			<button class='bg-color'>提交</button>\
		</div>\
		<div class='easemobWidget-success-prompt em-hide'><i>A</i><p>提交成功</p></div>\
	");
	easemobim.imChat.appendChild(dom);

	var satisfactionEntry = utils.$Dom('EasemobKefuWebimSatisfy'),
		starsUl = dom.getElementsByTagName('ul')[0],
		lis = starsUl.getElementsByTagName('li'),
		msg = dom.getElementsByTagName('textarea')[0],
		buttons = dom.getElementsByTagName('button'),
		cancelBtn = buttons[0],
		submitBtn = buttons[1],
		success = dom.getElementsByTagName('div')[1],
		session,
		invite,
		getStarLevel = function () {
			var count = 0;

			for ( var i = lis.length; i > 0; i-- ) {
				if ( utils.hasClass(lis[i-1], 'sel') ) {
					count += 1;
				}
			}
			return count;
		},
		clearStars = function () {
			for ( var i = lis.length; i > 0; i-- ) {
				utils.removeClass(lis[i-1], 'sel');
			}
		};
	
	satisfactionEntry && utils.on(satisfactionEntry, utils.click, function () {
		session = null;
		invite = null;
		utils.removeClass(dom, 'em-hide');
		clearInterval(chat.focusText);
	});
	utils.live('button.js_satisfybtn', 'click', function () {
		session = this.getAttribute('data-servicesessionid');
		invite = this.getAttribute('data-inviteid');
		utils.removeClass(dom, 'em-hide');
		clearInterval(chat.focusText);
	});
	utils.on(cancelBtn, 'click', function () {
		utils.addClass(dom, 'em-hide');
	});
	utils.on(submitBtn, 'click', function () {
		var level = getStarLevel();

		if ( level === 0 ) {
			chat.errorPrompt('请先选择星级');
			return false;
		}
		chat.sendSatisfaction(level, msg.value, session, invite);

		msg.blur();
		utils.removeClass(success, 'em-hide');

		setTimeout(function(){
			msg.value = '';
			clearStars();
			utils.addClass(success, 'em-hide');
			utils.addClass(dom, 'em-hide');
		}, 1500);
	});
	utils.on(starsUl, 'click', function ( e ) {
		var ev = e || window.event,
			that = ev.target || ev.srcElement,
			cur = that.getAttribute('idx');

		if ( !cur ) {
			return false;
		}
		for ( var i = 0; i < lis.length; i++ ) {
			if ( i < Number(cur) ) {
				utils.addClass(lis[i], 'sel');
			} else {
				utils.removeClass(lis[i], 'sel');
			}
		}
	});
};

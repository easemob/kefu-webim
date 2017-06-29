/**
 * 满意度调查
 */
app.satisfaction = (function(utils, uikit, channel){
	var dom = utils.createElementFromHTML([
		'<div>',
		'<h3>请对我的服务做出评价</h3>',
		'<ul>',
		// fake: IE8 满意度评价会有兼容问题，修改图标需替换字符
		'<li idx="1">H</li>',
		'<li idx="2">H</li>',
		'<li idx="3">H</li>',
		'<li idx="4">H</li>',
		'<li idx="5">H</li>',
		'</ul>',
		'<textarea spellcheck="false" placeholder="请输入留言"></textarea>',
		'</div>'
	].join(''));
	var starsUl = dom.querySelector('ul');
	var starList = starsUl.querySelectorAll('li');
	var msg = dom.querySelector('textarea');
	var dialog = uikit.createDialog({
		contentDom: dom,
		className: 'satisfaction mini'
	}).addButton({
		confirmText: '提交',
		confirm: function () {
			var level = starsUl.querySelectorAll('li.sel').length;

			if (level === 0) {
				uikit.tip('请先选择星级');
				// 防止对话框关闭
				return true;
			}
			_sendSatisfaction(level, msg.value, session, invite);

			_clear();
			uikit.showSuccess('提交成功');
		}
	});
	var session;
	var invite;

	utils.on(starsUl, 'click', function (e) {
		var ev = e || window.event;
		var target = ev.target || ev.srcElement;
		var selIndex = +target.getAttribute('idx') || 0;

		_.each(starList, function (elem, i) {
			utils.toggleClass(elem, 'sel', i < selIndex);
		});
	});

	function _clear(){
		msg.blur();
		msg.value = '';
		// clear stars
		utils.removeClass(starList, 'sel');
	}

	function _sendSatisfaction(level, content, session, invite) {
		channel.sendText('', {ext: {
			weichat: {
				ctrlType: 'enquiry',
				ctrlArgs: {
					inviteId: invite || '',
					serviceSessionId: session || '',
					detail: content,
					summary: level
				}
			}
		}});
	}

	return {
		show: function(currentInviteId, currentServiceSessionId){
			session = currentServiceSessionId;
			invite = currentInviteId;
			dialog.show();
		}
	};
}(easemobim.utils, app.uikit, app.channel));

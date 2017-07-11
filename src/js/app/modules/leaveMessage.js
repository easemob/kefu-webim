app.leaveMessage = (function (utils, uikit, apiHelper) {
	var isSending = false;

	var dom = utils.createElementFromHTML([
		'<div class="wrapper">',
		'<h3>请填写以下内容以方便我们及时联系您</h3>',
		'<input type="text" class="name" placeholder="姓名">',
		'<input type="text" class="phone" placeholder="电话">',
		'<input type="text" class="mail" placeholder="邮箱">',
		'<textarea spellcheck="false" placeholder="请输入留言"></textarea>',
		'</div>',
	].join(''));
	var content = dom.querySelector('textarea');
	var name = dom.querySelector('.name');
	var phone = dom.querySelector('.phone');
	var mail = dom.querySelector('.mail');
	// todo: lazy load dialog
	var dialog = uikit.createDialog({
		contentDom: dom,
		className: 'ticket'
	}).addButton({
		confirmText: '留言',
		confirm: function () {
			if (isSending) {
				uikit.tip('留言提交中...');
			}
			else if (!name.value || name.value.length > 140) {
				uikit.tip('姓名输入不正确');
			}
			else if (!phone.value || !(/^[0-9+][0-9-]{10,17}$/.test(phone.value))) {
				uikit.tip('电话号码格式不正确');
			}
			else if (!mail.value || !(/^[0-9a-z][_.0-9a-z-]{0,30}[0-9a-z]@([0-9a-z][0-9a-z-]{0,30}[.]){1,3}[a-z]{2,4}$/i.test(mail.value))) {
				uikit.tip('邮箱输入不正确');
			}
			else if (!content.value || content.value.length > 1500) {
				uikit.tip('留言内容不能为空，长度小于1500字');
			}
			else {
				isSending = true;
				setTimeout(function () { isSending = false; }, 10000);
				_createTicket();
			}
			// 不关闭对话框
			return {preventDefult: true};
		}
	});
	var cancelBtn = dialog.el.querySelector('.cancel-btn');

	function _createTicket(){
		Promise.all([
			apiHelper.getToken(),
			apiHelper.getProjectId()
		]).then(function(result){
			var token = result[0];
			var projectId = result[1];

			apiHelper.createTicket({
				token: token,
				projectId: projectId,
				name: name.value,
				phone: phone.value,
				mail: mail.value,
				content: content.value
			}).then(function (){
				isSending = false;
				uikit.showSuccess('留言发送成功');

				_clearInput();
			}, function (err){
				isSending = false;
				uikit.tip('留言失败，请稍后重试');
				console.error(err);
			});
		})
		['catch'](function(err){
			uikit.tip('留言失败，token无效');
			console.error(err);
		});
	}

	function _clearInput(){
		name.value = '';
		phone.value = '';
		mail.value = '';
		content.value = '';
	}

	function _writePreDate(preData){
		content.value = preData.content || '';
		name.value = preData.name || '';
		phone.value = preData.phone || '';
		mail.value = preData.mail || '';
	}

	return function(opt) {
		opt = opt || {};
		opt.preData && _writePreDate(opt.preData);
		opt.hideCloseBtn && utils.addClass(cancelBtn, 'hide');
		dialog.show();
	};
}(easemobim.utils, app.uikit, app.apiHelper));

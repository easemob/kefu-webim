easemobim.leaveMessage = (function (utils, apiHelper) {
	var isSending = false;
	var chat;
	var config;
	var getProjectIdPromise;

	var dom = document.querySelector('.em-widget-offline');
	var content = dom.querySelector('textarea');
	var name = dom.querySelector('.name');
	var phone = dom.querySelector('.phone');
	var mail = dom.querySelector('.mail');
	var confirmBtn = dom.querySelector('.btn-ok');
	var cancelBtn = dom.querySelector('.btn-cancel');
	var success = dom.querySelector('.em-widget-success-prompt');

	utils.on(cancelBtn, utils.click, function () {
		utils.addClass(dom, 'hide');
	});

	utils.on(confirmBtn, utils.click, function () {
		if (isSending) {
			chat.errorPrompt('留言提交中...');
		}
		else if (!name.value || name.value.length > 140) {
			chat.errorPrompt('姓名输入不正确');
		}
		else if (!phone.value || phone.value.length > 24) {
			chat.errorPrompt('电话输入不正确');
		}
		else if (!mail.value || mail.value.length > 127) {
			chat.errorPrompt('邮箱输入不正确');
		}
		else if (!content.value || content.value.length > 1500) {
			chat.errorPrompt('留言内容不能为空，长度小于1500字');
		}
		else {
			isSending = true;
			setTimeout(function () { isSending = false; }, 10000);
			_createTicket();
		}
	});

	function _createTicket(){
		Promise.all([
			apiHelper.getToken(),
			getProjectIdPromise
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
				utils.removeClass(success, 'hide');

				setTimeout(function () {
					utils.addClass(success, 'hide');
				}, 1500);

				_clearInput()
			}, function (err){
				isSending = false;
				chat.errorPrompt('留言失败，请稍后重试');
				console.warn(err);
			});
		})
		['catch'](function(err){
			chat.errorPrompt('留言失败，token无效');
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

	return {
		init: function (currentChat, cfg) {
			chat = currentChat;
			config = cfg;
		},
		show: function (opt) {
			opt = opt || {};
			opt.preData && _writePreDate(opt.preData);
			opt.hideCloseBtn && utils.addClass(cancelBtn, 'hide');
			utils.removeClass(dom, 'hide');

			// cache project id
			getProjectIdPromise = apiHelper.getProjectId();
		}
	};
}(easemobim.utils, easemobim.apiHelper));

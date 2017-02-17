;(function (utils) {
	easemobim.leaveMessage = function ( chat, tenantId ) {

		var projectId;
		var targetUser;
		var accessToken;
		var appkey;
		var isSending = false;
		var username;

		// 仅初始化一次
		if (dom) return;

		var dom = document.querySelector('.em-widget-offline');
		var content = dom.querySelector('textarea');
		var contact = dom.querySelector('.contact');
		var phone = dom.querySelector('.phone');
		var mail = dom.querySelector('.mail');
		var confirmBtn = dom.querySelector('.btn-ok');
		var cancelBtn = dom.querySelector('.btn-cancel');
		var success = dom.querySelector('.em-widget-success-prompt');

		utils.on(cancelBtn, utils.click, function () {
			utils.addClass(dom, 'hide');			   
		});

		utils.on(confirmBtn, utils.click, function () {
			if ( isSending ) {
				chat.errorPrompt('留言提交中...');
			}
			else if ( !projectId || !targetUser ) {
				chat.errorPrompt('留言失败，token无效');
			}
			else if ( !contact.value || contact.value.length > 140 ) {
				chat.errorPrompt('姓名输入不正确');
			}
			else if ( !phone.value || phone.value.length > 24 ) {
				chat.errorPrompt('电话输入不正确');
			}
			else if ( !mail.value || mail.value.length > 127 ) {
				chat.errorPrompt('邮箱输入不正确');
			}
			else if ( !content.value || content.value.length > 2000 ) {
				chat.errorPrompt('留言内容不能为空，长度小于2000字');
			}
			else {
				isSending = true;
				setTimeout(function () { isSending = false; }, 10000);
				easemobim.api('createTicket', {
					tenantId: tenantId,
					'easemob-target-username': targetUser,
					'easemob-appkey': appkey,
					'easemob-username': username,
					headers: { Authorization: 'Easemob IM ' + accessToken },
					projectId: projectId,
					subject: '',
					content: content.value,
					status_id: '',
					priority_id: '',
					category_id: '',
					creator: { 
						name: contact.value,
						avatar: '',
						email: mail.value,
						phone: phone.value,
						qq: '',
						company: '',
						description: ''
					},
					attachments: null
				}, function ( msg ) {
					isSending = false;
					if ( msg && msg.data && msg.data.id ) {
						utils.removeClass(success, 'hide');

						setTimeout(function(){
							utils.addClass(success, 'hide');
						}, 1500);

						contact.value = '';
						phone.value = '';
						mail.value = '';
						content.value = '';
					} else {
						chat.errorPrompt('留言失败，请稍后重试');
					}
				});
				
			}
		});

		return {
			auth: function ( token, config ) {
				accessToken = token;
				targetUser = config.toUser;
				username = config.user.username;
				appkey = config.appKey.replace('#', '%23');

				if ( !projectId ) {
					easemobim.api('getProject', {
						tenantId: tenantId,
						'easemob-target-username': targetUser,
						'easemob-appkey': appkey,
						'easemob-username': username,
						headers: { Authorization: 'Easemob IM ' + accessToken }
					}, function (content) {
						projectId = utils.getDataByPath(content, 'data.entities.0.id');
					});
				}
			},
			show: function (isHideCancelBtn) {
				utils.toggleClass(cancelBtn, 'hide', !!isHideCancelBtn);			   
				utils.removeClass(dom, 'hide');			   
			}
		};
	};
}(easemobim.utils));

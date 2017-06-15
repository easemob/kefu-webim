app.initSessionList = (function (
	_const, utils, profile, eventListener, apiHelper, createSessionList,
	createMessageView, promptCtaDialog
){
	var sessionListBtn;
	var redDotDom;
	var sessionListView;

	return function(){
		var topBar = document.querySelector('.em-widget-header');
		sessionListBtn = topBar.querySelector('.session-list-btn');
		redDotDom = sessionListBtn.querySelector('.notice');

		eventListener.add(_const.SYSTEM_EVENT.NEW_OFFICIAL_ACCOUNT_FOUND, _newOfficialAccountFound);
		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _officialAccountSwitched);

		eventListener.add(_const.SYSTEM_EVENT.SYSTEM_OFFICIAL_ACCOUNT_UPDATED, function (){
			sessionListView.updateItem(profile.systemOfficialAccount, 'default');
		});

		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_LIST_GOT, function (){
			profile.ctaEnable && sessionListView.show();
		});
	};

	function _officialAccountSwitched(){
		// todo: clear unread count
	}

	function _newMessageAppend(message){
		var officialAccount;
		var officialAccountId;
		var avatar;
		var content;
		var title;

		app.promptCtaDialog({
			title: 'test title',
			replyCallback: _switchToOfficialAccount,
			content: '您好,【#访客昵称】，感谢您对我产品的长期支持，自2017年3月5日起，我们即将推出一款全新理财产品【金融旋风】，4月1日开始发售至10月1日后进行返还，预计收益19.31%，风险指数极低，5000万元起，您可以从目前的产品直接过度到【金融旋风】，截止日期至3月31日。如果您对此感兴趣，可以跟我联系。',
			avatar: 'static/img/default_avatar.png',
			callbackMessage: '12123123213'
		});
	}

	function _switchToOfficialAccount(id){
		var targerOfficialAccountProfile = _.findWhere(profile.officialAccountList, {official_account_id: id});

		_.each(profile.officialAccountList, function(item){
			item.messageView.hide();
		});

		targerOfficialAccountProfile.messageView.show();
		profile.currentOfficialAccount = targerOfficialAccountProfile;

		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.SWITCH_OFFICIAL_ACCOUNT,
			[targerOfficialAccountProfile]
		);
		// todo: to confirm this session info
		// _getLastSession(profile.currentOfficialAccount.official_account_id);
	}

	function _newOfficialAccountFound(officialAccount){
		var type = officialAccount.type;

		officialAccount.messageView = createMessageView({
			officialAccount: officialAccount
		});

		if (!sessionListView){
			sessionListView = createSessionList({
				itemOnClickCallback: _switchToOfficialAccount
			});
			utils.on(sessionListBtn, 'click', sessionListView.show);
		}
		sessionListView.appendItem(officialAccount);

		// 有服务号消息时显示sessionList
		if (type === 'CUSTOM'){
			utils.removeClass(sessionListBtn, 'hide');
		}
	}
}(
	easemobim._const,
	easemobim.utils,
	app.profile,
	app.eventListener,
	app.apiHelper,
	app.createSessionList,
	app.createMessageView,
	app.promptCtaDialog
));

app.initSessionList = (function (
	_const, utils, profile, eventListener, apiHelper, createSessionList,
	createMessageView
){
	var sessionListBtn;
	var redDotDom;
	var sessionListView;

	return function(){
		var topBar = document.querySelector('.em-widget-header');
		sessionListBtn = topBar.querySelector('.session-list-btn');
		redDotDom = sessionListBtn.querySelector('.notice');

		utils.on(sessionListBtn, 'click', function () {
			profile.sessionListView.show();
		});

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

	function _newOfficialAccountFound(officialAccount){
		var type = officialAccount.type;

		officialAccount.messageView = createMessageView({
			officialAccount: officialAccount
		});

		if (!sessionListView){
			sessionListView = createSessionList();
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
	app.createMessageView
));

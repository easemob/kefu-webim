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

		eventListener.add(_const.SYSTEM_EVENT.MESSAGE_SENT, _onMessageSent);
		eventListener.add(_const.SYSTEM_EVENT.NEW_OFFICIAL_ACCOUNT_FOUND, _newOfficialAccountFound);
		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _officialAccountSwitched);

		eventListener.add(_const.SYSTEM_EVENT.SYSTEM_OFFICIAL_ACCOUNT_UPDATED, function (){
			sessionListView.updateItem(profile.systemOfficialAccount, 'default');
		});

		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_LIST_GOT, function (){
			profile.ctaEnable && sessionListView.show();
		});
	};

	function _onMessageSent(){
		var officialAccount = profile.currentOfficialAccount;
		_.each(officialAccount.unrepliedMarketingTaskIdList.getAll(), function(marketingTaskId){
			officialAccount.unrepliedMarketingTaskIdList.remove(marketingTaskId);
			apiHelper.reportMarketingTaskOpened(marketingTaskId);
		});
	}

	function _officialAccountSwitched(officialAccount){
		_.each(officialAccount.unopenedMarketingTaskIdList.getAll(), function(marketingTaskId){
			officialAccount.unopenedMarketingTaskIdList.remove(marketingTaskId);
			apiHelper.reportMarketingTaskOpened(marketingTaskId);
		});
	}

	function _onMarketingMessageReceived(msg, marketingTaskId, officialAccount){
		var avatar = officialAccount.img;
		var officialAccountId = officialAccount.official_account_id;
		var content = msg.data;
		var title = '';
		var isCurrentOfficialAccount = officialAccount === profile.currentOfficialAccount;

		!isCurrentOfficialAccount && app.promptCtaDialog({
			title: title,
			replyCallback: _switchToOfficialAccount,
			content: content,
			avatar: avatar,
			callbackMessage: officialAccountId
		});

		officialAccount.unopenedMarketingTaskIdList.add(marketingTaskId);
		officialAccount.unrepliedMarketingTaskIdList.add(marketingTaskId);
		apiHelper.reportMarketingTaskDelivered(marketingTaskId);
	}

	function _switchToOfficialAccount(id){
		var targerOfficialAccountProfile = _.findWhere(profile.officialAccountList, {official_account_id: id});

		_.each(profile.officialAccountList, function(item){
			item.messageView.hide();
		});

		targerOfficialAccountProfile.messageView.show();
		profile.currentOfficialAccount = targerOfficialAccountProfile;

		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED,
			[targerOfficialAccountProfile]
		);
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
